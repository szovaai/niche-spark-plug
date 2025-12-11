export interface FeeBreakdown {
  platformFee: number;
  transactionFee: number;
  paymentProcessing: number;
  listingFee: number;
  offsiteAds: number;
  totalFees: number;
  netProfit: number;
}

export interface ProfitCalculation {
  nicheName: string;
  productType: string;
  pricePoint: number;
  platform: 'etsy' | 'gumroad' | 'shopify';
  
  // Projections (per month)
  dailyTrafficEstimate: { low: number; mid: number; high: number };
  conversionRateEstimate: { low: number; mid: number; high: number };
  monthlySalesEstimate: { low: number; mid: number; high: number };
  monthlyRevenueEstimate: { low: number; mid: number; high: number };
  monthlyProfitEstimate: { low: number; mid: number; high: number };
  
  // Ratings
  competitionLevel: 'Easy' | 'Moderate' | 'Saturated';
  effortRating: 'Low' | 'Medium' | 'High';
  profitPotential: 'Low' | 'Good' | 'Great' | 'Excellent';
  
  // Breakdown
  feeBreakdown: FeeBreakdown;
  assumptions: string[];
  improvementTips: string[];
}

export const PLATFORM_FEES = {
  etsy: {
    listingFee: 0.20,
    transactionFeePercent: 0.065,
    paymentProcessingPercent: 0.03,
    paymentProcessingFixed: 0.25,
    offsiteAdsPercent: 0.15, // Only if opted in
  },
  gumroad: {
    transactionFeePercent: 0.10, // 10% flat
    paymentProcessingPercent: 0,
    paymentProcessingFixed: 0,
    listingFee: 0,
    offsiteAdsPercent: 0,
  },
  shopify: {
    transactionFeePercent: 0.029,
    paymentProcessingFixed: 0.30,
    paymentProcessingPercent: 0,
    listingFee: 0,
    offsiteAdsPercent: 0,
    // Monthly subscription not included in per-sale calc
  },
};

export const EFFORT_BY_PRODUCT_TYPE: Record<string, 'Low' | 'Medium' | 'High'> = {
  'Printable Pack': 'Low',
  'Planner': 'Medium',
  'Canva Template': 'Low',
  'Notion Template': 'Medium',
  'Spreadsheet': 'Medium',
  'Guide/Ebook': 'High',
  'Wall Art Pack': 'Low',
  'Social Media Kit': 'Medium',
  'Digital Stickers': 'Low',
};
