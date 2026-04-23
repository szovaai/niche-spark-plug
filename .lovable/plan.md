## Premium eProduct Bundle Visual Upgrade

Edit `supabase/functions/generate-ecover/index.ts` only, then redeploy `generate-ecover`. Goal: richer, denser, more designed-looking bundle mockups without breaking the existing strict typography/spelling rules.

### 1. Detailed, label-free side props (`COMPONENT_VISUALS`)
Rewrite each component's `promptFragment(false)` so blank props look richly designed instead of empty. Strict no-text rule unchanged — only visual texture is added.

- **Workbook**: spiral binding, fill-in lines, small bar-chart sketch, tiny circular icon glyphs, ornamental corners, matte cardstock — NO words
- **Checklist**: 6–8 checkmarks beside short placeholder bars, star icon, percent ring graphic, decorative divider, ornamental border — NO words
- **Resource list**: laminated card with link/bookmark/gear/envelope glyphs, divider lines, small QR-style square, gold accent corners — NO words
- **Templates**: layered sheets with wireframe boxes, grid placeholders, color swatch row, dotted dividers, kraft folder + band — NO words
- **Prompt library / quiz**: numbered circle badges, short bar placeholders, dotted dividers, icon glyph row, accent stripe — NO words

The label-on variants stay restricted to the existing 5-word safelist (WORKBOOK, CHECKLIST, TEMPLATE, SWIPE FILE, BONUS).

### 2. Hero cover — non-text design structure
Add a `heroLayoutRule` in the prompt builder telling the image model to fill dead space with non-text design elements:
- Thin decorative eyebrow band at top in the accent color
- Bold title block centered, occupying 55–65% of the cover height
- Ornamental divider line under the title
- Small brand monogram circle bottom-center
- Subtle background texture (paper grain or soft geometric pattern)

Existing strict typography rules and 6-word title cap stay exactly as they are.

### 3. Denser, richer composition (`compositionRule` rewrite)
- Hero ~55% of frame width
- Supporting items fan tighter — overlap **15–20%** (was 8–12%)
- Add a second depth row with 1–2 peeking items (folder edge, index card, tab)
- Add 1–2 styling accessories (fountain pen, brass paperclip, folded kraft band) for editorial feel
- Bundle fills **80–85% of the frame** (tight crop)
- One unified soft contact shadow under the entire stack

### 4. Cinematic studio background
Upgrade the background instruction inside `REQUIRED EFFECTS`:
- Navy-to-charcoal radial gradient centered behind hero with subtle vignette
- Faint reflective floor under the bundle
- Soft rim light from upper-left, gentle bloom on glossy edges

### 5. Prompt budget bump
`PROMPT_WRITER_SYSTEM`: raise output target from 400–600 → 500–750 words so the new detail rules survive into the final image prompt.

### Files touched
- `supabase/functions/generate-ecover/index.ts` (only)

### Out of scope
- No UI changes (Step 3 wizard already passes the right flags)
- No new toggles, no schema changes, no other edge functions
- Existing strict typography/spelling rules and 6-word title cap unchanged

### After edit
Redeploy `generate-ecover` so the next "Generate Product Bundle" click in Step 3 uses the upgraded prompt.