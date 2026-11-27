
## Business HQ (MVP 3.0)
- business_projects is the "business workspace"; don't add a parallel workspaces table (spec says avoid duplicating tables).
- Next-best-action and stage rules live in src/lib/businessHQ.ts with tests in businessHQ.test.ts (run `bunx vitest run`); vitest pinned to v2 because vite is v5.
- HQ metrics show only real data; unconnected sources render empty states, never fabricated numbers (spec rule).
