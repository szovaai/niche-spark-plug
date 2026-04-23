

## Fix Cover Text Quality: Drop the Tagline + Sharpen Spelling

Two clear options the user can toggle in **Product Launch Graphics** (Step 3). Defaults to the cleaner look (no tagline, hero text only).

### What changes

**1. New "Cover Text" control card** in `src/components/wizard/WizardStep3Graphics.tsx`, right above the Generate buttons:

- **Tagline on cover**: Toggle (default **OFF**)
  - OFF → only the **Title** is rendered on the main book; no subtitle, no body paragraph, no labels on side props.
  - ON → Title + short subtitle (auto-trimmed to ≤ 80 chars, no body paragraph).
- **Side asset labels**: Toggle (default **OFF**)
  - OFF → side workbook / swipe file / checklist / template props render as clean blank covers (no garbled "WORKBO"/"MEXOON" text).
  - ON → labels render but only from a fixed clean word list (`WORKBOOK`, `CHECKLIST`, `TEMPLATE`, `SWIPE FILE`, `BONUS`).

**2. Pass the toggles to the edge function**

Extend the `generate-ecover` body with:
```ts
includeSubtitle: boolean;     // default false
includeSideLabels: boolean;   // default false  
maxCoverWords: 8;             // hard cap on hero title rendering
```

**3. Tighten the prompt** in `supabase/functions/generate-ecover/index.ts`:

- When `includeSubtitle === false`: strip subtitle from `enhancedParams`, remove the "with subtitle …" clause, and add an explicit instruction:
  > `RENDER ONLY the title text "<TITLE>" on the main book cover. Do NOT render a subtitle, tagline, body paragraph, or any descriptive sentence. The cover must contain ONLY the title and small author/brand mark.`
- When `includeSideLabels === false`: replace the current per-component prompt fragments (which currently say things like `"'Worksheets' header label visible"`) with **label-free** variants:
  > `"3-5 stacked blank worksheet pages with subtle grid lines, NO TEXT, NO HEADERS, NO LABELS visible"`
- When `includeSideLabels === true`: restrict labels to the fixed word list above and forbid invented words. Add: `Side props may ONLY display these exact words: WORKBOOK, CHECKLIST, TEMPLATE, SWIPE FILE, BONUS. Do not invent or abbreviate any other words. Spell every visible word correctly.`
- Add a global typography rule: `All rendered text must be sharply legible, correctly spelled English. No partial words, no truncated text, no placeholder lorem ipsum, no fake brand names.`

**4. Auto-shorten the title for cover rendering**

In `WizardStep3Graphics.tsx`, derive a `coverTitle` for the bundle/hero/thumbnail that strips any text after the first colon **and** caps at 8 words (e.g. `"The $1,000 Debt Erase Blueprint: Add $1,000 to Your Bank Account in 30 Days—Not Debt Payments"` → `"The $1,000 Debt Erase Blueprint"`). The full original title is still stored in the project; only the cover render uses the short form. Show a small preview chip under the toggle: *"Cover will read: The $1,000 Debt Erase Blueprint"* so the user knows what will appear.

**5. Re-generate buttons unchanged**

Existing **Generate Product Bundle** and **Generate All Launch Graphics** buttons just pick up the new toggles automatically — no extra clicks required.

### Files touched

- **Edit** `src/components/wizard/WizardStep3Graphics.tsx` — add Cover Text card with two toggles, derive `coverTitle`, pass `includeSubtitle` / `includeSideLabels` / short title to all `generateGraphic` calls (single + ad overrides).
- **Edit** `supabase/functions/generate-ecover/index.ts` — accept the new flags, swap the per-component prompt fragments for label-free variants when off, add strict spelling + word-list rules, drop subtitle from prompt when off.

### Out of scope

- No changes to other wizard steps, asset factory, or autosave.
- No new edge function — same `generate-ecover` endpoint.
- No DB schema changes.

