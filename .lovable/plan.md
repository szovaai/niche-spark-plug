

## Fix: Score Drops After Generating Assets / Expanding Chapters

### Root cause

The Content Quality score (the big number in the report) is the average of 10 per-chapter dimensions. Asset Depth correctly climbs as Factory assets are generated, but the other 9 dimensions are computed from each chapter's text — so any time a chapter is **regenerated, expanded, "Fixed", or fully written** by the AI, the new text can score lower on Human Readability, Outcome Specificity, Step-by-Step Execution, etc., dragging the overall down even while Asset Depth went up.

There are also two smaller issues amplifying the effect:

1. **No floor on regenerated chapters.** When `Fix Ch N`, `Write Full Chapter`, or `expandChapter` returns prose that happens to score worse than the original, we silently overwrite the better version with the worse one.
2. **Asset Depth bonus formula has a soft cap that can shrink relative to noise.** The `min(70, presentTypes * 12 + min(30, count * 1.5))` cap means once you pass ~6 asset bundles you stop gaining ground, so a small dip in another dimension shows up immediately as an overall drop.
3. **Delta chip only shows positives.** When the score dips, the user sees no explanation — just a smaller number.

### Plan

**1. `src/lib/contentAudit.ts` — make Asset Depth monotonic and clarify the math**
- Remove the inner `min(30, …)` clamp on the density bonus so each new asset bundle produces visible movement up to 100.
- Change formula to: `boostedScore = max(avgScore, min(100, presentTypes * 14 + densityCount * 2))`. Using `max` against `avgScore` ensures Asset Depth never drops just because chapters were rewritten with different inline asset words.
- Add a new helper `auditFullContentWithBest(content, assets, prevDimensions?)` that, when called with the previous audit's per-dimension scores, takes `Math.max(currentDim, prevDim)` for the **same chapter index + dimension**. This gives the audit a "best-ever" floor across regenerations so a worse rewrite cannot pull a dimension below its previous best.
- Keep `auditFullContent` unchanged for callers that want raw scoring.

**2. `src/components/wizard/ContentQualityReport.tsx` — track overall delta + show drops too**
- Track previous `audit.overall` in a ref alongside the existing `prevAssetDepth`.
- When overall changes, render a small chip next to the big number: green `+N pts` if up, amber `-N pts` if down. Auto-dismiss after 3s.
- Pass `prevDimensions` from the ref into a new `auditFullContent` call (using the "best-ever" floor) so the visible score never regresses just from a noisy regeneration.

**3. `src/components/wizard/WizardStep2.tsx` — guard against regressions on chapter-level AI ops**
- After `Fix Ch`, `expandChapter`, `Write Full Chapter`, and `Humanize` operations finish, compare the new chapter's individual audit against the previous chapter's individual audit. If overall per-chapter score drops by more than 5 points, show a small inline toast: "New version scored lower — kept previous version" and **revert** that single chapter's content. Add a "Use new version anyway" button on the toast.
- Pass `prevDimensions` (stored in a ref) into both `<ContentQualityReport assets={assets} />` and the local `auditFullContent` call that gates the Continue button so they stay in sync.

**4. UX clarity**
- In `ContentQualityReport`, when overall dips, surface a one-line note under the score: "A recent rewrite scored lower on [dimension] — original version kept." This makes the behavior predictable.
- Asset Depth chip continues to show `+N pts` when factory assets are added.

### Files touched
- **Edit** `src/lib/contentAudit.ts` — new monotonic Asset Depth math + `auditFullContentWithBest` helper.
- **Edit** `src/components/wizard/ContentQualityReport.tsx` — overall delta chip (up + down), best-ever floor, regression note.
- **Edit** `src/components/wizard/WizardStep2.tsx` — per-chapter regression guard with revert + override toast; pass `prevDimensions` ref.

### Out of scope
- No changes to the `generate-product-assets` or `generate-launch-content` edge functions.
- No changes to other wizard steps or the boost-score system.
- No DB or schema changes.

