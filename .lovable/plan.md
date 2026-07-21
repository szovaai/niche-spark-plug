# Project Zero v2 — AI-Guided Launch Platform

Turn Project Zero from a tool library into a mission-based AI launch coach: personalized dashboard, guided 12-mission ladder, persistent Business Blueprint, contextual tool reveals, and Nova as the always-on strategist.

---

## 1. What already exists (reuse)

Nova foundation is already partly built and will be extended, not replaced:

- **Nova coach chat** — `chat-with-nova` edge function + `NovaChat`, streaming via Lovable AI Gateway, message persistence in `nova_messages`.
- **Onboarding** — `/onboarding` wizard + `onboard-user` function + `founder_profiles` table (name, interests, experience, audience, goals, weekly_hours, budget_band, camera_comfort, has_audience).
- **Mission ladder UI** — `MissionMap` component with 12 missions across 6 phases (already added last turn).
- **Projects** — `business_projects` (project_name, current_stage, progress_pct, user_id).
- **Credit system** — `credit_ledger` + `credit_reservations` + `nova_tasks` + `reserve/finalize/release` RPCs.
- **Nova memory** — `nova_memories` (decision, preference, open_question, coach_note, summary).
- **Launch Assets / Email Engine** — `email_campaigns` + `generate-email-campaigns` (Phase 5, Mission 8).
- **Model router** — `_shared/aiRouter.ts` + `novaModels.ts` (Economy / Balanced / Premium).
- **Power tools** — Score-Niche-style research, opportunity radar, ecover generator, sales letter, toolkit builder, funnel builder, PDF generator, launch checklist. These stay reachable under `/tools/*` and get surfaced *contextually* by mission.

## 2. What to refactor

- **Dashboard (`NovaDashboard`)** — rebuild around: Current Mission, Overall Progress, Next Action, Recently Created, Launch Readiness, Business Blueprint, Continue Mission + Talk to Coach.
- **ProjectWorkspace** — split into Mission view (per-mission workspace) + always-visible Coach panel + Blueprint sidebar. Route `/project/:id/m/:missionId`.
- **StageMap → MissionMap** — already done; wire it to real per-mission task completion, not just `current_stage`.
- **Legacy dashboards** (`CommandCenter`, `Dashboard`, `MyToolkits`, `Discover`, etc.) — keep reachable under `/tools/*`, remove from primary nav.
- **Sidebar / MobileBottomNav** — collapse to: Dashboard · Coach · Missions · Blueprint · Assets · Reference · Tools · Settings.
- **Existing tools become mission actions**: Score-Niche → M1/M2, Toolkit/PDF Builder → M3/M4, Sales Letter/Ecover → M5/M6, Funnel/Checkout → M6/M7, Email Engine → M8, Traffic Pins → M9, Viral DNA → content actions.

## 3. New data models (migration, Phase 1)

Additive only — legacy tables stay.

- `business_blueprints` — one row per project. Fields: business_name, niche, target_audience, customer_problem, desired_outcome, product_concept, product_promise, offer_summary, price, bonuses (jsonb), order_bump, upsell, downsell, funnel_platform, payment_provider, traffic_source, brand_voice, brand_colors (jsonb), launch_date, revenue_goal, status. RLS by `user_id`.
- `mission_progress` — (project_id, mission_id, status enum: locked/active/in_review/complete, progress_pct, started_at, completed_at, blockers jsonb). Unique (project_id, mission_id).
- `mission_tasks` — (project_id, mission_id, task_key, label, status: pending/done/skipped, output_ref, approved_at). Drives real completion %.
- `user_decisions` — (project_id, mission_id, decision_key, value jsonb, decided_at). Audit trail + coach memory.
- `research_findings` — (project_id, source, kind, payload jsonb, confidence, created_at). Structured research storage for M1/M2.
- `opportunities` (exists — extend) — link to project + add validation_scores jsonb (demand/urgency/competition/monetization/audience/alignment/simplicity/overall) + reasoning + risks.
- `product_briefs` — (project_id, name, format, promise, deliverables jsonb, price_range, differentiation, approved).
- `product_assets` — (project_id, kind, title, content, status: draft/approved, version, generated_by).
- `offers` — (project_id, offer_map jsonb with front_end/order_bump/upsell/downsell/recurring, approved).
- `funnel_plans` — (project_id, path: fast/starter/advanced, platform, checklist jsonb, completed_items).
- `traffic_plans` — (project_id, primary_channel, secondary_channel, 30_day_plan jsonb).
- `launch_milestones` — (project_id, kind, achieved_at, meta jsonb) for the readiness bar + celebration.
- Extend `business_projects`: `current_mission_id`, `overall_progress_pct`, `readiness_pct`, `last_action_at`, `next_action` (jsonb).

Every table gets `GRANT SELECT/INSERT/UPDATE/DELETE ... TO authenticated` + `GRANT ALL TO service_role` + `ENABLE RLS` + policy `user_id = auth.uid()` (or scoped through `business_projects` ownership).

## 4. Proposed navigation

```text
Sidebar (primary)          Contextual (revealed per mission)
─────────────────          ────────────────────────────────
Dashboard                  Research (M1/M2 → Score Niche)
Coach (Nova)               Product Studio (M3/M4 → Toolkit/PDF)
Missions                   Offer Builder (M5)
Blueprint                  Sales Assets (M6 → Sales Letter, Ecover)
Asset Library              Funnel Setup (M6/M7)
Reference Library          Payments (M7)
Tools (Power Tools index)  Email Engine (M8) · Content Machine (M9)
Settings                   Traffic Pins (M9 · Pinterest path)
```

## 5. Mission architecture

```text
Phase 1 Discover     M0 Founder Profile · M1 Opportunity
Phase 2 Validate     M2 Problem Validation
Phase 3 Build        M3 Product Concept · M4 Build Product
Phase 4 Offer/Funnel M5 Offer · M6 Sales Assets+Funnel · M7 Payments
Phase 5 Launch Assets M8 Email Engine · M9 Content Machine
Phase 6 Launch/Grow  M10 Launch · M11 Improve
```

Each mission = { intro copy, coach questions, research/generation actions, decisions to capture, approval gate, tasks that drive %, next-action pointer }. Weights match the user's spec (5/10/10/10/20/10/10/5/5/10/5).

## 6. AI coach behavior additions

- Loads Blueprint + last decisions + open questions into Nova system prompt (already partially wired via `nova_memories`).
- Start-of-session ping: "What do you want to accomplish today?"
- End-of-session summary → writes decisions, next-action commitment, updates `next_action` on project.
- One question at a time, cites evidence, separates fact/estimate/assumption, never promises income. Adds a small style rubric to `NOVA_SYSTEM_PROMPT`.

## 7. Existing-tool integration rules

- Score Niche → embedded in M1/M2 research panels; results write to `research_findings` + `opportunities`.
- Traffic Pins → surfaces only when M9 primary channel = Pinterest (or user opts in). Positioned as premium add-on.
- Viral DNA → surfaces in M6/M9 content actions to score hooks/titles.
- All other power tools accessible via `/tools` index but never block mission flow.

## 8. Phased rollout

**Phase 1 (this phase — ship first):**
1. Migration for `business_blueprints`, `mission_progress`, `mission_tasks`, `user_decisions`, `launch_milestones`, plus `business_projects` extensions.
2. Rewrite `NovaDashboard` per spec (Current Mission · Overall Progress · Next Action · Recently Created · Launch Readiness · Blueprint · Continue Mission · Talk to Coach).
3. `MissionsHub` page — full 12-mission ladder with per-mission progress, unlock rules, jump-in.
4. `MissionWorkspace` shell at `/project/:id/m/:missionId` with left = mission tasks/actions, right = Nova coach, top = blueprint chips.
5. `useBlueprint` + `useMissionProgress` hooks; autosave decisions.
6. Nova prompt upgrade + start/end-of-session rituals.
7. Sidebar/mobile-nav simplification; move legacy dashboards under `/tools/*`.

**Phase 2:** M1/M2 research engine (adapter layer with placeholders for Reddit/Quora/Trends beyond current Firecrawl), structured Research Report UI, validation scorecard with transparent factors.

**Phase 3:** M3/M4 Product Studio (wraps toolkit generator with staged approval gates + Asset Library).

**Phase 4:** M5/M6 Offer Builder + Sales Assets consolidation (wraps sales letter + ecover + funnel).

**Phase 5:** M7 Payments walkthrough (Stripe/Gumroad handoff, no secret capture in chat), M8 already live, M9 Traffic Engine + Traffic Pins gating.

**Phase 6:** M10 Launch checklist consolidation, M11 Improve loop (metrics + coach retro), Reference Library page pulling in existing PDFs/templates contextually.

## 9. Non-goals for Phase 1

- No new live research integrations beyond what's already wired (Firecrawl). Placeholder adapters only.
- No changes to `chat-with-nova` streaming or `nova_messages` shape.
- No deletion of legacy routes — they remain under `/tools/*`.
- No payment credential capture inside chat.

---

## Technical notes

- Router: add `/project/:id/m/:missionId`, `/missions`, `/blueprint`, `/assets`, `/reference`. Keep `/tools/*` alias for legacy pages.
- MissionMap already supports legacy `current_stage` via `STAGE_TO_MISSION` — reuse.
- Progress % = weighted sum of `mission_progress.progress_pct * weight`. Mission % = approved `mission_tasks` / total.
- Recently Created = union query over `product_assets`, `email_campaigns`, `offers`, ordered by `updated_at`.
- Launch Readiness = boolean checks: blueprint fields filled + product approved + offer approved + funnel selected + payments confirmed + traffic plan approved.
- Design tokens only (charcoal / white / electric blue accent) — no hardcoded colors. Reuse existing `index.css` palette; add `--accent-electric` if missing.

Confirm and I'll ship Phase 1 (migration + dashboard + missions hub + mission workspace shell + nav simplification + Nova prompt upgrade).
