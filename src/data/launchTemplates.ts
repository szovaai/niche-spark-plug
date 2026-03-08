export interface LaunchTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  niche: string;
  targetAudience: string;
  productType: string;
  topic: string;
  price: number;
  funnelStructure: { tier: string; price: string; description: string }[];
  exampleProduct: string;
  exampleBonuses: string[];
}

export const LAUNCH_TEMPLATES: LaunchTemplate[] = [
  {
    id: "warriorplus-launch",
    name: "WarriorPlus Launch",
    description: "High-converting funnel optimized for the WarriorPlus marketplace. Bold claims, affiliate-friendly, fast-action pricing.",
    icon: "🎯",
    category: "Marketplace",
    niche: "Make Money Online",
    targetAudience: "Aspiring online entrepreneurs who want a proven shortcut to their first sale",
    productType: "ebook",
    topic: "How to generate your first $500 online using AI tools and simple digital products",
    price: 17,
    funnelStructure: [
      { tier: "Front End", price: "$17", description: "Core ebook + templates" },
      { tier: "Order Bump", price: "$27", description: "Done-for-you prompt pack" },
      { tier: "Upsell 1", price: "$67", description: "Implementation templates + video training" },
      { tier: "Upsell 2", price: "$97", description: "Done-for-you client acquisition system" },
    ],
    exampleProduct: "The $500 AI Client Formula",
    exampleBonuses: ["AI Prompt Vault ($197 value)", "Client Outreach Templates ($97 value)", "7-Day Quick Start Checklist ($47 value)"],
  },
  {
    id: "lead-magnet-funnel",
    name: "Lead Magnet Funnel",
    description: "Build your email list with a free lead magnet, then convert with a low-ticket tripwire offer.",
    icon: "📧",
    category: "List Building",
    niche: "Digital Marketing",
    targetAudience: "Small business owners and solopreneurs who want more leads without paid ads",
    productType: "checklist",
    topic: "5 proven lead generation strategies that work without paid advertising",
    price: 7,
    funnelStructure: [
      { tier: "Lead Magnet", price: "FREE", description: "Checklist or cheat sheet" },
      { tier: "Tripwire", price: "$7", description: "Expanded guide + templates" },
      { tier: "Core Offer", price: "$27", description: "Full training + community access" },
      { tier: "Upsell", price: "$47", description: "Done-for-you implementation" },
    ],
    exampleProduct: "The Lead Magnet Machine",
    exampleBonuses: ["Social Media Swipe File ($67 value)", "Email Template Pack ($47 value)", "Content Calendar ($27 value)"],
  },
  {
    id: "tripwire-funnel",
    name: "$17 Tripwire Funnel",
    description: "Classic info product funnel — low-ticket front end with ascending offers. Perfect for building a buyer list.",
    icon: "💰",
    category: "Info Product",
    niche: "Productivity",
    targetAudience: "Busy professionals who want to achieve more in less time using proven systems",
    productType: "templates",
    topic: "The ultimate productivity system for getting 10x more done without burnout",
    price: 17,
    funnelStructure: [
      { tier: "Front End", price: "$17", description: "Templates + quick-start guide" },
      { tier: "Order Bump", price: "$17", description: "Audio version + bonus templates" },
      { tier: "Upsell", price: "$47", description: "Full course + advanced strategies" },
      { tier: "Downsell", price: "$27", description: "Lite version of the upsell" },
    ],
    exampleProduct: "The 10X Productivity Blueprint",
    exampleBonuses: ["Morning Routine Planner ($37 value)", "Focus Timer App Guide ($27 value)", "Weekly Review Template ($17 value)"],
  },
  {
    id: "coaching-funnel",
    name: "Coaching Funnel",
    description: "Higher-ticket funnel for coaches and consultants. Lead with value, convert on calls.",
    icon: "🎓",
    category: "High Ticket",
    niche: "Business Coaching",
    targetAudience: "Coaches and consultants who want to attract premium clients without cold outreach",
    productType: "course",
    topic: "How to build a 6-figure coaching business using a simple content-to-client pipeline",
    price: 47,
    funnelStructure: [
      { tier: "Lead Magnet", price: "FREE", description: "Video training + workbook" },
      { tier: "Low Ticket", price: "$47", description: "Self-study course" },
      { tier: "Mid Ticket", price: "$297", description: "Group coaching program" },
      { tier: "High Ticket", price: "$997+", description: "1-on-1 coaching (application)" },
    ],
    exampleProduct: "The Client Attraction Academy",
    exampleBonuses: ["Coaching Scripts Pack ($197 value)", "Client Onboarding Templates ($97 value)", "Pricing Strategy Guide ($67 value)"],
  },
];
