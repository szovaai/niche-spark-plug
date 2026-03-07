

# Refinements to Existing Implementation

All 7 major features from the previous plan are already built and working. The user's refined spec calls out 4 specific polish items that aren't yet implemented. Here's what needs to change:

## 1. Make Campaign Angle Mandatory Before Continuing

Currently Step 1 shows a "Continue to Product Content" button even if no angle is selected. Gate this so the user must pick an angle first.

**File:** `src/components/wizard/WizardStep1.tsx`
- Disable or hide the "Continue" button until `result.selectedAngle` is set
- Add a small helper text like "Select a campaign angle above to continue"

## 2. Show Selected Angle Label in Step 4 Ads

Each ad card already shows `ad.hookAngle` as a badge. Add an additional visual indicator showing the project's selected campaign angle at the top of the Ads tab to reinforce the "AI Brain" consistency effect.

**File:** `src/components/wizard/WizardStep4.tsx`
- At the top of the Ads tab content, render a small banner: "Campaign Angle: {selectedAngle}" using the `productBrief.selectedAngle` value

## 3. Completion Percentage on Products Page

Currently the Products page shows a status badge ("in_progress" / "complete"). Add a completion percentage based on which steps have data.

**File:** `src/pages/Products.tsx`
- Calculate percentage from the 5 step fields (step1-5): each non-null step = 20%
- Show a small progress indicator or percentage text next to the status badge

## 4. Rename Button to "Build My Launch System"

**File:** `src/components/wizard/WizardStep1.tsx`
- Change "Generate Entire Launch System" text to "Build My Launch System"

**File:** `src/components/wizard/GenerateAllModal.tsx`
- Change modal title from "Building Your Launch System" to "Building Your Launch System" (already correct, no change needed)

---

These are all small, surgical edits across 3 files with no database or edge function changes required.

