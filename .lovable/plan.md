

# Content Expansion System

## Overview

Add a Content Depth selector, per-chapter expansion buttons (Add Case Study, Add Worksheet, etc.), a page estimator, and enhanced quality scoring — turning the product generator from an outline tool into a full product factory.

## Changes

### 1. Content Depth Selector (WizardStep2.tsx)

Add a radio group above the "Generate Full Product" button with 4 options:
- **Quick** (20-30 pages) — 4-5 chapters, concise
- **Standard** (40-60 pages) — 6-8 chapters (current default)
- **Premium** (80-120 pages) — 8-10 chapters with expanded examples, worksheets, frameworks
- **Authority** (150+ pages) — 12-15 chapters with case studies, scripts, templates per chapter

Pass `contentDepth` to the edge function, which adjusts chapter count and detail level in the prompt.

### 2. Per-Chapter Expansion Buttons (WizardStep2.tsx)

Replace the single "Expand" button per chapter with a dropdown of specific expansion types:
- **Expand Chapter** (existing)
- **Add Case Study** — generates a detailed before/after case study
- **Add Worksheet** — generates a fillable worksheet with prompts
- **Add Template** — generates a reusable template/script
- **Add Checklist** — generates an action checklist
- **Add Real Example** — generates a step-by-step real-world walkthrough

Each calls `generate-launch-content` with a new `expansionType` parameter. The expanded content is appended to the chapter's existing fields.

### 3. Chapter Data Model Enhancement (launchWizard.ts)

Add optional fields to `ChapterItem`:
```
caseStudies?: { name: string; problem: string; solution: string; result: string; quote: string }[]
worksheets?: { title: string; instructions: string; fields: string[] }[]
templates?: { name: string; content: string }[]
checklists?: { title: string; items: string[] }[]
additionalExamples?: { title: string; steps: string[] }[]
```

### 4. Page Estimator (WizardStep2.tsx)

Show an "Estimated Pages" badge that calculates based on:
- Base word count per chapter (~800 words for Quick, ~1200 Standard, ~2000 Premium, ~2500 Authority)
- Additional assets per chapter (worksheets +2 pages, case studies +1 page, etc.)
- Updates dynamically as chapters are expanded

Display: `📄 Estimated Pages: 62` below the chapter count stats.

### 5. Edge Function Update (generate-launch-content/index.ts)

- Accept `contentDepth` param → adjust chapter count and detail level in prompt
- Accept `expansionType` param (caseStudy, worksheet, template, checklist, realExample) → generate specific expansion content with targeted prompts
- Return structured JSON matching the new `ChapterItem` fields

### 6. Enhanced Quality Score (contentAudit.ts)

Add two new audit dimensions:
- **Asset Depth** — checks for worksheets, case studies, templates in chapters (target: 1+ per chapter)
- **Example Richness** — checks for specific numbers, dollar amounts, timeframes in examples

Quality report suggests specific improvements: "+ Add 2 worksheets", "+ Add 1 case study", "+ Expand chapter 3"

## Files Modified

| File | Changes |
|------|---------|
| `src/types/launchWizard.ts` | Add expansion fields to ChapterItem |
| `src/components/wizard/WizardStep2.tsx` | Content depth selector, per-chapter expansion menu, page estimator |
| `supabase/functions/generate-launch-content/index.ts` | Handle contentDepth + expansionType params |
| `src/lib/contentAudit.ts` | Add Asset Depth and Example Richness dimensions, improvement suggestions |

