

# LaunchStack AI — Profit Radar 2.0 MVP Upgrade

Pivot from generic "niche finder" to **"Discover Problems People Pay To Solve"** — a buyer-pain intelligence engine that flows: Pain → Score → Product → Funnel → Shopify → Ads. Existing UI, sidebar shell, dark/neon aesthetic and all current functionality remain intact. New features are layered on top.

---

## 1. Sidebar Restructure (keep current component, swap items)

Update `DashboardSidebar.tsx` groups:

- **Core**: Dashboard, Profit Radar AI *(renamed)*, Saved Projects *(new)*
- **Build**: Product Builder, Funnel Builder, Shopify Launch *(new)*, Ad Lab *(new)*
- **Intelligence**: Clone Competitor *(promoted)*, Winning Launch Modeler, Profit Map, Launch Simulation
- **System**: Launch Templates, Settings

All existing routes stay reachable; nothing deleted.

---

## 2. Profit Radar AI (rebuild of `/opportunities`)

New hero: **"Discover Problems People Pay To Solve"** + subhead "Find real buyer demand, score winning opportunities, generate digital products, launch stores, and scale with ads."

**Search bar** with example pills: weight loss, dog anxiety, credit repair, menopause, side hustle, sleep, confidence.

**Filter pill tabs** (replaces Select dropdowns): Buyer Problems 🔥 · Paid Ad Ready · Shopify Winners · Etsy Trends · Printables · Evergreen · Fast Launch.

**Opportunity Cards** (keep existing card grid styling, new fields):
- Title (e.g. "Menopause Belly Fat Reset")
- **Score badge** /100 with color tier (90+ green, 75–89 blue, 60–74 yellow, else red)
- Mini metrics row: Demand · Competition · Ad Potential · Emotion · Upsell
- Platform badges: Shopify / Gumroad / Etsy / WP
- Buttons: **View Data** · **Build Product** · **Clone Funnel**

**Score Engine** (computed in edge function, weighted /100): Demand 25 + Pain 20 + Competition Ease 15 + Emotion 15 + Ad Potential 15 + Upsell 10.

**View Data Modal**: Demand snapshot, Pain analysis, 5 ad hooks, suggested price ($17/$27/$37/$47), recommended platform, upsell ideas.

**Right rail "Today's Buyer Goldmines"** — replaces Today's Winners with the 8 top-scoring pains of the day (cached daily via existing `ai_cache`).

---

## 3. Build Product Flow (extend wizard)

`Build Product` button on a radar card deep-links to `/wizard?opportunity={id}` and pre-fills: product name, niche, target buyer, problem solved, suggested price. Adds a multi-asset checkbox panel in WizardStep2: Main Guide / Checklist / Cheat Sheet / Workbook / Bonus PDF / Swipe File / Email Pack / Video Script / Mini Course Outline. Existing generators are reused; new types map to existing prompt slots.

---

## 4. New Pages (built on existing layout primitives)

- **`/shopify-launch`** — Shopify Launch Engine: generates product description, hero headline, benefit bullets, FAQ, mock reviews, upsell, order bump, urgency copy, thank-you offer. Buttons: **Copy Assets**, **Export to Shopify (.csv)**. No live Shopify API yet — export-only MVP.
- **`/ad-lab`** — Paid Ads Creative Lab: TikTok (10 hooks, 5 UGC scripts, 5 CTAs), Facebook (5 direct + 5 curiosity + 5 story), Pinterest (10 pin headlines), Google (10 search headlines). Tabbed UI, copy-all per block.
- **`/clone-competitor`** — promoted to top-level. Paste URL (Etsy/Gumroad/Shopify/sales page) → Product angle, funnel breakdown, offer stack, "better version" suggestions, rebuild score, **Clone & Improve** button (deep-links into wizard pre-filled). Reuses existing `clone-funnel` + `analyze-competitor` edge functions.
- **`/saved-projects`** — list of user launches with statuses Idea / Building / Launching / Scaling. Reads from `launch_projects` + new status field.

---

## 5. Dashboard Upgrade

Replace 4 stat cards with 6: Opportunities Scanned · Products Built · Funnels Created · Stores Launched · Ads Generated · Revenue Potential. Hero CTA copy updated to new positioning. Today's Buyer Goldmines widget added to right column.

---

## 6. Edge Functions

- **`opportunity-radar`** (rewrite existing): accepts `{ keyword, mode }` (mode = one of the 7 tabs). Returns 6–8 opportunities with the new 6-axis score, hooks, price, platform, upsell. Simulated multi-source signal blend (Google autocomplete / Reddit / Quora / TikTok / Etsy / Pinterest) via prompt engineering. Caches per `keyword+mode` daily in `ai_cache`.
- **`generate-shopify-assets`** (new): produces all Shopify store copy blocks.
- **`generate-paid-ads`** (new): produces the full TikTok/FB/Pinterest/Google ad pack.
- **`buyer-goldmines-daily`** (new): produces the 8 daily top-pain rankings, cached per-day.

All use existing `tieredAI` + `ai_cache` patterns, JWT auth via `validateAuth`, CORS shared.

---

## 7. Database Migrations

Two new tables, plus one column add. RLS on all.

```sql
-- opportunities (cached AI-generated buyer pains)
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  mode text not null default 'buyer_problems',
  title text not null,
  niche text,
  score int not null,
  demand int, pain int, competition int,
  emotion int, ad_potential int, upsell int,
  hooks jsonb default '[]',
  suggested_price numeric,
  platform text,
  payload jsonb default '{}',
  created_at timestamptz default now()
);
alter table public.opportunities enable row level security;
create policy "anyone reads opportunities" on public.opportunities for select using (true);

-- saved_opportunities (user bookmarks → projects bridge)
create table public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  status text not null default 'idea',  -- idea/building/launching/scaling
  project_id uuid references public.launch_projects(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.saved_opportunities enable row level security;
create policy "users manage own" on public.saved_opportunities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- launch_projects: lifecycle status
alter table public.launch_projects
  add column if not exists lifecycle_status text default 'idea';
```

(`projects`, `funnels`, `products`, `ads` from your spec map to existing `launch_projects` JSONB columns — no duplication needed.)

---

## 8. Out of Scope (MVP)

- Live Shopify API publishing (export-CSV only)
- Real trend data APIs (simulated AI blend now; swap-in slot reserved)
- Stripe paywall for the new $27/$47 tiers (already a separately tracked todo)

---

## Files

**New**: `src/pages/ProfitRadar.tsx` (rewrite of OpportunityRadar.tsx) · `src/pages/ShopifyLaunch.tsx` · `src/pages/AdLab.tsx` · `src/pages/CloneCompetitor.tsx` · `src/pages/SavedProjects.tsx` · `src/components/radar/OpportunityCard.tsx` · `src/components/radar/ViewDataModal.tsx` · `src/components/radar/BuyerGoldmines.tsx` · `supabase/functions/generate-shopify-assets/index.ts` · `supabase/functions/generate-paid-ads/index.ts` · `supabase/functions/buyer-goldmines-daily/index.ts` · 1 migration.

**Edited**: `src/App.tsx` (5 new routes) · `src/components/DashboardSidebar.tsx` (regrouped) · `src/pages/Dashboard.tsx` (6-stat grid + Goldmines + new copy) · `supabase/functions/opportunity-radar/index.ts` (new score engine + modes) · `src/components/wizard/WizardStep2.tsx` (asset checkbox panel + opportunity prefill).

