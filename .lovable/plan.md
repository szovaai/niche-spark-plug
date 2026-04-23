

## Add "Let AI Decide" option to Mechanism Selector

Add a special card at the top of the mechanism grid in `src/components/wizard/MechanismSelector.tsx` that lets the user delegate the choice to the AI instead of picking one of the 8 mechanism cards manually.

### Changes to `src/components/wizard/MechanismSelector.tsx`

1. **Add a new "Let AI Decide" card** rendered before the mapped `mechs.map(...)` cards.
   - Distinct visual style: gradient border (accent → primary), Sparkles icon, "Recommended" badge.
   - Title: "Let AI Decide"
   - Tagline: "Pick the highest-converting mechanism for me"
   - Description: short copy explaining the AI will analyze the niche, audience, and angle scores to lock in the strongest framework automatically.
   - Selectable like the other cards (shows the same Check indicator when active).

2. **Selection logic** — when clicked:
   - Score each mechanism using available signals (formula diversity, presence of `whyItWorks`, length/specificity of tagline+description). If `launchScore.angleScores` are not available here, fall back to a deterministic ranking: prioritize mechanisms whose `formula` is `Number`, `Timeframe`, or `Acronym` (highest-converting in direct response), then by description length.
   - Pick the top-scored mechanism and call the existing `onSelect(mech)` with it.
   - Mark internal state `aiPicked = true` so the AI Decide card shows the Check, and add a small "AI picked: {name}" hint line under the card grid.
   - Show a toast: `AI selected "{name}" — {reason}` (e.g. "highest-converting Timeframe formula for your niche").

3. **Visual treatment**
   - The AI card spans the same grid cell size as the other mechanism cards (no layout shift).
   - When AI-picked, also visually highlight the chosen underlying mechanism card with a small "AI Pick" mini-badge so the user can see which one was selected and still override it manually by clicking another card.

4. **No prop changes required** — the parent (`WizardStep1.tsx`) already passes `onSelect` and the mechanism list. No edge function changes needed; this is a client-side smart selection layered on top of the existing mechanisms array.

### Out of scope
- No new edge function call (avoids extra AI cost; uses existing generated mechanisms).
- No changes to `WizardStep1.tsx`, types, or other wizard steps.

