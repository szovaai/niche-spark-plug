

## Universal Autosave + Unified "All Projects" View

Two parts: (1) extend the 2-second debounced autosave already used by Launch Wizard to **Empire Mode**, **Micro Factory**, and **Toolkit Builder** so nothing is ever lost; (2) upgrade the `Saved Projects` page into a unified hub that lists **every build type** in one place.

---

### Part 1 — Reusable autosave hook

**Add** `src/hooks/useAutosave.ts` — generic 2s-debounced upsert hook modeled on the existing `LaunchWizard` autosave:

```ts
useAutosave({
  table: "empire_projects" | "micro_products" | "toolkits" | "launch_projects",
  recordId: string | null,
  setRecordId: (id: string) => void,
  userId: string | undefined,
  data: Record<string, any>,
  enabled: boolean,           // skip on empty drafts
  onError?: (e) => void,
});
```

- Debounces 2s on any `data` change.
- First save = `insert + select id`, subsequent = `update where id`.
- Silent success; toasts a soft warning only on failure (matches existing pattern).
- Skips while a save is in-flight (ref guard).

### Part 2 — Wire autosave into the three builders

1. **`src/pages/EmpireMode.tsx`** — call `useAutosave({ table: "empire_projects", … })` with the current step state (`step1_*` through `step6_*`, `current_step`, `name`). Remove ad-hoc save buttons or leave them as "Save now" wrappers around the hook's `flush()`.
2. **`src/pages/MicroFactory.tsx`** — autosave to `micro_products` (`niche_topic`, `product_type`, `target_audience`, `problem_statement`, `config`, `generated_content`, `product_title`, `status`).
3. **`src/pages/CreateToolkit.tsx`** — replace the existing manual `toolkits.update`/`insert` block (lines ~450) with the hook so every keystroke autosaves. Keep the existing `localStorage` draft as a safety net.

No schema changes — every target table already has `updated_at` defaults and matching RLS.

### Part 3 — Unified "All Projects" hub

**Edit** `src/pages/SavedProjects.tsx` (route `/saved-projects`) to fetch and display **all four build types** in parallel:

- `launch_projects` → "Launch" pill, opens `/wizard/:id`
- `empire_projects` → "Empire" pill, opens `/empire?id=:id`
- `micro_products` → "Micro" pill, opens `/micro-factory?id=:id`
- `toolkits` → "Toolkit" pill, opens `/toolkit/builder/:id`

Each row shows: type pill, name/title, niche, lifecycle status, progress %, "Updated X ago", **Open** + **Delete** buttons. Add a top filter bar with chips: **All / Launches / Empire / Micro / Toolkits** and a search input that filters by name/niche client-side.

Sort all results by `updated_at desc` after merging. Skeleton loaders while any source is pending.

### Part 4 — Sidebar relabel

In `src/components/DashboardSidebar.tsx`, rename the "Saved Projects" link to **"All Projects"** to match the broader scope. No route change.

---

### Files touched

- **Add** `src/hooks/useAutosave.ts`
- **Edit** `src/pages/EmpireMode.tsx` (wire hook)
- **Edit** `src/pages/MicroFactory.tsx` (wire hook)
- **Edit** `src/pages/CreateToolkit.tsx` (replace manual save with hook)
- **Edit** `src/pages/SavedProjects.tsx` (multi-source aggregation + filters)
- **Edit** `src/components/DashboardSidebar.tsx` (label only)

### Out of scope

- No DB schema changes.
- No changes to the existing Launch Wizard autosave (already works).
- No cross-type project merging — each build type stays in its own table and opens in its native editor.

