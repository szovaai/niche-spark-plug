export interface ProductBlueprint {
  productName: string;
  productType: string;
  nicheName: string;
  pricePoint: number;
  estimatedTimeToCreate: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  keyFeatures: string[];
}

export interface DailyChallenge {
  day: number;
  title: string;
  description: string;
  estimatedTime: string;
  actionItems: string[];
  proTip?: string;
  completed?: boolean;
}

export interface FirstSalePlan {
  product: ProductBlueprint;
  totalTimeEstimate: string;
  potentialFirstMonthRevenue: string;
  steps: {
    step: number;
    title: string;
    description: string;
    duration: string;
    tasks: string[];
  }[];
}

export interface MoneyMapData {
  starterProducts: ProductBlueprint[];
  firstSalePlan: FirstSalePlan;
  dailyChallenges: DailyChallenge[];
  quickTips: string[];
  milestones: {
    title: string;
    description: string;
    reward: string;
    targetDate: string;
  }[];
}

export const STARTER_PRODUCTS: ProductBlueprint[] = [
  {
    productName: "Digital Habit Tracker Bundle",
    productType: "Printable Pack",
    nicheName: "Self-Improvement",
    pricePoint: 5.99,
    estimatedTimeToCreate: "2-3 hours",
    difficulty: "Easy",
    description: "A set of printable habit trackers for daily, weekly, and monthly goal tracking",
    keyFeatures: [
      "30-day habit tracker",
      "Weekly reflection sheet",
      "Monthly goal planner",
      "Minimalist design"
    ]
  },
  {
    productName: "Social Media Content Calendar",
    productType: "Canva Template",
    nicheName: "Business/Marketing",
    pricePoint: 12.99,
    estimatedTimeToCreate: "3-4 hours",
    difficulty: "Medium",
    description: "Editable Canva template for planning 30 days of social media content",
    keyFeatures: [
      "30 post templates",
      "Caption prompts",
      "Hashtag suggestions",
      "Content calendar"
    ]
  },
  {
    productName: "Budget Planner Spreadsheet",
    productType: "Spreadsheet",
    nicheName: "Personal Finance",
    pricePoint: 8.99,
    estimatedTimeToCreate: "4-5 hours",
    difficulty: "Medium",
    description: "Google Sheets budget tracker with automatic calculations",
    keyFeatures: [
      "Income tracking",
      "Expense categories",
      "Savings goals",
      "Visual charts"
    ]
  }
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    day: 1,
    title: "Pick Your First Product",
    description: "Choose one product from your starter blueprint to create first",
    estimatedTime: "15 min",
    actionItems: [
      "Review all 3 starter products",
      "Pick the one that excites you most",
      "Write down why you chose it"
    ],
    proTip: "Don't overthink it! Your first product doesn't need to be perfect."
  },
  {
    day: 2,
    title: "Research 5 Competitors",
    description: "Find 5 similar products on Etsy and note what you like/dislike",
    estimatedTime: "30 min",
    actionItems: [
      "Search your product type on Etsy",
      "Save 5 listings that catch your eye",
      "Note their prices, reviews, and style"
    ],
    proTip: "Look for 1-2 things you can do BETTER than each competitor."
  },
  {
    day: 3,
    title: "Create Your First Draft",
    description: "Build a rough version of your digital product",
    estimatedTime: "2-3 hours",
    actionItems: [
      "Open Canva or your design tool",
      "Create a basic version",
      "Don't worry about perfection yet"
    ]
  },
  {
    day: 4,
    title: "Polish & Perfect",
    description: "Refine your product and make it sale-ready",
    estimatedTime: "2 hours",
    actionItems: [
      "Add finishing touches",
      "Create multiple file formats (PDF, PNG)",
      "Test all downloads work"
    ]
  },
  {
    day: 5,
    title: "Write Your Listing",
    description: "Craft a compelling title and description",
    estimatedTime: "1 hour",
    actionItems: [
      "Write 5 title options",
      "Create bullet points of benefits",
      "Write your full description"
    ],
    proTip: "Focus on benefits, not features. How does this help the buyer?"
  },
  {
    day: 6,
    title: "Create Mockups",
    description: "Make eye-catching listing images",
    estimatedTime: "1-2 hours",
    actionItems: [
      "Create main listing image",
      "Add 3-4 additional preview images",
      "Show product in use if possible"
    ]
  },
  {
    day: 7,
    title: "Launch Day!",
    description: "Publish your first product and celebrate!",
    estimatedTime: "30 min",
    actionItems: [
      "Set up your Etsy/Gumroad account",
      "Upload your product",
      "Publish and share!",
      "Celebrate your first listing! 🎉"
    ],
    proTip: "Share on social media and tell friends. Your first sale often comes from your network!"
  }
];
