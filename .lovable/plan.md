

# Clone My Funnel — Implementation Plan

## Overview

Add a "Clone Funnel" feature to the Funnels page that lets users duplicate an existing funnel into a new launch project, optionally with AI-powered rewriting to adapt it to a new niche/audience/product.

## How It Works

1. User clicks "Clone Funnel" button on the Funnels page
2. Modal opens showing their existing funnels (from `launch_projects` with `step3_funnel`)
3. User selects a source funnel, then enters new details: product name, target market, tone
4. Two modes: **Clone** (duplicate as-is into new project) and **Clone & Improve** (AI rewrites all funnel pages for new context with stronger copy)
5. Creates a new `launch_projects` row with the cloned/rewritten `step3_funnel`, pre-filled niche/audience/product fields
6. Navigates user to the new project in the Launch Wizard

## Files to Create

### `src/components/CloneFunnelModal.tsx`
- Modal with two views: **Select Funnel** (list of user's funnels) → **Customize** (inputs for new product name, target market, tone selector, clone mode toggle)
- Tone options: WarriorPlus, Authority, Friendly, Bold
- Two buttons: "Clone Funnel" (direct copy) and "Clone & Improve" (calls edge function)
- Loading state during AI rewrite

### `supabase/functions/clone-funnel/index.ts`
- Accepts: `sourceFunnel` (the step3_funnel JSON), `newProductName`, `newAudience`, `newNiche`, `tone`, `improve` (boolean)
- If `improve=false`: returns the source funnel with simple find/replace of product name and audience references
- If `improve=true`: calls AI to rewrite each funnel section (salesPage, optInPage, thankYouPage, bonusPage, checkoutCopy, orderBump, upsellOffer) for the new context with stronger hooks, headlines, and pricing suggestions
- Uses existing `callTieredAI` and auth patterns

## Files to Modify

### `src/pages/Funnels.tsx`
- Add "Clone Funnel" button next to header
- Import and render `CloneFunnelModal`
- Pass projects list to modal for selection

### `supabase/config.toml`
- Register `clone-funnel` function with `verify_jwt = false`

## Implementation Priority
1. `CloneFunnelModal` component with select + customize UI
2. Direct clone mode (no AI — just duplicates into new project row)
3. `clone-funnel` edge function for AI-powered rewrite
4. "Clone & Improve" mode integration
5. Navigate to new project after clone

