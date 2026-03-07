

# Pass 2: Content Depth + Structured Modules + Sales Page Optimizer

This pass upgrades the quality and architecture of generated content across Steps 2-3 of the wizard.

---

## 2A. Content Depth Audit & Quality Checker

**New component:** `src/components/wizard/ContentQualityReport.tsx`
- Auto-analyzes generated `Step2Content` on 4 dimensions with A-F letter grades:
  - **Specificity** — counts vague phrases ("many", "some", "various", "proven strategies"), flags them
  - **Actionability** — counts action verbs, step-by-step structures, checks for minimum 7 actionable steps
  - **Example Density** — counts examples/case studies (target 3+ per chapter)
  - **Theory/Tactics Ratio** — measures proportion of conceptual vs actionable content (target 70% tactical)
- Shows overall percentage score (e.g., "78% specific and actionable")
- Collapsible panel rendered below each chapter in WizardStep2
- "Expand This Section" button per chapter that calls `generate-launch-content` with an expansion prompt to add examples, walkthroughs, and troubleshooting
- All scoring logic is client-side in a new utility `src/lib/contentAudit.ts` — no edge function needed for the analysis itself

**Integration:** Add below the chapter accordion in `WizardStep2.tsx`

---

## 2B. Structured Module Architecture

**Type changes in `launchWizard.ts`:**
- Extend `ChapterItem` with optional structured fields: `moduleGoal`, `hook`, `coreConcept`, `actionPlan: {step: string, action: string, why: string}[]`, `realExample`, `commonMistakes: string[]`, `actionStep`, `moduleSummary: string[]`

**Edge function update:** `generate-launch-content/index.ts`
- Update the prompt to enforce the structured module template per chapter:
  - Module Goal → Hook (2-3 paragraphs) → Core Concept → Step-by-Step Action Plan (3-7 steps) → Real Example → Common Mistakes (2-3) → Action Step → Module Summary (3 bullets)
- Output these as separate JSON fields per chapter instead of flat text

**UI update in `WizardStep2.tsx`:**
- Render each chapter with labeled sections using icons: Target (goal), BookOpen (hook), Lightbulb (concept), ListOrdered (action plan), CheckCircle (example), AlertTriangle (mistakes), Pencil (action step), Key (summary)
- Each section is individually copyable
- Fallback: if chapter only has `summary`/`keyPoints` (old format), render in legacy accordion mode

---

## 2C. Sales Page Optimizer (Landing Page Audit)

**New component:** `src/components/wizard/SalesPageAudit.tsx`
- Auto-runs after Step 3 funnel generation
- Checks the `salesPage` content for 10 conversion elements:
  1. Pattern Interrupt (strong headline)
  2. Specific Promises (numbers, not vague)
  3. Social Proof (testimonials/numbers referenced)
  4. Clear CTA (buy button / action words)
  5. Objection Handling (FAQ or concerns section)
  6. Urgency/Scarcity (deadline or limit)
  7. Risk Reversal (guarantee/refund)
  8. Readability (short paragraphs, bullets)
  9. Video/Visual placeholder
  10. P.S. Line
- Each element scored as present/missing via keyword/pattern matching (client-side)
- Shows score: "Your page is 73% optimized"
- Lists missing elements with recommendations
- "Optimize This Page" button calls `generate-launch-funnel` with an optimization prompt that instructs the AI to add the missing elements while preserving existing copy
- Rendered as a card below the funnel tabs in `WizardStep3.tsx`

---

## Files to Create
1. `src/lib/contentAudit.ts` — scoring utility functions
2. `src/components/wizard/ContentQualityReport.tsx` — quality report card UI
3. `src/components/wizard/SalesPageAudit.tsx` — sales page conversion audit UI

## Files to Modify
1. `src/types/launchWizard.ts` — extend `ChapterItem` with structured module fields
2. `src/components/wizard/WizardStep2.tsx` — integrate quality report + structured module rendering
3. `src/components/wizard/WizardStep3.tsx` — integrate sales page audit
4. `supabase/functions/generate-launch-content/index.ts` — enforce structured module template in prompt

## No Database Changes
All new data fits within existing JSONB columns.

