# PDF Empire — Full Audit (Health, Security, Clutter)

## What's already known
- Database is running again (it was paused earlier).
- Phase 1 still needs the Approval Center / notifications / activity log storage applied.
- Quick security scan: 2 serious, 2 medium, 4 low findings (below). Deep security scan is running now.
- App has 52 pages and ~90 AI services; 46 old addresses redirect into "Power Tools".

## 1. Security
Serious:
- Review comments: anyone can read every comment.
- Review sessions: anyone can read the private share keys, which lets them open any review link.
Medium:
- UGC app tags and tag assignments readable by anyone (likely fine if the Vault list is public; otherwise restrict to Pro).
Low (probably intentional public content): daily inspiration, opportunities, PLR quickstart kits, pre-made niches.
Fix: lock review data to its owner and to people holding that exact link's key; confirm the low ones are meant to be public and mark them so. Fold in deep-scan results when they arrive.

## 2. Health & bugs
- Sign in as a test user and walk the main journey: onboarding → dashboard → Business HQ → missions 1–11 → Launch Assets → PDF export.
- Call each key AI service once and log failures (timeouts, empty output, wrong model).
- Read preview errors and server logs for recurring crashes.
- Output: a pass/fail table per feature with the fix for each failure.

## 3. Clutter cleanup
Overlap groups to merge (keep working, hide duplicates):
- Home screens: Dashboard, Command Center, Nova Dashboard, Business HQ → Business HQ becomes the home.
- Product builders: Launch Wizard, Empire Mode, Micro Factory, Toolkit Builder → one Product Studio entry, others under Power Tools.
- Money planners: Funnels, Funnel Simulation, Profit Map, Money Map, Profit Radar → one "Plan your money" tool.
- Research: Research, Research Agent, Discover, Opportunity Radar → one Research hub.
Nothing is deleted without your OK.

## Deliverable
One report in your Files (audit findings + fixes), then fix the serious security items and finish Phase 1 storage right away.

## Technical details
- RLS: replace `USING (true)` on review_comments/review_sessions with owner checks plus a security-definer lookup by share token; never expose access_key column.
- Apply the pending approval_requests / notifications / audit_logs migration.
- Health checks via Playwright against localhost:8080 and supabase--curl_edge_functions per function.
