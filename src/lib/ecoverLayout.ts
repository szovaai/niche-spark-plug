export type LayoutStyle = 'hero-centered' | 'side-by-side' | 'triangle' | 'arc' | 'fan-stack';

export interface LayoutConfig {
  componentCount: number | [number, number];
  layout: LayoutStyle;
  name: string;
  description: string;
  promptFragment: string;
}

/**
 * Layout rules based on component count.
 * Auto-arranges items for optimal visual balance.
 */
export const LAYOUT_RULES: LayoutConfig[] = [
  {
    componentCount: 1,
    layout: 'hero-centered',
    name: 'Hero Centered',
    description: 'Single hero item centered with dramatic lighting',
    promptFragment: 'Single product centered on the dark gradient background, dramatic studio lighting from above, floating with soft shadow beneath, commanding presence'
  },
  {
    componentCount: 2,
    layout: 'side-by-side',
    name: 'Side by Side',
    description: 'Two items balanced horizontally',
    promptFragment: 'Two products arranged side by side with slight angles toward each other, balanced composition, equal visual weight, 20% spacing between items'
  },
  {
    componentCount: 3,
    layout: 'triangle',
    name: 'Triangle Formation',
    description: 'Three items in pyramid arrangement',
    promptFragment: 'Three products arranged in elegant triangle formation, main item (book) slightly elevated at center-top, supporting items at bottom-left and bottom-right, cohesive grouping with 15-20% spacing'
  },
  {
    componentCount: [4, 5],
    layout: 'fan-stack',
    name: 'Fan Stack',
    description: 'Fan or layered stack arrangement',
    promptFragment: 'Products arranged in elegant fan spread, main book at center, other items fanning outward with slight overlap, 15-20% spacing between items, individual soft shadows for each item'
  },
  {
    componentCount: [6, 10],
    layout: 'arc',
    name: 'Arc Arrangement',
    description: 'Full arc spanning the composition',
    promptFragment: 'All products arranged in sweeping arc formation across the image, main book at center-front, other items curving behind in an elegant arc, glowing accent connecting elements, balanced visual flow'
  }
];

/**
 * Get the appropriate layout configuration for a given component count
 */
export function getLayoutForCount(count: number): LayoutConfig {
  const rule = LAYOUT_RULES.find(r => {
    if (typeof r.componentCount === 'number') {
      return r.componentCount === count;
    }
    return count >= r.componentCount[0] && count <= r.componentCount[1];
  });
  
  // Default to fan-stack for any count not explicitly covered
  return rule || LAYOUT_RULES.find(r => r.layout === 'fan-stack')!;
}

/**
 * Get layout preview description for UI display
 */
export function getLayoutPreview(count: number): { name: string; description: string } {
  const layout = getLayoutForCount(count);
  return {
    name: `${layout.name} (${count} item${count !== 1 ? 's' : ''})`,
    description: layout.description
  };
}
