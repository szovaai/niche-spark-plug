export type SequenceFramework = 'daily-curiosity' | 'momentum-launch';

export type SequencePurpose = 'product-launch' | 'nurture-list' | 'affiliate-promo' | 'webinar-promo' | 'daily-content';

export type EmailVolume = 5 | 10 | 20 | 30;

export type HookStyle = 'curiosity' | 'confession' | 'discovery' | 'story' | 'contrarian' | 'observation';

export const FRAMEWORK_CONFIG: Record<SequenceFramework, { label: string; description: string; icon: string }> = {
  'daily-curiosity': {
    label: 'Daily Curiosity Sequence',
    description: 'Story-driven emails that build trust and curiosity daily. Subtle selling through relatable moments.',
    icon: '📬',
  },
  'momentum-launch': {
    label: 'Momentum Launch Sequence',
    description: 'Narrative arc that builds excitement before a product launch. Setup → Conflict → Discovery → Offer.',
    icon: '🚀',
  },
};

export const PURPOSE_CONFIG: Record<SequencePurpose, { label: string; color: string }> = {
  'product-launch': { label: 'Product Launch', color: 'bg-primary' },
  'nurture-list': { label: 'List Nurture', color: 'bg-emerald-500' },
  'affiliate-promo': { label: 'Affiliate Promo', color: 'bg-amber-500' },
  'webinar-promo': { label: 'Webinar Promo', color: 'bg-violet-500' },
  'daily-content': { label: 'Daily Content', color: 'bg-blue-500' },
};

export const HOOK_STYLES: Record<HookStyle, { label: string; example: string }> = {
  curiosity: { label: 'Curiosity', example: '"Something weird happened when I tested this…"' },
  confession: { label: 'Confession', example: '"I made a huge mistake when I first tried this."' },
  discovery: { label: 'Discovery', example: '"I just realized why most people fail at this."' },
  story: { label: 'Story', example: '"This reminds me of something that happened years ago…"' },
  contrarian: { label: 'Contrarian', example: '"Everyone says you need funnels… but that\'s not true."' },
  observation: { label: 'Observation', example: '"I noticed something strange about every successful launch…"' },
};

export type EmailFocusType =
  | 'origin-story'
  | 'curiosity-loop'
  | 'value-lesson'
  | 'proof-snapshot'
  | 'humor-relatability'
  | 'objection-time'
  | 'objection-money'
  | 'proof-stack'
  | 'value-bomb'
  | 'transition'
  | 'offer-reveal'
  | 'urgency'
  | 'objection-fit'
  | 'final-call'
  | 'welcome-quick-win'
  | 'setup'
  | 'conflict'
  | 'discovery'
  | 'solution'
  | 'soft-sell'
  | 'story-hook'
  | 'confession'
  | 'contrarian';

export const EMAIL_FOCUS_CONFIG: Record<string, { label: string; color: string; purpose: string }> = {
  'origin-story': { label: 'Origin Story', color: 'bg-blue-500', purpose: 'Why this offer exists and connects to the reader\'s pain' },
  'curiosity-loop': { label: 'Curiosity Loop', color: 'bg-purple-500', purpose: 'Tease the unique mechanism or unexpected discovery' },
  'value-lesson': { label: 'Value Lesson', color: 'bg-green-500', purpose: 'Deliver one "aha" that reframes the reader\'s situation' },
  'proof-snapshot': { label: 'Proof Snapshot', color: 'bg-amber-500', purpose: 'Share a small win or customer story' },
  'humor-relatability': { label: 'Humor/Relatability', color: 'bg-pink-500', purpose: 'Add personality and human connection' },
  'objection-time': { label: 'Objection: Time', color: 'bg-orange-500', purpose: 'Address "I don\'t have time"' },
  'objection-money': { label: 'Objection: Money', color: 'bg-orange-500', purpose: 'Address "I don\'t have money / I\'ve tried before"' },
  'proof-stack': { label: 'Proof Stack', color: 'bg-amber-600', purpose: 'Combine multiple case studies or testimonials' },
  'value-bomb': { label: 'Value Bomb', color: 'bg-emerald-500', purpose: 'Teach another mini concept or shortcut' },
  'transition': { label: 'Transition', color: 'bg-indigo-500', purpose: 'Explain "why I made this for you"' },
  'offer-reveal': { label: 'Offer Reveal', color: 'bg-violet-500', purpose: 'Present the offer stack and full value' },
  'urgency': { label: 'Urgency', color: 'bg-red-500', purpose: 'Introduce early deadline or expiring bonus' },
  'objection-fit': { label: 'Objection: Fit', color: 'bg-orange-500', purpose: '"Does this really work for me?" story' },
  'final-call': { label: 'Final Call', color: 'bg-red-600', purpose: 'Emotional close and final deadline reminder' },
  'welcome-quick-win': { label: 'Welcome + Quick Win', color: 'bg-green-600', purpose: 'Get them moving immediately' },
  'setup': { label: 'The Setup', color: 'bg-slate-500', purpose: 'Introduce the story and hook attention' },
  'conflict': { label: 'The Conflict', color: 'bg-red-400', purpose: 'Explain the problem or struggle' },
  'discovery': { label: 'The Discovery', color: 'bg-yellow-500', purpose: 'Reveal the breakthrough moment' },
  'solution': { label: 'The Solution', color: 'bg-emerald-600', purpose: 'Introduce the system' },
  'soft-sell': { label: 'Soft Sell', color: 'bg-sky-500', purpose: 'Subtle bridge to the offer' },
  'story-hook': { label: 'Story Hook', color: 'bg-indigo-400', purpose: 'Open with a relatable story' },
  'confession': { label: 'Confession', color: 'bg-rose-400', purpose: 'Admit a mistake to build trust' },
  'contrarian': { label: 'Contrarian', color: 'bg-fuchsia-500', purpose: 'Challenge conventional wisdom' },
};

export interface EmailDay {
  day: number;
  focus: string;
  subject: string;
  previewText: string;
  openingHook: string;
  storyAnalogy: string;
  lessonTwist: string;
  offerBridge: string;
  cta: string;
  ps?: string;
  hookStyle?: HookStyle;
  spamScore?: number;
}

export interface EmailSequence14Day {
  offerName: string;
  targetAudience: string;
  price: number;
  emails: EmailDay[];
  sequenceTheme: string;
  narrativeArc: string;
  framework?: SequenceFramework;
  purpose?: SequencePurpose;
  storyAngles?: string[];
}

export interface EmailSequenceRequest {
  offerName: string;
  targetAudience: string;
  keyBenefits: string[];
  uniqueMechanism?: string;
  price: number;
  salesPageUrl?: string;
  framework: SequenceFramework;
  purpose: SequencePurpose;
  emailCount: EmailVolume;
}
