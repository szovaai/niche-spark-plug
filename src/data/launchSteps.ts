import { LaunchPlatform, LaunchStep, PlatformInfo } from "@/types/launch";

export const PLATFORM_INFO: Record<LaunchPlatform, PlatformInfo> = {
  gumroad: {
    id: "gumroad",
    name: "Gumroad",
    tagline: "Fastest & Beginner-Friendly",
    description: "Perfect for your first sale. Handles everything: files, payments, taxes, and delivery.",
    pros: [
      "Free to start (small fee per sale)",
      "Handles taxes/VAT automatically",
      "Instant checkout links",
      "Built-in audience features"
    ],
    cons: [
      "Higher fees than some alternatives",
      "Limited customization"
    ],
    setupUrl: "https://gumroad.com",
    icon: "ShoppingBag",
    recommended: true
  },
  warriorplus: {
    id: "warriorplus",
    name: "WarriorPlus",
    tagline: "Affiliate-Powered Sales",
    description: "Best for internet marketing products with affiliate launches.",
    pros: [
      "Built-in affiliate marketplace",
      "Launch support system",
      "Free to list"
    ],
    cons: [
      "Approval required",
      "IM-focused audience",
      "Steeper learning curve"
    ],
    setupUrl: "https://warriorplus.com",
    icon: "Swords"
  },
  digistore24: {
    id: "digistore24",
    name: "Digistore24",
    tagline: "Global Reach",
    description: "International sales with automatic VAT handling and multi-currency support.",
    pros: [
      "Global payment support",
      "Automatic VAT handling",
      "Affiliate marketplace",
      "Multiple currencies"
    ],
    cons: [
      "More complex setup",
      "Approval process"
    ],
    setupUrl: "https://www.digistore24.com",
    icon: "Globe"
  },
  systeme: {
    id: "systeme",
    name: "Systeme.io",
    tagline: "Free Funnel Builder",
    description: "All-in-one platform with sales pages, email marketing, and payments.",
    pros: [
      "Generous free plan",
      "Built-in email marketing",
      "Funnel builder included",
      "No coding required"
    ],
    cons: [
      "Less customization on free tier",
      "Learning curve for funnels"
    ],
    setupUrl: "https://systeme.io",
    icon: "Workflow"
  },
  custom: {
    id: "custom",
    name: "Self-Hosted",
    tagline: "Full Control",
    description: "Use your own website with Stripe or PayPal for maximum control.",
    pros: [
      "Full ownership",
      "Lower fees",
      "Complete customization",
      "Your own branding"
    ],
    cons: [
      "More technical setup",
      "You handle everything"
    ],
    setupUrl: "",
    icon: "Code"
  }
};

export const LAUNCH_STEPS: LaunchStep[] = [
  // Pre-launch checklist
  {
    id: "pre-check-guide",
    category: "pre-launch",
    title: "Main Guide Ready",
    description: "Your PDF guide is complete and downloaded",
    platform: "all",
    timeEstimate: "Already done",
    instructions: [
      "Download your guide from the toolkit builder",
      "Open it to verify formatting looks correct",
      "Check all chapters are present"
    ],
    tips: ["Your guide was generated in the toolkit builder - just download it if you haven't already"]
  },
  {
    id: "pre-check-bonuses",
    category: "pre-launch",
    title: "Bonuses Prepared",
    description: "Worksheets, checklists, and other bonuses are ready",
    platform: "all",
    timeEstimate: "Already done",
    instructions: [
      "Download your complete toolkit ZIP",
      "Verify all bonus files are included",
      "Consider which bonuses to highlight in marketing"
    ],
    tips: ["More bonuses = higher perceived value"]
  },
  {
    id: "pre-check-cover",
    category: "pre-launch",
    title: "Cover Images Ready",
    description: "E-cover and bundle images are created",
    platform: "all",
    timeEstimate: "Already done",
    instructions: [
      "Download your e-cover from the toolkit builder",
      "Save in PNG format for best quality",
      "Create multiple sizes if needed (thumbnail, full)"
    ],
    tips: ["Professional covers increase conversions by 40%+"]
  },
  {
    id: "pre-check-sales",
    category: "pre-launch",
    title: "Sales Copy Ready",
    description: "Your sales letter is written and ready to paste",
    platform: "all",
    timeEstimate: "Already done",
    instructions: [
      "Review your sales letter in the Marketing Kit",
      "Copy the full sales letter text",
      "Have it ready to paste into your chosen platform"
    ],
    tips: ["You can always refine after your first few sales"]
  },
  {
    id: "pre-check-price",
    category: "pre-launch",
    title: "Price Decided",
    description: "You've chosen your launch price",
    platform: "all",
    timeEstimate: "5 mins",
    instructions: [
      "Consider your target audience's budget",
      "Research similar products in your niche",
      "Start lower to build reviews, raise later"
    ],
    tips: [
      "Common price points: $7, $17, $27, $37, $47",
      "You can always increase price after initial sales"
    ]
  },

  // Gumroad platform steps
  {
    id: "gumroad-account",
    category: "platform",
    platform: "gumroad",
    title: "Create Gumroad Account",
    description: "Sign up for a free Gumroad account",
    timeEstimate: "3 mins",
    instructions: [
      "Go to gumroad.com",
      "Click 'Start selling'",
      "Create your account with email",
      "Complete your profile basics"
    ],
    links: [{ label: "Open Gumroad", url: "https://gumroad.com" }],
    tips: ["Use a professional email for your seller account"]
  },
  {
    id: "gumroad-product",
    category: "platform",
    platform: "gumroad",
    title: "Create Product Listing",
    description: "Set up your digital product on Gumroad",
    timeEstimate: "10 mins",
    instructions: [
      "Click 'New Product' in your dashboard",
      "Select 'Digital Product'",
      "Enter your product name",
      "Upload your main guide (PDF)",
      "Add bonus files to the same product",
      "Upload your cover image",
      "Set your price"
    ],
    tips: [
      "Gumroad handles secure file delivery automatically",
      "You can update files anytime after publishing"
    ]
  },
  {
    id: "gumroad-description",
    category: "sales-page",
    platform: "gumroad",
    title: "Add Sales Copy",
    description: "Paste your sales letter into the product description",
    timeEstimate: "5 mins",
    instructions: [
      "Go to your product's edit page",
      "Find the 'Description' field",
      "Paste your DigiStream sales copy",
      "Format headlines and bullets",
      "Preview the page"
    ],
    tips: [
      "Gumroad supports basic formatting",
      "Add your cover image at the top"
    ]
  },
  {
    id: "gumroad-publish",
    category: "platform",
    platform: "gumroad",
    title: "Publish Product",
    description: "Make your product live and get your checkout link",
    timeEstimate: "2 mins",
    instructions: [
      "Review all product details",
      "Click 'Publish' button",
      "Copy your checkout URL",
      "Test the link in a new browser window"
    ],
    tips: ["Your product is now live and ready for sales!"]
  },

  // WarriorPlus steps
  {
    id: "wp-account",
    category: "platform",
    platform: "warriorplus",
    title: "Create Vendor Account",
    description: "Sign up as a vendor on WarriorPlus",
    timeEstimate: "5 mins",
    instructions: [
      "Go to warriorplus.com",
      "Click 'Create Account'",
      "Select 'Vendor' account type",
      "Complete profile information",
      "Add payment method (PayPal/Stripe)"
    ],
    links: [{ label: "Open WarriorPlus", url: "https://warriorplus.com" }],
    tips: ["Vendor approval may take 24-48 hours"]
  },
  {
    id: "wp-product",
    category: "platform",
    platform: "warriorplus",
    title: "Create Product",
    description: "Set up your product listing",
    timeEstimate: "15 mins",
    instructions: [
      "Go to Vendor Dashboard",
      "Click 'Add New Product'",
      "Fill in product details",
      "Upload your files",
      "Set pricing and commission rates",
      "Configure delivery settings"
    ],
    tips: ["Offering affiliate commissions helps drive sales"]
  },
  {
    id: "wp-salespage",
    category: "sales-page",
    platform: "warriorplus",
    title: "Create Sales Page",
    description: "Add your sales copy to WarriorPlus",
    timeEstimate: "10 mins",
    instructions: [
      "Use WarriorPlus page builder or link external page",
      "Paste your sales letter content",
      "Add product images",
      "Include buy button",
      "Preview the page"
    ],
    tips: ["You can use Systeme.io for a custom sales page if preferred"]
  },
  {
    id: "wp-submit",
    category: "platform",
    platform: "warriorplus",
    title: "Submit for Approval",
    description: "Submit your product for WarriorPlus review",
    timeEstimate: "2 mins",
    instructions: [
      "Review all product settings",
      "Click 'Submit for Approval'",
      "Wait for approval (usually 24-48 hours)",
      "You'll receive email when approved"
    ],
    tips: ["Ensure your sales page is complete before submitting"]
  },

  // Digistore24 steps
  {
    id: "digi-account",
    category: "platform",
    platform: "digistore24",
    title: "Create Digistore24 Account",
    description: "Sign up for Digistore24 vendor account",
    timeEstimate: "5 mins",
    instructions: [
      "Go to digistore24.com",
      "Click 'Register as Vendor'",
      "Complete registration form",
      "Verify your email",
      "Add payment details"
    ],
    links: [{ label: "Open Digistore24", url: "https://www.digistore24.com" }],
    tips: ["Digistore24 handles international taxes automatically"]
  },
  {
    id: "digi-product",
    category: "platform",
    platform: "digistore24",
    title: "Add Product",
    description: "Create your product listing",
    timeEstimate: "15 mins",
    instructions: [
      "Go to Products section",
      "Click 'Add New Product'",
      "Select 'Digital Download'",
      "Upload your files",
      "Configure pricing in multiple currencies",
      "Set up delivery automation"
    ],
    tips: ["Take advantage of multi-currency pricing for global reach"]
  },
  {
    id: "digi-salespage",
    category: "sales-page",
    platform: "digistore24",
    title: "Configure Sales Page",
    description: "Link your sales page to Digistore24",
    timeEstimate: "10 mins",
    instructions: [
      "Create external sales page (or use their builder)",
      "Add Digistore24 buy button code",
      "Configure thank you page redirect",
      "Test the purchase flow"
    ],
    tips: ["You can use Systeme.io for a free hosted sales page"]
  },

  // Systeme.io steps
  {
    id: "systeme-account",
    category: "platform",
    platform: "systeme",
    title: "Create Systeme.io Account",
    description: "Sign up for free Systeme.io account",
    timeEstimate: "3 mins",
    instructions: [
      "Go to systeme.io",
      "Click 'Get Started Free'",
      "Create your account",
      "Complete onboarding steps"
    ],
    links: [{ label: "Open Systeme.io", url: "https://systeme.io" }],
    tips: ["Free plan includes 2,000 contacts and 3 funnels"]
  },
  {
    id: "systeme-funnel",
    category: "platform",
    platform: "systeme",
    title: "Create Sales Funnel",
    description: "Build your sales page and checkout",
    timeEstimate: "20 mins",
    instructions: [
      "Click 'Funnels' in dashboard",
      "Click 'Create'",
      "Choose 'Sell a product' template",
      "Customize the sales page with your copy",
      "Upload your cover images",
      "Configure checkout page"
    ],
    tips: ["Use their drag-and-drop builder - no coding needed"]
  },
  {
    id: "systeme-product",
    category: "platform",
    platform: "systeme",
    title: "Upload Product Files",
    description: "Add your digital files to Systeme.io",
    timeEstimate: "5 mins",
    instructions: [
      "Go to Products section",
      "Create new product",
      "Upload your PDF and bonus files",
      "Link product to your funnel",
      "Set up automatic delivery"
    ],
    tips: ["Files are delivered automatically after purchase"]
  },
  {
    id: "systeme-payment",
    category: "platform",
    platform: "systeme",
    title: "Connect Payment",
    description: "Set up Stripe or PayPal for payments",
    timeEstimate: "5 mins",
    instructions: [
      "Go to Settings → Payment Integrations",
      "Connect Stripe or PayPal",
      "Set your product price in the funnel",
      "Test the checkout process"
    ],
    tips: ["Stripe is recommended for faster payouts"]
  },

  // Custom/Self-hosted steps
  {
    id: "custom-hosting",
    category: "platform",
    platform: "custom",
    title: "Set Up Hosting",
    description: "Deploy your sales page to a hosting service",
    timeEstimate: "15 mins",
    instructions: [
      "Export your sales page HTML from DigiStream",
      "Sign up for Netlify or Vercel (free)",
      "Upload or deploy your HTML file",
      "Configure your domain (optional)"
    ],
    links: [
      { label: "Netlify", url: "https://netlify.com" },
      { label: "Vercel", url: "https://vercel.com" }
    ],
    tips: ["Both Netlify and Vercel offer free hosting with SSL"]
  },
  {
    id: "custom-payment",
    category: "platform",
    platform: "custom",
    title: "Add Payment Button",
    description: "Integrate Stripe or PayPal checkout",
    timeEstimate: "15 mins",
    instructions: [
      "Create a Stripe or PayPal account",
      "Set up a payment link or buy button",
      "Add the button code to your sales page",
      "Configure success/thank you page"
    ],
    links: [
      { label: "Stripe Payment Links", url: "https://stripe.com/payments/payment-links" },
      { label: "PayPal Buttons", url: "https://www.paypal.com/buttons" }
    ],
    tips: ["Stripe Payment Links are the fastest option"]
  },
  {
    id: "custom-delivery",
    category: "platform",
    platform: "custom",
    title: "Set Up File Delivery",
    description: "Configure how customers receive files",
    timeEstimate: "10 mins",
    instructions: [
      "Upload files to a secure location",
      "Create a thank you page with download links",
      "Or use a service like Gumroad just for delivery",
      "Test the full purchase flow"
    ],
    tips: ["Many creators use Gumroad just for delivery even with custom pages"]
  },

  // Testing steps (all platforms)
  {
    id: "test-purchase",
    category: "testing",
    title: "Test Purchase",
    description: "Buy your own product to verify everything works",
    platform: "all",
    timeEstimate: "5 mins",
    instructions: [
      "Use a test card or coupon code",
      "Complete the full checkout process",
      "Verify payment confirmation",
      "Check your seller dashboard"
    ],
    tips: [
      "Most platforms have test modes or 100% discount coupons",
      "This single step prevents 90% of beginner issues"
    ]
  },
  {
    id: "test-delivery",
    category: "testing",
    title: "Verify File Delivery",
    description: "Confirm customers receive their files correctly",
    platform: "all",
    timeEstimate: "5 mins",
    instructions: [
      "Check confirmation email arrived",
      "Test all download links",
      "Open each file to verify content",
      "Test on mobile if possible"
    ],
    tips: ["Make sure links work on different devices and browsers"]
  },
  {
    id: "test-mobile",
    category: "testing",
    title: "Check Mobile View",
    description: "Verify sales page looks good on phones",
    platform: "all",
    timeEstimate: "3 mins",
    instructions: [
      "Open your sales page on a phone",
      "Check text is readable",
      "Verify images display properly",
      "Test the buy button works"
    ],
    tips: ["50%+ of buyers may be on mobile"]
  },

  // Promotion steps
  {
    id: "promo-facebook",
    category: "promotion",
    title: "Share in Facebook Groups",
    description: "Post in relevant Facebook groups",
    platform: "all",
    timeEstimate: "15 mins",
    instructions: [
      "Find 3-5 groups related to your niche",
      "Read group rules first (avoid spamming)",
      "Share value first, then mention your product",
      "Respond to comments and questions"
    ],
    tips: [
      "Lead with value, not promotion",
      "Share a tip from your guide, then mention it"
    ]
  },
  {
    id: "promo-email",
    category: "promotion",
    title: "Email Your List",
    description: "Send your email sequence to existing contacts",
    platform: "all",
    timeEstimate: "10 mins",
    instructions: [
      "Import your email sequence to your email tool",
      "Schedule the 14-day sequence",
      "Send first email announcing your launch",
      "Monitor opens and clicks"
    ],
    tips: ["Even a small list can generate first sales"]
  },
  {
    id: "promo-reddit",
    category: "promotion",
    title: "Share on Reddit",
    description: "Post helpful content on relevant subreddits",
    platform: "all",
    timeEstimate: "20 mins",
    instructions: [
      "Find subreddits in your niche",
      "Read rules carefully (most ban self-promotion)",
      "Share genuinely helpful advice",
      "Only mention product if asked or in appropriate threads"
    ],
    tips: [
      "Reddit hates obvious promotion",
      "Focus on being helpful first"
    ]
  },
  {
    id: "promo-social",
    category: "promotion",
    title: "Post on Social Media",
    description: "Share on Twitter/X, LinkedIn, or Instagram",
    platform: "all",
    timeEstimate: "15 mins",
    instructions: [
      "Create a launch announcement post",
      "Share the problem your product solves",
      "Include your product link",
      "Engage with any responses"
    ],
    tips: [
      "Share the transformation, not just the product",
      "Personal stories resonate well"
    ]
  },
  {
    id: "promo-direct",
    category: "promotion",
    title: "Direct Outreach",
    description: "Message people who might benefit",
    platform: "all",
    timeEstimate: "20 mins",
    instructions: [
      "Think of 5-10 people who'd genuinely benefit",
      "Send personalized messages (not spam)",
      "Offer to answer questions",
      "Ask for honest feedback"
    ],
    tips: [
      "Personal recommendations convert best",
      "Don't spam - only message people who'd genuinely benefit"
    ]
  }
];

// Helper to get steps by platform and category
export const getStepsForPlatform = (platform: LaunchPlatform | null): LaunchStep[] => {
  if (!platform) return LAUNCH_STEPS.filter(step => step.platform === 'all');
  
  return LAUNCH_STEPS.filter(step => 
    step.platform === 'all' || step.platform === platform
  );
};

export const getStepsByCategory = (
  steps: LaunchStep[], 
  category: LaunchStep['category']
): LaunchStep[] => {
  return steps.filter(step => step.category === category);
};

export const CATEGORY_INFO: Record<LaunchStep['category'], { label: string; description: string }> = {
  'pre-launch': {
    label: 'Pre-Launch Checklist',
    description: 'Make sure you have everything ready'
  },
  'platform': {
    label: 'Platform Setup',
    description: 'Set up your selling platform'
  },
  'sales-page': {
    label: 'Sales Page',
    description: 'Configure your sales page'
  },
  'testing': {
    label: 'Testing',
    description: 'Verify everything works'
  },
  'promotion': {
    label: 'First Promotion',
    description: 'Get your first sales'
  }
};
