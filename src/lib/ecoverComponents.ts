import { Book, ClipboardList, CheckSquare, Link, FileText, HelpCircle, LucideIcon } from "lucide-react";

export interface ComponentVisual {
  id: string;
  name: string;
  visualDescription: string;
  icon: LucideIcon;
  promptFragment: string;
}

/**
 * Canonical mapping of toolkit components to their exact visual representations.
 * RULE: Each component maps to exactly ONE visual object in the eCover.
 */
export const COMPONENT_VISUALS: ComponentVisual[] = [
  {
    id: "guide",
    name: "Main Guide",
    visualDescription: "3D hardcover book mockup",
    icon: Book,
    promptFragment: "A premium 3D hardcover book with matte finish, the product title visible on spine and front cover, slight shadow beneath"
  },
  {
    id: "worksheet",
    name: "Worksheet Pack",
    visualDescription: "Stacked worksheets on clipboard",
    icon: ClipboardList,
    promptFragment: "3-5 stacked worksheet pages with subtle grid lines, 'Worksheets' header label visible, optional clipboard backing with realistic depth"
  },
  {
    id: "checklist",
    name: "Checklist",
    visualDescription: "Single checklist page with checkmarks",
    icon: CheckSquare,
    promptFragment: "Single clean checklist page with 5-7 visible checkmarks in a vertical list, 'Checklist' header at top, minimal text blocks"
  },
  {
    id: "resourceList",
    name: "Resource List",
    visualDescription: "Resource document card",
    icon: Link,
    promptFragment: "Card-style document with icon bullets representing tools and links, clean professional layout, 'Resources' header"
  },
  {
    id: "templates",
    name: "Templates",
    visualDescription: "Swipe file template sheets",
    icon: FileText,
    promptFragment: "Layered swipe-file style sheets with 'Templates' header bars, visible depth effect between sheets, professional document styling"
  },
  {
    id: "quiz",
    name: "Quiz",
    visualDescription: "Quiz question card",
    icon: HelpCircle,
    promptFragment: "Interactive quiz card showing question format with multiple choice indicators visible, clean modern design"
  }
];

/**
 * Get the visual configuration for a specific component
 */
export function getComponentVisual(componentId: string): ComponentVisual | undefined {
  return COMPONENT_VISUALS.find(c => c.id === componentId);
}

/**
 * Build prompt fragments for selected components
 */
export function buildComponentPrompts(selectedComponents: string[]): string[] {
  return selectedComponents
    .map(id => getComponentVisual(id))
    .filter((v): v is ComponentVisual => v !== undefined)
    .map((v, index) => `${index + 1}. ${v.name}: ${v.promptFragment}`);
}

/**
 * Get display names for selected components
 */
export function getComponentNames(selectedComponents: string[]): string[] {
  return selectedComponents
    .map(id => getComponentVisual(id)?.name)
    .filter((name): name is string => name !== undefined);
}
