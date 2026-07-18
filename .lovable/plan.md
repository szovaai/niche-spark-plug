## Goal
Reframe Project Zero's progress system from an 8-stage "launch map" into a **Mission-based Launch Coach** dashboard, where Email Launch Engine + Launch Assets sit clearly inside **Mission 8 (Email Engine)** / Phase 5 Launch Assets, and PDFs are reference vault output rather than the headline stage.

## New Mission Ladder (replaces `NovaStage`)

```text
Mission 0  Business Discovery      (founder profile)
Mission 1  Find Your Opportunity   (niche + demand research)
Mission 2  Validate the Idea       (proof + positioning)
Mission 3  Build the Product       (toolkit / PDF vault)
Mission 4  Brand Identity          (cover, colors, voice)
Mission 5  Create the Offer        (pricing, bonuses, sales page)
Mission 6  Build the Funnel        (pages + checkout flow)
Mission 7  Connect Payments        (Stripe / Gumroad wire-up)
Mission 8  Email Engine            (Email Launch Engine — Origin/Insight/Launch/Value + repurpose)
Mission 9  Content Machine         (social repurpose, daily posts)
Mission 10 Launch                  (go-live checklist)
Mission 11 Improve                 (post-launch optimization)
```

Phase groupings shown on the rail:
- Phase 1 Discover — M0–M1
- Phase 2 Validate — M2
- Phase 3 Build — M3–M4
- Phase 4 Offer & Funnel — M5–M7
- **Phase 5 Launch Assets — M8 Email Engine + M9 Content Machine**
- Phase 6 Launch & Grow — M10–M11

## Files to change (UI/presentation only — no schema changes)

1. **`src/components/nova/StageMap.tsx`** — rebuild as `MissionMap`:
   - Replace `NovaStage` union with `MissionId` (`m0`…`m11`) + backwards-compat mapping from old stage strings (`founder_profile→m0`, `opportunity→m1`, `niche→m2`, `product→m3`, `cover→m4`, `sales→m5`, `launch→m10`, `published→m11`).
   - Render grouped by phase with a "Phase 5 · Launch Assets" header that highlights Email Engine.
   - Active mission gets a subtle glow + "Continue mission" affordance; completed missions show check + subtle line.
   - Keep the same exported symbol (`StageMap`) as a thin alias so `NovaDashboard` / `ProjectWorkspace` keep working; add new `MissionMap` export.

2. **`src/pages/nova/NovaDashboard.tsx`**
   - Rename hero copy: "Your launch map" → "Your missions".
   - Subhead: "An AI launch coach that guides you from idea to launch through measurable missions."
   - Feed mission ids into the new map via the compat mapper.
   - Add a small "Phase 5 · Launch Assets ready" callout card linking to `/project/:id/launch-assets` once M3 is complete.

3. **`src/pages/nova/ProjectWorkspace.tsx`**
   - Sidebar "Launch map" → "Missions", grouped by phase.
   - Move the existing **Launch Assets** card so it renders inside the Phase 5 group (visually nested under Mission 8) instead of a standalone card, with a "Mission 8 · Email Engine" label.
   - "Your decision" card copy updated to reference current mission, not stage.

4. **`src/pages/nova/LaunchAssets.tsx`**
   - Add a header chip: "Phase 5 · Mission 8 — Email Engine" and a one-liner: "This is your launch's voice. Everything here also feeds Mission 9 (Content Machine)."

5. **`src/pages/Index.tsx`** (sales page)
   - Update the "8-stage journey" section to the 12-mission ladder grouped into the 6 phases; keep visual style.
   - Adjust copy from "launch map" to "guided missions" and add a line: "PDFs become your reference vault — the missions are the show."

6. **`src/components/nova/LegacyRedirect.tsx`** — no logic change; just verify nothing references removed stage strings.

## Non-goals
- No database migration. `business_projects.current_stage` keeps its existing text values; the mapper handles display.
- No changes to edge functions, email generation logic, or `useEmailCampaigns`.
- No changes to auth, credits, or MCP.

## Verification
- Load `/dashboard`, `/project/:id`, `/project/:id/launch-assets`, and `/` — confirm mission rail renders, Phase 5 highlights Email Engine, and existing projects with legacy `current_stage` values still show the right active mission via the compat mapper.
