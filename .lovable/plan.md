

# DigiLaunchKit AI — Comprehensive Quality & Completeness Upgrade

This is a 10-feature request. Many overlap with existing functionality that needs enhancement, while others are net-new. I'll organize into 4 implementation passes by priority.

---

## Pass 1: Deep Avatar Builder + Enhanced Mechanism Generator + Validation Score (Highest Priority)

### 1A. Deep Avatar Builder (New Pre-Step)
- Add `BuyerAvatar` interface to `launchWizard.ts` with fields: personaName, occupation, dailyFrustration, triedBefore, secretDream, biggestFear, languageTheyUse, emotionalState, painPoints (5), desires (3), instantBuySentence, dayInTheLife
- Create `src/components/wizard/AvatarBuilder.tsx` — a card-based form with "Generate Avatar from Niche" button that calls a new edge function `generate-buyer-avatar`
- Add avatar state to `LaunchWizard.tsx`, display as optional Step 0 before Product Setup
- Show "Writing for: [Avatar Name]" badge in `LaunchDNACard.tsx`
- Pass avatar into ALL edge function calls (generate-launch-product, generate-launch-content, generate-launch-funnel, generate-launch-marketing) so prompts reference the buyer persona
- Store avatar in `launch_projects` table — requires adding `buyer_avatar jsonb` column via migration

### 1B. Enhanced Mechanism Generator (Upgrade existing)
The existing `MechanismSelector` generates 3 mechanisms. Upgrade to:
- Generate 8 options across the 8 naming formulas (Number, Timeframe, Acronym, Metaphor, Insider, Transformation, Contrarian, Simple)
- Show "Why this works" psychological explanation per option
- Add "Generate More" button for additional options
- Already weaves mechanism into all copy via `copyPrompts.ts` — verify consistency in all edge functions

### 1C. Validation Score Enhancement (Upgrade existing LaunchScore)
The existing `LaunchScoreCard` already scores Demand, Competition, Monetization, Audience Clarity, Offer Strength. Upgrade:
- Add traffic-light color coding (green/yellow/red) based on overall score
- Add "AI-suggested pivots" when score is below 50
- Add estimated price ceiling and affiliate commission sweet spot
- Update `generate-launch-score` edge function prompt to include these new outputs

---

## Pass 2: Proof Stack + Structured Modules + Content Quality Checker

### 2A. Proof & Credibility Stack Builder
- Create `src/components/wizard/ProofStackBuilder.tsx`
- Add as a section within WizardStep2 (after content generation) and WizardStep3 (funnel)
- Generate: 5 placeholder testimonials (Before→Product→Result→Life Now format), Before/After transformation table, Credibility builder copy for beginners, FTC-compliant earnings disclaimer
- Add `proofStack` field to `Step2Content` type
- Create edge function logic (can be added to `generate-launch-content` as an additional output section)

### 2B. Structured Module Architecture (Upgrade WizardStep2)
- Replace flat chapter generation with the structured template: Module Goal → Hook → Core Concept → Step-by-Step Action Plan → Real Example → Common Mistakes → Action Step → Module Summary
- Update `ChapterItem` type to include these new fields
- Update `generate-launch-content` prompt to enforce this structure
- Update WizardStep2 UI to render each module section with icons and formatting

### 2C. Content Quality Checker
- The existing `CopyScoreBadge` scores copy on generic phrases, specificity, mechanism, CTA strength, readability
- Extend with: Actionability grade (check for action verbs), Fluff ratio (vague filler detection), per-dimension A-F letter grades
- Add "Improve This Section" button that calls AI to rewrite weak parts
- Show as collapsible panel under each generated piece in Steps 2-4

---

## Pass 3: Product Naming Workshop + JV Page + Legal Pages

### 3A. Product Naming Workshop (Add to Step 1)
- Create `src/components/wizard/ProductNamingWorkshop.tsx`
- Generate 12 names across 6 formulas (Number, Timeframe, Transformation, Insider, Curiosity Gap, Simple)
- Each shows: title, subtitle, "why this works", buyer reaction emoji
- Add as sub-step in WizardStep1 before concept generation
- Selected name auto-populates product title

### 3B. Affiliate JV Page Generator
- Add "JV Page" tab to `WizardStep3.tsx` FUNNEL_TABS array
- Extend `Step3Funnel` type with `jvPage` field
- Update `generate-launch-funnel` edge function to produce JV page content: affiliate pitch, commission structure, launch schedule, affiliate swipe pack (5 subject lines, 3 full emails, 10 social posts)
- This partially exists in `AffiliateKit` type — extend and integrate

### 3C. Legal Pages Generator
- Create `src/components/wizard/LegalPagesGenerator.tsx`
- Add as a section in WizardStep3 or as new tab
- Generate 6 legal page types: Earnings Disclaimer, Income Disclaimer, Privacy Policy, Terms of Service, Refund Policy, DMCA Notice
- Pre-populate with product name and author details from profile/settings
- Add `legalPages` field to `Step3Funnel` type
- Show warning banner on Dashboard if legal pages not generated

---

## Pass 4: Pre-Launch Content Calendar

### 4A. 7-Day Pre-Launch Calendar
- Create `src/components/wizard/PreLaunchCalendar.tsx`
- Add after Step 5 completion as bonus section
- Generate day-by-day plan (Day 1: Seed Pain → Day 7: Official Launch) with social posts, email copy, and content hooks per day
- Visual calendar grid with checkboxes for completion tracking
- "Copy All Emails" and "Copy All Posts" bulk copy buttons
- Store calendar state in `step5_checklist` or new `prelaunch_calendar` field

---

## Database Changes
- Migration: Add `buyer_avatar jsonb` column to `launch_projects` table

## Edge Function Changes
- New: `generate-buyer-avatar` — generates persona from niche/audience
- Updated: `generate-launch-product` — accept avatar, generate 8 mechanisms with formulas
- Updated: `generate-launch-content` — structured module architecture, proof stack, pass avatar
- Updated: `generate-launch-funnel` — JV page, legal pages, pass avatar
- Updated: `generate-launch-marketing` — pre-launch calendar, pass avatar
- Updated: `generate-launch-score` — traffic light, pivots, price ceiling

## Implementation Priority
Pass 1 first (Avatar + Mechanisms + Validation) — these fundamentally improve everything downstream. Then Pass 2 (Proof + Modules + Quality), Pass 3 (Naming + JV + Legal), Pass 4 (Calendar).

