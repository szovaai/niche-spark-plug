export interface ResearchNiche {
  id: string;
  label: string;
  category: string;
  emoji: string;
  description: string;
  keywords: string[];
}

export const NICHE_CATEGORIES = [
  "Health & Wellness",
  "Finance & Money",
  "Productivity",
  "Parenting",
  "Education",
  "Business & Marketing",
  "Hobbies & Crafts",
  "Spirituality",
  "Pets",
  "Relationships",
  "AI & Tech",
  "Self-Development",
] as const;

export const RESEARCH_NICHES: ResearchNiche[] = [
  // Health & Wellness
  { id: "weight-loss", label: "Weight Loss", category: "Health & Wellness", emoji: "⚖️", description: "Diets, fat loss programs, metabolism", keywords: ["weight loss", "fat burn", "diet", "metabolism"] },
  { id: "fitness", label: "Fitness & Workouts", category: "Health & Wellness", emoji: "💪", description: "Home workouts, strength, mobility", keywords: ["fitness", "workout", "strength training", "home gym"] },
  { id: "mental-health", label: "Mental Health & Anxiety", category: "Health & Wellness", emoji: "🧠", description: "Anxiety, stress, depression, calm", keywords: ["anxiety", "mental health", "stress", "burnout"] },
  { id: "sleep", label: "Sleep & Insomnia", category: "Health & Wellness", emoji: "😴", description: "Better sleep, insomnia fixes", keywords: ["sleep", "insomnia", "rest", "circadian"] },

  // Finance & Money
  { id: "personal-finance", label: "Personal Finance", category: "Finance & Money", emoji: "💰", description: "Budgeting, saving, debt payoff", keywords: ["budget", "save money", "debt free", "personal finance"] },
  { id: "investing", label: "Investing & Stocks", category: "Finance & Money", emoji: "📈", description: "Stocks, ETFs, dividends", keywords: ["investing", "stocks", "ETF", "dividends"] },
  { id: "side-hustles", label: "Side Hustles", category: "Finance & Money", emoji: "🚀", description: "Make money online, side income", keywords: ["side hustle", "make money online", "side income"] },
  { id: "crypto", label: "Crypto & Web3", category: "Finance & Money", emoji: "₿", description: "Bitcoin, altcoins, Web3", keywords: ["crypto", "bitcoin", "web3", "blockchain"] },

  // Productivity
  { id: "productivity", label: "Productivity Systems", category: "Productivity", emoji: "⚡", description: "Time management, focus, GTD", keywords: ["productivity", "time management", "focus", "GTD"] },
  { id: "notion-templates", label: "Notion & Templates", category: "Productivity", emoji: "📋", description: "Notion templates, dashboards", keywords: ["notion", "templates", "dashboard", "second brain"] },

  // Parenting
  { id: "parenting", label: "Parenting Toddlers", category: "Parenting", emoji: "👶", description: "Toddler behavior, discipline", keywords: ["parenting", "toddler", "discipline", "kids"] },
  { id: "homeschool", label: "Homeschooling", category: "Parenting", emoji: "🏡", description: "Curriculum, planners, activities", keywords: ["homeschool", "curriculum", "kids learning"] },

  // Education
  { id: "language-learning", label: "Language Learning", category: "Education", emoji: "🗣️", description: "Spanish, English, languages", keywords: ["language", "spanish", "english fluency"] },
  { id: "study-skills", label: "Study Skills & Exams", category: "Education", emoji: "📚", description: "Test prep, study methods", keywords: ["study", "exam prep", "memory", "students"] },

  // Business & Marketing
  { id: "freelancing", label: "Freelancing", category: "Business & Marketing", emoji: "💼", description: "Upwork, clients, freelance income", keywords: ["freelance", "upwork", "clients"] },
  { id: "ecommerce", label: "E-Commerce & Shopify", category: "Business & Marketing", emoji: "🛒", description: "Shopify, dropshipping, stores", keywords: ["ecommerce", "shopify", "dropshipping"] },
  { id: "social-media", label: "Social Media Growth", category: "Business & Marketing", emoji: "📱", description: "Instagram, TikTok, growth", keywords: ["instagram", "tiktok", "social media growth"] },
  { id: "email-marketing", label: "Email Marketing", category: "Business & Marketing", emoji: "✉️", description: "Lists, automations, deliverability", keywords: ["email marketing", "newsletter", "list building"] },
  { id: "copywriting", label: "Copywriting", category: "Business & Marketing", emoji: "✍️", description: "Sales copy, conversion writing", keywords: ["copywriting", "sales copy", "conversion"] },

  // Hobbies & Crafts
  { id: "crafts", label: "Crafts & DIY", category: "Hobbies & Crafts", emoji: "🎨", description: "Crochet, knitting, DIY projects", keywords: ["crafts", "DIY", "crochet", "knitting"] },
  { id: "gardening", label: "Gardening", category: "Hobbies & Crafts", emoji: "🌱", description: "Vegetables, indoor plants", keywords: ["gardening", "plants", "vegetable garden"] },
  { id: "cooking", label: "Cooking & Recipes", category: "Hobbies & Crafts", emoji: "🍳", description: "Meal plans, recipes, batch cooking", keywords: ["cooking", "recipes", "meal prep"] },

  // Spirituality
  { id: "manifestation", label: "Manifestation & Mindset", category: "Spirituality", emoji: "✨", description: "Law of attraction, manifesting", keywords: ["manifestation", "law of attraction", "mindset"] },
  { id: "meditation", label: "Meditation & Mindfulness", category: "Spirituality", emoji: "🧘", description: "Meditation, mindfulness, calm", keywords: ["meditation", "mindfulness"] },

  // Pets
  { id: "dog-training", label: "Dog Training", category: "Pets", emoji: "🐕", description: "Puppy training, behavior", keywords: ["dog training", "puppy", "obedience"] },
  { id: "cat-care", label: "Cat Care", category: "Pets", emoji: "🐈", description: "Cat behavior, care guides", keywords: ["cats", "cat care", "kitten"] },

  // Relationships
  { id: "dating", label: "Dating & Attraction", category: "Relationships", emoji: "💘", description: "Dating advice, attraction", keywords: ["dating", "attraction", "relationships"] },
  { id: "marriage", label: "Marriage & Communication", category: "Relationships", emoji: "💍", description: "Couples, communication, intimacy", keywords: ["marriage", "couples", "communication"] },

  // AI & Tech
  { id: "ai-tools", label: "AI Tools & ChatGPT", category: "AI & Tech", emoji: "🤖", description: "ChatGPT, prompts, AI workflows", keywords: ["AI", "chatgpt", "prompts", "automation"] },
  { id: "no-code", label: "No-Code & Automation", category: "AI & Tech", emoji: "⚙️", description: "Zapier, Make, no-code apps", keywords: ["no-code", "automation", "zapier", "make"] },

  // Self-Development
  { id: "habits", label: "Habits & Routines", category: "Self-Development", emoji: "🔄", description: "Morning routines, habit building", keywords: ["habits", "routine", "discipline"] },
  { id: "confidence", label: "Confidence & Self-Esteem", category: "Self-Development", emoji: "🌟", description: "Confidence, self-worth, courage", keywords: ["confidence", "self-esteem", "self worth"] },
];

export const NICHES_BY_CATEGORY = NICHE_CATEGORIES.reduce((acc, cat) => {
  acc[cat] = RESEARCH_NICHES.filter(n => n.category === cat);
  return acc;
}, {} as Record<string, ResearchNiche[]>);
