import { ToolkitComponents } from "@/types/toolkit";

export interface ToolkitTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  suggestedNiche: string;
  suggestedTitle: string;
  suggestedAudience: string;
  components: ToolkitComponents;
  placeholderContent: {
    guideTopics?: string[];
    worksheetIdeas?: string[];
    checklistItems?: string[];
    quizTopic?: string;
  };
}

export const TOOLKIT_TEMPLATES: ToolkitTemplate[] = [
  {
    id: "coaching",
    name: "Coaching Toolkit",
    category: "Personal Development",
    description: "Perfect for life coaches, business coaches, and mentors. Includes goal-setting worksheets, progress trackers, and motivational guides.",
    icon: "🎯",
    suggestedNiche: "Life Coaching",
    suggestedTitle: "Ultimate Goal Achievement Toolkit",
    suggestedAudience: "Aspiring entrepreneurs and professionals seeking personal growth",
    components: {
      guide: true,
      worksheet: true,
      checklist: true,
      resourceList: true,
      templates: false,
      quiz: true,
    },
    placeholderContent: {
      guideTopics: ["Setting SMART Goals", "Overcoming Mental Blocks", "Building Daily Habits", "Tracking Progress"],
      worksheetIdeas: ["Weekly Goal Planner", "Vision Board Template", "Accountability Partner Sheet"],
      checklistItems: ["Define your 90-day vision", "Break down into weekly milestones", "Set up accountability system"],
      quizTopic: "What's Your Goal-Setting Style?",
    },
  },
  {
    id: "marketing",
    name: "Marketing Toolkit",
    category: "Business",
    description: "Email templates, content calendars, and social media checklists for marketers and business owners.",
    icon: "📈",
    suggestedNiche: "Digital Marketing",
    suggestedTitle: "Content Marketing Mastery Kit",
    suggestedAudience: "Small business owners and solopreneurs",
    components: {
      guide: true,
      worksheet: false,
      checklist: true,
      resourceList: true,
      templates: true,
      quiz: false,
    },
    placeholderContent: {
      guideTopics: ["Content Strategy Basics", "Email Marketing Fundamentals", "Social Media Best Practices"],
      checklistItems: ["Audit existing content", "Define target audience", "Create content calendar", "Set up analytics"],
    },
  },
  {
    id: "productivity",
    name: "Productivity Toolkit",
    category: "Productivity",
    description: "Time management systems, daily planners, and focus techniques for busy professionals.",
    icon: "⚡",
    suggestedNiche: "Productivity & Time Management",
    suggestedTitle: "Peak Productivity System",
    suggestedAudience: "Busy professionals and remote workers",
    components: {
      guide: true,
      worksheet: true,
      checklist: true,
      resourceList: false,
      templates: true,
      quiz: false,
    },
    placeholderContent: {
      guideTopics: ["Time Blocking Mastery", "The Pomodoro Method", "Eliminating Distractions", "Weekly Review Process"],
      worksheetIdeas: ["Daily Time Block Planner", "Weekly Priority Matrix", "Energy Management Tracker"],
      checklistItems: ["Morning routine setup", "Workspace optimization", "Digital declutter", "Weekly planning session"],
    },
  },
  {
    id: "health",
    name: "Health & Wellness Toolkit",
    category: "Health",
    description: "Meal planners, workout trackers, and mindfulness guides for health-conscious audiences.",
    icon: "🧘",
    suggestedNiche: "Health & Wellness",
    suggestedTitle: "30-Day Wellness Transformation Kit",
    suggestedAudience: "Health-conscious individuals starting their wellness journey",
    components: {
      guide: true,
      worksheet: true,
      checklist: true,
      resourceList: true,
      templates: false,
      quiz: true,
    },
    placeholderContent: {
      guideTopics: ["Nutrition Basics", "Building Exercise Habits", "Sleep Optimization", "Stress Management"],
      worksheetIdeas: ["Weekly Meal Planner", "Workout Log", "Mood & Energy Tracker"],
      checklistItems: ["Pantry clean-out", "Set up workout space", "Download meditation app", "Schedule check-ups"],
      quizTopic: "What's Your Wellness Personality?",
    },
  },
  {
    id: "finance",
    name: "Finance Toolkit",
    category: "Finance",
    description: "Budget templates, savings trackers, and investment guides for money management.",
    icon: "💰",
    suggestedNiche: "Personal Finance",
    suggestedTitle: "Money Mastery Starter Kit",
    suggestedAudience: "Young professionals looking to take control of their finances",
    components: {
      guide: true,
      worksheet: true,
      checklist: true,
      resourceList: true,
      templates: true,
      quiz: false,
    },
    placeholderContent: {
      guideTopics: ["Budgeting 101", "Emergency Fund Building", "Debt Payoff Strategies", "Investing Basics"],
      worksheetIdeas: ["Monthly Budget Template", "Net Worth Tracker", "Savings Goal Planner"],
      checklistItems: ["Calculate net worth", "Track 30 days of spending", "Set up automatic savings", "Review subscriptions"],
    },
  },
  {
    id: "creative",
    name: "Creative Business Toolkit",
    category: "Creative",
    description: "Client workflow templates, pricing guides, and portfolio checklists for freelancers and creatives.",
    icon: "🎨",
    suggestedNiche: "Freelance & Creative Business",
    suggestedTitle: "Freelancer Success Kit",
    suggestedAudience: "Freelancers and creative professionals",
    components: {
      guide: true,
      worksheet: false,
      checklist: true,
      resourceList: true,
      templates: true,
      quiz: false,
    },
    placeholderContent: {
      guideTopics: ["Pricing Your Services", "Client Communication", "Building Your Portfolio", "Managing Multiple Projects"],
      checklistItems: ["Define service packages", "Create contract template", "Set up invoicing system", "Build portfolio site"],
    },
  },
  {
    id: "blank",
    name: "Start from Scratch",
    category: "Custom",
    description: "Begin with a blank canvas and build your toolkit exactly how you want it.",
    icon: "✨",
    suggestedNiche: "",
    suggestedTitle: "",
    suggestedAudience: "",
    components: {
      guide: true,
      worksheet: false,
      checklist: false,
      resourceList: false,
      templates: false,
      quiz: false,
    },
    placeholderContent: {},
  },
];

export const getTemplateById = (id: string): ToolkitTemplate | undefined => {
  return TOOLKIT_TEMPLATES.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: string): ToolkitTemplate[] => {
  return TOOLKIT_TEMPLATES.filter(t => t.category === category);
};
