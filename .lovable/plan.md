

# DigiLaunchKit AI — Refactor Plan

## What This Changes

This is a major restructuring that repositions the app from a collection of separate tools (Empire Mode, Micro Factory, Toolkit Builder, Research, Launch) into a unified **AI Launch Engine** with one primary flow: the **AI Launch Wizard**.

## Current State vs. Target State

**Current navigation:** Dashboard, Empire Mode, Micro Factory, Research, My Toolkits, Launch

**New navigation:** Dashboard, AI Launch Wizard, Products, Funnels, Marketing Assets, Launch Checklist, Templates, Settings

## Implementation Status: ✅ COMPLETE

### Phase 1: Database ✅
- Created `launch_projects` table with JSONB fields for each wizard step
- RLS policies: users can only CRUD their own rows
- Auto-updated `updated_at` trigger

### Phase 2: Edge Functions ✅
- `generate-launch-product` — product concept from niche/audience/type/topic
- `generate-launch-content` — outline, chapters, bonuses, description
- `generate-launch-funnel` — sales page, opt-in, thank you, bonus, checkout copy
- `generate-launch-marketing` — 5 emails, 10 social posts, 5 pins, blog, video script
- `generate-launch-checklist` — personalized launch roadmap

### Phase 3: AI Launch Wizard ✅
- 5-step wizard at `/wizard` with left stepper + right content
- "Generate Entire Launch System" button runs all 5 steps sequentially
- All outputs saved to `launch_projects` table

### Phase 4: Section Pages ✅
- `/products` — list/delete launch projects
- `/funnels` — tabbed funnel copy library
- `/assets` — marketing asset library (emails, posts, pins, blog, video)
- `/checklist` — interactive launch checklists with toggle
- `/templates` — 5 pre-built niche templates

### Phase 5: Navigation ✅
- New sidebar: Dashboard, Products, Funnels, Marketing Assets, Launch Checklist, Templates
- CTA button: "New Launch" → `/wizard`
- Legacy routes preserved: `/empire`, `/micro-factory`, `/research`, `/my-toolkits`, `/launch`

### Phase 6: Dashboard ✅
- Launch-focused: progress tracker, active projects, adapted stats
- "Start New Launch" CTA

### Phase 7: Branding ✅
- Title: "DigiLaunchKit AI"
- Hero: "Launch Your Digital Product in 60 Minutes"
- Updated Navbar, HeroSection, index.html
