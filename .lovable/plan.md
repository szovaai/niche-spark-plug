

# Landing Page Conversion Optimization

## What's Being Added

Three high-impact conversion features plus two micro-copy enhancements:

1. **Floating Buy Bar** — sticky bottom CTA that appears after scrolling past hero
2. **Scroll Progress Bar** — thin gradient bar at top with dynamic contextual text
3. **"What This Replaces" Comparison Section** — Without vs With visual comparison
4. **"Your First Launch In 60 Minutes" Steps Section** — 4-step visual breakdown
5. **Hero micro-copy enhancement** — add "Build your product / Build your funnel / Build your launch" lines + reassurance bullets under CTA

## Implementation

### File: `src/pages/Index.tsx`

**Add state + scroll listener** for:
- `scrollProgress` (0-100 percentage)
- `showFloatingBar` (boolean, true when scrolled past hero ~90vh)

**New sections inserted into the page flow:**

1. **Scroll Progress Bar** (fixed top, z-50): Thin gradient bar showing scroll %. Below it, dynamic text that changes:
   - 0-25%: "Discover how DigiLaunchKit works"
   - 25-50%: "See what DigiLaunchKit builds for you"
   - 50-75%: "See how the launch system works"
   - 75-100%: "You're almost there — see the launch price below"

2. **"Your First Launch In 60 Minutes"** section — inserted after the "What Nobody Admits" section (before "Introducing"). 4 numbered steps: Enter topic → AI builds → Export kit → Deploy & sell.

3. **"What This Replaces"** section — inserted after the "Launch Score Advisor" section (before "Who It's For"). Two-column comparison: Without (red X items, weeks/expensive) vs With (green check items, minutes/automatic).

4. **Floating Buy Bar** (fixed bottom, z-50): Dark glass bar with product name on left, "$37 Launch Price" + "Get Instant Access" button on right. Hidden on mobile or collapsed to just the button. Appears after hero scroll threshold via `showFloatingBar`.

5. **Hero enhancement**: Add 3 short lines under the subheading: "Build your product. Build your funnel. Build your launch." Plus 3 reassurance bullets under the CTA button: "Build Your First Launch In Under 60 Minutes", "No Writing Required", "Launch Tonight".

### File: `src/components/HeroSection.tsx`

No changes needed — it's not currently used by `Index.tsx` (the hero is inline in Index.tsx).

## Page Flow (Updated)

```
Hero (with new micro-copy)
↓ Scroll progress bar (fixed top)
Problem / Pain
"Your First Launch In 60 Minutes" ← NEW
What Nobody Admits
Introducing DigiLaunchKit
What Gets Built (feature grid)
Steal This Launch
Research Agent
Launch Score Advisor
"What This Replaces" ← NEW
Who It's For
What Makes It Different
Templates + BYOK
Value Stack ($997 → $37)
Guarantee
Investment Comparison
Final Word
FAQ
Footer
↑ Floating Buy Bar (fixed bottom) ← NEW
```

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add scroll state, progress bar, floating bar, 2 new sections, hero micro-copy |

Single file change — everything lives in `Index.tsx`.

