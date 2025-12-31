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
  | 'final-call';

export const EMAIL_FOCUS_CONFIG: Record<EmailFocusType, { label: string; color: string; purpose: string }> = {
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
};

export interface EmailDay {
  day: number;
  focus: EmailFocusType;
  subject: string;
  previewText: string;
  openingHook: string;
  storyAnalogy: string;
  lessonTwist: string;
  offerBridge: string;
  cta: string;
  ps?: string;
}

export interface EmailSequence14Day {
  offerName: string;
  targetAudience: string;
  price: number;
  emails: EmailDay[];
  sequenceTheme: string;
  narrativeArc: string;
}

export interface EmailSequenceRequest {
  offerName: string;
  targetAudience: string;
  keyBenefits: string[];
  uniqueMechanism?: string;
  price: number;
  salesPageUrl?: string;
}
