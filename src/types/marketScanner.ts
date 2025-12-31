export interface MarketProduct {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  reviews?: number;
  salesSignal: 'hot' | 'rising' | 'steady' | 'new';
  seller: string;
  marketplace: 'etsy' | 'gumroad';
  url: string;
  thumbnail?: string;
  description?: string;
}

export interface MarketInsights {
  avgPrice: string;
  priceRange: { min: number; max: number };
  topPatterns: string[];
  opportunities: string[];
  commonElements: string[];
  missingElements: string[];
}

export interface MarketScanResult {
  products: MarketProduct[];
  insights: MarketInsights;
  query: string;
  marketplace: 'etsy' | 'gumroad' | 'all';
  totalFound: number;
}

export interface MarketScanFilters {
  marketplace: ('etsy' | 'gumroad')[];
  priceRange: { min: number; max: number };
  sortBy: 'reviews' | 'price-low' | 'price-high' | 'newest';
}
