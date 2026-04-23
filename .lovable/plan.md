

## Add "Boost My Score" AI Optimizer to Launch Score Card

Add a one-click AI booster that targets the lowest-scoring dimensions on the Launch Score and rewrites the inputs (niche framing, audience, topic, mechanism, angle) to push the overall score above 80.

### What the user sees

In `src/components/wizard/LaunchScoreCard.tsx`, when `score.overall < 80`:

1. A new **"Boost Score to 80+"** button appears at the top-right of the card next to the score, styled with a gradient + Sparkles icon.
2. Each dimension bar shows a small **"Weak — Fix"** chip when its value is `<= 6`, clickable to boost just that one dimension.
3. Clicking either button opens an inline **Boost Panel** below the score that streams AI recommendations as cards:
   - **Sharpened niche** (more specific, higher-intent variant)
   - **Tighter audience** (a clearer "who" with pain trigger)
   - **Stronger topic angle** (a more emotional/urgent reframe)
   - **Mechanism upgrade** (swap to a Number/Timeframe/Acronym formula)
   - **Pricing tweak** (if monetization is weak, suggest a price within ceiling)
   Each card has an **"Apply"** button that updates the relevant wizard field and a **"Apply All"** button at the bottom.
4. After Apply All, the score auto-regenerates and an animated delta shows `+12 pts` if the new score is higher.

### Data + AI flow

1. New edge function: **`supabase/functions/boost-launch-score/index.ts`**
   - Input: current `niche`, `targetAudience`, `productType`, `topic`, `productConcept`, `uniqueMechanism`, `selectedAngle`, `price`, and the full `launchScore` object (so the model knows which dimensions are weak).
   - Prompt instructs the model to identify the 2–3 lowest-scoring dimensions and produce **targeted upgrades only for those**, returning a structured JSON via tool calling:
     ```json
     {
       "weakestDimensions": ["audienceClarity", "offerStrength"],
       "upgrades": {
         "niche":   { "current": "...", "improved": "...", "why": "..." },
         "audience":{ "current": "...", "improved": "...", "why": "..." },
         "topic":   { "current": "...", "improved": "...", "why": "..." },
         "mechanism":{"current": "...", "improved": "...", "why": "..." },
         "price":   { "current": 17,    "improved": 27,     "why": "..." }
       },
       "projectedScore": 84,
       "summary": "Tightened the audience to a 5-year window and reframed the mechanism as a 7-Day system..."
     }
     ```
   - Uses `callTieredAI` with `"standard"` tier (same pattern as `generate-launch-score`).
   - Returns only upgrades for dimensions that were actually weak (skips strong ones).

2. Wire-up in `WizardStep1.tsx`:
   - Pass `niche/setNiche`, `targetAudience/setTargetAudience`, `topic/setTopic`, `price/setPrice`, plus `result/setResult` into `LaunchScoreCard` (new optional props).
   - When user clicks **Apply** on a card, the matching setter runs (e.g., `setTargetAudience(upgrade.improved)`), and for mechanism/angle the `result.uniqueMechanism` field updates.
   - When user clicks **Apply All**, all setters fire, then `generateScore(updatedProduct)` is called automatically to refresh the score.

3. Track delta: stash the previous `overall` in component state so the new score can render a `+N pts` animated chip for 3 seconds.

### Files to add / change

- **Add** `supabase/functions/boost-launch-score/index.ts` — new edge function (auto-deploys).
- **Edit** `src/components/wizard/LaunchScoreCard.tsx` — add Boost button, weak-dimension chips, inline Boost Panel, Apply / Apply All handlers, delta animation, optional setter props.
- **Edit** `src/components/wizard/WizardStep1.tsx` — pass setters + `generateScore` into `LaunchScoreCard`; expose a re-score callback.

### Out of scope

- No changes to `generate-launch-score` itself (boost is additive).
- No changes to other wizard steps.
- No DB schema changes — boost runs purely in the wizard session and updates already-tracked state that autosaves via the existing autosave hook.

