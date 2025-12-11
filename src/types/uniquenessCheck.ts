export interface UniquenessCheckInput {
  content: string;
  contentType: 'blueprint' | 'description' | 'marketing_copy' | 'plr_content';
  nicheContext?: string;
}

export interface PatternMatch {
  pattern: string;
  frequency: 'common' | 'moderate' | 'rare';
  suggestion: string;
}

export interface UniquenessCheckOutput {
  uniquenessScore: number; // 0-100
  rating: 'Low' | 'Moderate' | 'Good' | 'Excellent';
  overallAssessment: string;
  patternMatches: PatternMatch[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  differentiationTips: string[];
}
