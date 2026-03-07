

# Digital Product Asset Factory — Implementation Plan

This is a major upgrade to the Launch Wizard (Step 2) that transforms it from "outline generator" into a "complete sellable asset stack" factory. The request covers ~12 asset types, each requiring dedicated generation logic. Due to scope, this will be split into two implementation passes.

---

## Architecture Decision

Rather than cramming everything into WizardStep2, we add a **new Step 2.5 — "Product Asset Factory"** that appears after Step 2 content generation. This keeps the existing flow intact while adding the full asset ecosystem.

**Approach:** Add a new `launch_projects` JSONB column `step2_assets` to store all generated assets. Add a new component `AssetFactory.tsx` that renders as a sub-section within Step 2 (below the existing chapters/outline). Each asset type gets a toggle + generate button + display card.

---

## Pass 1: Core Asset Generators (This Implementation)

### 1. Database Migration
- Add `step2_assets jsonb` column to `launch_projects` table (stores all generated asset content)

### 2. New Edge Function: `generate-product-assets`
- Single edge function that accepts an `assetType` parameter
- Supported types: `workbook`, `cheatsheet`, `toolkit`, `templates`, `promptPack`, `bonusGuides`, `caseStudies`
- Uses existing `MASTER_SYSTEM_PROMPT` + asset-specific prompts
- Each asset type has a dedicated prompt template that references the product brief, chapters, and mechanism
- Returns structured JSON per asset type (e.g., workbook returns array of worksheets with questions)

### 3. New Component: `src/components/wizard/AssetFactory.tsx`
- Toggle panel with checkboxes for each asset type
- "Generate All Selected" button + individual generate buttons
- Progress indicator showing which assets are being generated
- Each completed asset renders in a collapsible card with copy/download buttons
- Uses existing `AssetDownloadButtons` for PDF/TXT export

### 4. Asset Type Outputs

| Asset | What Gets Generated |
|-------|-------------------|
| **Workbook** | 1 worksheet per chapter: title, intro, 5-8 questions, reflection prompts |
| **Cheat Sheets** | 3-5 quick-reference sheets: step-by-step frameworks, key formulas |
| **Toolkit** | Scripts, outreach templates, checklists (5-8 items) |
| **Templates** | 5 reusable templates (proposals, emails, onboarding, offers) |
| **Prompt Pack** | 15-20 AI prompts organized by use case |
| **Bonus Guides** | 3-5 named bonus products with 500-word content each |
| **Case Studies** | 3 fictional case studies with before/after/method/results |

### 5. Integrate into WizardStep2
- After existing chapters/bonuses/description cards, add the AssetFactory component
- Pass `productBrief`, `step2Result` (chapters), and `productType` as context
- Auto-save generated assets to `step2_assets` column via autosave

### 6. Product Multiplier Card
- Small card at bottom of AssetFactory showing "Your Product Can Become:"
- Lists: Ebook, Video Course Outline, Workshop, Membership, Upsell Product, Coaching Offer
- Each is a one-click generate that calls the edge function with `assetType: 'multiplier'`
- Returns a brief pitch + outline for each format

### 7. Export: "Download Full Product Bundle"
- New button in Step 2 that bundles ALL generated assets into a ZIP
- Uses existing `JSZip` library
- Folder structure: `/Core-Product/`, `/Workbooks/`, `/Cheat-Sheets/`, `/Toolkit/`, `/Templates/`, `/Prompts/`, `/Bonuses/`

---

## Pass 2: Launch Assets & Resell Kit (Follow-up)

These are partially covered by existing Steps 3-4 but will be enhanced:
- **Affiliate Promo Kit** — already in Step 4, will add review video script + ad headlines
- **Sales Page Generator** — already in Step 3, will add Kennedy-style template
- **Resell Rights Generator** — new: license terms, affiliate rules, graphics prompts
- **Product Quality Score** — already built as `ProductScorecard.tsx`, will integrate into Asset Factory

---

## Files to Create
- `src/components/wizard/AssetFactory.tsx` — main toggle panel + asset cards
- `src/components/wizard/AssetCard.tsx` — individual asset display with copy/download
- `src/components/wizard/ProductMultiplier.tsx` — multiplier suggestions card
- `supabase/functions/generate-product-assets/index.ts` — unified asset generation edge function

## Files to Modify
- `src/components/wizard/WizardStep2.tsx` — add AssetFactory below existing content
- `src/pages/LaunchWizard.tsx` — pass step2Assets state, include in autosave
- `src/types/launchWizard.ts` — add asset type interfaces
- `supabase/config.toml` — register new edge function
- `src/integrations/supabase/types.ts` — will auto-update after migration

## Database Migration
```sql
ALTER TABLE public.launch_projects ADD COLUMN step2_assets jsonb DEFAULT '{}';
```

## Implementation Priority
1. Migration + types
2. Edge function with workbook + cheatsheet + toolkit prompts
3. AssetFactory UI with toggles + generation
4. Product Multiplier card
5. ZIP bundle export
6. Remaining asset types (templates, prompts, bonuses, case studies)

