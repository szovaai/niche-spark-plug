

# Build It Better Than Saisify — Enhancement Plan

## What Saisify Does (and Where It Falls Short)

Saisify is a $27 tool with 4 specialized AI agents: Demand Finder, Product Architect, Content Wizard, and Copy Wizard. It generates a product + sales page + ad copy in 30 minutes and provides a 1-click sales page template. Their key selling points: trained on "$16M in sales intelligence," revenue calculator, scaling calculator, and a launch community.

**Where Saisify falls short** (and where DigiLaunchKit already wins or can win):
- No project management or persistence -- just a prompt wrapper
- No asset library or content vault
- No launch checklist or timeline
- No cohesive "AI Brain" that keeps messaging consistent across assets
- No campaign angles or A/B variations
- No ad copy generation (they mention it but it's basic)

**DigiLaunchKit already has** most of the core pipeline (5-step wizard, asset library, funnel copy, marketing assets, checklist). The upgrades below focus on the features that make DigiLaunchKit decisively better.

---

## Enhancements to Build

### 1. Add "Campaign Angles" to Step 1 (Product Setup)

After the product concept is generated, add a new section that generates 3 distinct sales angles (e.g., speed, automation, beginner-friendly). User picks the winning angle, and it gets passed into all subsequent steps (funnel, emails, posts) for messaging consistency.

**Changes:**
- Update `Step1Product` type to include `campaignAngles: CampaignAngle[]` and `selectedAngle: string`
- Update `generate-launch-product` edge function to also return 3 campaign angles
- Update `WizardStep1.tsx` to show angle cards with a "Use This Angle" selector
- Pass `selectedAngle` into Steps 3, 4 prompts so funnel/marketing copy stays consistent

### 2. Add "Ad Copy Generator" to Step 4 (Marketing Assets)

Saisify's headline feature is ad copy. Add a dedicated "Ads" tab to Step 4 that generates:
- 5 Facebook/Instagram ad variations (headline, primary text, CTA)
- 3 ad hook angles
- Suggested targeting keywords

**Changes:**
- Update `Step4Marketing` type to include `adCopy: AdVariation[]`
- Update `generate-launch-marketing` edge function prompt to also generate ad copy
- Add "Ads" tab to `WizardStep4.tsx` with copy buttons per ad variation

### 3. Add "Revenue Calculator" Widget to Dashboard

Simple interactive widget (like Saisify's) showing projected revenue based on price and sales/day. This is a powerful psychological tool.

**Changes:**
- Create `RevenueProjector` component with a slider (1-20 sales/day) and price input
- Shows daily/monthly/yearly revenue projections
- Add to Dashboard below the stats grid

### 4. Add "Generate Entire Launch" Progress Modal

Currently the "Generate Entire Launch System" button just shows toast messages. Replace with a proper full-screen progress modal showing each step completing in real-time with animations.

**Changes:**
- Create `GenerateAllModal` component with 5 animated step indicators
- Shows: current step name, spinner, checkmark on completion, estimated time
- Replaces the inline toasts during `generateAll()`

### 5. Add "Order Bump & Upsell Generator" to Step 3 (Funnel)

Saisify doesn't have this. Generate order bump copy and upsell offer copy alongside the funnel.

**Changes:**
- Update `Step3Funnel` type to include `orderBump: string` and `upsellOffer: string`
- Update `generate-launch-funnel` prompt to also generate order bump + upsell copy
- Add "Order Bump" and "Upsell" tabs to `WizardStep3.tsx`

### 6. Add "Launch Timeline" to Step 5

Replace the generic checklist with a day-by-day launch timeline (Day 1: finalize product, Day 2: set up sales page, etc.).

**Changes:**
- Update `ChecklistStep` type to include `day: number`
- Update `generate-launch-checklist` prompt to organize steps by day
- Update `WizardStep5.tsx` to render as a timeline grouped by day instead of a flat list

### 7. Resume/Edit Existing Projects from Products Page

Currently projects are view-only in the Products list. Add ability to click a project and reopen the wizard with all data pre-loaded.

**Changes:**
- Add route `/wizard/:projectId` that loads existing project data
- Update `LaunchWizard.tsx` to accept a `projectId` param and pre-fill all state from the database
- Update Products page to link each project to `/wizard/${p.id}`

---

## Implementation Order

1. **Types + Edge Functions** -- Update types and all 5 edge function prompts (campaign angles, ad copy, order bump/upsell, day-based timeline)
2. **Wizard UI Enhancements** -- Campaign angle selector in Step 1, new tabs in Steps 3-4, timeline view in Step 5, progress modal for Generate All
3. **Dashboard Revenue Calculator** -- New standalone widget
4. **Project Resume** -- Route param support + data loading in wizard

## Files Modified

- `src/types/launchWizard.ts` -- Add CampaignAngle, AdVariation types; extend existing types
- `supabase/functions/generate-launch-product/index.ts` -- Add campaign angles to prompt
- `supabase/functions/generate-launch-funnel/index.ts` -- Add order bump + upsell to prompt
- `supabase/functions/generate-launch-marketing/index.ts` -- Add ad copy to prompt
- `supabase/functions/generate-launch-checklist/index.ts` -- Add day-based timeline structure
- `src/components/wizard/WizardStep1.tsx` -- Campaign angle selector UI
- `src/components/wizard/WizardStep3.tsx` -- Order Bump + Upsell tabs
- `src/components/wizard/WizardStep4.tsx` -- Ads tab
- `src/components/wizard/WizardStep5.tsx` -- Day-based timeline view
- `src/pages/LaunchWizard.tsx` -- Progress modal, project resume support, route param
- `src/pages/Products.tsx` -- Link to `/wizard/:id` for resume
- `src/pages/Dashboard.tsx` -- Revenue calculator widget
- `src/App.tsx` -- Add `/wizard/:projectId` route
- New: `src/components/wizard/GenerateAllModal.tsx`
- New: `src/components/wizard/RevenueProjector.tsx`
- New: `src/components/wizard/CampaignAngleSelector.tsx`

No database schema changes needed -- existing JSONB fields accommodate the expanded data structures.

