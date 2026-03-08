

# Upgrade Sales Page Generator — Section-Based, High-Converting, Style-Selectable

## What's Wrong Now

The current funnel builder generates a **single long text blob** for the sales page. It's rendered as one continuous markdown document via `RenderedCopy`. There's no section-level editing, no style selector, no visual product stack, and the AI prompt produces generic copy despite having a strong system prompt.

## What Changes

### 1. Sales Letter Style Selector (new)
Add a dropdown/radio selector **before** generation with 4 styles:
- **WarriorPlus Style** (default) — urgency-heavy, scarcity, value stacking, pattern interrupts
- **Long-Form Copy** — classic Dan Kennedy letter format (already partially implemented)
- **Video Sales Letter Script** — teleprompter-ready script with timing cues
- **Short Landing Page** — hero + mechanism + stack + CTA only

Each style maps to a different prompt template in the edge function.

### 2. Section-Based Sales Page Output (replaces single blob)
Instead of `salesPage: "one big string"`, the edge function returns structured JSON sections:

```text
{
  "salesPageSections": {
    "patternInterrupt": "...",
    "bigPromise": "...",
    "curiosityHook": "...",
    "problemAgitation": "...",
    "mechanismIntro": "...",
    "systemSteps": [...],
    "productBreakdown": [{ module, title, description, value }],
    "bonusStack": [{ name, description, value }],
    "testimonials": "...",
    "objectionHandling": "...",
    "guarantee": "...",
    "urgencyClose": "...",
    "callToAction": "..."
  }
}
```

### 3. Section Tab UI in WizardStep3
Replace the single "Sales Page" tab content with **sub-tabs** for each section:
- Headline | Hook | Problem | Mechanism | System Steps | Product Breakdown | Bonus Stack | Testimonials | Objections | Guarantee | CTA
- Each section is individually editable (textarea) and regenerable
- "Copy Section" and "Preview Section" per tab

### 4. Product Breakdown Visual Card
A dedicated visual component showing module breakdown with perceived values — similar to the existing Offer Stack but for the product modules themselves. Auto-generated from Step 2 chapters.

### 5. Edge Function Prompt Overhaul
Update `generate-launch-funnel` to:
- Accept a `salesStyle` parameter
- Use style-specific prompt templates with the WarriorPlus framework (pattern interrupt → curiosity hook → mechanism → stack → urgency)
- Return structured sections instead of a single string
- Keep backward compatibility: if `salesPageSections` exists, use section UI; if `salesPage` string exists, fall back to current blob view

## Files to Create
- `src/components/wizard/SalesStyleSelector.tsx` — radio cards for the 4 styles
- `src/components/wizard/SalesPageSections.tsx` — tabbed section editor/viewer for the structured sales page
- `src/components/wizard/ProductBreakdownCard.tsx` — visual module stack with values

## Files to Modify
- `supabase/functions/generate-launch-funnel/index.ts` — add style-specific prompts, structured section output
- `src/components/wizard/WizardStep3.tsx` — integrate style selector, section-based UI, backward compat
- `src/types/launchWizard.ts` — add `SalesPageSections`, `SalesStyle` types, update `Step3Funnel`

## Implementation Priority
1. Types + style selector UI
2. Edge function prompt overhaul (4 style templates, structured JSON output)
3. `SalesPageSections` tabbed editor component
4. `ProductBreakdownCard` with module values
5. Integration into WizardStep3 with backward compatibility
6. Individual section regeneration (calls edge function with `regenerateSection` param)

