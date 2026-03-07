

# DigiLaunchKit AI — Refactor Plan

## What This Changes

This is a major restructuring that repositions the app from a collection of separate tools (Empire Mode, Micro Factory, Toolkit Builder, Research, Launch) into a unified **AI Launch Engine** with one primary flow: the **AI Launch Wizard**.

## Current State vs. Target State

**Current navigation:** Dashboard, Empire Mode, Micro Factory, Research, My Toolkits, Launch

**New navigation:** Dashboard, AI Launch Wizard, Products, Funnels, Marketing Assets, Launch Checklist, Templates, Settings

## Implementation Strategy

Rather than deleting existing features, we **reorganize and consolidate** them into the new structure. The existing edge functions, database tables, and AI logic stay — we rewire the frontend and add new generation steps.

---

## Phase 1: Database — New `launch_projects` Table

Create a central `launch_projects` table that ties all generated assets together under one project:

```
launch_projects
├── id, user_id, name, status
├── niche, target_audience, product_type, topic
├── step1_product (JSONB) — title, subtitle, concept, pain points, unique mechanism
├── step2_product_content (JSONB) — outline, chapters, bonuses, description
├── step3_funnel (JSONB) — sales page, opt-in, thank you, bonus page, checkout copy
├── step4_marketing (JSONB) — emails, social posts, pins, blog, video script
├── step5_checklist (JSONB) — auto-generated launch steps with status
├── current_step (1-5)
├── created_at, updated_at
```

RLS: users can only CRUD their own rows. Existing tables (toolkits, empire_projects, micro_products) remain untouched for backward compatibility.

## Phase 2: Edge Functions (5 New)

1. **`generate-launch-product`** — Takes niche/audience/type/topic, returns product title, subtitle, concept, unique mechanism, pain points
2. **`generate-launch-content`** — Takes product brief, returns outline, chapter breakdown, bonus ideas, product description
3. **`generate-launch-funnel`** — Takes product brief + content summary, returns sales page copy, opt-in page, thank you page, bonus page, checkout copy (5 sections)
4. **`generate-launch-marketing`** — Takes product + funnel context, returns email sequence (5 emails), 10 social posts, 5 Pinterest pins, 1 blog article, 1 video script
5. **`generate-launch-checklist`** — Takes project state, returns personalized launch roadmap steps

All use existing `tieredAI.ts` and `cache.ts`. Each function receives outputs from prior steps to maintain continuity (product title flows into sales page, etc.).

## Phase 3: Frontend — AI Launch Wizard

New page: `src/pages/LaunchWizard.tsx` at route `/wizard`

**Layout:** Left stepper (5 steps) + right content area (same pattern as Empire Mode)

### Step 1 — Niche + Product Setup
- Inputs: Niche, Target Audience, Product Type (dropdown: Ebook, Course, Templates, Checklist, Planner), Topic
- Button: "Generate Product Concept"
- Output: Product title, subtitle, concept, unique mechanism, target pain points (editable cards)

### Step 2 — Product Generator
- Shows product brief from Step 1
- Button: "Generate Full Product"
- Output: Outline, chapter breakdown (accordion), bonus ideas, product description
- Export buttons: PDF / Markdown / Text

### Step 3 — Funnel Builder
- Button: "Generate Funnel Copy"
- Output: 5 tabbed sections — Sales Page, Opt-in Page, Thank You Page, Bonus Page, Checkout Copy
- Each section is an editable text block with copy button

### Step 4 — Marketing Asset Generator
- Button: "Generate All Marketing Assets"
- Output: Tabbed view — Emails (5), Social Posts (10), Pinterest Pins (5), Blog Article (1), Video Script (1)
- Each asset has copy-to-clipboard

### Step 5 — Launch Checklist
- Auto-generated from project state
- Interactive checklist with checkboxes
- Steps like: Finalize product, Upload sales page, Load email sequence, Publish opt-in, Announce launch

**"Generate Entire Launch System" button** on Step 1 — runs all 5 generation steps sequentially and populates the entire project.

## Phase 4: New Section Pages

### Products Page (`/products`)
- Lists all `launch_projects` with product data
- Columns: Name, Niche, Type, Date, Status, Actions (edit/regenerate/export)

### Funnels Page (`/funnels`)
- Lists funnel assets from all projects
- Tabs: Sales Pages, Opt-in Pages, Bonus Pages, Checkout Pages
- Copy and export actions

### Marketing Assets Page (`/assets`)
- Central library pulling from all projects
- Tabs: Email Sequences, Social Posts, Pinterest Pins, Blog Articles, Video Scripts

### Templates Page (`/templates`)
- Pre-built niche templates (Affiliate Marketing, AI Tools, Fitness, Productivity, Side Hustles)
- Clicking a template pre-fills the wizard with niche/audience/type

## Phase 5: Navigation Refactor

**New sidebar items:**
```
Dashboard          /dashboard
AI Launch Wizard   /wizard        (primary CTA, highlighted)
Products           /products
Funnels            /funnels
Marketing Assets   /assets
Launch Checklist   /checklist
Templates          /templates
Settings           /settings
```

**Preserved routes** (accessible but removed from main nav):
- `/empire` — Empire Mode still works
- `/micro-factory` — Micro Factory still works
- `/research` — Research still works
- `/my-toolkits` — Toolkits still accessible
- `/launch` — Old launch hub still accessible

The sidebar CTA button changes from "Create Toolkit" to "New Launch" → navigates to `/wizard`.

## Phase 6: Dashboard Refactor

Replace current dashboard with launch-focused view:
- **Launch Progress Tracker** — visual progress bar showing Product → Sales Page → Emails → Assets → Ready
- **Active Launch Projects** — list of in-progress projects
- **Recent Generated Assets** — last 5 generated items across all projects
- **Quick Launch Button** — "Start New Launch" CTA
- Keep stats grid (adapted: Products Created, Funnels Built, Assets Generated, Streak)

## Phase 7: Branding Update

- App title: "DigiLaunchKit AI" (update index.html, Navbar, Sidebar)
- Tagline: "Create, Launch, and Start Selling Your Own Digital Product in Under 60 Minutes Using AI"
- Hero section updated with new messaging

---

## Files Created/Modified Summary

**New files (~20):**
- 1 migration file
- 5 edge functions
- 1 types file (`src/types/launchWizard.ts`)
- 5 wizard step components (`src/components/wizard/`)
- 4 section pages (Products, Funnels, Assets, Templates)
- 1 main wizard page
- 1 launch checklist page

**Modified files (~5):**
- `DashboardSidebar.tsx` — new nav items
- `Dashboard.tsx` — launch-focused redesign
- `App.tsx` — new routes
- `index.html` — branding
- `Navbar.tsx` / `HeroSection.tsx` — branding

**Preserved (no changes):**
- All existing edge functions, database tables, Empire Mode, Micro Factory, Research, Toolkit Builder

