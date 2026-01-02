export interface EcoverStyle {
  id: string;
  name: string;
  description: string;
  background: string;
  accentGlow: string;
  lighting: string;
  finish: string;
  promptFragment: string;
}

/**
 * Premium Dark style - default high-ticket aesthetic
 */
export const PREMIUM_DARK_STYLE: EcoverStyle = {
  id: 'premium-dark',
  name: 'Premium Dark',
  description: 'Dark gradient with cyan glow accents',
  background: 'Dark gradient from charcoal (#1a1a2e) to near-black (#0a0a0f)',
  accentGlow: 'Subtle blue/cyan arc glow connecting elements',
  lighting: 'Soft studio lighting from top-left, individual realistic shadows',
  finish: 'Premium high-ticket aesthetic ($297-$497 value look)',
  promptFragment: `BACKGROUND: Rich dark gradient background transitioning from charcoal (#1a1a2e) to near-black (#0a0a0f)
LIGHTING: Professional soft studio lighting from top-left angle, each item casts its own individual realistic shadow
ACCENT: Subtle glowing cyan/teal arc (#00d4ff at 30% opacity) connecting and unifying all elements
FINISH: Premium, high-ticket digital product aesthetic conveying $297+ perceived value
QUALITY: Ultra high detail, professional product photography style, clean and polished`
};

/**
 * Minimal Light style - clean SaaS aesthetic
 */
export const MINIMAL_LIGHT_STYLE: EcoverStyle = {
  id: 'minimal-light',
  name: 'Minimal Light',
  description: 'Clean white with subtle shadows',
  background: 'Clean white to light gray gradient',
  accentGlow: 'Subtle shadows only, no glow effects',
  lighting: 'Even, diffused professional lighting',
  finish: 'Modern, minimal SaaS aesthetic',
  promptFragment: `BACKGROUND: Clean white (#ffffff) to light gray (#f8fafc) gradient, minimalist
LIGHTING: Even, diffused professional studio lighting from multiple angles
ACCENT: Clean, crisp shadows only - no glow effects, subtle depth
FINISH: Modern, minimal SaaS product aesthetic, clean and professional
QUALITY: High detail, product catalog style photography, sharp and clean`
};

/**
 * Warm Premium style - luxury gold accents
 */
export const WARM_PREMIUM_STYLE: EcoverStyle = {
  id: 'warm-premium',
  name: 'Warm Premium',
  description: 'Dark with warm gold accents',
  background: 'Deep charcoal to black gradient',
  accentGlow: 'Warm gold accent highlights',
  lighting: 'Dramatic warm lighting from top',
  finish: 'Luxury, high-end product feel',
  promptFragment: `BACKGROUND: Deep charcoal (#1a1a1a) to rich black (#0a0a0a) gradient
LIGHTING: Dramatic warm lighting from top, golden highlights on edges
ACCENT: Warm gold (#d4a574) accent highlights and subtle glow connecting elements
FINISH: Luxury, high-end premium product aesthetic, exclusive feel
QUALITY: Ultra high detail, luxury product photography style`
};

/**
 * All available styles
 */
export const ECOVER_STYLES: EcoverStyle[] = [
  PREMIUM_DARK_STYLE,
  MINIMAL_LIGHT_STYLE,
  WARM_PREMIUM_STYLE
];

/**
 * Get style by ID
 */
export function getStyleById(styleId: string): EcoverStyle {
  return ECOVER_STYLES.find(s => s.id === styleId) || PREMIUM_DARK_STYLE;
}

/**
 * Depth toggle options
 */
export type DepthMode = 'minimal' | 'stacked';

export const DEPTH_MODES: { id: DepthMode; name: string; promptFragment: string }[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    promptFragment: 'Flat arrangement with minimal depth, clean and modern, items at similar visual plane'
  },
  {
    id: 'stacked',
    name: 'Stacked Depth',
    promptFragment: '3D depth with layered stacking, realistic perspective, items at varying depths creating visual hierarchy'
  }
];

export function getDepthPrompt(mode: DepthMode): string {
  return DEPTH_MODES.find(d => d.id === mode)?.promptFragment || DEPTH_MODES[1].promptFragment;
}
