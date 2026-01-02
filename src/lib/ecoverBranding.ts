// Branding extraction types for eCover generation

export interface ToolkitBranding {
  // Core identity
  title: string;
  subtitle?: string;
  niche: string;
  targetAudience?: string;
  
  // Voice & positioning
  thesis?: string;
  writingStyle?: 'conversational' | 'professional' | 'storytelling' | 'step-by-step';
  
  // Derived visual direction (AI-inferred)
  brandPersonality?: string;
  colorMood?: string;
  visualStyle?: string;
}

// Niche categories for visual mapping
export type NicheCategory = 
  | 'finance'
  | 'wellness'
  | 'tech'
  | 'marketing'
  | 'coaching'
  | 'creative'
  | 'business'
  | 'lifestyle'
  | 'education'
  | 'default';

// Niche keywords for automatic detection
const NICHE_KEYWORDS: Record<NicheCategory, string[]> = {
  finance: ['money', 'finance', 'invest', 'crypto', 'trading', 'wealth', 'income', 'passive', 'profit', 'revenue', 'cash'],
  wellness: ['health', 'wellness', 'fitness', 'yoga', 'meditation', 'mental', 'self-care', 'healing', 'nutrition', 'diet'],
  tech: ['tech', 'software', 'saas', 'app', 'coding', 'developer', 'ai', 'automation', 'digital'],
  marketing: ['marketing', 'affiliate', 'traffic', 'sales', 'funnel', 'ads', 'social media', 'content', 'seo', 'leads'],
  coaching: ['coaching', 'mentor', 'personal development', 'mindset', 'success', 'motivation', 'leadership', 'transformation'],
  creative: ['art', 'design', 'creative', 'photography', 'writing', 'music', 'crafts', 'diy'],
  business: ['business', 'entrepreneur', 'startup', 'agency', 'freelance', 'consulting', 'ecommerce', 'amazon'],
  lifestyle: ['lifestyle', 'travel', 'relationship', 'parenting', 'home', 'fashion', 'beauty'],
  education: ['course', 'learning', 'training', 'tutorial', 'guide', 'masterclass', 'certification'],
  default: []
};

/**
 * Detect the niche category from toolkit data
 */
export function detectNicheCategory(niche: string, title?: string): NicheCategory {
  const searchText = `${niche} ${title || ''}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(NICHE_KEYWORDS)) {
    if (category === 'default') continue;
    
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        return category as NicheCategory;
      }
    }
  }
  
  return 'default';
}

/**
 * Extract branding data from toolkit
 */
export function extractBranding(toolkit: {
  title: string;
  subtitle?: string;
  niche: string;
  target_audience?: string;
  thesis?: string;
  writing_style?: string;
}): ToolkitBranding {
  return {
    title: toolkit.title,
    subtitle: toolkit.subtitle || undefined,
    niche: toolkit.niche,
    targetAudience: toolkit.target_audience || undefined,
    thesis: toolkit.thesis || undefined,
    writingStyle: toolkit.writing_style as ToolkitBranding['writingStyle'] || undefined
  };
}

/**
 * Get brand personality description from writing style
 */
export function getBrandPersonality(writingStyle?: string): string {
  switch (writingStyle) {
    case 'conversational':
      return 'Friendly, approachable, and relatable';
    case 'professional':
      return 'Authoritative, trustworthy, and polished';
    case 'storytelling':
      return 'Engaging, emotional, and narrative-driven';
    case 'step-by-step':
      return 'Clear, actionable, and results-focused';
    default:
      return 'Professional and results-oriented';
  }
}
