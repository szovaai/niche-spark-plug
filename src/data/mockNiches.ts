import { NicheSnapshot, ProductPattern, KeywordIdea, TrendingTopic, PLRSource, LaunchPack, LaunchRecipe, StoreBlueprint } from "@/types/niche";

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

// Helper to check if a niche qualifies for "Fast Cash" filter
export const isFastCashNiche = (niche: NicheSnapshot): boolean => {
  const isHighDemand = niche.demandTier === "Hot" || niche.demandTier === "On Fire";
  const isLowCompetition = niche.competitionTier === "Easy" || niche.competitionTier === "Moderate";
  const isGoodPrice = niche.priceRange.min >= 4 && niche.priceRange.max <= 27;
  return isHighDemand && isLowCompetition && isGoodPrice;
};

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

// Launch Packs - Pre-curated Done-For-You packs
export const launchPacks: LaunchPack[] = [
  {
    id: "holiday-planner-pack",
    title: "Holiday Planner Quick-Start",
    slug: "holiday-planner",
    nicheName: "Holiday Planning",
    category: "Seasonal",
    whyHot: "Holiday planning searches spike 300% in Nov-Dec. Low competition for undated/reusable formats. Perfect impulse buy at $7-15.",
    plrSuggestion: {
      id: "plr-holiday",
      name: "PLR.me Holiday Bundle",
      description: "Complete holiday planning templates",
      features: ["50+ pages", "Editable Canva", "Commercial license"],
      category: "Planners",
      link: "#",
    },
    listingTitle: "2025 Holiday Planner Bundle | Printable Christmas Organizer | Gift List Budget Tracker",
    listingBullets: [
      "✨ Complete 30+ page holiday planning bundle",
      "🎁 Gift tracker, budget planner, menu planning",
      "📱 Works on iPad, tablet, or print at home",
      "⚡ Instant download - start planning today",
    ],
    imageRecommendations: [
      "Mockup on iPad with festive background",
      "Flat lay with Christmas decorations",
      "Page spread showing gift tracker",
    ],
    promoIdea: "Pin 'Holiday Planning Checklist' graphic to Pinterest with link. Best timing: early November.",
  },
  {
    id: "new-year-goals-pack",
    title: "New Year Goals Pack",
    slug: "new-year-goals",
    nicheName: "Goal Setting",
    category: "New Year",
    whyHot: "Goal-setting products see 5x demand in December-January. Evergreen appeal with seasonal spikes. Works as standalone or bundle upsell.",
    plrSuggestion: {
      id: "plr-goals",
      name: "IDPLR Goal Setting Kit",
      description: "Vision board and goal planning templates",
      features: ["Workbooks", "Trackers", "Vision board templates"],
      category: "Self-Improvement",
      link: "#",
    },
    listingTitle: "2026 Goal Setting Planner | Vision Board Kit | Habit Tracker Bundle | New Year Resolution",
    listingBullets: [
      "🎯 Set and achieve your 2026 goals",
      "📊 Monthly, weekly, and daily tracking pages",
      "✨ Includes vision board templates",
      "🖨️ Printable + digital iPad version included",
    ],
    imageRecommendations: [
      "Clean desk setup with planner open",
      "Vision board page spread",
      "Before/after goal tracking example",
    ],
    promoIdea: "Create Instagram Reel: '5 Goals That Will Change Your 2026' with planner in background.",
  },
  {
    id: "kids-learning-pack",
    title: "Kids Learning Activity Pack",
    slug: "kids-learning",
    nicheName: "Educational Printables",
    category: "Kids & Education",
    whyHot: "Parents constantly search for educational activities. Evergreen demand, especially homeschool market. Easy to create bundles.",
    plrSuggestion: {
      id: "plr-kids",
      name: "Content Sparks Kids Bundle",
      description: "Educational worksheets and activities",
      features: ["100+ worksheets", "Multiple age ranges", "Answer keys"],
      category: "Education",
      link: "#",
    },
    listingTitle: "Printable Learning Bundle for Kids | Preschool Worksheets | Educational Activities | Homeschool",
    listingBullets: [
      "📚 100+ pages of learning activities",
      "🎨 Coloring, tracing, counting, and more",
      "👶 Perfect for ages 3-7",
      "🏠 Great for homeschool or quiet time",
    ],
    imageRecommendations: [
      "Child's hand coloring a worksheet",
      "Spread of colorful activity pages",
      "Before/after completed worksheet",
    ],
    promoIdea: "Join Facebook homeschool groups and share free sample page with link to full bundle.",
  },
  {
    id: "social-media-canva-pack",
    title: "Social Media Canva Templates",
    slug: "social-media-templates",
    nicheName: "Social Media Marketing",
    category: "Business",
    whyHot: "Every small business owner needs social content. Recurring buyers as they need fresh templates. Higher price point ($15-30).",
    plrSuggestion: {
      id: "plr-social",
      name: "PLR.me Social Media Kit",
      description: "Canva templates for Instagram and Facebook",
      features: ["200+ templates", "Stories + Posts", "Engagement graphics"],
      category: "Marketing",
      link: "#",
    },
    listingTitle: "Canva Social Media Templates | Instagram Post Bundle | Small Business Marketing Kit",
    listingBullets: [
      "📱 200+ fully editable Canva templates",
      "✨ Instagram posts, stories, and reels covers",
      "💼 Perfect for coaches, shops, and creators",
      "🎨 Easily customize colors and fonts",
    ],
    imageRecommendations: [
      "Phone mockup showing Instagram grid",
      "Laptop with Canva editor open",
      "Before/after customization example",
    ],
    promoIdea: "Share a free 'Content Calendar' PDF on your email list, upsell the full template pack.",
  },
  {
    id: "self-care-journal-pack",
    title: "Self-Care Journal Bundle",
    slug: "self-care-journal",
    nicheName: "Wellness & Self-Care",
    category: "Health & Wellness",
    whyHot: "Mental wellness is a growing market. Appeals to broad audience. Great for bundles and subscriptions.",
    plrSuggestion: {
      id: "plr-selfcare",
      name: "IDPLR Wellness Journal",
      description: "Self-care and mindfulness journal templates",
      features: ["Gratitude pages", "Mood trackers", "Affirmations"],
      category: "Wellness",
      link: "#",
    },
    listingTitle: "Self-Care Journal Bundle | Mental Health Planner | Gratitude Diary | Mindfulness Tracker",
    listingBullets: [
      "💜 Complete self-care planning system",
      "🧘 Gratitude, mood tracking, and affirmations",
      "📖 Perfect for daily mindfulness practice",
      "✨ Beautiful minimal aesthetic design",
    ],
    imageRecommendations: [
      "Cozy setup with candle and journal",
      "Gratitude page with handwritten example",
      "Full spread showing different sections",
    ],
    promoIdea: "Create Pinterest board 'Self-Care Ideas' and pin journal pages as examples.",
  },
];

// 60-Minute Launch Recipes
export const getLaunchRecipe = (nicheId: string): LaunchRecipe[] => {
  return [
    {
      step: 1,
      title: "Grab Your PLR Base",
      description: "Choose a PLR product from our recommended sources. Look for one with editable files (Canva or Word format preferred).",
      timeEstimate: "5 min",
    },
    {
      step: 2,
      title: "Customize 3 Key Elements",
      description: "Change the cover design, update fonts/colors to match your brand, and add your logo or watermark.",
      timeEstimate: "15 min",
    },
    {
      step: 3,
      title: "Create Listing Images",
      description: "Make 5 mockup images: cover shot, page spread, device mockup, feature callout, and lifestyle shot.",
      timeEstimate: "15 min",
    },
    {
      step: 4,
      title: "Write Your Listing",
      description: "Use our title template and bullet points. Focus on benefits (save time, get organized) not features.",
      timeEstimate: "10 min",
    },
    {
      step: 5,
      title: "Set Price & Publish",
      description: "Price between the suggested range. Start slightly lower for first sales/reviews, then increase.",
      timeEstimate: "5 min",
    },
    {
      step: 6,
      title: "Quick Promo Boost",
      description: "Pin one image to Pinterest, share in one relevant Facebook group, or post to your Instagram.",
      timeEstimate: "10 min",
    },
  ];
};

// 1-Product Store Blueprint
export const getStoreBlueprint = (nicheId: string): StoreBlueprint => {
  const niche = nicheSnapshots.find(n => n.id === nicheId);
  const nicheName = niche?.name || "Digital Product";
  
  return {
    heroHeadline: `Get Your ${nicheName} Instantly – Download & Start Today`,
    sections: [
      { name: "Hero", description: "Bold headline + product mockup + 'Get Instant Access' CTA button" },
      { name: "Benefits", description: "3-4 benefit cards with icons: Save Time, Easy to Use, Instant Download, etc." },
      { name: "What's Inside", description: "Preview of pages/content with feature callouts" },
      { name: "Testimonials", description: "3 customer quotes with star ratings (placeholder ready)" },
      { name: "FAQ", description: "5 common questions: file format, how to download, refund policy, etc." },
      { name: "Final CTA", description: "Urgency message + price + download button" },
    ],
    recommendedPlatform: niche?.platform === "Etsy" ? "Shopify or Gumroad for higher margins" : "Shopify for brand building, Gumroad for simplicity",
    ctaSuggestion: "Get Instant Access – Only $X",
  };
};
