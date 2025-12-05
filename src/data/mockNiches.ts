import { NicheSnapshot, ProductPattern, KeywordIdea, TrendingTopic, PLRSource } from "@/types/niche";

export const trendingTopics: TrendingTopic[] = [
  { id: "1", name: "Minimalist 2026 Planners", platform: "Etsy", momentum: "rising", category: "Planners" },
  { id: "2", name: "Editable Holiday Coupon Books", platform: "Etsy", momentum: "rising", category: "Printables" },
  { id: "3", name: "Kids' Printable Activity Packs", platform: "Multiple", momentum: "rising", category: "Kids" },
  { id: "4", name: "AI Art Coloring Pages", platform: "Etsy", momentum: "rising", category: "Art" },
  { id: "5", name: "Budget Tracker Templates", platform: "Multiple", momentum: "steady", category: "Finance" },
  { id: "6", name: "Digital Recipe Cards", platform: "Etsy", momentum: "rising", category: "Food" },
  { id: "7", name: "Wedding Planning Bundles", platform: "Etsy", momentum: "steady", category: "Events" },
  { id: "8", name: "Social Media Templates", platform: "Multiple", momentum: "rising", category: "Marketing" },
];

export const nicheSnapshots: NicheSnapshot[] = [
  {
    id: "minimalist-planners",
    name: "Minimalist 2026 Planners",
    category: "Planners & Organization",
    demandTier: "On Fire",
    competitionTier: "Moderate",
    momentum: "rising",
    priceRange: { min: 7, max: 18 },
    salesTier: "Hot",
    platform: "Etsy",
  },
  {
    id: "holiday-coupon-books",
    name: "Editable Holiday Coupon Books",
    category: "Printables",
    demandTier: "Hot",
    competitionTier: "Easy",
    momentum: "rising",
    priceRange: { min: 4, max: 12 },
    salesTier: "Hot",
    platform: "Etsy",
  },
  {
    id: "kids-activity-packs",
    name: "Kids' Printable Activity Packs",
    category: "Kids & Education",
    demandTier: "On Fire",
    competitionTier: "Moderate",
    momentum: "rising",
    priceRange: { min: 5, max: 15 },
    salesTier: "On Fire",
    platform: "Multiple",
  },
  {
    id: "ai-coloring-pages",
    name: "AI Art Coloring Pages",
    category: "Art & Creativity",
    demandTier: "Hot",
    competitionTier: "Easy",
    momentum: "rising",
    priceRange: { min: 3, max: 10 },
    salesTier: "Spark",
    platform: "Etsy",
  },
  {
    id: "budget-trackers",
    name: "Budget Tracker Templates",
    category: "Finance & Business",
    demandTier: "Hot",
    competitionTier: "Saturated",
    momentum: "steady",
    priceRange: { min: 5, max: 20 },
    salesTier: "Hot",
    platform: "Multiple",
  },
  {
    id: "digital-recipe-cards",
    name: "Digital Recipe Cards",
    category: "Food & Lifestyle",
    demandTier: "Spark",
    competitionTier: "Easy",
    momentum: "rising",
    priceRange: { min: 4, max: 12 },
    salesTier: "Spark",
    platform: "Etsy",
  },
  {
    id: "wedding-planning",
    name: "Wedding Planning Bundles",
    category: "Events & Celebrations",
    demandTier: "On Fire",
    competitionTier: "Saturated",
    momentum: "steady",
    priceRange: { min: 15, max: 45 },
    salesTier: "On Fire",
    platform: "Etsy",
  },
  {
    id: "social-media-templates",
    name: "Social Media Templates",
    category: "Marketing & Business",
    demandTier: "Hot",
    competitionTier: "Moderate",
    momentum: "rising",
    priceRange: { min: 8, max: 25 },
    salesTier: "Hot",
    platform: "Multiple",
  },
];

export const getProductPatterns = (nicheId: string): ProductPattern[] => {
  const patterns: Record<string, ProductPattern[]> = {
    "minimalist-planners": [
      { id: "1", name: "Undated Minimalist Planner", priceRange: { min: 9, max: 15 }, formats: ["PDF", "Goodnotes"], difficulty: "Easy", seasonality: "Year-round, peaks Jan" },
      { id: "2", name: "Weekly/Monthly Bundle", priceRange: { min: 12, max: 18 }, formats: ["PDF", "Printable"], difficulty: "Medium" },
      { id: "3", name: "Goal Setting Planner", priceRange: { min: 7, max: 12 }, formats: ["PDF"], difficulty: "Easy", seasonality: "Peaks Dec-Jan" },
      { id: "4", name: "Digital Planner for iPad", priceRange: { min: 15, max: 25 }, formats: ["Goodnotes", "Notability"], difficulty: "Advanced" },
    ],
    "holiday-coupon-books": [
      { id: "1", name: "Editable Love Coupon Book", priceRange: { min: 5, max: 10 }, formats: ["Canva", "PDF"], difficulty: "Easy", seasonality: "Valentine's, Anniversary" },
      { id: "2", name: "Kids Holiday Coupon Pack", priceRange: { min: 4, max: 8 }, formats: ["PDF"], difficulty: "Easy", seasonality: "Christmas, Birthday" },
      { id: "3", name: "Self-Care Coupon Bundle", priceRange: { min: 6, max: 12 }, formats: ["Canva"], difficulty: "Medium" },
    ],
    "kids-activity-packs": [
      { id: "1", name: "Printable Advent Calendar Activities", priceRange: { min: 6, max: 12 }, formats: ["PDF"], difficulty: "Medium", seasonality: "Nov-Dec" },
      { id: "2", name: "Learning Worksheets Bundle", priceRange: { min: 8, max: 15 }, formats: ["PDF"], difficulty: "Medium" },
      { id: "3", name: "Coloring Pages Collection", priceRange: { min: 4, max: 8 }, formats: ["PDF"], difficulty: "Easy" },
      { id: "4", name: "Educational Games Pack", priceRange: { min: 10, max: 18 }, formats: ["PDF", "Interactive"], difficulty: "Advanced" },
    ],
  };
  return patterns[nicheId] || [
    { id: "1", name: "Starter Template Pack", priceRange: { min: 5, max: 12 }, formats: ["PDF"], difficulty: "Easy" },
    { id: "2", name: "Premium Bundle", priceRange: { min: 12, max: 25 }, formats: ["PDF", "Canva"], difficulty: "Medium" },
  ];
};

export const getKeywordIdeas = (nicheId: string): KeywordIdea[] => {
  const keywords: Record<string, KeywordIdea[]> = {
    "minimalist-planners": [
      { keyword: "undated planner printable", demandTier: "Hot", competitionTier: "Moderate", suggestedProductType: "PDF Bundle" },
      { keyword: "minimalist weekly planner", demandTier: "On Fire", competitionTier: "Saturated", suggestedProductType: "Digital Planner" },
      { keyword: "aesthetic 2026 planner", demandTier: "Hot", competitionTier: "Easy", suggestedProductType: "Printable Set" },
      { keyword: "goodnotes planner template", demandTier: "On Fire", competitionTier: "Moderate", suggestedProductType: "Digital Planner" },
      { keyword: "simple daily planner", demandTier: "Spark", competitionTier: "Easy", suggestedProductType: "PDF Single" },
    ],
    "holiday-coupon-books": [
      { keyword: "valentine coupon book printable", demandTier: "Hot", competitionTier: "Easy", suggestedProductType: "Editable Canva" },
      { keyword: "christmas coupon book kids", demandTier: "Hot", competitionTier: "Easy", suggestedProductType: "PDF Bundle" },
      { keyword: "anniversary gift coupons", demandTier: "Spark", competitionTier: "Easy", suggestedProductType: "Editable Template" },
    ],
    "kids-activity-packs": [
      { keyword: "printable activities for kids", demandTier: "On Fire", competitionTier: "Moderate", suggestedProductType: "Mega Bundle" },
      { keyword: "educational worksheets preschool", demandTier: "Hot", competitionTier: "Saturated", suggestedProductType: "Themed Pack" },
      { keyword: "toddler busy book printable", demandTier: "Hot", competitionTier: "Moderate", suggestedProductType: "Activity Book" },
    ],
  };
  return keywords[nicheId] || [
    { keyword: `${nicheId} template`, demandTier: "Spark", competitionTier: "Easy", suggestedProductType: "Starter Template" },
  ];
};

export const getPLRSources = (nicheId: string): PLRSource[] => {
  return [
    {
      id: "plr-me",
      name: "PLR.me",
      description: "Premium PLR content for coaches and course creators",
      features: ["10,000+ articles", "Editable graphics", "Video scripts"],
      category: "All-in-One",
      link: "#",
      nicheRelevance: "Great for planner content and worksheets",
    },
    {
      id: "idplr",
      name: "IDPLR",
      description: "Massive collection of digital products with full PLR rights",
      features: ["12,500+ products", "Software included", "Membership site"],
      category: "Bulk Downloads",
      link: "#",
      nicheRelevance: "Good for templates and graphics",
    },
    {
      id: "content-sparks",
      name: "Content Sparks",
      description: "White-label courses and training materials",
      features: ["Full courses", "Slide decks", "Workbooks"],
      category: "Courses",
      link: "#",
      nicheRelevance: "Perfect for educational content bundles",
    },
  ];
};