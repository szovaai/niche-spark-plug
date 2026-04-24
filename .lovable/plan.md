# PDF Empire — Fix Blank PDF + Premium Generator Upgrade

## Root cause of the blank PDF (confirmed)

In `src/pages/CreateToolkit.tsx` (line ~520), after calling `generate-toolkit-content` for each guide section, the code reads `data.content`:

```ts
content: data.content,
wordCount: data.wordCount || data.content.split(/\s+/).length,
```

But the edge function (`supabase/functions/generate-toolkit-content/index.ts`) returns `sectionContent` (legacy) and `chapterContent` (new 5-chapter framework) — never `content` for single-section calls. So every `GuideSection.content` saves as `undefined`. `compileGuide()` then builds a guide with empty section bodies, and `generateGuidePDF` renders Cover + TOC + chapter opener pages with **no body text** — exactly the "almost empty PDF" symptom.

Component-level `data.content[componentId]` calls work fine (that path returns `{ success, content: { guide: {...} } }`), but the section-by-section flow that drives the main guide is broken.

We'll fix the bug, then layer on the requested upgrades.

---

## 1. Fix the PDF export pipeline

**a. Fix the section response read** (`CreateToolkit.tsx`)
- Read `data.sectionContent ?? data.chapterContent ?? data.content` so it works against both the legacy and chapter generators.
- Recompute `wordCount` from the resolved string.
- Identical fix to `generateGuideSection`'s setter so `GuideSection.content` is always a real string.

**b. Pre-export validation in `generateGuidePDF`** (`src/lib/pdfGenerator.ts`)
- Before rendering, count total characters across `content.sections`.
- If total < ~500 chars OR every section's `content` is empty: throw a typed `EmptyContentError` rather than silently producing a 2-page shell.
- Same guard in `generateAllPDFs` for each component.

**c. Section-level fallbacks**
- If a single section is empty but others have content, render a one-line "This section is being rebuilt — regenerate it from the builder." placeholder block instead of leaving a blank page.

**d. UI guard before "Export PDF"** (`ToolkitPreview.tsx` and `ToolkitBuilder.tsx > handleDownloadPdf`)
- Compute a `contentReadiness` score: total words across `content.guide.sections` + selected sub-components.
- If words < 800 → disable export button and show inline warning: "This product does not have enough content to export yet. Please generate full content first."
- If 800 ≤ words < 2000 → enable export but show a yellow "Light export — consider regenerating with deeper content" hint.

**e. Try/catch + toast** around every export call. On `EmptyContentError`, surface the offending sections in console + a clear toast ("Guide section 'X' is empty — regenerate it before exporting").

**f. New "Preview PDF Content" button** that opens a modal listing each section's word count and a green/red dot, so the user can see exactly what will and won't appear before download.

---

## 2. Content depth scaling

Add a `contentDepth` selector with four tiers and route it end-to-end.

| Depth | Chapters | Words/chapter | Worksheet exercises | Checklist items | Style-guide page target |
|-------|----------|---------------|---------------------|-----------------|------------------------|
| Quick | 5 | 600–800 | 3 | 12 | 20–30 |
| Standard (default) | 6 | 1100–1400 | 5 | 20 | 40–60 |
| Premium | 8 | 1800–2400 | 8 | 32 | 80–120 |
| Authority | 10 | 2500–3500 | 12 | 50 | 150+ |

**Wiring**
- New `ContentDepth` type in `src/types/toolkit.ts`.
- Persist on toolkit row (extend the `toolkits` table with `content_depth text default 'standard'` via migration; nullable so existing rows keep working).
- Send in every `generate-toolkit-content` invocation (chapter, section, and component bodies).
- Edge function: depth multiplies `max_tokens`, the `wordTarget` lines in `CHAPTER_PROMPTS`, and the count requirements in `componentPrompts` (worksheet exercises, checklist items, templates, etc.).
- `GuideSectionBuilder` injects extra section templates when depth ≥ Premium, padding `GUIDE_SECTION_TEMPLATES` to 8/10 sections.

---

## 3. Writing voice blend (primary + secondary + ratio)

Replace single-voice control with a blend.

- New UI component `VoiceBlendSelector` (replaces the right-side voice select in `ContentControlsBar.tsx`):
  - Primary Voice dropdown (existing 9 voices)
  - Secondary Voice dropdown (same options, but the currently-selected primary is disabled to prevent duplicates)
  - Blend Ratio: pill group with 70/30, 60/40, 50/50
  - Live preview line: "Write in 70% No-Nonsense, 30% Friendly Mentor."
- Persist `primaryVoice`, `secondaryVoice`, `blendRatio` (default `tactical` / `coaching` / `70/30` for this product type) in toolkit state and in DB (migration adds `primary_voice`, `secondary_voice`, `blend_ratio`).
- Edge function:
  - When secondary voice is present, build `styleDirective` as: leading paragraph "Blend two voices: {pct1}% {VOICE1_NAME} + {pct2}% {VOICE2_NAME}. Be {VOICE1 essence} while still {VOICE2 essence}." followed by both `STYLE_DIRECTIVES` blocks weighted (the heavier one first, with an explicit instruction "Lead with this tone for ~70% of sentences").
  - Fall back to single voice if `secondaryVoice` is null.

---

## 4. Boost Score (working, dynamic, with rewrite)

**a. New scoring engine** — `src/lib/boostScore.ts`
- Pure-TS scorer that takes `{ title, subtitle, hook, promise, audience, productDescription, upsellBridge, salesPageBullets, niche }` and returns:
  ```ts
  { overall: number; band: 'weak'|'needs-work'|'strong'|'launch-ready'; categories: Record<Category, { score:number; tip:string }> }
  ```
- 10 categories from the brief: title strength, hook clarity, buyer pain, promise specificity, speed/result appeal, audience clarity, monetization potential, differentiation, upsell alignment, traffic potential.
- Heuristic rules per category (length windows, presence of numbers/timeframes, action verbs, audience qualifiers, pain-keyword presence, presence of upsell tie-in, etc.) — fast and deterministic, runs on every keystroke (debounced).
- Bands: 0–49 weak (red), 50–69 needs work (amber), 70–84 strong (blue), 85–100 launch-ready (green).

**b. New component** — `src/components/BoostScoreCard.tsx`
- Big circular overall score with band color.
- Per-category bars with score + 1-line improvement tip.
- Recomputes via `useMemo` on every relevant field change so it updates live.
- "Boost This Product" button → calls a new edge function `boost-product-copy` (Lovable AI, `google/gemini-3-flash-preview`) that returns rewritten `title`, `subtitle`, `hook`, `description`, `chapterAngle`, `upsellBridge`. Each field is shown as a diff card with Accept/Reject; Accept writes back into form state.

**c. Placement** — slot the card into both `CreateToolkit` step 1 (niche/title) and the `ToolkitBuilder` dashboard tab.

---

## 5. Structured product output

Introduce a canonical `GeneratedProduct` shape (matches the brief) and use it as the contract between generator and PDF exporter.

```ts
interface GeneratedProduct {
  title; subtitle; targetAudience; promise; productDescription;
  tableOfContents: string[];
  chapters: { title; summary; content; actionSteps:string[]; examples:string[]; worksheetPrompt:string }[];
  bonuses: { title; content }[];
  checklists: { title; items:string[] }[];
  quickStartGuide: string;
  salesPageBullets: string[];
  emailPromo: string;
  upsellBridge: string;
  conclusion: string;
}
```

- Add a new edge function `generate-product-package` that returns this shape in one structured call (using tool-calling for guaranteed JSON), respecting `contentDepth` + voice blend.
- Add a new exporter `generateFullProductPDF(product, branding)` in `pdfGenerator.ts` that walks every field and renders: Cover → Description → TOC → each Chapter (title, summary, content, action steps, examples, worksheet prompt) → Quick Start → Bonuses → Checklists → Sales Page Bullets → Email Promo → Upsell Bridge → Conclusion → Disclaimer/footer with page numbers throughout.
- Old per-component PDFs (`generateGuidePDF`, etc.) stay for backward compatibility but call into shared section-renderer helpers so the empty-section guard applies everywhere.

---

## 6. UI improvements (result page)

In `ToolkitPreview.tsx` add an action row above the download buttons:
- **Preview PDF Content** — opens a modal listing each section, word count, status dot.
- **Regenerate Full Content** — re-runs the depth-aware generator for any section below the depth's word floor.
- **Export PDF** — disabled until validation passes; shows total word count + estimated page count beside it (`Math.max(1, Math.round(words / 280))`).
- Loading states and success/error toasts on every action.

---

## 7. Best defaults for this product type

When the niche/category resolves to digital-product / "PDF Empire"-style products:
- `contentDepth = 'standard'`
- `primaryVoice = 'tactical'` (No-Nonsense)
- `secondaryVoice = 'coaching'` (Friendly Mentor)
- `blendRatio = '70/30'`

Set in `CreateToolkit` initial state and persisted on first save.

---

## Files to be edited / added

**Edit**
- `src/pages/CreateToolkit.tsx` — fix `data.content` → `data.sectionContent`, add depth + voice-blend state, default values, plug in `BoostScoreCard`.
- `src/pages/ToolkitBuilder.tsx` — same field-name fix in `handleRegenerateChapter` if it ever calls section endpoint, validation guard in `handleDownloadPdf`.
- `src/lib/pdfGenerator.ts` — pre-export validation, `EmptyContentError`, section placeholders, new `generateFullProductPDF`.
- `src/lib/zipBundler.ts` — call validation, surface errors instead of swallowing.
- `src/components/ToolkitPreview.tsx` — Preview / Regenerate / Export buttons, word + page count, validation gating.
- `src/components/toolkit/ContentControlsBar.tsx` — replace single voice with `VoiceBlendSelector`.
- `src/components/toolkit/DashboardTab.tsx` — surface depth selector + new voice blend.
- `src/types/toolkit.ts` — add `ContentDepth`, voice blend fields, `GeneratedProduct`.
- `supabase/functions/generate-toolkit-content/index.ts` — accept `contentDepth`, `primaryVoice`, `secondaryVoice`, `blendRatio`; scale word targets and `max_tokens`; build blended style directive.

**Add**
- `src/lib/boostScore.ts` — pure scorer.
- `src/components/BoostScoreCard.tsx` — score UI + Boost This Product action.
- `src/components/toolkit/VoiceBlendSelector.tsx`
- `src/components/toolkit/PdfPreviewModal.tsx`
- `supabase/functions/boost-product-copy/index.ts` — rewrites copy using Lovable AI.
- `supabase/functions/generate-product-package/index.ts` — returns the `GeneratedProduct` shape via tool-calling.

**DB migration**
- `toolkits` add columns: `content_depth text default 'standard'`, `primary_voice text`, `secondary_voice text`, `blend_ratio text default '70/30'`, `boost_score jsonb`. All nullable / defaulted so existing rows stay valid.

---

## Test case verification

After implementation, manually run with the supplied product ("The 60-Minute PDF Profit Protocol …") and confirm:
1. Boost Score renders with non-zero values across all 10 categories and updates live as the title is edited.
2. Generating with depth = Standard produces ≥ 6 chapters of 1100+ words each in the UI.
3. Voice blend defaults to 70% Tactical / 30% Coaching and the output reads direct but encouraging.
4. PDF export produces a multi-page file with Cover, TOC, every chapter body, action steps, worksheets, checklist, sales bullets, upsell bridge, and page numbers — never blank.
5. If content is wiped, Export PDF disables and shows the validation warning instead of generating a 2-page shell.

---

Approve this plan and I'll implement it.
## AI Smart Routing (added)
- Added `_shared/aiRouter.ts` (backend) + `lib/aiRouting.ts` (frontend mirror) — Hybrid Balanced mapping (Gemini Flash Lite for fast, GPT-5 for longform/sales, GPT-5 + reasoning:medium for Premium tier).
- `callRoutedAI()` includes auto-fallback chain per task kind.
- DB: profiles.ai_quality_mode + ai_model_preference; toolkits.ai_quality_mode_override.
- Settings → new "AI Routing" tab with live model preview + cost/speed badges.
- ContentControlsBar → per-project AI Quality override.
- Wired into: generate-toolkit-content (longform), generate-sales-letter (salescopy), boost-product-copy (salescopy), generate-toolkit-title (fast). All four redeployed.

