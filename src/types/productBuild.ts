import { ProductBlueprint } from "./niche";
import { PersonalizationData } from "./personalization";
import { BundleVariants } from "./bundle";
import { LaunchKit } from "./launchKit";
import { PlaybookProgress } from "./playbook";

export interface ProductBuild {
  id: string;
  user_id: string;
  niche_id: string;
  niche_name: string;
  product_type: string;
  product_name: string;
  
  // Personalization
  target_audience: string;
  transformation_focus: string;
  style_vibe: string;
  price_tier: string;
  
  // Generated content
  blueprint: ProductBlueprint;
  bundles?: BundleVariants;
  launch_kit?: LaunchKit;
  ecovers?: {
    mockup3d?: string;
    thumbnail?: string;
    pinterestPin?: string;
    instagramSquare?: string;
  };
  
  // Status
  status: 'in_progress' | 'complete';
  completion_steps: {
    blueprint: boolean;
    ecovers: boolean;
    bundles: boolean;
    launchKit: boolean;
  };
  playbook_progress?: PlaybookProgress;
  
  created_at: string;
  updated_at: string;
}

export interface CompletionStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
}
