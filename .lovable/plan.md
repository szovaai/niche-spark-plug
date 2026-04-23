

## Make Asset Depth React to Generated Product Assets in Real Time

Right now, the **Asset Depth** dimension in the Content Quality Report only counts assets baked into chapters (worksheets, templates, checklists, additional examples) plus regex matches for the words "prompt" / "script". The standalone **Digital Product Asset Factory** outputs (workbook, cheatsheet, toolkit, templates, promptPack, bonusGuides, caseStudies, multiplier) are **not** factored in — so generating them never moves the score. This plan fixes that and makes the score recompute live as each asset finishes generating.

### What changes

1. **Teach `auditFullContent` about `ProductAssets`** (`src/lib/contentAudit.ts`)
   - Add an optional second arg: `auditFullContent(content, assets?)`.
   - In the Asset Depth calculation, add bonus credit for each generated asset bundle:
     - `workbook` → +1 prompt-equivalent per worksheet
     - `cheatsheet` → +1 checklist-equivalent per sheet
     - `toolkit` → counts toward scripts/templates/checklists by tool `type`
     - `templates` → +1 template per item
     - `promptPack` → +1 prompt per item across all categories
     - `bonusGuides` → +1 example per bonus
     - `caseStudies` → +1 example per case study
     - `multiplier` → small completeness bump (caps the score)
   - Re-derive `metFactors` so once the user has a full Asset Factory bundle, Asset Depth reaches 100.
   - Update the `details` string to show both per-chapter and Factory totals (e.g., `"6 worksheets, 4 cheat sheets, 12 prompts, 3 templates from Asset Factory"`).
   - Keep the per-chapter minimums as a floor so chapters still have to ship some inline assets.

2. **Pass `assets` into the report** (`src/components/wizard/ContentQualityReport.tsx` + `WizardStep2.tsx`)
   - Add `assets?: ProductAssets` prop to `ContentQualityReport` and forward it to `auditFullContent`.
   - In `WizardStep2.tsx`, pass the existing `assets` state into both `<ContentQualityReport assets={assets} />` and the in-page `audit` constant (line ~410) so the same numbers drive the gate logic that controls the "Continue" button.

3. **Real-time recompute on asset generation**
   - The audit is already pure and runs every render. By including `assets` in the prop chain, every `setAssets(...)` call inside `AssetFactory` (after a single generate or a "Generate All" pass) automatically re-renders `ContentQualityReport`, recalculates Asset Depth, and updates the overall score and pill colors.
   - Add a subtle animated `+N pts` chip (reuse the same pattern from `LaunchScoreCard`'s boost delta) next to the Asset Depth row: stash the previous Asset Depth score in a ref; when it jumps after generation, flash the delta for ~3 seconds.

4. **Visual polish in the Asset Depth row**
   - When assets are generated, render small icon chips under the Asset Depth dimension (📘 Workbook · ⚡ Cheatsheet · 🧰 Toolkit · 📝 Templates · 💬 Prompts · 🎁 Bonuses · 📈 Cases) — filled when present, dim when missing — so the user sees exactly which Factory outputs are still missing.

### Files touched
- **Edit** `src/lib/contentAudit.ts` — new optional `assets` arg, expanded Asset Depth math, richer details string.
- **Edit** `src/components/wizard/ContentQualityReport.tsx` — accept + forward `assets`, render delta chip and asset chips on the Asset Depth row.
- **Edit** `src/components/wizard/WizardStep2.tsx` — pass `assets` into `ContentQualityReport` and the local `auditFullContent` call so the gate uses the same enriched score.

### Out of scope
- No changes to `AssetFactory` itself or to the `generate-product-assets` edge function.
- No new edge functions or DB schema changes.
- No changes to other dimensions in the audit (Specificity, Readability, etc.).

