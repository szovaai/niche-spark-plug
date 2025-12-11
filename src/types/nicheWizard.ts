export interface NicheWizardInput {
  skills: string[];
  interests: string[];
  goals: string[];
  timeAvailable: 'minimal' | 'moderate' | 'dedicated';
  budget: 'free' | 'low' | 'medium';
  experience: 'beginner' | 'intermediate' | 'advanced';
}

export interface NicheRecommendation {
  nicheName: string;
  nicheId: string;
  matchScore: number;
  whyItFits: string;
  quickStart: string[];
  potentialEarnings: string;
  timeToFirstSale: string;
  skillsMatch: string[];
  interestsMatch: string[];
}

export interface NicheWizardOutput {
  topRecommendations: NicheRecommendation[];
  personalizedInsights: string[];
  nextSteps: string[];
  warningsOrConsiderations: string[];
}

export const SKILL_OPTIONS = [
  { id: 'design', label: 'Design/Visual', icon: '🎨' },
  { id: 'writing', label: 'Writing/Content', icon: '✍️' },
  { id: 'spreadsheets', label: 'Spreadsheets/Data', icon: '📊' },
  { id: 'organization', label: 'Organization/Planning', icon: '📋' },
  { id: 'teaching', label: 'Teaching/Explaining', icon: '📚' },
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'photography', label: 'Photography', icon: '📷' },
  { id: 'crafts', label: 'Crafts/DIY', icon: '✂️' },
];

export const INTEREST_OPTIONS = [
  { id: 'wellness', label: 'Health & Wellness', icon: '🧘' },
  { id: 'productivity', label: 'Productivity', icon: '⚡' },
  { id: 'business', label: 'Business/Finance', icon: '💼' },
  { id: 'education', label: 'Education/Kids', icon: '🎓' },
  { id: 'lifestyle', label: 'Home/Lifestyle', icon: '🏠' },
  { id: 'creativity', label: 'Art/Creativity', icon: '🎭' },
  { id: 'relationships', label: 'Relationships', icon: '💕' },
  { id: 'selfcare', label: 'Self-Care', icon: '🌸' },
];

export const GOAL_OPTIONS = [
  { id: 'side_income', label: 'Side Income ($500-1K/mo)', icon: '💰' },
  { id: 'full_income', label: 'Full-Time Income ($3K+/mo)', icon: '🚀' },
  { id: 'passive', label: 'Passive Income Stream', icon: '🔄' },
  { id: 'portfolio', label: 'Build a Portfolio', icon: '📁' },
  { id: 'learn', label: 'Learn & Experiment', icon: '🧪' },
  { id: 'brand', label: 'Build a Brand', icon: '⭐' },
];
