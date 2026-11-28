// Single source of truth for the consolidated departments (Post-Audit spec, phases 3–7).
// Each department reuses existing tools as internal workflows; legacy routes stay intact.
export type DeptTool = { title: string; url: string; blurb: string; tier?: "core" | "advanced" };
export type DeptEntry = { title: string; blurb: string; url: string };
export type Department = {
  id: string; path: string; name: string; tagline: string;
  entries?: DeptEntry[]; tools: DeptTool[]; note?: string;
};

export const DEPARTMENTS: Department[] = [
  {
    id: "opportunities", path: "/discover-intel", name: "Opportunity Intelligence",
    tagline: "Find a market worth building for — with real evidence, not guesses.",
    entries: [
      { title: "I have an interest or passion", blurb: "Turn what you love into product ideas, then check real demand.", url: "/tools/research-agent?mode=passion" },
      { title: "I already have a product idea", blurb: "Pressure-test your idea against search, questions and competitors.", url: "/tools/research-agent?mode=idea" },
      { title: "Find me a promising market", blurb: "Browse scored niches and pick one to research deeper.", url: "/tools/opportunities" },
    ],
    tools: [
      { title: "Research Agent", url: "/tools/research-agent", blurb: "Guided conversation that researches a market with you.", tier: "core" },
      { title: "Profit Radar", url: "/tools/opportunities", blurb: "Scored niche opportunities.", tier: "core" },
      { title: "Niche Discover", url: "/tools/discover", blurb: "Browse pre-made niches by category.", tier: "core" },
      { title: "Market Research", url: "/tools/research", blurb: "Keyword, trend and competitor research.", tier: "advanced" },
      { title: "Opportunity Radar (classic)", url: "/tools/opportunities-legacy", blurb: "Demand vs. competition chart.", tier: "advanced" },
      { title: "Winning Launches", url: "/tools/steal", blurb: "Study what's already selling.", tier: "advanced" },
    ],
    note: "Numbers shown come from the research sources each tool uses. Where a source isn't available, the tool says so instead of estimating.",
  },
  {
    id: "studio", path: "/studio", name: "Product Studio",
    tagline: "One place to create eBooks, guides, workbooks, planners, checklists and bundles.",
    entries: [
      { title: "Full product (eBook / guide / workbook)", blurb: "Chapter-by-chapter long-form product with cover and PDF export.", url: "/tools/create" },
      { title: "Quick micro product", blurb: "Checklists, trackers, swipe files and printables in minutes.", url: "/tools/micro-factory" },
      { title: "Product + launch in one flow", blurb: "Product, funnel and marketing built step by step.", url: "/tools/wizard" },
    ],
    tools: [
      { title: "Toolkit Builder", url: "/tools/toolkit/builder", blurb: "Bundles and multi-part toolkits.", tier: "core" },
      { title: "My Products", url: "/tools/my-toolkits", blurb: "Everything you've created.", tier: "core" },
      { title: "Templates", url: "/tools/templates-marketplace", blurb: "Start from a ready-made blueprint.", tier: "core" },
      { title: "Empire Mode", url: "/tools/empire", blurb: "Faceless brand + product pack, 6 steps.", tier: "advanced" },
      { title: "Launch Templates", url: "/tools/launch-templates", blurb: "Lead magnets and marketplace formats.", tier: "advanced" },
    ],
  },
  {
    id: "funnels", path: "/profit-studio", name: "Funnel & Profit Studio",
    tagline: "Plan your funnel — lead magnet, front-end, bump, upsell, downsell, follow-up — and see what it could earn.",
    tools: [
      { title: "Funnel Builder", url: "/tools/funnels", blurb: "Build the pages of your funnel.", tier: "core" },
      { title: "Profit Map", url: "/tools/profit-map", blurb: "Traffic-to-revenue scenarios.", tier: "core" },
      { title: "Launch Simulation", url: "/tools/funnel-simulation", blurb: "Visual funnel simulator.", tier: "core" },
      { title: "Affiliate Predictor", url: "/tools/affiliate-predictor", blurb: "Scenario for affiliate partners.", tier: "advanced" },
      { title: "Traffic Planner", url: "/tools/traffic-planner", blurb: "Where your visitors will come from.", tier: "advanced" },
    ],
    note: "Everything here is a simulation based on the assumptions you enter. Real results appear only in Analytics once sales data is connected.",
  },
  {
    id: "copy", path: "/copy-studio", name: "Sales Copy Intelligence",
    tagline: "Headlines, sales pages, emails, ads and scripts — all written from one profile of your business.",
    tools: [
      { title: "Sales Copy Engine", url: "/tools/sales-copy", blurb: "Full sales letters and landing pages (AIDA, PAS, BAB).", tier: "core" },
      { title: "Email Engine", url: "/tools/email-engine", blurb: "Launch and follow-up sequences.", tier: "core" },
      { title: "Ad Lab", url: "/tools/ad-lab", blurb: "TikTok, Facebook, Pinterest and Google ads.", tier: "core" },
      { title: "Social Engine", url: "/tools/social-engine", blurb: "Social posts and video scripts.", tier: "advanced" },
      { title: "Clone Competitor", url: "/tools/clone-competitor", blurb: "Learn from a competitor's structure.", tier: "advanced" },
    ],
    note: "Copy scores are drafting aids only. Real conversion rates come from your analytics. No made-up testimonials, scarcity or results.",
  },
];

export const DEPT_BY_ID = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d])) as Record<string, Department>;
