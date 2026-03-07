

# DigiLaunchKit AI — Comprehensive Upgrade Plan

This is a large request spanning 7 feature areas. To avoid quality degradation from trying to do everything at once, I recommend splitting into 3 implementation passes. Here is the full plan:

---

## Pass 1: Critical Fixes and Copy Infrastructure (Items 1, 2)

### 1A. Fix Funnel Copy Truncation
**Root cause:** `WizardStep3.tsx` line 113 uses `max-h-[500px]` with `line-clamp-6` in the Funnels page. The Funnels page (`Funnels.tsx` line 57) also uses `line-clamp-6`.

**Changes:**
- `WizardStep3.tsx`: Remove `max-h-[500px]`, replace with auto height or `max-h-[80vh]` for scrollable full content
- `Funnels.tsx`: Remove `line-clamp-6`, add scrollable container
- Add "Copy Full Page" button (copies raw text) and "View Full Preview" button (opens Dialog with full rendered HTML) to each tab
- Apply same fix to Offer Stack's `max-h-[300px]` container

### 1B. Human Tone Directive in All Prompts
**Changes:**
- Update `supabase/functions/_shared/copyPrompts.ts` — append a "HUMAN TONE" section to `MASTER_SYSTEM_PROMPT` enforcing conversational rhythm, contractions, em-dashes, humor, and story-driven writing
- This automatically propagates to all edge functions already importing from `copyPrompts.ts`
- Update `generate-launch-content` and `generate-launch-product` prompts to also include the human tone directive (these currently use inline prompts)

---

## Pass 2: Full Asset Suite and Author Bio (Items 3, 4, 7)

### 2A. Expanded Product Asset Suite
**Changes:**
- Extend `Step2Content` type in `launchWizard.ts` to include new fields: `videoScript`, `slideDeckOutline`, `audioScript`, `cheatSheet`, `worksheet`, `swipeFile`, `resourceToolkit`, `miniCaseStudy`, `orderBumpConcept`, `upsellConcept`, `downsellConcept`
- Update `generate-launch-content` edge function prompt to generate all asset types
- Refactor `WizardStep2.tsx` from accordion to tabbed interface showing each asset with copy buttons

### 2B. Author Bio Generator + Brand Voice Settings
**Changes:**
- Add `author_name`, `author_bio`, `author_persona`, `tone_preference`, `niche_tags`, `default_price`, `default_product_type` columns to `profiles` table via migration
- Create new component `AuthorBioSection.tsx` used in both WizardStep1 and Settings
- Add "Generate Author Bio" button calling a new edge function or inline prompt
- Persona archetypes: Expert, Relatable Beginner, Contrarian, Coach, Insider
- Add "Brand Voice" tab to `Settings.tsx` with form for all preferences
- Auto-populate wizard fields from profile settings on load
- Inject author bio into funnel/marketing generation prompts

---

## Pass 3: Product Graphics, UX Polish (Items 5, 6)

### 3A. Product Graphics Generator
**Changes:**
- New page `src/pages/ProductGraphics.tsx` with route `/graphics`
- Add "Product Graphics" to sidebar nav
- Implement 5 graphic types using HTML Canvas + CSS 3D transforms:
  1. Ebook Cover (3D perspective book)
  2. Bundle Stack (layered product mockup)
  3. Flat Lay (top-down spread)
  4. Device Mockup (laptop/tablet frame)
  5. Bonus Badge Stack (individual badges)
- Color palette presets + custom hex input
- Download as PNG via `html2canvas` (already installed)
- This is the most complex item — may need a dedicated follow-up for polish

### 3B. UX Polish
**Dashboard:**
- Add "Quick Actions" row with icon buttons (New Launch, Generate Graphics, Research Niche, View Assets)
- Add launch project switcher dropdown

**Wizard:**
- Add progress bar showing % completion (already partially exists)
- Add "Regenerate" button per section
- Add tooltips on form fields
- Add "Launch Summary" page after Step 5 completion

**Marketing Assets:**
- Add filter chips, character counts on social posts, "Regenerate All" button

**General:**
- Add Cmd/Ctrl+K quick search (using `cmdk` — already installed)
- Skeleton loading states (partially exist)
- Copy confirmation toasts (partially exist)

---

## Recommended Implementation Order

Given credit constraints, I recommend implementing in this order:
1. **Pass 1** (Items 1+2) — fixes the critical truncation bug and upgrades all copy quality
2. **Pass 2** (Items 3+4+7) — expands the product suite and adds author/brand voice
3. **Pass 3** (Items 5+6) — graphics generator and UX polish

Shall I proceed with Pass 1 first?

