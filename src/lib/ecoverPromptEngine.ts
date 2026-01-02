// AI-powered prompt generation engine for eCover Bundle Generator

import { NicheCategory } from './ecoverBranding';

// Niche-specific style profiles
export interface NicheStyleProfile {
  primaryColor: string;
  primaryColorName: string;
  accentColor: string;
  accentColorName: string;
  lighting: string;
  materials: string[];
  finishing: string[];
  grading: string;
  mood: string;
  visualKeywords: string[];
}

export const NICHE_STYLE_PROFILES: Record<NicheCategory, NicheStyleProfile> = {
  finance: {
    primaryColor: '#0a1628',
    primaryColorName: 'Deep navy',
    accentColor: '#d4a574',
    accentColorName: 'Warm gold',
    lighting: 'dramatic',
    materials: ['leather', 'glossy'],
    finishing: ['foil-stamp', 'emboss'],
    grading: 'warm-luxury',
    mood: 'Luxurious, trustworthy, and authoritative',
    visualKeywords: ['wealth', 'premium', 'exclusive', 'professional']
  },
  wellness: {
    primaryColor: '#2d4a3e',
    primaryColorName: 'Sage green',
    accentColor: '#f5f0e6',
    accentColorName: 'Warm cream',
    lighting: 'soft-natural',
    materials: ['matte', 'linen'],
    finishing: ['soft-focus'],
    grading: 'neutral-clean',
    mood: 'Calming, natural, and nurturing',
    visualKeywords: ['organic', 'peaceful', 'balanced', 'healing']
  },
  tech: {
    primaryColor: '#1a1a2e',
    primaryColorName: 'Charcoal',
    accentColor: '#00d4ff',
    accentColorName: 'Electric cyan',
    lighting: 'three-point',
    materials: ['glossy', 'silk'],
    finishing: ['spot-uv', 'lens-bloom'],
    grading: 'cool-tech',
    mood: 'Modern, innovative, and cutting-edge',
    visualKeywords: ['futuristic', 'sleek', 'digital', 'smart']
  },
  marketing: {
    primaryColor: '#1a1a1a',
    primaryColorName: 'Deep black',
    accentColor: '#ff6b35',
    accentColorName: 'Vibrant orange',
    lighting: 'three-point',
    materials: ['glossy', 'matte'],
    finishing: ['emboss', 'spot-uv'],
    grading: 'vibrant-energy',
    mood: 'Energetic, action-oriented, and results-driven',
    visualKeywords: ['bold', 'dynamic', 'powerful', 'growth']
  },
  coaching: {
    primaryColor: '#2d1b4e',
    primaryColorName: 'Deep purple',
    accentColor: '#e8d5b7',
    accentColorName: 'Warm beige',
    lighting: 'rim-glow',
    materials: ['matte', 'leather'],
    finishing: ['foil-stamp', 'soft-focus'],
    grading: 'warm-luxury',
    mood: 'Inspiring, empowering, and transformational',
    visualKeywords: ['success', 'growth', 'potential', 'breakthrough']
  },
  creative: {
    primaryColor: '#1a1a2e',
    primaryColorName: 'Dark indigo',
    accentColor: '#ff6b9d',
    accentColorName: 'Vibrant pink',
    lighting: 'dramatic',
    materials: ['matte', 'silk'],
    finishing: ['lens-bloom', 'spot-uv'],
    grading: 'vibrant-energy',
    mood: 'Artistic, unique, and expressive',
    visualKeywords: ['creative', 'artistic', 'unique', 'innovative']
  },
  business: {
    primaryColor: '#1a2634',
    primaryColorName: 'Corporate navy',
    accentColor: '#4a90d9',
    accentColorName: 'Professional blue',
    lighting: 'three-point',
    materials: ['glossy', 'matte'],
    finishing: ['emboss', 'foil-stamp'],
    grading: 'neutral-clean',
    mood: 'Professional, reliable, and strategic',
    visualKeywords: ['corporate', 'professional', 'strategic', 'growth']
  },
  lifestyle: {
    primaryColor: '#2a2a2a',
    primaryColorName: 'Warm gray',
    accentColor: '#c9a66b',
    accentColorName: 'Warm bronze',
    lighting: 'soft-natural',
    materials: ['matte', 'linen'],
    finishing: ['soft-focus'],
    grading: 'warm-luxury',
    mood: 'Aspirational, beautiful, and curated',
    visualKeywords: ['lifestyle', 'curated', 'beautiful', 'aspirational']
  },
  education: {
    primaryColor: '#1a3a5c',
    primaryColorName: 'Academic blue',
    accentColor: '#f4a261',
    accentColorName: 'Warm amber',
    lighting: 'three-point',
    materials: ['matte', 'leather'],
    finishing: ['emboss'],
    grading: 'neutral-clean',
    mood: 'Authoritative, clear, and structured',
    visualKeywords: ['learning', 'knowledge', 'mastery', 'expertise']
  },
  default: {
    primaryColor: '#1a1a2e',
    primaryColorName: 'Charcoal',
    accentColor: '#00b4d8',
    accentColorName: 'Teal',
    lighting: 'three-point',
    materials: ['glossy', 'matte'],
    finishing: ['soft-focus', 'lens-bloom'],
    grading: 'neutral-clean',
    mood: 'Professional and premium',
    visualKeywords: ['premium', 'professional', 'quality', 'value']
  }
};

/**
 * Get the style profile for a niche category
 */
export function getNicheStyleProfile(category: NicheCategory): NicheStyleProfile {
  return NICHE_STYLE_PROFILES[category] || NICHE_STYLE_PROFILES.default;
}

/**
 * The system prompt for the AI Prompt Writer
 */
export const PROMPT_WRITER_SYSTEM = `You are a premium eCover design director with 15+ years of experience creating high-ticket digital product mockups. Your job is to write ultra-high-quality image generation prompts that produce photorealistic, commercially-appealing digital product bundle mockups.

Your prompts MUST create images that look like they came from a professional 3D artist or high-end design studio.

CRITICAL RULES:
1. ONLY include the EXACT components specified - NO extras, NO fillers, NO additional items
2. Each component maps to exactly one visual object - no duplicates
3. NO laptops, tablets, phones, or screens unless explicitly requested
4. NO generic stock imagery, dashboards, or Canva-style flat icons
5. NO text overlays except the product title (if appropriate for the style)
6. The final output must look like a $297-$997 premium digital product bundle

ANALYZE the brand data and write a comprehensive prompt that includes:

1. BRAND-CALIBRATED VISUAL STYLE
   - Infer the ideal color palette from the niche and target audience
   - Match lighting mood to brand personality
   - Select appropriate textures and materials
   - Ensure visual style resonates with the target demographic

2. HYPERREALISTIC RENDERING DIRECTIVES
   - Subsurface scattering for paper and plastic materials
   - Ambient occlusion for realistic depth at edges and corners
   - Specular highlights matching the light direction
   - Realistic material properties (glossy, matte, textured)
   - Individual cast shadows for each element

3. CINEMATIC FINISHING
   - Color grading appropriate to niche (warm/cool/neutral)
   - Rim lighting glow in brand accent color
   - Subtle lens bloom for premium photography feel
   - Environment reflections where appropriate
   - Depth of field for focus hierarchy

4. COMPONENT-SPECIFIC DETAILS
   - Each component rendered with its specific visual representation
   - Proper material variation between components
   - Accurate perspective and proportions
   - Consistent light direction across all elements

5. COMPOSITION & LAYOUT
   - Apply the specified layout arrangement
   - 15-20% spacing between items for clarity
   - Balanced visual weight distribution
   - Clear focal hierarchy

OUTPUT FORMAT:
Write a single, complete image generation prompt (400-600 words) ready for GPT-Image-1. 
Do NOT include any explanations, headers, or metadata - ONLY the prompt text.
The prompt should flow naturally and be comprehensive.`;

/**
 * Build the user message for the prompt writer
 */
export function buildPromptWriterMessage(params: {
  title: string;
  niche: string;
  nicheCategory: NicheCategory;
  targetAudience?: string;
  thesis?: string;
  writingStyle?: string;
  brandPersonality: string;
  styleProfile: NicheStyleProfile;
  selectedComponents: string[];
  componentDescriptions: string[];
  layoutDescription: string;
  depthMode: string;
}): string {
  return `Generate a premium eCover image prompt for this digital product bundle:

BRAND DATA:
- Product Title: "${params.title}"
- Niche: ${params.niche}
- Niche Category: ${params.nicheCategory}
- Target Audience: ${params.targetAudience || 'General audience in this niche'}
- Brand Thesis: ${params.thesis || 'Not specified'}
- Writing Style: ${params.writingStyle || 'Professional'}
- Brand Personality: ${params.brandPersonality}

VISUAL DIRECTION (Calibrated for ${params.nicheCategory} niche):
- Primary Color: ${params.styleProfile.primaryColorName} (${params.styleProfile.primaryColor})
- Accent Color: ${params.styleProfile.accentColorName} (${params.styleProfile.accentColor})
- Mood: ${params.styleProfile.mood}
- Visual Keywords: ${params.styleProfile.visualKeywords.join(', ')}
- Preferred Lighting: ${params.styleProfile.lighting}
- Preferred Materials: ${params.styleProfile.materials.join(', ')}
- Finishing Effects: ${params.styleProfile.finishing.join(', ')}
- Color Grading: ${params.styleProfile.grading}

COMPONENTS TO INCLUDE (ONLY THESE - NO EXTRAS):
${params.componentDescriptions.map((desc, i) => `${i + 1}. ${params.selectedComponents[i]}: ${desc}`).join('\n')}

LAYOUT: ${params.layoutDescription}
DEPTH MODE: ${params.depthMode}

Remember: Create a prompt that will generate a photorealistic, $297+ premium digital product bundle mockup. The image should look like professional product photography, not a digital illustration.`;
}
