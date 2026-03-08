

# Sales Page & Dashboard Psychology Upgrades

## Assessment

Most features the user mentioned already exist in the codebase:
- "Generate Entire Launch" button = existing `GenerateAllModal` ("Build My Launch System")
- "Launch Factory" / Multiplier = existing `LaunchMultiplier` component
- "Steal This Launch" library = existing `/steal` page
- Affiliate Launch Kit = existing in `WizardStep4.tsx`

The actual new work is **positioning and psychology upgrades** — not new features.

## Changes

### 1. Dashboard — Add "Launch Tonight" Hero CTA
**File: `src/pages/Dashboard.tsx`**

Replace the current "AI Launch Wizard" card with a more urgent "Launch Tonight" card:
- Headline: "🚀 Launch Tonight"
- Sub: "Generate your complete product, funnel, emails & affiliate kit in 60 minutes"
- Button: "Launch Tonight" (navigates to `/wizard`)
- Gradient: more prominent, pulsing border animation

### 2. Landing Page — Itemized Value Stack ($852)
**File: `src/pages/Index.tsx`**

Replace the generic `$997+` strikethrough in the pricing section with an itemized breakdown:

```
Product Generator         $297
Funnel Builder            $197  
Email Launch System        $97
Affiliate Kit Builder      $97
Launch Planner             $97
Revenue Projector          $67
─────────────────────────
Total Value:              $852
Today:                     $37
```

Each line item gets its own row with a check mark, making the value feel concrete and justified.

### 3. Landing Page — "Watch This In Action" Demo Section
**File: `src/pages/Index.tsx`**

Add a section right after the hero (before "The Problem"):
- Heading: "See DigiLaunchKit Build A Product In Under 60 Seconds"
- Placeholder video frame (dark rounded card with play button icon)
- Sub-copy: "Watch how DigiLaunchKit turns a simple idea into a complete digital product launch"
- This section is a placeholder — user can later embed an actual demo video/GIF

### 4. Landing Page — "Built For WarriorPlus" Section
**File: `src/pages/Index.tsx`**

Add after "What Makes This Different" section:
- Heading: "Built For WarriorPlus Launches"
- 5 checkmarks: Optimized $17 front-end funnels, Affiliate promo kit included, JV page generated automatically, Launch email swipes included, Bonus stack builder
- This signals to affiliates and vendors that the tool is purpose-built for their ecosystem

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Upgrade wizard CTA to "Launch Tonight" with urgency styling |
| `src/pages/Index.tsx` | Itemized $852 value stack, demo video placeholder section, WarriorPlus section |

Two files, pure UI/copy changes. No backend or edge function changes needed.

