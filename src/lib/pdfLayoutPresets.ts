// PDF Layout Preset System for Toolkit Guides

export interface PDFLayoutPreset {
  id: string;
  name: string;
  description: string;
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  colors: {
    primary: [number, number, number];
    accent: [number, number, number];
    secondary: [number, number, number];
    background: [number, number, number];
    text: [number, number, number];
    textMuted: [number, number, number];
    cardBg: [number, number, number];
  };
  spacing: {
    lineHeight: number;
    paragraphSpacing: number;
    margins: { top: number; bottom: number; left: number; right: number };
  };
  elements: {
    chapterBadgeStyle: 'circle' | 'square' | 'pill';
    calloutStyle: 'bordered' | 'filled' | 'minimal';
    dividerStyle: 'line' | 'dots' | 'gradient';
    useAccentBars: boolean;
  };
}

export const PDF_LAYOUT_PRESETS: PDFLayoutPreset[] = [
  {
    id: 'premium-dark',
    name: 'Premium Dark',
    description: 'Luxurious dark theme with ocean blue accents - Professional & modern',
    fonts: { heading: 'Helvetica Bold', body: 'Helvetica', accent: 'Helvetica Oblique' },
    colors: {
      primary: [0, 120, 212],        // Ocean Blue
      accent: [236, 72, 153],         // Magenta Pink
      secondary: [56, 189, 248],      // Light Cyan
      background: [15, 23, 42],       // Dark Navy
      text: [248, 250, 252],          // Light text
      textMuted: [148, 163, 184],     // Slate 400
      cardBg: [30, 41, 59],           // Slate 800
    },
    spacing: {
      lineHeight: 5.5,
      paragraphSpacing: 4,
      margins: { top: 30, bottom: 25, left: 22, right: 22 },
    },
    elements: {
      chapterBadgeStyle: 'circle',
      calloutStyle: 'filled',
      dividerStyle: 'gradient',
      useAccentBars: true,
    },
  },
  {
    id: 'clean-modern',
    name: 'Clean Modern',
    description: 'Bright, minimal design for maximum readability',
    fonts: { heading: 'Helvetica Bold', body: 'Helvetica', accent: 'Helvetica Oblique' },
    colors: {
      primary: [37, 99, 235],         // Blue 600
      accent: [16, 185, 129],         // Emerald 500
      secondary: [99, 102, 241],      // Indigo 500
      background: [255, 255, 255],    // White
      text: [15, 23, 42],             // Slate 900
      textMuted: [100, 116, 139],     // Slate 500
      cardBg: [248, 250, 252],        // Slate 50
    },
    spacing: {
      lineHeight: 6,
      paragraphSpacing: 5,
      margins: { top: 28, bottom: 25, left: 25, right: 25 },
    },
    elements: {
      chapterBadgeStyle: 'pill',
      calloutStyle: 'bordered',
      dividerStyle: 'line',
      useAccentBars: false,
    },
  },
  {
    id: 'warm-coaching',
    name: 'Warm Coaching',
    description: 'Soft, approachable design for personal development content',
    fonts: { heading: 'Helvetica Bold', body: 'Helvetica', accent: 'Helvetica Oblique' },
    colors: {
      primary: [234, 88, 12],         // Orange 600
      accent: [245, 158, 11],         // Amber 500
      secondary: [251, 191, 36],      // Amber 400
      background: [255, 251, 235],    // Amber 50
      text: [41, 37, 36],             // Stone 800
      textMuted: [120, 113, 108],     // Stone 500
      cardBg: [254, 243, 199],        // Amber 100
    },
    spacing: {
      lineHeight: 6.5,
      paragraphSpacing: 6,
      margins: { top: 32, bottom: 28, left: 28, right: 28 },
    },
    elements: {
      chapterBadgeStyle: 'circle',
      calloutStyle: 'filled',
      dividerStyle: 'dots',
      useAccentBars: true,
    },
  },
  {
    id: 'bold-tactical',
    name: 'Bold Tactical',
    description: 'High-contrast, action-focused military-style design',
    fonts: { heading: 'Helvetica Bold', body: 'Helvetica', accent: 'Helvetica Bold' },
    colors: {
      primary: [220, 38, 38],         // Red 600
      accent: [251, 191, 36],         // Amber 400 (warning yellow)
      secondary: [22, 163, 74],       // Green 600
      background: [24, 24, 27],       // Zinc 900
      text: [250, 250, 250],          // Zinc 50
      textMuted: [161, 161, 170],     // Zinc 400
      cardBg: [39, 39, 42],           // Zinc 800
    },
    spacing: {
      lineHeight: 5,
      paragraphSpacing: 3,
      margins: { top: 25, bottom: 22, left: 20, right: 20 },
    },
    elements: {
      chapterBadgeStyle: 'square',
      calloutStyle: 'bordered',
      dividerStyle: 'line',
      useAccentBars: true,
    },
  },
  {
    id: 'elegant-professional',
    name: 'Elegant Professional',
    description: 'Sophisticated consulting-grade presentation',
    fonts: { heading: 'Helvetica Bold', body: 'Helvetica', accent: 'Helvetica Oblique' },
    colors: {
      primary: [51, 65, 85],          // Slate 700
      accent: [168, 162, 158],        // Stone 400 (gold-ish)
      secondary: [100, 116, 139],     // Slate 500
      background: [250, 250, 249],    // Stone 50
      text: [28, 25, 23],             // Stone 900
      textMuted: [87, 83, 78],        // Stone 600
      cardBg: [245, 245, 244],        // Stone 100
    },
    spacing: {
      lineHeight: 6,
      paragraphSpacing: 5,
      margins: { top: 35, bottom: 30, left: 30, right: 30 },
    },
    elements: {
      chapterBadgeStyle: 'circle',
      calloutStyle: 'minimal',
      dividerStyle: 'line',
      useAccentBars: false,
    },
  },
  {
    id: 'vibrant-fun',
    name: 'Vibrant Fun',
    description: 'Energetic, colorful design for engaging content',
    fonts: { heading: 'Helvetica Bold', body: 'Helvetica', accent: 'Helvetica Oblique' },
    colors: {
      primary: [168, 85, 247],        // Purple 500
      accent: [236, 72, 153],         // Pink 500
      secondary: [34, 211, 238],      // Cyan 400
      background: [255, 255, 255],    // White
      text: [30, 41, 59],             // Slate 800
      textMuted: [100, 116, 139],     // Slate 500
      cardBg: [250, 245, 255],        // Purple 50
    },
    spacing: {
      lineHeight: 5.5,
      paragraphSpacing: 4,
      margins: { top: 28, bottom: 25, left: 24, right: 24 },
    },
    elements: {
      chapterBadgeStyle: 'pill',
      calloutStyle: 'filled',
      dividerStyle: 'gradient',
      useAccentBars: true,
    },
  },
];

export const getPresetById = (id: string): PDFLayoutPreset => {
  return PDF_LAYOUT_PRESETS.find(p => p.id === id) || PDF_LAYOUT_PRESETS[0];
};

export const getPresetForStyle = (writingStyle: string): PDFLayoutPreset => {
  const stylePresetMap: Record<string, string> = {
    'conversational': 'clean-modern',
    'professional': 'elegant-professional',
    'storytelling': 'warm-coaching',
    'step-by-step': 'clean-modern',
    'fun': 'vibrant-fun',
    'motivational': 'warm-coaching',
    'empowering': 'warm-coaching',
    'tactical': 'bold-tactical',
    'coaching': 'warm-coaching',
  };
  
  const presetId = stylePresetMap[writingStyle] || 'premium-dark';
  return getPresetById(presetId);
};