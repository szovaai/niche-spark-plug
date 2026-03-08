

# Quality & Conversion Upgrade — Gap Analysis and Implementation Plan

## What's Already Built (No Work Needed)

Several of these requests are already implemented:

| Request | Status | Where |
|---------|--------|-------|
| 1. Research Engine | **DONE** | Research Agent (`/research-agent`) with 4 modes (Pain Point, Demand-Led, Competitor Gap, Asset-First) + Research Hub (`/research`) with Niche Wizard, Gap Finder, Store Spy |
| 2. Quality Guardrails | **DONE** | `ContentQualityReport` component with A-F grading on specificity, actionability, example density; auto-flags vague phrases |
| 4. Action Engine (worksheets, examples, action steps per chapter) | **DONE** | Structured chapters with `moduleGoal`, `hook`, `actionPlan`, `realExample`, `commonMistakes`, `actionStep` |
| 5. Launch Assets Generator (emails, affiliate kit, upsell, order bump) | **DONE** | Step 4 marketing + Step 3 funnel with offer stack, order bump, upsell, affiliate kit |
| 7. Buyer List Builder (lead magnet, opt-in, email sequence) | **DONE** | Step 3 generates opt-in page, thank you page; Step 4 generates email sequences |
| 8. Done-For-You Funnel Assets | **DONE** | Instant Funnel Site export (HTML ZIP for Gumroad/Systeme.io/Netlify) in Step 5 |
| 9. Conversion Booster AI | **DONE** | `SalesPageAudit` component auditing 10 conversion elements with one-click optimize |
| 10. Launch Calendar | **DONE** | Step 5 generates day-by-day launch timeline with completion tracking |
| Bonus: Product Angle Generator | **DONE** | `CampaignAngleSelector` in Step 1 with conversion predictions per angle |

## What's NOT Built Yet (2 Items)

### Upgrade A: WarriorPlus Mode Toggle (Request #6)

A global toggle that adapts ALL output across every step for WarriorPlus-style short, bold, fast-action formatting. Currently the Sales Style Selector only affects Step 3 funnel copy. This toggle should affect Steps 2-5.

**Implementation:**
- Add a `launchMode` state (`"standard" | "warriorplus"`) to `LaunchWizard.tsx`, toggled via a sticky badge/switch in the wizard header
- Pass `launchMode` to all edge functions (product, funnel, marketing, checklist)
- In each edge function, append a WarriorPlus directive to the system prompt when mode is active:
  - Shorter paragraphs, bolder claims, $7-$17 pricing focus, "What You'll Discover / What You Get / Bonuses / Fast Action" section structure
  - Product content: shorter chapters, more bullet points, less theory
  - Marketing: affiliate-focused swipes, JV page angle
- UI: Small toggle pill at the top of the wizard: "🎯 WarriorPlus Mode"

**Files to modify:**
- `src/pages/LaunchWizard.tsx` — add state + pass to steps
- `src/components/wizard/WizardStep1.tsx` through `WizardStep5.tsx` — pass `launchMode` to edge function calls
- `supabase/functions/generate-launch-product/index.ts` — add WP directive
- `supabase/functions/generate-launch-funnel/index.ts` — add WP directive
- `supabase/functions/generate-launch-marketing/index.ts` — add WP directive
- `supabase/functions/generate-launch-checklist/index.ts` — add WP directive

### Upgrade B: Premium PDF Layout Engine (Request #3)

The current PDF exports use jsPDF with basic formatting. The request is for designed assets with cover pages, chapter dividers, callout boxes, icons, and modern typography — a "Notion/Starter Story" aesthetic.

This is a significant upgrade to the existing PDF system. The foundations exist in `pdfLayoutPresets.ts` with 6 design presets, but the actual rendering doesn't fully utilize them for workbook-style elements.

**Implementation:**
- Enhance `src/lib/pdfGenerator.ts` to render:
  - Full-bleed cover page with gradient background, large title, subtitle, author
  - Styled table of contents with page numbers
  - Chapter divider pages (full-width accent bar, chapter number badge, title)
  - Callout boxes: "Quick Win" (green), "Reality Check" (amber), "Pro Tip" (blue) with icons
  - Worksheet sections with dotted fill lines and checkbox fields
  - Modern footer with page numbers and product branding
- Add a "Premium Export" button alongside the existing download that uses the enhanced renderer

**Files to modify:**
- `src/lib/pdfGenerator.ts` — enhanced rendering functions
- `src/lib/pdfLayoutPresets.ts` — expand preset definitions with callout/divider styles
- `src/components/wizard/WizardStep2.tsx` — add "Premium PDF" download option

## Implementation Priority

1. WarriorPlus Mode Toggle (smaller scope, high impact on user perception)
2. Premium PDF Layout Engine (larger scope, high impact on product quality)

