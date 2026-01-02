// Sales Page Section-Based Data Structure
// Matches the DigiStream Conversion Pattern + Buyer Traffic Blueprint

export interface SalesPagePromo {
  left: string;
  pills: string[];
  linkText?: string;
}

export interface SalesPageHero {
  eyebrow: string;
  headline: string;
  subhead: string;
  priceLine: string;
  trustLine: string;
}

export interface SalesPageStory {
  title: string;
  body: string;
}

export interface SalesPageBeforeAfter {
  title: string;
  beforeTitle: string;
  before: string[];
  afterTitle: string;
  after: string[];
}

export interface SalesPageStat {
  kicker: string;
  body: string;
}

export interface SalesPageStats {
  title: string;
  stats: SalesPageStat[];
  note?: string;
}

export interface SalesPageStep {
  title: string;
  body: string;
}

export interface SalesPageMechanism {
  title: string;
  intro?: string;
  steps: SalesPageStep[];
}

export interface SalesPageFirstHour {
  title: string;
  items: string[];
}

export interface SalesPageSignals {
  title: string;
  signals: string[];
  note?: string;
}

export interface SalesPageScript {
  label: string;
  text: string;
}

export interface SalesPageScripts {
  title: string;
  cards: SalesPageScript[];
  note?: string;
}

export interface SalesPageOfferItem {
  name: string;
  value: string;
  desc: string;
}

export interface SalesPageOfferStack {
  title: string;
  items: SalesPageOfferItem[];
  totalValue: string;
  todayPrice: string;
  bonus?: string;
}

export interface SalesPageProof {
  title: string;
  tiles: string[];
  note?: string;
}

export interface SalesPagePath {
  title: string;
  steps: SalesPageStep[];
}

export interface SalesPageFitFilter {
  title: string;
  yes: string[];
  no: string[];
}

export interface SalesPageGuarantee {
  title: string;
  body: string;
}

export interface SalesPageFAQItem {
  q: string;
  a: string;
}

export interface SalesPageFAQs {
  title: string;
  items: SalesPageFAQItem[];
  note?: string;
}

export interface SalesPageFinalCTA {
  title: string;
  price: string;
  trustLine: string;
}

export interface SalesPageFooter {
  legal: string;
}

// Complete Sales Page Data Structure
export interface SalesPageData {
  // Meta
  title: string;
  niche: string;
  price: number;
  targetAudience: string;
  checkoutUrl?: string;
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  
  // Section content
  promo: SalesPagePromo;
  hero: SalesPageHero;
  trustPills: string[];
  story: SalesPageStory;
  beforeAfter: SalesPageBeforeAfter;
  stats: SalesPageStats;
  mechanism: SalesPageMechanism;
  firstHour: SalesPageFirstHour;
  signals: SalesPageSignals;
  scripts: SalesPageScripts;
  offerStack: SalesPageOfferStack;
  proof: SalesPageProof;
  path: SalesPagePath;
  fitFilter: SalesPageFitFilter;
  guarantee: SalesPageGuarantee;
  faqs: SalesPageFAQs;
  finalCta: SalesPageFinalCTA;
  footer: SalesPageFooter;
}

// Section identifiers for individual editing
export type SalesPageSectionId = 
  | 'promo'
  | 'hero'
  | 'trustPills'
  | 'story'
  | 'beforeAfter'
  | 'stats'
  | 'mechanism'
  | 'firstHour'
  | 'signals'
  | 'scripts'
  | 'offerStack'
  | 'proof'
  | 'path'
  | 'fitFilter'
  | 'guarantee'
  | 'faqs'
  | 'finalCta'
  | 'footer';

export interface SalesPageSection {
  id: SalesPageSectionId;
  label: string;
  description: string;
  required: boolean;
}

export const SALES_PAGE_SECTIONS: SalesPageSection[] = [
  { id: 'promo', label: 'Promo Bar', description: 'Sticky announcement bar with category + launch note', required: false },
  { id: 'hero', label: 'Hero', description: 'Main headline, subhead, price, and primary CTA', required: true },
  { id: 'trustPills', label: 'Trust Pills', description: 'Quick trust indicators (no ads, beginner-friendly, etc.)', required: false },
  { id: 'story', label: 'Quick Story', description: 'Relatable origin story (2-3 paragraphs)', required: true },
  { id: 'beforeAfter', label: 'Before/After', description: 'Concrete contrast between old way and new way', required: true },
  { id: 'stats', label: 'Why It Works', description: 'Credibility stats and social proof context', required: false },
  { id: 'mechanism', label: 'How It Works', description: '4-step mechanism showing the system', required: true },
  { id: 'firstHour', label: 'First Hour', description: 'Quick-start checklist for immediate action', required: false },
  { id: 'signals', label: 'Buying Signals', description: 'Specific signals/patterns to look for', required: false },
  { id: 'scripts', label: 'Scripts', description: 'Copy-paste templates included', required: false },
  { id: 'offerStack', label: 'Offer Stack', description: 'What\'s included with value breakdown', required: true },
  { id: 'proof', label: 'Light Proof', description: 'Testimonials and small wins', required: false },
  { id: 'path', label: 'Implementation Path', description: '3-day quick-start roadmap', required: false },
  { id: 'fitFilter', label: 'Fit Filter', description: 'Who this is for / not for', required: true },
  { id: 'guarantee', label: 'Guarantee', description: 'Risk reversal and refund policy', required: true },
  { id: 'faqs', label: 'FAQs', description: 'Common questions and answers', required: true },
  { id: 'finalCta', label: 'Final CTA', description: 'Closing call-to-action', required: true },
  { id: 'footer', label: 'Footer', description: 'Copyright and legal links', required: true },
];

// Template presets
export type SalesPageTemplate = 'premium-dark' | 'saas-light' | 'checkout-focus';

export interface SalesPageTemplateConfig {
  id: SalesPageTemplate;
  label: string;
  description: string;
  sections: SalesPageSectionId[];
}

export const SALES_PAGE_TEMPLATES: SalesPageTemplateConfig[] = [
  {
    id: 'premium-dark',
    label: 'Premium Dark',
    description: 'Full 18-section WarriorPlus-style page',
    sections: ['promo', 'hero', 'trustPills', 'story', 'beforeAfter', 'stats', 'mechanism', 'firstHour', 'signals', 'scripts', 'offerStack', 'proof', 'path', 'fitFilter', 'guarantee', 'faqs', 'finalCta', 'footer'],
  },
  {
    id: 'saas-light',
    label: 'SaaS Light',
    description: 'Clean, minimal sections',
    sections: ['hero', 'story', 'mechanism', 'offerStack', 'fitFilter', 'guarantee', 'faqs', 'finalCta', 'footer'],
  },
  {
    id: 'checkout-focus',
    label: 'Checkout Focus',
    description: 'Hero + Offer + CTA only',
    sections: ['hero', 'offerStack', 'guarantee', 'finalCta', 'footer'],
  },
];
