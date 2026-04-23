

# Fix Mushed Metric Labels + Dashboard Page

Two targeted fixes:

## 1. Fix mushed-together metric labels on opportunity cards

In `src/components/radar/OpportunityCard.tsx`, the 5-column metric strip (DEMAND / COMP / ADS / EMOTION / UPSELL) has labels overflowing into each other because each column is too narrow for the uppercase text and there's no horizontal breathing room.

Changes to the `Metric` block + its container:
- Switch the metric strip from a tight 5-column grid to a layout with proper column gaps and per-cell padding so labels don't collide.
- Shrink the label font slightly (`text-[9px]`), tighten letter-spacing, and add `whitespace-nowrap` + `truncate` so each label stays on one line within its cell.
- Shorten label copy where it visibly overflows: "Emotion" → "Emo", "Upsell" → "Up", "Demand" → "Dem", "Ads" stays, "Comp" stays. This keeps all 5 readable at the current card width.
- Add a subtle vertical divider between cells so values group correctly with their label visually.
- Increase vertical padding inside the strip so labels and numbers aren't cramped.

Result: each metric is clearly separated and readable on the card width shown in the screenshot.

## 2. Fix the Dashboard sidebar entry showing old discovery content

The sidebar's "Dashboard" link routes to `/dashboard` correctly, but the Dashboard page itself currently renders legacy discovery-style widgets (DailyBriefing, GettingStartedChecklist, old project list cards) that feel like the old Discover page rather than a true home base for the new Profit Radar / PDF Empire flow.

Changes to `src/pages/Dashboard.tsx`:
- Replace the legacy hero/cards layout with a focused "home base" layout aligned with the new Profit Radar product:
  - Top: welcome header with the user's name and a primary CTA "Open Profit Radar" → `/opportunities`, plus a secondary "New Launch" → `/wizard`.
  - Stats row: 4 compact KPI cards (Products built, Funnels generated, Marketing assets, Streak days) using the existing `stats` data already fetched.
  - Recent projects section: clean list of the 5 most recent `launch_projects` with Continue / Clone actions (keeps the existing `cloneProject` logic).
  - Quick links row: 4 tiles to Profit Radar, Product Builder, Funnel Builder, Saved Projects.
- Remove the discovery-flavored widgets that no longer fit the mainstream PDF Empire positioning: `DailyBriefing`, `GettingStartedChecklist`, `LaunchJourney`, `ProductFactoryCard`, `AILaunchCoach`, `ReferralWidget`, `RevenueGoalWidget`, `RevenueProjector`, `LaunchDNACard`, `ProductScorecard`, `PreLaunchAudit`, `DailyLaunchTasks`. (These components stay in the codebase for use elsewhere — only removed from the Dashboard page.)
- Keep `DashboardLayout` wrapper so the sidebar/header remain consistent.

Result: clicking "Dashboard" in the sidebar now lands on a clean home base centered on Profit Radar + recent launches, not the old discovery layout.

## Out of scope
- No route changes (`/dashboard` already maps to `Dashboard`).
- No sidebar restructuring.
- No changes to Profit Radar itself beyond the OpportunityCard metric strip.

