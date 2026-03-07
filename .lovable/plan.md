

# UX & Product Intelligence Upgrade — Implementable Plan

This is a massive feature request spanning 30+ items. Many are aspirational (mobile app, Discord integration, real-time sales tracking, heatmaps from live data) and can't be built in a web-only tool without external services. I'll distill this into what's **actually implementable now** within the current architecture, organized into 4 passes.

---

## Pass 1: Friction Elimination (Highest Impact)

### 1A. One-Click Product Cloning
- Add "Clone" button on Dashboard project cards and Products page
- Duplicates `launch_projects` row with new ID, resets status to `in_progress`, appends "(Copy)" to name
- Pre-fills all settings — user only changes topic/price
- Simple DB insert + navigate to `/wizard/{newId}`

### 1B. Brand Kit in Settings
- Extend `profiles` table with `brand_kit jsonb` column (logo_url, primary_color, secondary_color, font_pref, business_name, business_email, business_address, tagline)
- Add "Brand Kit" tab in `Settings.tsx` with form fields + color pickers
- Auto-populate into Legal Pages, Author Bio, and all generated copy via edge function context

### 1C. Revenue Calculator Upgrade
- Enhance `RevenueProjector.tsx` with OTO/upsell layers: FE price + OTO1 conversion% + OTO2 conversion% + email list growth
- Add scenario tabs (Conservative / Optimistic / Best Case) saved to localStorage
- Live drag-to-adjust sliders with real-time revenue cascade
- "Export as PDF" button using existing jspdf

### 1D. Product Strength Scorecard
- Create `ProductScorecard.tsx` — visual bar chart showing 7 dimensions: Content Quality, Social Proof, Pricing Power, Positioning, Email Flow, Bonus Value, Speed to Sale
- Scores calculated client-side from existing JSONB data (has proof stack? has objections? has mechanism? etc.)
- One-click "Boost" buttons linking to relevant wizard steps
- Display on Dashboard for latest project

---

## Pass 2: Intelligence & Smart Defaults

### 2A. Smart Auto-Fill Memory
- On wizard start, fetch user's most recent `launch_projects` to pre-fill: author bio, tone preferences, favorite mechanism style
- Store preferences in `profiles.brand_kit` — tone, default price range, preferred product type
- Show "Use settings from [Last Product Name]" button at wizard start

### 2B. Pre-Launch Readiness Audit
- Create `PreLaunchAudit.tsx` — checklist card showing 8 critical items with pass/fail:
  - Has branded mechanism, 3+ proof points, guarantee, pricing explanation, clear CTA, email sequence, refund policy, legal pages
- Scores as "X/8 complete — Y% ready to launch"
- Missing items link directly to the relevant wizard step/section
- Display in Step 5 and on Dashboard

### 2C. Benchmark Comparison Widget
- Create `BenchmarkCard.tsx` — shows user's product config vs "top performer" averages
- Compares: price, bonus count, testimonial count, mechanism quality, email count, guarantee, sales page word count
- Data derived from AI-generated benchmarks (stored in launch score output)
- "Upgrade to Elite" button triggers targeted regeneration of weak areas

### 2D. A/B Test Variation Generator
- Add "Generate Variations" button on key copy elements (headlines, CTAs, email subjects)
- Calls existing edge functions with a `variationMode: true` flag
- Shows 3 side-by-side cards: Aggressive / Curiosity / Benefit-driven
- User picks one to replace current copy

---

## Pass 3: Workflow Acceleration

### 3A. Template Funnel Library
- Create `FunnelTemplates.tsx` page — 5 pre-built funnel archetypes:
  - "Cash Grab" (3-step high-ticket), "Authority Play" (long-form), "Scarcity Sprint" (limited-time), "Evergreen Machine" (nurture), "JV Blitz" (affiliate-heavy)
- Each template pre-configures wizard defaults (tone, pricing, funnel structure, email count)
- "Use This Template" button creates a new project with pre-filled settings
- Add route `/templates/funnels` and sidebar link

### 3B. AI Conversation Mode (Inline Refinement)
- Add a floating "Refine with AI" chat panel (bottom-right) visible during wizard steps 2-4
- User types natural language: "Make the headline more aggressive" / "Add more proof to email 3"
- Calls edge function with current section content + user instruction
- Returns updated content that replaces the specific section
- Context-aware: knows which step/section user is viewing

### 3C. Smart Notifications Banner
- Create `SmartAlerts.tsx` — contextual tips shown as dismissible banners on Dashboard
- Logic checks: missing mechanism → suggest generating one, no proof → suggest proof stack, low scorecard → suggest improvements
- Max 1-2 alerts at a time, stored in `profiles.tooltips_seen` to avoid repeats

---

## Pass 4: Community & Post-Launch

### 4A. Success Stories Feed
- Extend existing `community_wins` table — already has display_name, product_name, win_type, niche_name, platform
- Create `SuccessFeed.tsx` component on Dashboard showing recent public wins
- Add "Share My Win" button after Step 5 completion that inserts into `community_wins`
- Show aggregate stats: "X products launched this month"

### 4B. Niche Monopoly Suggester
- After product completion, show "Expand Your Empire" card suggesting 5 related product ideas
- Calls `generate-launch-score` with a `suggestRelated: true` flag
- Each suggestion is a one-click "Start This Product" that pre-fills a new wizard

### 4C. Post-Launch Retargeting Copy Generator
- Add "Post-Launch Kit" section in Step 5 / Launch Checklist
- Generate: retargeting ad copy (3 variations), non-buyer email sequence (3 emails), re-engagement sequence (2 emails)
- Extend `generate-launch-marketing` with `postLaunchMode: true`

---

## Database Changes
- Migration: Add `brand_kit jsonb` column to `profiles` table

## Files to Create
- `src/components/wizard/ProductScorecard.tsx`
- `src/components/wizard/PreLaunchAudit.tsx`
- `src/components/wizard/BenchmarkCard.tsx`
- `src/components/wizard/SmartAlerts.tsx`
- `src/components/wizard/AIRefineChat.tsx`
- `src/pages/FunnelTemplates.tsx`

## Files to Modify
- `src/pages/Dashboard.tsx` — scorecard, alerts, success feed, clone button
- `src/pages/Settings.tsx` — brand kit tab
- `src/components/wizard/RevenueProjector.tsx` — multi-tier calculator
- `src/components/wizard/WizardStep5.tsx` — pre-launch audit, post-launch kit
- `src/components/DashboardSidebar.tsx` — new nav items
- `src/App.tsx` — new routes
- Edge functions — variation mode, post-launch mode, related product suggestions

## Implementation Priority
Pass 1 first (Clone + Brand Kit + Revenue Calculator + Scorecard) — these are highest-impact, lowest-complexity. Then Pass 2 (Smart Defaults + Audit + Benchmarks), Pass 3 (Templates + AI Chat + Alerts), Pass 4 (Community + Monopoly + Post-Launch).

