export interface ListingKit {
  titles: {
    primary: string;
    alternative1: string;
    alternative2: string;
  };
  etsyTags: string[];
  descriptions: {
    short: string;
    long: string;
    gumroad: string;
    shopify: string;
  };
  pricingStrategy: {
    suggestedPrice: number;
    launchPrice: number;
    bundlePrice: number;
    psychology: string;
  };
  policies: {
    refundPolicy: string;
    licensingText: string;
    faq: Array<{ question: string; answer: string }>;
  };
  seoKeywords: string[];
}

export interface ListingKitRequest {
  blueprint: any;
  personalization: any;
  platform: 'etsy' | 'gumroad' | 'shopify' | 'all';
  nicheName: string;
}
