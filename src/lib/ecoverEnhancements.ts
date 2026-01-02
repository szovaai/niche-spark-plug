// Premium visual enhancement library for eCover generation

export interface LightingTechnique {
  id: string;
  name: string;
  description: string;
  promptFragment: string;
}

export interface MaterialTreatment {
  id: string;
  name: string;
  description: string;
  promptFragment: string;
}

export interface FinishingEffect {
  id: string;
  name: string;
  description: string;
  promptFragment: string;
}

export interface ColorGrading {
  id: string;
  name: string;
  description: string;
  promptFragment: string;
}

// Lighting techniques
export const LIGHTING_TECHNIQUES: LightingTechnique[] = [
  {
    id: 'three-point',
    name: 'Three-Point Studio',
    description: 'Professional three-point lighting setup',
    promptFragment: 'Professional three-point studio lighting with key light from top-left at 45 degrees, soft fill from right, and subtle rim light for edge definition'
  },
  {
    id: 'rim-glow',
    name: 'Rim Glow',
    description: 'Colored rim lighting around edges',
    promptFragment: 'Subtle colored rim lighting creating a soft glow around product edges, emphasizing depth and premium quality'
  },
  {
    id: 'dramatic',
    name: 'Dramatic Spotlight',
    description: 'Dramatic top-down spotlight',
    promptFragment: 'Dramatic overhead spotlight with soft falloff, creating rich shadows and highlighting key product features'
  },
  {
    id: 'soft-natural',
    name: 'Soft Natural',
    description: 'Diffused natural window lighting',
    promptFragment: 'Soft, diffused natural lighting as if from a large window, creating gentle shadows and warm, inviting atmosphere'
  }
];

// Surface material treatments
export const MATERIAL_TREATMENTS: MaterialTreatment[] = [
  {
    id: 'glossy',
    name: 'High Gloss',
    description: 'Reflective surface with environment reflections',
    promptFragment: 'High-gloss reflective surface with subtle environment reflections and crisp specular highlights'
  },
  {
    id: 'matte',
    name: 'Premium Matte',
    description: 'Matte finish with micro-texture',
    promptFragment: 'Premium matte finish with subtle micro-texture, soft highlights, and velvet-like appearance'
  },
  {
    id: 'leather',
    name: 'Leather Texture',
    description: 'Rich leather texture with grain',
    promptFragment: 'Rich leather texture with subtle grain pattern, natural variations, and premium tactile appearance'
  },
  {
    id: 'linen',
    name: 'Linen Paper',
    description: 'Natural linen paper texture',
    promptFragment: 'Natural linen paper texture with visible fiber pattern, organic feel, and high-end stationery appearance'
  },
  {
    id: 'silk',
    name: 'Silk Finish',
    description: 'Smooth silk-like surface',
    promptFragment: 'Smooth silk-like finish with subtle sheen, luxurious appearance, and soft light reflection'
  }
];

// Finishing effects
export const FINISHING_EFFECTS: FinishingEffect[] = [
  {
    id: 'foil-stamp',
    name: 'Foil Stamping',
    description: 'Metallic foil on title text',
    promptFragment: 'Metallic foil stamping effect on title with realistic light reflection and premium gold/silver appearance'
  },
  {
    id: 'emboss',
    name: 'Embossed Texture',
    description: 'Raised embossed elements',
    promptFragment: 'Subtle embossed texture on cover creating tactile depth, with accurate shadow and highlight on raised areas'
  },
  {
    id: 'spot-uv',
    name: 'Spot UV Gloss',
    description: 'Selective gloss coating',
    promptFragment: 'Spot UV gloss coating on logo and title areas, creating contrast between matte and glossy surfaces'
  },
  {
    id: 'soft-focus',
    name: 'Depth of Field',
    description: 'Cinematic depth blur',
    promptFragment: 'Subtle depth of field with sharp focus on hero product and gentle blur on background elements'
  },
  {
    id: 'lens-bloom',
    name: 'Lens Bloom',
    description: 'Soft light bloom effect',
    promptFragment: 'Subtle lens bloom on bright highlights, creating cinematic quality and premium photography feel'
  }
];

// Color grading presets
export const COLOR_GRADING: ColorGrading[] = [
  {
    id: 'warm-luxury',
    name: 'Warm Luxury',
    description: 'Golden tones, rich shadows',
    promptFragment: 'Warm golden color grading with rich amber shadows, luxurious atmosphere, and premium feel'
  },
  {
    id: 'cool-tech',
    name: 'Cool Tech',
    description: 'Blue-cyan tones, crisp',
    promptFragment: 'Cool blue-cyan color grading with crisp highlights, modern tech aesthetic, and clean appearance'
  },
  {
    id: 'neutral-clean',
    name: 'Neutral Clean',
    description: 'Balanced, clean whites',
    promptFragment: 'Neutral balanced color grading with clean whites, accurate colors, and professional appearance'
  },
  {
    id: 'moody-dark',
    name: 'Moody Dark',
    description: 'Deep shadows, selective lighting',
    promptFragment: 'Moody dark color grading with deep shadows, selective lighting, and dramatic atmosphere'
  },
  {
    id: 'vibrant-energy',
    name: 'Vibrant Energy',
    description: 'Saturated, dynamic colors',
    promptFragment: 'Vibrant saturated colors with dynamic energy, bold appearance, and eye-catching pop'
  }
];

// Get enhancement by ID
export function getLightingById(id: string): LightingTechnique | undefined {
  return LIGHTING_TECHNIQUES.find(l => l.id === id);
}

export function getMaterialById(id: string): MaterialTreatment | undefined {
  return MATERIAL_TREATMENTS.find(m => m.id === id);
}

export function getFinishingById(id: string): FinishingEffect | undefined {
  return FINISHING_EFFECTS.find(f => f.id === id);
}

export function getGradingById(id: string): ColorGrading | undefined {
  return COLOR_GRADING.find(g => g.id === id);
}

// Build enhancement prompt fragment
export function buildEnhancementPrompt(options: {
  lighting?: string;
  materials?: string[];
  finishing?: string[];
  grading?: string;
}): string {
  const fragments: string[] = [];
  
  if (options.lighting) {
    const lighting = getLightingById(options.lighting);
    if (lighting) fragments.push(`LIGHTING: ${lighting.promptFragment}`);
  }
  
  if (options.materials && options.materials.length > 0) {
    const materialFragments = options.materials
      .map(id => getMaterialById(id)?.promptFragment)
      .filter(Boolean);
    if (materialFragments.length > 0) {
      fragments.push(`MATERIALS: ${materialFragments.join('. ')}`);
    }
  }
  
  if (options.finishing && options.finishing.length > 0) {
    const finishingFragments = options.finishing
      .map(id => getFinishingById(id)?.promptFragment)
      .filter(Boolean);
    if (finishingFragments.length > 0) {
      fragments.push(`FINISHING: ${finishingFragments.join('. ')}`);
    }
  }
  
  if (options.grading) {
    const grading = getGradingById(options.grading);
    if (grading) fragments.push(`COLOR GRADING: ${grading.promptFragment}`);
  }
  
  return fragments.join('\n\n');
}
