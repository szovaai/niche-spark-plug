

# DigiLaunchKit AI — Advanced Optimization Suite Plan

This is a massive 12-feature request. Many overlap with existing functionality (avatar builder, mechanisms, validation score, proof stack, quality checker already exist or were just built). I'll organize by what's truly new vs. what enhances existing features, and prioritize into 4 implementation passes.

---

## What Already Exists (Upgrade Only)

- **Buyer Avatar** — `AvatarBuilder.tsx` already built in Pass 1
- **Unique Mechanism Generator** — `MechanismSelector.tsx` already generates 8 formulas
- **Validation Score** — `LaunchScoreCard.tsx` already has traffic-light verdicts, pivots, price ceiling
- **Copy Quality Scoring** — `CopyScoreBadge.tsx` scores 0-100 with suggestions
- **Offer Stack** — `Step3Funnel.offerStack` already generates core + bonuses with value pricing
- **Affiliate Kit** — `Step4Marketing.affiliateKit` already has JV copy and swipes

These need enhancement, not rebuilding from scratch.

---

## Pass 1: Pricing Psychology + Objection Killer + Proof Stack (Revenue-Critical)

### 1A. Pricing Psychology Engine
- Create `src/components/wizard/PricingPsychologyCard.tsx` — shows in Step 1 after validation score
- Extend `generate-launch-score` to also output: `pricingRecommendation` (3 tiers with psychology reasoning), `paymentPlanSuggestion`, `anchoringCopy`, `scarcityCopy`, `riskReversalCopy`
- Display as a card with recommended price + copy snippets they can drop into sales page
- Auto-inject pricing psychology into `generate-launch-funnel` prompt

### 1B. Objection Handling Engine
- Create `src/components/wizard/ObjectionKiller.tsx` — collapsible section in Step 3
- Extend `generate-launch-funnel` to output `objections[]` array: each with `objection`, `reframe`, `proof`, `followUpQuestion`
- Render as an accordion with copy buttons per objection
- Auto-embed top objections into FAQ section of sales page and email sequences

### 1C. Enhanced Proof & Credibility Stack
- Create `src/components/wizard/ProofStackBuilder.tsx` — section in Step 2
- Extend `generate-launch-content` to output: `testimonialTemplates[]` (5 placeholder testimonials in Before→Product→Result format), `beforeAfterTable`, `credibilityBuilder` (for beginners), `earningsDisclaimer`, `quickWinsList[]`
- Add `proofStack` field to `Step2Content` type
- Render as tabbed card with copy buttons

---

## Pass 2: Content Depth + Structured Modules + Landing Page Optimizer

### 2A. Content Depth Audit
- Enhance `CopyScoreBadge` / `copyUtils.ts` with new dimensions: `actionableSteps` count, `exampleCount`, `theoryToTacticsRatio`, `specificityScore` (flag "many", "some", "various")
- Add "Expand This Section" button that calls AI to add examples, walkthroughs, troubleshooting
- Show content quality report card with A-F grades per dimension

### 2B. Structured Module Architecture
- Update `ChapterItem` type to include: `moduleGoal`, `hook`, `coreConcept`, `actionPlan: {step, action, why}[]`, `realExample`, `commonMistakes[]`, `actionStep`, `moduleSummary[]`
- Update `generate-launch-content` prompt to enforce this template per chapter
- Update `WizardStep2.tsx` to render each module section with icons

### 2C. Landing Page Optimizer (Sales Page Audit)
- Create `src/components/wizard/SalesPageAudit.tsx` — auto-runs after Step 3 generation
- Check 10 conversion elements: pattern interrupt, specific promises, social proof, clear CTA, objection handling, urgency/scarcity, risk reversal, readability, video placeholder, P.S. line
- Show score (e.g., "73% optimized") with missing elements listed
- "Optimize This Page" button re-calls AI with instructions to add missing elements

---

## Pass 3: Product Funnel Architect + Delivery Templates + Swipe Files

### 3A. Full Product Funnel Architect
- Create `src/components/wizard/FunnelArchitect.tsx` — new section after Step 3
- Generate complete stack: Main Product + OTO1 (templates/implementation) + OTO2 (community/accountability) + OTO3 (done-for-you) + Downsell (lite version)
- Each tier gets: name, concept, price point, sales copy snippet
- Extend `Step3Funnel` type with `funnelStack` field
- Update `generate-launch-funnel` to produce this as additional output

### 3B. Delivery Method Templates
- Create `src/components/wizard/DeliveryMethodPicker.tsx` — shows after Step 2
- 4 options: Evergreen Email Sequence, Membership Site, Video Course Outline, Hybrid Funnel Stack
- Based on selection, generate the implementation template (email sequence text, HTML membership page, video course module structure)
- New edge function section in `generate-launch-content`

### 3C. Smart Swipe File Generator
- Extend `generate-launch-marketing` to output: `emailSubjectLines[]` (20 variations), `fbAdHooks[]`, `youtubeThumbnailText[]`, `redditAngles[]`, `linkedinHooks[]`, `tiktokScripts[]` (short-form), `retargetingCopy[]`, `refundResponseTemplate`
- Extend `Step4Marketing` type with these fields
- Add new tabs in `WizardStep4.tsx` for each swipe category

---

## Pass 4: Competitive Positioning + Launch Sequence + Legal + Testimonial Collector

### 4A. Competitive Positioning Engine
- Create `src/components/wizard/CompetitivePositioning.tsx` — section in Step 1
- User inputs 3-5 competitor product URLs or descriptions
- Calls enhanced `generate-launch-score` or new edge function to analyze gaps and generate: unique positioning statement, comparison chart copy, angle variations (speed/price/beginner/results)
- Partially exists in "Steal This Launch" — integrate that data flow

### 4B. Webinar/Launch Sequence Generator
- Create `src/components/wizard/LaunchSequenceBuilder.tsx` — bonus section after Step 5
- Generate: webinar pitch script, 3-video pre-launch sequence, 5-email launch day sequence, post-launch follow-ups, re-engagement emails
- 30-day visual calendar with checkboxes
- Extends the existing 7-day pre-launch calendar concept from prior plan

### 4C. Legal Pages Generator
- Create `src/components/wizard/LegalPagesGenerator.tsx` — tab in Step 3
- Generate: Earnings Disclaimer, Income Disclaimer, Privacy Policy, Terms of Service, Refund Policy, DMCA Notice
- Pre-populated with product name and author details
- Copy HTML + Download PDF buttons per page

### 4D. Testimonial Collection System
- Create `src/components/wizard/TestimonialCollector.tsx` — section in Step 2
- Generate shareable testimonial collection form template (HTML they can host)
- Auto-generate 48-hour follow-up email prompts
- Render collected/placeholder testimonials into sales page quote blocks

---

## Database Changes
- No new tables needed — all new data fits into existing JSONB columns (`step1_product`, `step2_product_content`, `step3_funnel`, `step4_marketing`)

## Edge Function Changes
- `generate-launch-score` — add pricing psychology, competitive positioning outputs
- `generate-launch-content` — add proof stack, structured modules, delivery templates
- `generate-launch-funnel` — add objections, legal pages, funnel stack, JV page
- `generate-launch-marketing` — add expanded swipe files, launch sequence

## Type Changes
- Extend `Step2Content` with `proofStack`, structured `ChapterItem` fields
- Extend `Step3Funnel` with `objections[]`, `legalPages`, `funnelStack`, `jvPage`
- Extend `Step4Marketing` with expanded swipe file fields

---

## Implementation Priority
Pass 1 first (Pricing Psychology + Objections + Proof Stack) — these directly increase conversion of generated products. Then Pass 2 (Content Depth + Modules + Page Audit), Pass 3 (Funnel Architect + Delivery + Swipes), Pass 4 (Positioning + Launch Sequence + Legal + Testimonials).

Shall I proceed with Pass 1?

