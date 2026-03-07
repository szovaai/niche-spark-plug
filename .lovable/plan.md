

# Category-of-One Features — Implementation Plan

This adds 7 differentiating features that transform DigiLaunchKit from a "better workflow" into a product no competitor can match, plus a full landing page rewrite.

---

## Feature 1: Launch Score (Pre-Generation Advisor)

After the product concept generates in Step 1, auto-analyze the idea and display a Launch Score card with 5 dimensions (0-10 each), an overall score out of 100, and 2-3 AI improvement suggestions.

**New edge function:** `generate-launch-score`
- Input: niche, audience, productType, topic, product concept
- Output: `{ demand, competition, monetization, audienceClarity, offerStrength, overall, suggestions[], angleScores[] }`
- `angleScores` includes predicted conversion rating per campaign angle (Feature A from user's request)
- Uses `tieredAI` standard complexity

**New component:** `src/components/wizard/LaunchScoreCard.tsx`
- Radial progress for overall score, horizontal bars for each dimension
- Suggestion cards below
- Angle scores displayed as badges on the `CampaignAngleSelector` (e.g., "Recommended" badge on highest-scoring angle)

**Modified:** `WizardStep1.tsx` — after product concept generates, auto-call `generate-launch-score` and render `LaunchScoreCard` between the product card and campaign angles.

**Type update:** Add `launchScore` to `Step1Product` in `launchWizard.ts`.

---

## Feature 2: Unique Mechanism Generator

Generate 3 named proprietary frameworks (e.g., "The Rapid Launch Protocol") as selectable cards. Selected mechanism replaces `uniqueMechanism` in the product brief and flows into all subsequent prompts.

**Modified edge function:** `generate-launch-product` — expand prompt to return `mechanisms: [{ name, tagline, description }]` (3 options) alongside existing output.

**New component:** `src/components/wizard/MechanismSelector.tsx` — 3 clickable cards. On selection, updates `result.uniqueMechanism` to `"name — tagline"`.

**Modified:** `WizardStep1.tsx` — show `MechanismSelector` after product concept card, before campaign angles. User must select a mechanism before angles appear.

**Type update:** Add `mechanisms` array to `Step1Product`.

---

## Feature 3: Offer Stack Generator

Auto-generate a visual value stack (Core Product + 3 Bonuses with perceived values + total vs. asking price) as a new tab in Step 3.

**Modified edge function:** `generate-launch-funnel` — add `offerStack` to prompt output: `{ coreProduct: {name, value}, bonuses: [{name, description, value}], totalValue, askingPrice, stackCopy }`.

**Modified:** `WizardStep3.tsx` — add "Offer Stack" tab with visual strikethrough pricing card and copyable stack text.

**Type update:** Add `offerStack` to `Step3Funnel`.

---

## Feature 4: Affiliate Hook Generator

New "Affiliate Kit" tab in Step 4 generating: JV page headline, 3 affiliate email swipes, promo angle suggestions, bonus page headline.

**Modified edge function:** `generate-launch-marketing` — add `affiliateKit` to prompt output.

**Modified:** `WizardStep4.tsx` — add "Affiliate Kit" tab with copy buttons for each asset.

**Type update:** Add `affiliateKit` to `Step4Marketing`.

---

## Feature 5: "Steal This Launch" Analyzer

New page where users paste a competitor URL. System scrapes via Firecrawl (already connected), then AI analyzes the offer structure and suggests counter-positioning.

**New edge function:** `analyze-competitor-launch`
- Receives scraped markdown content
- Returns: detected angle, pricing strategy, funnel structure, 3 alternative angles, recommended counter-positioning
- "Build Competing Launch" button pre-fills wizard

**New page:** `src/pages/StealThisLaunch.tsx` at `/steal`
- URL input field, analyze button
- Calls existing Firecrawl scrape edge function (need to create `firecrawl-scrape` edge function since it doesn't exist yet), then passes markdown to `analyze-competitor-launch`
- Results card with insights + "Build Competing Launch" CTA

**New edge function:** `firecrawl-scrape` — standard Firecrawl scrape wrapper (uses existing `FIRECRAWL_API_KEY` secret).

**Modified:** `DashboardSidebar.tsx` — add "Steal This Launch" nav item. `App.tsx` — add `/steal` route.

---

## Feature 6: Launch DNA Card (Dashboard + Wizard Banner)

Visible "AI Brain" showing the active project's Product, Angle, Mechanism, Audience in a compact card.

**New component:** `src/components/wizard/LaunchDNACard.tsx`
- Compact card displaying: product name, selected angle, unique mechanism, target audience
- Shown on Dashboard for latest project
- Shown as persistent banner at top of wizard Steps 2-5

**Modified:** `Dashboard.tsx` — add LaunchDNACard after progress tracker. `LaunchWizard.tsx` — render LaunchDNACard banner in Steps 2-5.

---

## Feature 7: Landing Page Rewrite

Complete rewrite of `Index.tsx` and `HeroSection.tsx` to match "AI Launch Operating System" positioning.

**`HeroSection.tsx`:**
- Headline: "The AI Operating System for Launching Digital Products"
- Subheading: "Plan, Build, and Launch Your Entire Digital Product Business From One Dashboard"
- Stats: "Launch Score", "30+ Assets", "< 60min"

**`Index.tsx`:**
- "How It Works" → 5-step wizard flow (not 6-step toolkit flow)
- Features grid → Launch Score, Unique Mechanisms, Offer Stacks, Affiliate Kit, Steal This Launch, Launch DNA
- Components showcase → remove toolkit-specific section, replace with "What Gets Generated" (Product, Funnel, Emails, Ads, Timeline, Affiliate Kit)
- CTAs → point to `/wizard`
- Footer → update branding to "DigiLaunchKit AI"

---

## Files Summary

**New files (6):**
- `supabase/functions/generate-launch-score/index.ts`
- `supabase/functions/analyze-competitor-launch/index.ts`
- `supabase/functions/firecrawl-scrape/index.ts`
- `src/components/wizard/LaunchScoreCard.tsx`
- `src/components/wizard/MechanismSelector.tsx`
- `src/pages/StealThisLaunch.tsx`

**New component (1):**
- `src/components/wizard/LaunchDNACard.tsx`

**Modified files (11):**
- `src/types/launchWizard.ts` — add LaunchScore, Mechanism, OfferStack, AffiliateKit types
- `supabase/functions/generate-launch-product/index.ts` — add mechanisms to prompt
- `supabase/functions/generate-launch-funnel/index.ts` — add offerStack to prompt
- `supabase/functions/generate-launch-marketing/index.ts` — add affiliateKit to prompt
- `src/components/wizard/WizardStep1.tsx` — LaunchScore + Mechanism selector
- `src/components/wizard/WizardStep3.tsx` — Offer Stack tab
- `src/components/wizard/WizardStep4.tsx` — Affiliate Kit tab
- `src/pages/Index.tsx` — full rewrite
- `src/components/HeroSection.tsx` — new positioning
- `src/components/DashboardSidebar.tsx` — add Steal This Launch nav
- `src/pages/Dashboard.tsx` — LaunchDNACard
- `src/pages/LaunchWizard.tsx` — LaunchDNACard banner in Steps 2-5
- `src/App.tsx` — add `/steal` route
- `supabase/config.toml` — register 3 new edge functions
- `src/lib/api/firecrawl.ts` — add scrape method

No database schema changes needed — all new data fits in existing JSONB fields.

