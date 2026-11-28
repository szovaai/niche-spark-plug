
## Business HQ (MVP 3.0)
- business_projects is the "business workspace"; don't add a parallel workspaces table (spec says avoid duplicating tables).
- Next-best-action and stage rules live in src/lib/businessHQ.ts with tests in businessHQ.test.ts (run `bunx vitest run`); vitest pinned to v2 because vite is v5.
- HQ metrics show only real data; unconnected sources render empty states, never fabricated numbers (spec rule).
- v_credit_balance is keyed on auth.uid(), never auth.users (authenticated can't read auth.users; it 403'd).
- _shared/tieredAI.ts normalizes role→tier and complexity aliases; redeploy every function importing it after edits.
- Pro-only edge functions call requirePro() from _shared/entitlement.ts right after validateAuth; client-side isPro checks are UI only.
- AI chat functions accept only user/assistant roles from the client; system prompts are built server-side.
