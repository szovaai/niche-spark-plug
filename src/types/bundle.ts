export interface BundleVariant {
  name: string;
  description: string;
  priceRange: { min: number; max: number };
  keyFeatures: string[];
  listingTitle: string;
  quickPitch: string;
}

export interface LiteVersion extends BundleVariant {
  pageCount: number;
}

export interface BonusAddOn extends BundleVariant {
  format: string;
}

export interface PremiumBundle {
  name: string;
  description: string;
  includedItems: string[];
  totalValue: number;
  bundlePrice: { min: number; max: number };
  savingsPercent: number;
  listingTitle: string;
  quickPitch: string;
}

export interface BundleStrategy {
  upsellFlow: string;
  crossPromotionIdeas: string[];
  seasonalTip: string;
}

export interface BundleVariants {
  liteVersion: LiteVersion;
  bonusAddOn: BonusAddOn;
  premiumBundle: PremiumBundle;
  bundleStrategy: BundleStrategy;
}
