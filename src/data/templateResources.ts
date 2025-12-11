export interface TemplateResource {
  id: string;
  name: string;
  category: 'canva' | 'mockup' | 'font' | 'color';
  productTypes: string[];
  url: string;
  description: string;
  isPro?: boolean;
}

export interface FontPairing {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  styleVibe: string;
  preview?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  styleVibe: string;
  colors: string[];
  usage: string;
}

export const CANVA_TEMPLATES: TemplateResource[] = [
  { id: 'planner-minimal', name: 'Minimal Daily Planner', category: 'canva', productTypes: ['Planner', 'Printable Pack'], url: 'https://www.canva.com/templates/?query=minimal-planner', description: 'Clean, minimalist planner layouts' },
  { id: 'planner-aesthetic', name: 'Aesthetic Planner Bundle', category: 'canva', productTypes: ['Planner', 'Printable Pack'], url: 'https://www.canva.com/templates/?query=aesthetic-planner', description: 'Trendy aesthetic planner designs' },
  { id: 'journal-guided', name: 'Guided Journal Pages', category: 'canva', productTypes: ['Guide/Ebook', 'Printable Pack'], url: 'https://www.canva.com/templates/?query=journal-template', description: 'Self-reflection and wellness journals' },
  { id: 'ebook-modern', name: 'Modern Ebook Template', category: 'canva', productTypes: ['Guide/Ebook'], url: 'https://www.canva.com/templates/?query=ebook-template', description: 'Professional ebook layouts' },
  { id: 'social-kit', name: 'Social Media Kit', category: 'canva', productTypes: ['Social Media Kit'], url: 'https://www.canva.com/templates/?query=social-media-kit', description: 'Instagram, Pinterest, TikTok templates' },
  { id: 'wall-art', name: 'Wall Art Prints', category: 'canva', productTypes: ['Wall Art Pack'], url: 'https://www.canva.com/templates/?query=wall-art-prints', description: 'Printable wall art designs' },
  { id: 'stickers', name: 'Digital Sticker Sheets', category: 'canva', productTypes: ['Digital Stickers'], url: 'https://www.canva.com/templates/?query=digital-stickers', description: 'GoodNotes and iPad stickers' },
  { id: 'budget', name: 'Budget Spreadsheet', category: 'canva', productTypes: ['Spreadsheet'], url: 'https://www.canva.com/templates/?query=budget-planner', description: 'Financial tracking templates' },
];

export const MOCKUP_RESOURCES: TemplateResource[] = [
  { id: 'placeit-ebook', name: 'Placeit Ebook Mockups', category: 'mockup', productTypes: ['Guide/Ebook', 'Planner'], url: 'https://placeit.net/c/mockups/stages/ebook-mockup', description: '3D ebook and digital product mockups', isPro: true },
  { id: 'smartmockups', name: 'Smartmockups Free', category: 'mockup', productTypes: ['Guide/Ebook', 'Planner', 'Printable Pack'], url: 'https://smartmockups.com/mockups/free', description: 'Free product mockup generator' },
  { id: 'mockup-world', name: 'Mockup World', category: 'mockup', productTypes: ['Wall Art Pack', 'Social Media Kit'], url: 'https://www.mockupworld.co/', description: 'Free PSD mockups collection' },
  { id: 'graphic-burger', name: 'GraphicBurger', category: 'mockup', productTypes: ['Guide/Ebook', 'Printable Pack'], url: 'https://graphicburger.com/mock-ups/', description: 'High-quality free mockups' },
  { id: 'ls-graphics', name: 'LS Graphics', category: 'mockup', productTypes: ['Social Media Kit', 'Digital Stickers'], url: 'https://www.ls.graphics/', description: 'Premium device mockups' },
];

export const FONT_PAIRINGS: FontPairing[] = [
  { id: 'minimal-clean', name: 'Clean Minimal', headingFont: 'Playfair Display', bodyFont: 'Lato', styleVibe: 'Minimalist' },
  { id: 'boho-organic', name: 'Boho Organic', headingFont: 'Cormorant Garamond', bodyFont: 'Nunito', styleVibe: 'Boho' },
  { id: 'modern-bold', name: 'Modern Bold', headingFont: 'Montserrat', bodyFont: 'Open Sans', styleVibe: 'Corporate' },
  { id: 'cute-playful', name: 'Cute Playful', headingFont: 'Quicksand', bodyFont: 'Poppins', styleVibe: 'Cute' },
  { id: 'aesthetic-soft', name: 'Aesthetic Soft', headingFont: 'Josefin Sans', bodyFont: 'Source Sans Pro', styleVibe: 'Aesthetic' },
  { id: 'elegant-serif', name: 'Elegant Serif', headingFont: 'Libre Baskerville', bodyFont: 'Raleway', styleVibe: 'Minimalist' },
  { id: 'tech-modern', name: 'Tech Modern', headingFont: 'Space Grotesk', bodyFont: 'Inter', styleVibe: 'Corporate' },
  { id: 'handwritten', name: 'Handwritten Feel', headingFont: 'Dancing Script', bodyFont: 'Karla', styleVibe: 'Boho' },
];

export const COLOR_PALETTES: ColorPalette[] = [
  { id: 'sage-neutral', name: 'Sage & Neutral', styleVibe: 'Minimalist', colors: ['#9CAF88', '#F5F5F0', '#2C3E2D', '#E8E4DE', '#FFFFFF'], usage: 'Wellness, Self-care, Nature' },
  { id: 'blush-gold', name: 'Blush & Gold', styleVibe: 'Aesthetic', colors: ['#E8B4BC', '#D4AF37', '#FFF5F5', '#2D2D2D', '#F8F0E3'], usage: 'Beauty, Lifestyle, Feminine' },
  { id: 'ocean-blue', name: 'Ocean Blue', styleVibe: 'Corporate', colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E'], usage: 'Business, Finance, Tech' },
  { id: 'terracotta', name: 'Terracotta Earth', styleVibe: 'Boho', colors: ['#C4775C', '#E9D8A6', '#94553D', '#FEFAE0', '#606C38'], usage: 'Boho, Earthy, Rustic' },
  { id: 'lavender', name: 'Lavender Dreams', styleVibe: 'Cute', colors: ['#E6E6FA', '#DDA0DD', '#9370DB', '#F0E6FA', '#4B0082'], usage: 'Spiritual, Cute, Calming' },
  { id: 'mono-black', name: 'Mono Black', styleVibe: 'Minimalist', colors: ['#000000', '#333333', '#666666', '#999999', '#FFFFFF'], usage: 'Modern, Professional, Clean' },
  { id: 'sunset', name: 'Sunset Vibes', styleVibe: 'Aesthetic', colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCB77', '#4D96FF'], usage: 'Energy, Creativity, Fun' },
  { id: 'forest', name: 'Forest Green', styleVibe: 'Boho', colors: ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#D8F3DC'], usage: 'Nature, Growth, Wellness' },
];

export const getTemplatesForProductType = (productType: string): TemplateResource[] => {
  return CANVA_TEMPLATES.filter(t => t.productTypes.includes(productType));
};

export const getMockupsForProductType = (productType: string): TemplateResource[] => {
  return MOCKUP_RESOURCES.filter(t => t.productTypes.includes(productType));
};

export const getFontsForStyle = (styleVibe: string): FontPairing[] => {
  return FONT_PAIRINGS.filter(f => f.styleVibe === styleVibe);
};

export const getPalettesForStyle = (styleVibe: string): ColorPalette[] => {
  return COLOR_PALETTES.filter(p => p.styleVibe === styleVibe);
};
