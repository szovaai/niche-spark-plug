

# Sales Letter & Product Content Quality Upgrade

## What's Being Improved

The sales letter generator produces decent structure but weak conversion copy. The product generator creates outlines but not full written content. Two targeted upgrades fix both:

1. **Sales Letter Raw Draft Prompt Overhaul** — Add module-by-module value stack, bonus stack with dollar values, scarcity section, risk reversal, and fast-action CTA to the raw draft prompt structure
2. **Full Chapter Content Generation** — Add a "Write Full Chapter" button that generates 1,500-2,500 words of actual readable content per chapter (not just outlines)

## Changes

### 1. Sales Letter Raw Draft — Enhanced Prompt Structure
**File: `supabase/functions/generate-sales-letter/index.ts`**

Update the raw draft prompt (Phase 1, ~lines 310-355) to add 4 missing sections after the current 8:

```
9. MODULE-BY-MODULE VALUE STACK
   - List each module with a name, what they'll discover, and perceived value ($47-$297)
   - Format: "Module 1: [Name] — [What they learn] — Value: $XX"
   - Total the values at the bottom

10. BONUS STACK (3-5 bonuses)
   - Each bonus: name, one-line benefit, perceived value
   - Format: "Bonus #1: [Name] — [Benefit] — Value: $XX"

11. SCARCITY + RISK REVERSAL
   - Launch pricing angle (not fake countdown)
   - Full money-back guarantee with confident language
   - Example: "Try the entire system. If it doesn't help you [result], request a refund."

12. FAST ACTION CTA
   - Direct, confident call to action
   - "Click the button below to get instant access"
   - Repeat the total value vs. price comparison
```

Also update the polish phase (Phase 2, ~lines 386-410) to ensure Kennedy HTML output includes:
- `bonus-row` divs for each bonus with perceived values
- A visible value stack table inside the `order-box`
- A guarantee section with specific risk-reversal language

### 2. Full Chapter Content Generator
**File: `supabase/functions/generate-launch-content/index.ts`**

Add a new mode alongside `expandChapter` — called `writeFullChapter`. When triggered, the edge function generates 1,500-2,500 words of actual readable chapter content (not JSON structure) including:
- Opening hook paragraph
- Core teaching with examples
- Action steps inline
- Closing summary

Returns: `{ fullContent: "..." }` as markdown text.

**File: `src/components/wizard/WizardStep2.tsx`**

Add a "Write Full Content" button next to each chapter's Expand button. When clicked:
- Calls `generate-launch-content` with `{ writeFullChapter: true, chapterToExpand: chapter, productBrief }`
- Stores the result in a new optional `fullContent?: string` field on `ChapterItem`
- Displays the full content in a scrollable text area within the accordion
- Includes copy/download buttons for the full text

Also add a "Write All Chapters" button at the top of the chapters card that sequentially generates full content for all chapters with a progress indicator.

### 3. Chapter Data Model Update
**File: `src/types/launchWizard.ts`**

Add to `ChapterItem`:
```typescript
fullContent?: string;  // Full written chapter content (1500-2500 words)
```

## Files Modified

| File | Changes |
|------|---------|
| `supabase/functions/generate-sales-letter/index.ts` | Add value stack, bonus stack, scarcity, risk reversal, CTA sections to raw + polish prompts |
| `supabase/functions/generate-launch-content/index.ts` | Add `writeFullChapter` mode for full 1,500-2,500 word chapter generation |
| `src/types/launchWizard.ts` | Add `fullContent` field to ChapterItem |
| `src/components/wizard/WizardStep2.tsx` | Add "Write Full Content" per-chapter button + "Write All Chapters" bulk button with progress |

