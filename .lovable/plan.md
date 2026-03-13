

# Plan: Fix & Stabilize + Boost Audit Score

## Current Issues Identified

### 1. Funnel Save & Download
The funnel download code in `FunnelInjectionEngine.tsx` (line 105-124) looks correct — it uses JSZip + file-saver. The `generateFunnelSite` function produces HTML files and zips them. The error logging is already enhanced. The **save project** flow in `LaunchWizard.tsx` (line 237-305) also looks correct with proper user_id and RLS.

**Likely root causes:**
- The `generateFunnelSite` function may throw if `funnel` properties are missing/null (e.g., `salesPageSections` undefined)
- The `saveProject` function calls `launch-intelligence` which is non-critical but could mask the real error
- JSONB column size limits could cause autosave failures for large generated content

### 2. Audit Score (~57%)
The `contentAudit.ts` audit system scores across 10 dimensions. Low scores come from chapters lacking: full content, action plans, case studies, worksheets, templates, checklists, specific metrics, and time markers. The score is an average across all 10 dimensions per chapter, then averaged across chapters.

---

## Implementation Plan

### Phase 1: Fix & Stabilize (3 changes)

**A. Harden funnel download** (`src/components/wizard/FunnelInjectionEngine.tsx`)
- Add null-safety checks before calling `generateFunnelSite` — validate that `funnel.salesPage`, `funnel.salesPageSections` exist
- Wrap individual file generation in try/catch so one bad page doesn't kill the whole ZIP
- Show specific error in toast if funnel data is incomplete

**B. Harden generateFunnelSite** (`src/lib/funnelSiteGenerator.ts`)
- Add defensive defaults for all optional funnel properties (salesPageSections, offerStack, objections, etc.)
- Ensure undefined/null values don't cause template string crashes

**C. Fix autosave robustness** (`src/pages/LaunchWizard.tsx`)
- Add size-check before autosave — if JSONB payload is too large, truncate non-critical fields (e.g., trim fullContent to first 50k chars)
- Ensure `generateAll` triggers an immediate save after completion (not just debounced)
- Add error recovery: if autosave fails, show a non-blocking warning toast

### Phase 2: Boost Audit Score (2 changes)

**D. Enrich AI-generated chapters** (`supabase/functions/generate-launch-content/index.ts`)
- Update the prompt to require each chapter include: actionPlan (3+ steps with action verbs), moduleGoal, hook, commonMistakes, realExample with specific numbers/timelines, actionStep
- Add time markers ("within 60 minutes", "by day 3") and transformation language ("before → after") in the prompt instructions
- Require prompts, scripts, and templates to be embedded in chapter content

**E. Add "Boost Score" button** (`src/components/wizard/WizardStep2.tsx`)
- Add a one-click "Boost to 80+" button that calls a new edge function `boost-chapter-content` 
- This function takes existing chapter data + audit coaching messages and rewrites/enriches the chapter to hit all 10 audit dimensions
- Alternatively, modify the existing `generate-launch-content` function to accept an `enrichMode: true` flag that produces richer output

### Phase 3: Quick wins for score

**F. Auto-populate proof stack** during content generation
- Have `generate-launch-content` also return a `proofStack` with testimonial templates, before/after tables, and quick wins
- This feeds directly into the Transformation Audit's Proof & Believability dimension

---

## Files to modify
1. `src/components/wizard/FunnelInjectionEngine.tsx` — null safety
2. `src/lib/funnelSiteGenerator.ts` — defensive defaults  
3. `src/pages/LaunchWizard.tsx` — save robustness + post-generate save
4. `supabase/functions/generate-launch-content/index.ts` — enriched prompts
5. `src/components/wizard/WizardStep2.tsx` — "Boost Score" button (new)
6. `supabase/functions/boost-chapter-content/index.ts` — new edge function for score boosting

