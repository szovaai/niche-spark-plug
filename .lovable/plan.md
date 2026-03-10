

# Plan: LaunchStack AI -- Sidebar Navigation Restructure & Module Polish

This is a large request touching many existing modules. Most of the core modules already exist and are functional. The main gaps are:

1. **Sidebar navigation** doesn't match the requested structure
2. **No dedicated "Profit Map" page** (currently embedded in FunnelSimulation)
3. **"Winning Launch Modeler"** exists at `/steal` but isn't in the sidebar with the right name
4. **"Visual Funnel Builder"** exists at `/funnels` but isn't labeled correctly in nav
5. **"Launch Intelligence"** is not a standalone sidebar item

Everything else -- Onboarding, Outcome Lock AI, Command Center, Launch Simulation, Product Builder -- already exists and is functional.

## Changes

### 1. Restructure Sidebar Navigation (`src/components/DashboardSidebar.tsx`)

Replace the current 5-group navigation with the requested structure:

```text
LaunchStack AI

[New Launch button]

--- Core ---
Dashboard           /dashboard
Command Center      /command-center
AI Product Builder  /wizard

--- Intelligence ---
Winning Launch Modeler  /steal
Visual Funnel Builder   /funnels
Profit Map              /profit-map
Launch Simulation       /funnel-simulation

--- System ---
Settings            /settings
```

Remove: Opportunity Radar, AI Agent Hub, Sales Copy Engine, Email Engine, Social Content, Affiliate Center, Traffic Planner, Analytics, Integrations, Brand Kit from the main sidebar (these remain accessible via direct URL).

### 2. Create Profit Map Page (`src/pages/ProfitMap.tsx`)

Extract and enhance the "Profit Map" visualization into its own dedicated page:
- Interactive sliders for Price, Traffic, Conversion Rate, Upsell Price, Upsell Conversion
- Visual conversion funnel flow: Visitors → Leads → Buyers → Revenue
- Real-time revenue calculations (Front End + Upsell)
- Revenue forecast cards
- Glassmorphism styling consistent with existing pages

### 3. Add Route for Profit Map (`src/App.tsx`)

Add `/profit-map` route pointing to the new ProfitMap page.

### 4. Update `DashboardLayout` page titles

Add entries for the new/renamed routes in the `pageTitles` map.

## Technical Notes

- No database changes needed
- No new edge functions needed
- All computation is client-side (slider-driven calculations)
- Reuses existing glassmorphism design system (glass-surface, Card components, motion animations)

