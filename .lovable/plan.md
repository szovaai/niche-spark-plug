

# Product Graphics Integration + Enhanced Build Sequence

## What's Requested

Two upgrades:
1. **Product Graphics step** in the Launch Wizard — auto-generate eCover/bundle graphics using the existing `generate-ecover` edge function
2. **Enhanced "Build My Launch System" progress sequence** — more granular, psychologically-tuned steps with celebration state

## Current State

- The `generate-ecover` edge function already exists and works (used by Toolkit Builder, EcoverFactory, etc.)
- The `GenerateAllModal` already shows 5-step progress but is basic (5 coarse steps, no celebration)
- No Product Graphics step exists in the Launch Wizard — `WIZARD_STEPS` has 5 steps
- The wizard stores state for steps 1-5 but has no graphics state

## Implementation Plan

### Part 1: Add Step 3 — Product Graphics (shifts current 3-5 to 4-6)

**New step between Product Content and Funnel Builder:**

```
1. Product Setup
2. Product Content  
3. Product Graphics  ← NEW
4. Funnel Copy (was 3)
5. Marketing Assets (was 4)
6. Launch Checklist (was 5)
```

**Files to modify:**

- `src/types/launchWizard.ts` — Update `WIZARD_STEPS` to 6 steps, add `Step3Graphics` interface with `coverUrl`, `bundleUrl`, `bonusCoverUrls` fields
- `src/pages/LaunchWizard.tsx` — Add `step3Graphics` state, shift step numbering (current step 3→4, 4→5, 5→6), pass graphics state, update `generateAll` to include graphics generation as step 3, update sidebar step count
- `src/components/wizard/WizardStep5.tsx` — Update component (now step 6) to receive graphics URLs for the Launch In A Box export

**Files to create:**

- `src/components/wizard/WizardStep3Graphics.tsx` — New component that:
  - Shows "Generate Product Graphics" button
  - Calls `generate-ecover` edge function with product title, niche, and style
  - Offers style selector (WarriorPlus Launch / Minimal Ebook / Premium Course / Dark SaaS)
  - Displays generated cover, bonus covers, and bundle image
  - Includes "Regenerate" button per graphic
  - Auto-generates 3 graphics: ebook cover, bonus bundle, product stack

### Part 2: Enhanced GenerateAllModal

**Update `src/components/wizard/GenerateAllModal.tsx`:**

- Expand from 5 steps to 12 granular sub-steps for psychological impact:
  1. Researching your market
  2. Analyzing audience frustrations
  3. Generating product concept
  4. Building product structure
  5. Writing ebook content
  6. Creating worksheets & templates
  7. Designing product graphics
  8. Writing sales page
  9. Creating email launch sequence
  10. Building funnel assets
  11. Generating affiliate kit
  12. Preparing launch timeline

- The actual API calls remain the same 6 steps — the extra sub-steps are visual breakdowns that advance automatically within each real API call
- Add celebration state when complete: confetti animation (canvas-confetti already installed), "Your Digital Product Launch Is Ready" with Launch Score summary
- Add "Estimated build time: ~45 seconds" text
- Show completion summary with buttons: "Preview Product", "Preview Funnel", "Export Launch Kit"

### Part 3: Graphics in Launch In A Box Export

**Update `src/lib/launchBoxExport.ts`:**

- Add `GRAPHICS/` folder to the ZIP
- Include `ProductCover.png`, `BonusCover.png`, `BundleBox.png` (fetched from the generated URLs and converted to blobs)
- Reference graphics in the README.txt instructions

### Part 4: Graphics in Funnel HTML Export

**Update `src/lib/funnelSiteGenerator.ts`:**

- Insert `<img>` for product bundle graphic in the sales page under "What You'll Get" section
- Insert bundle image on the checkout page

## Files Summary

| File | Action |
|------|--------|
| `src/types/launchWizard.ts` | Modify — add `Step3Graphics`, update `WIZARD_STEPS` to 6 |
| `src/components/wizard/WizardStep3Graphics.tsx` | Create — graphics generation step |
| `src/pages/LaunchWizard.tsx` | Modify — add graphics state, shift steps, update generateAll |
| `src/components/wizard/GenerateAllModal.tsx` | Modify — 12 sub-steps, celebration, summary |
| `src/lib/launchBoxExport.ts` | Modify — add GRAPHICS folder with image blobs |
| `src/lib/funnelSiteGenerator.ts` | Modify — embed graphics in HTML |
| `src/components/wizard/WizardStep5.tsx` | Modify — pass graphics to export (now step 6) |

## Priority Order

1. WizardStep3Graphics component + wizard integration (core feature)
2. Enhanced GenerateAllModal with granular steps + celebration
3. Graphics in Launch In A Box ZIP export
4. Graphics in funnel HTML export

