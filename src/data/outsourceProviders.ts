import { OutsourceProvider, OutsourceTask } from "@/types/launch";

export const OUTSOURCE_PROVIDERS: OutsourceProvider[] = [
  {
    id: 'funnel-specialist',
    title: 'Funnel Specialist',
    icon: 'Layers',
    bestFor: 'Zero tech + email included (Systeme.io)',
    searchTerms: ['Systeme.io funnel setup', 'Systeme.io sales page'],
    lookFor: ['100+ completed gigs', 'Mentions Stripe/PayPal', 'Funnel + checkout screenshots'],
    typicalCost: '$30–$60',
    platforms: ['systeme', 'custom'],
  },
  {
    id: 'static-website',
    title: 'Static Website Specialist',
    icon: 'Globe',
    bestFor: 'Using HTML sales page export',
    searchTerms: ['Netlify website deploy', 'HTML website upload'],
    lookFor: ['Mentions Netlify or Vercel', 'Experience with domains', 'Fast turnaround (24–48 hrs)'],
    typicalCost: '$25–$50',
    platforms: ['custom'],
  },
  {
    id: 'gumroad-expert',
    title: 'Gumroad Expert',
    icon: 'ShoppingBag',
    bestFor: 'Fastest launch possible',
    searchTerms: ['Gumroad product setup', 'Gumroad sales page'],
    lookFor: ['Gumroad screenshots', 'Digital product experience', 'Bonus setup included'],
    typicalCost: '$25–$40',
    platforms: ['gumroad'],
  },
  {
    id: 'payment-integration',
    title: 'Payment Specialist',
    icon: 'CreditCard',
    bestFor: 'Have hosting, need checkout',
    searchTerms: ['Stripe payment button', 'PayPal checkout integration'],
    lookFor: ['Clear examples', 'Payment testing included', 'Clean instructions after delivery'],
    typicalCost: '$20–$40',
    platforms: ['warriorplus', 'digistore24', 'custom'],
  },
  {
    id: 'launch-assistant',
    title: 'Launch Assistant / VA',
    icon: 'Rocket',
    bestFor: 'Everything handled end-to-end',
    searchTerms: ['launch assistant', 'digital product launch setup'],
    lookFor: ['Multiple platform experience', 'Clear communication', 'Willingness to follow instructions'],
    typicalCost: '$50–$100',
    platforms: ['gumroad', 'warriorplus', 'digistore24', 'systeme', 'custom'],
  },
];

export const OUTSOURCE_TASKS: OutsourceTask[] = [
  { id: 'upload-files', task: 'Upload your sales page files', included: true },
  { id: 'connect-payment', task: 'Connect your payment button (Gumroad/Stripe/PayPal)', included: true },
  { id: 'setup-hosting', task: 'Set up hosting (Netlify/Systeme.io/similar)', included: true },
  { id: 'connect-domain', task: 'Connect your domain', included: true },
  { id: 'test-checkout', task: 'Test checkout + download', included: true },
  { id: 'deliver-link', task: 'Hand you the live link', included: true },
];

export const DO_NOT_OUTSOURCE = [
  'Writing copy (already done in DigiStream)',
  'Creating products (already done)',
  'Marketing strategy',
  'Ads',
];

export const FIVERR_MESSAGE_TEMPLATE = `Hi! I have a digital product already created.

I need help with:
- Uploading my sales page files
- Connecting my payment button
- Setting up hosting (Netlify or Systeme.io)
- Connecting my domain
- Testing checkout + download

All content, files, and copy are ready.
No design or writing needed.

Please confirm:
1) Platforms you support
2) Turnaround time
3) What access you'll need

Thanks!`;

export function getFiverrSearchUrl(searchTerms: string[]): string {
  const query = encodeURIComponent(searchTerms[0]);
  return `https://www.fiverr.com/search/gigs?query=${query}`;
}

export function getRecommendedProviders(platform: string | null): OutsourceProvider[] {
  if (!platform) return OUTSOURCE_PROVIDERS;
  return OUTSOURCE_PROVIDERS.filter(p => 
    p.platforms.includes(platform as any) || p.id === 'launch-assistant'
  );
}
