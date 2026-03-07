export interface WorksheetItem {
  chapterIndex: number;
  title: string;
  intro: string;
  questions: string[];
  reflectionPrompt: string;
}

export interface CheatSheetStep {
  number: number;
  title: string;
  description: string;
}

export interface CheatSheet {
  title: string;
  subtitle: string;
  steps: CheatSheetStep[];
  proTip: string;
}

export interface ToolkitTool {
  name: string;
  type: "script" | "template" | "checklist" | "swipeFile";
  description: string;
  content: string;
}

export interface TemplateItem {
  name: string;
  category: string;
  instructions: string;
  content: string;
}

export interface PromptItem {
  title: string;
  prompt: string;
  expectedOutput: string;
}

export interface PromptCategory {
  name: string;
  prompts: PromptItem[];
}

export interface BonusGuide {
  name: string;
  perceivedValue: number;
  tagline: string;
  content: string;
}

export interface CaseStudy {
  name: string;
  background: string;
  challenge: string;
  method: string;
  results: string;
  quote: string;
}

export interface MultiplierFormat {
  format: string;
  pitch: string;
  outline: string[];
  estimatedPrice: number;
  timeToCreate: string;
}

export interface ProductAssets {
  workbook?: { worksheets: WorksheetItem[] };
  cheatsheet?: { sheets: CheatSheet[] };
  toolkit?: { tools: ToolkitTool[] };
  templates?: { templates: TemplateItem[] };
  promptPack?: { categories: PromptCategory[] };
  bonusGuides?: { bonuses: BonusGuide[] };
  caseStudies?: { caseStudies: CaseStudy[] };
  multiplier?: { formats: MultiplierFormat[] };
}

export type AssetType = keyof ProductAssets;

export const ASSET_TYPE_CONFIG: Record<AssetType, { label: string; icon: string; description: string }> = {
  workbook: { label: "Workbook", icon: "BookOpen", description: "Worksheets & exercises for each chapter" },
  cheatsheet: { label: "Cheat Sheets", icon: "Zap", description: "Quick-reference guides & frameworks" },
  toolkit: { label: "Toolkit", icon: "Wrench", description: "Scripts, templates & checklists" },
  templates: { label: "Templates", icon: "FileText", description: "Reusable proposals, emails & offers" },
  promptPack: { label: "Prompt Pack", icon: "MessageSquare", description: "15-20 AI prompts for ChatGPT" },
  bonusGuides: { label: "Bonus Guides", icon: "Gift", description: "3-5 high-value bonus products" },
  caseStudies: { label: "Case Studies", icon: "TrendingUp", description: "Detailed before/after stories" },
  multiplier: { label: "Product Multiplier", icon: "Layers", description: "Turn 1 product into 6 formats" },
};
