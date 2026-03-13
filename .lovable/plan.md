

# Plan: Connect Research Agent to AI Launch Wizard

## Problem
The Research Agent generates Opportunity Briefs with product ideas, but the connection to the Launch Wizard is weak:
1. Non-trend-mode ideas lack per-idea "Build This" buttons
2. Clicking "Send to Launch Wizard" only passes query params — no project is created, so the user starts from scratch
3. No visual feedback that a project was created from research

## Solution

### 1. Per-Idea "Build This Product" Buttons (All Modes)
**File:** `src/pages/ResearchAgent.tsx`

- Add a "Build This Product" button to every idea card (not just trend mode)
- Each button creates a `launch_projects` row directly from that specific idea's data (title, audience, angle, mechanism, format)
- After creation, navigate to `/wizard/{newProjectId}` so the user lands on a saved, pre-populated project

### 2. Direct Project Creation from Research
**File:** `src/pages/ResearchAgent.tsx`

- New `buildFromIdea(idea, brief)` async function that:
  1. Inserts a `launch_projects` row with `user_id`, `name` (idea title), `niche`, `target_audience`, `product_type`, `topic`, and pre-fills `step1_product` with a partial object containing the idea's angle, mechanism, and "why it sells" data
  2. Navigates to `/wizard/{newId}` on success
- Replace the current `sendToWizard` (query-param approach) with this direct creation
- The global "Send to Launch Wizard" button uses the recommended idea

### 3. Visual Enhancement
- Loading state on the "Build This Product" button while project is being created
- Toast confirmation: "Project created — opening Launch Wizard..."
- Add a subtle "→ Launch Wizard" breadcrumb trail so users know where they're going

### Technical Details
- Uses existing `launch_projects` table — no migrations needed
- `step1_product` JSONB will be pre-seeded with: `{ title: idea.title, uniqueMechanism: idea.uniqueMechanism, campaignAngle: idea.suggestedAngle, whyItSells: idea.whyItSells }`
- The LaunchWizard's `loadProject` already reads all these fields, so the wizard will show pre-filled data immediately

