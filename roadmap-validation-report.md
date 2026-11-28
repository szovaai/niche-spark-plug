# Roadmap validation — November 28, 2026

## Delivered
- Online mission manuscripts with optimistic revision checks, approval persistence, legacy browser-draft import and draft/final PDF downloads.
- Fixed an actual PDF defect: double-escaped sanitizer patterns deleted normal letters. Draft fixture: 4 pages / 3,413 extracted characters; approved fixture: 4 pages / 3,433 characters. Final AI-written partial product: 5 pages / 3,648 readable characters. Removed unsupported emoji from the table of contents.
- Service-only task-credit mutations, canonical prices, per-user advisory locks, idempotent finalization, reservation expiry checks and protection against browser task mutation. All ten mission functions deployed.
- Explicit JSON schemas included in structured model prompts after live testing found missing JSON instructions and a top-level `products` versus `concepts` mismatch. All nine structured mission functions redeployed.
- Business team invitations with seven-day expiry and email matching. Reviewers can read/export shared manuscripts but cannot edit, generate, or read private tasks/chats/credits. Invitations are in-app; no invitation email is sent.
- Two-account browser verification: uninvited reads denied; invitation acceptance succeeded; shared product rendered; edits/private-task reads denied; removing membership revoked access.
- Duplicate department listings consolidated; alternative simulators/templates remain under advanced tools. No legacy tool or saved route was removed.
- Same-business downsell copy, preview and export coverage; absent offers omitted; separate upsell/downsell checkout URLs prevent using the front-end checkout for a different product.

## Live smoke test
An isolated demonstration business was used, not the owner's real business.
Concept generation, selection, outline, one section, avatar, cover, sales letter, three welcome emails and funnel all returned successful responses. Product text and approval read back after reload; generated draft PDF downloaded and its readable text was extracted. Emails persisted and appeared in Launch Assets; downsell rendered in the wizard. The graphic was visually inspected.

The selected concept was a Notion toolkit, not a completed PDF-only product. Only one of 25 sections was written; the PDF is clearly marked DRAFT. No Notion workspace, calculator, complete product or completed 25-section manuscript was claimed or shipped.

Funnel retained the configured $5 bump, $29 upsell and $9 downsell. Copy still requires human review: some supporting descriptions extend the supplied offer wording. No commercial copy certification is claimed.

## Costs
- In-app task credits: **5**, balance 25 → 20; no reservations left.
- Recorded metered AI usage: **1.434462 Lovable credits** across ten successful model calls, including one output-shape failure and the two-call cover process.
- One initial HTTP 400 pre-generation format rejection has unknown reported usage/cost. No charge is recorded for it in the available gateway summary.
- Development/chat usage is separate.

## Checks and limits
- 29 tests passed, including live deployed permission checks; preview build logs report build OK.
- Actual browser attempts to mutate credits and save stale manuscripts were denied.
- Exactly-once/concurrent charging is implemented with database locking, but no privileged multi-request stress test was run.
- Full long-form generation, all campaign types, non-PDF deliverables and commercial checkout/publishing remain unverified and require a separately approved budget and/or external integration access.
- Payments provider and external API access remain outstanding; no fake connection statuses were introduced.