

# Strip WarriorPlus Branding + Add Niche Dropdown for Research

Two parts: (1) remove WarriorPlus references throughout the app and replace with mainstream/neutral language, (2) add a curated niche dropdown selector (PDF Trend App style) on the Opportunity Radar so users can pick a niche to research instead of doing a blind market scan.

---

## 1. Remove WarriorPlus Branding (Mainstream Pivot)

Replace all WarriorPlus-specific copy, labels, fees, and platform options with neutral, mainstream-marketplace language. Affected surfaces:

**UI components & pages**
- `src/components/wizard/SalesStyleSelector.tsx` — rename "WarriorPlus Style" option to "High-Converting Sales Style" (keep underlying `warriorplus` enum value to avoid breaking saved projects, but relabel UI + description without the platform name).
- `src/components/CloneFunnelModal.tsx` — relabel the `warriorplus` tone option to "High-Energy" with a generic urgency/scarcity description.
- `src/components/wizard/FunnelInjectionEngine.tsx` — remove "WarriorPlus Buy Button" payment option from the dropdown; keep Stripe, PayPal, Gumroad, ThriveCart.
- `src/components/wizard/FunnelSimulationMap.tsx` — rename "Full WarriorPlus" funnel preset to "Full Launch Funnel".
- `src/components/wizard/WizardStep3.tsx` — replace the `"WarriorPlus Style"` badge label with "High-Converting Style".
- `src/components/wizard/WizardStep4.tsx` — rewrite the affiliate-finding instructions to reference generic affiliate marketplaces ("affiliate networks like ClickBank, JVZoo, Gumroad, or PartnerStack") instead of WarriorPlus specifically.
- `src/pages/FunnelSimulation.tsx` — rename the "WarriorPlus Affiliates" traffic source to "Affiliate Network Traffic"; update default state value label.
- `src/pages/ResearchAgent.tsx` — replace the example chip "I want to sell on WarriorPlus" with "I want to sell digital products online".
- `src/components/PricingSuggester.tsx` — rename the `warriorPlusFee` variable to `marketplaceFee`, relabel the tooltip to "After marketplace (10%) + payment fees (5%)".

**Edge functions (copy strings only — keep enum keys for data compatibility)**
- `supabase/functions/clone-funnel/index.ts` — rewrite the `warriorplus` tone directive to remove the platform name; keep the key.
- `supabase/functions/opportunity-radar/index.ts` — drop "WarriorPlus" from the `platform` enum returned by AI; keep Shopify, Gumroad, Etsy, plus add "Digital Marketplace".
- `supabase/functions/launch-intelligence/index.ts` — change default `platform` fallback string from `"warriorplus"` to `"digital"`.

**Master copy prompts**
- `supabase/functions/_shared/copyPrompts.ts` — rewrite the marketplace-context paragraph to remove WarriorPlus/ClickBank/JVZoo name-drops; replace with "digital product marketplaces and direct-response buyers" framing. Keep all the tonal rules intact.

**Branding copy**
- Search the codebase for any remaining user-facing strings containing "WarriorPlus" in pages/components and convert each to a neutral phrase (e.g. "marketplace", "affiliate network", "digital product launch").

**Migration filename comment**
- Existing `20251231085743_*.sql` migration has `-- WarriorPlus Toolkit Edition` comment — leave the migration file untouched (already executed) but no further references in new code.

---

## 2. Niche Dropdown Selector on Opportunity Radar

Add a curated niche picker above the "Scan Market" button so users can target a specific niche before scanning, similar to PDF Trend App's category browser.

**Niche library**
- Create `src/data/researchNiches.ts` exporting a curated list of ~30 mainstream digital-product niches grouped by category. Each entry: `{ id, label, category, emoji, description, keywords[] }`. Categories: Health & Wellness, Finance & Money, Productivity, Parenting, Education, Business & Marketing, Hobbies & Crafts, Spirituality, Pets, Relationships, AI & Tech, Self-Development.

**UI changes — `src/pages/OpportunityRadar.tsx`**
- Add a `selectedNiche` state (default `"all"`).
- Add a prominent searchable niche selector above the existing category/difficulty/profit filter row, using a Combobox-style dropdown (shadcn `Popover` + `Command`) so users can scroll, search, and pick from grouped niches.
- Show the selected niche as a chip with a clear-X button.
- Pass the chosen niche label + keywords to `fetchOpportunities` → forward to the `opportunity-radar` edge function as `targetNiche`.
- When a specific niche is selected, change the empty-state CTA label from "Scan Market" to `Scan {NicheLabel} Niche`.

**Edge function — `supabase/functions/opportunity-radar/index.ts`**
- Accept new optional `targetNiche` param.
- When provided, inject a directive into the AI prompt: "Focus exclusively on the '<niche>' niche. All opportunities returned must serve this audience." Keep current generic behaviour when `targetNiche` is `"all"` or omitted.

**Optional polish**
- Persist last-selected niche in `localStorage` so returning users see their previous focus.
- Wire the same selector visually into the Discover page header for parity, but scoped to filter `nicheSnapshots` by category match (single-file change, low risk).

---

## Out of Scope

- No database schema changes (existing `warriorplus` enum values in saved projects remain valid; only labels change).
- No changes to Pricing, Auth, Logo, or Sidebar layout.
- No removal of the `SalesStyle` type's `"warriorplus"` key — preserved for backwards compatibility with stored launch projects.

