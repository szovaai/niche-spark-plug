

# Plan: Complete Remaining Features — Funnel Builder, Command Center Polish, Import Flow

## Overview

Four deliverables to finish all mentioned-but-not-built items:

1. **Funnel Readiness → Wizard Navigation** — Make each checklist item in the Command Center clickable, navigating to the correct wizard step
2. **Visual Funnel Builder** — Replace the current Funnels page with a node-based funnel flow visualization (Traffic → Opt-in → Sales → Checkout → Upsell → Thank You) with conversion assumptions per node
3. **Rotating AI Recommendations** — Auto-cycle the Next Best Action panel every 8 seconds through multiple suggestions
4. **Import Product Idea** — Add an "Import Product Idea" flow from the Command Center empty state

---

## 1. Funnel Readiness → Wizard Navigation

**File:** `src/pages/CommandCenter.tsx`

- Add a `wizardStep` property to each funnel checklist item mapping to the correct wizard step number (e.g., "Offer Created" → step 1, "Sales Page Drafted" → step 2, "Email Follow-up Ready" → step 4)
- Make `FunnelCheckItem` accept an `onClick` prop
- Incomplete items become clickable, navigating to `/wizard/{projectId}?step={stepNumber}`
- Complete items stay static (no click needed)
- Add a subtle hover effect + arrow icon on clickable items

## 2. Visual Funnel Builder Page

**File:** `src/pages/Funnels.tsx` (rewrite)

Replace the current "Funnel Copy Library" with a proper Visual Funnel Builder:

- **Node-based flow visualization** using SVG connections between funnel stages:
  - Traffic Source → Opt-in Page → Sales Page → Checkout → Upsell → Thank You
- Each node shows:
  - Stage name + icon
  - Status (Ready / Not Ready) based on the active project's data
  - Conversion assumption (editable via slider: e.g., 40% opt-in, 3% sales, 25% upsell)
  - Estimated visitors reaching that node (calculated from upstream)
- **Revenue calculation** flows through the funnel showing drop-off at each stage
- **Weak Point Detector** — highlights the node with the biggest revenue leak
- Click any node → navigate to the relevant wizard step or open the copy preview
- **Funnel Templates** — 3 preset blueprints (Simple Sales Page, Full IM Funnel, Webinar Funnel) that set conversion assumptions
- Pull project data from `launch_projects` table (same pattern as Command Center)
- Glassmorphism styling consistent with Command Center

## 3. Rotating AI Recommendations

**File:** `src/pages/CommandCenter.tsx`

- Create a `rotatingActions` array with 4-5 contextual suggestions based on project state
- Add a `useEffect` timer that cycles `activeActionIndex` every 8 seconds
- Animate transitions with `AnimatePresence` fade/slide
- Each suggestion has: text, CTA label, and navigation action
- Manual dots/indicators to let user click between suggestions

## 4. Import Product Idea Flow

**File:** `src/pages/CommandCenter.tsx`

- Add "Import Product Idea" button to the empty state (already has placeholder text)
- On click, show a Dialog with:
  - Text area for pasting a product idea / description
  - Optional fields: niche, target audience, price point
  - "Import & Build" button that creates a new `launch_projects` row with the imported data as `step1_product`
  - After creation, navigate to `/command-center/{newProjectId}`

---

## Technical Notes

- No database migrations needed — all features use existing `launch_projects` table
- No new edge functions — all computation is client-side
- The Visual Funnel Builder is the biggest piece (~400 lines); everything else is incremental additions to existing files

