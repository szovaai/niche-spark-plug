

# Micro Product Factory

A new standalone page at `/micro-factory` that lets users quickly create small, focused digital products (micro-offers) through a simple 4-step wizard -- no niche research required.

## How It Works (User Flow)

1. **Pick a Product Type** -- Choose from categories like E-book, Checklist, Habit Tracker, Challenge, Worksheet, or Swipe File
2. **Define Your Niche and Audience** -- Enter the topic, target audience, and the problem the product solves
3. **Customize Components** -- Configure product-specific details (e.g., number of chapters for an e-book, number of days for a challenge, sections for a checklist)
4. **Generate Everything** -- AI creates the full product content plus marketing assets (product description, sales copy, email sequence teaser, social media post) in one click

## Where It Lives

- New sidebar item: "Micro Factory" with a Zap icon, placed between "Empire Mode" and "Research"
- New Dashboard CTA card alongside the existing Empire Mode card
- New route: `/micro-factory`
- Saved products stored in a new `micro_products` database table

## Product Types Available

| Type | Configurable Components |
|------|------------------------|
| E-book / Mini Guide | Number of chapters (3-10), writing tone |
| Checklist | Number of items (10-50), category grouping toggle |
| Habit Tracker | Duration (7/14/21/30 days), habits per day (3-10) |
| Challenge | Number of days (3/5/7/14/21/30), daily task format |
| Worksheet | Number of sections (3-8), exercise style |
| Swipe File / Template Pack | Number of templates (5-20), format type |

## What AI Generates

For every product type, the output includes:

- **Product Content** -- The actual structured content (chapters, checklist items, daily tasks, etc.)
- **Product Title and Subtitle** -- Optimized for sales
- **Product Description** -- Ready for Gumroad/Etsy listing
- **3 Social Media Posts** -- Short promotional captions
- **Email Pitch** -- A short sales email for the product

---

## Technical Details

### Database

New table: `micro_products`
- `id`, `user_id`, `product_type`, `niche_topic`, `target_audience`, `problem_statement`
- `config` (JSONB) -- stores component choices (num chapters, days, etc.)
- `generated_content` (JSONB) -- AI output (product content + marketing)
- `product_title`, `product_subtitle`
- `status` (draft / complete)
- `created_at`, `updated_at`
- RLS: user can only CRUD their own rows

### Edge Function

One new edge function: `generate-micro-product`
- Accepts: product type, niche topic, audience, problem, config
- Uses `tieredAI` (standard complexity) and `cache` utilities
- Returns structured JSON with product content + marketing assets
- Prompt is tailored per product type (e.g., checklist prompt vs. challenge prompt)

### Frontend Components

- `src/pages/MicroFactory.tsx` -- Main wizard page with 4 steps
- `src/components/micro-factory/StepSelectType.tsx` -- Product type cards grid
- `src/components/micro-factory/StepDefineNiche.tsx` -- Niche/audience/problem form
- `src/components/micro-factory/StepCustomize.tsx` -- Dynamic component config based on selected type
- `src/components/micro-factory/StepResults.tsx` -- Generated content display with copy buttons and tabs (Content / Marketing / Social)

### Navigation Changes

- Add "Micro Factory" to `mainNavItems` in `DashboardSidebar.tsx`
- Add route `/micro-factory` in `App.tsx`
- Add CTA card on Dashboard between the Empire Mode card and the stats grid

