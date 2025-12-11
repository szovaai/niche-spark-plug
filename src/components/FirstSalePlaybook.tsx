import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Clock, Copy, ChevronDown, ChevronUp,
  ShoppingBag, Camera, MessageSquare, Mail, Hash, Sparkles,
  Target, PartyPopper, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { PlaybookStep, PlaybookPlatform, PlaybookProgress } from "@/types/playbook";
import { ProductBlueprint } from "@/types/niche";
import { PersonalizationData } from "@/types/personalization";

interface FirstSalePlaybookProps {
  blueprint: ProductBlueprint;
  personalization: PersonalizationData;
  nicheName: string;
  progress?: PlaybookProgress;
  onProgressUpdate?: (progress: PlaybookProgress) => void;
}

const PLATFORM_CONFIG: Record<PlaybookPlatform, { icon: React.ElementType; color: string; label: string }> = {
  etsy: { icon: ShoppingBag, color: "text-orange-400", label: "Etsy" },
  pinterest: { icon: Camera, color: "text-red-400", label: "Pinterest" },
  reddit: { icon: MessageSquare, color: "text-orange-500", label: "Reddit" },
  facebook: { icon: Hash, color: "text-blue-400", label: "Facebook" },
  instagram: { icon: Camera, color: "text-pink-400", label: "Instagram" },
  email: { icon: Mail, color: "text-green-400", label: "Email" },
  tiktok: { icon: Camera, color: "text-cyan-400", label: "TikTok" },
  general: { icon: Target, color: "text-primary", label: "General" },
};

const FirstSalePlaybook = ({
  blueprint,
  personalization,
  nicheName,
  progress = { completedSteps: [], startedAt: null, completedAt: null },
  onProgressUpdate,
}: FirstSalePlaybookProps) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [localProgress, setLocalProgress] = useState<PlaybookProgress>(progress);

  // Generate dynamic playbook steps based on product data
  const steps = useMemo<PlaybookStep[]>(() => generateSteps(blueprint, personalization, nicheName), [blueprint, personalization, nicheName]);

  const completedCount = localProgress.completedSteps.length;
  const progressPercent = (completedCount / steps.length) * 100;
  const isComplete = completedCount === steps.length;

  const toggleStepComplete = (stepId: string) => {
    const newCompleted = localProgress.completedSteps.includes(stepId)
      ? localProgress.completedSteps.filter(id => id !== stepId)
      : [...localProgress.completedSteps, stepId];

    const newProgress: PlaybookProgress = {
      completedSteps: newCompleted,
      startedAt: localProgress.startedAt || new Date().toISOString(),
      completedAt: newCompleted.length === steps.length ? new Date().toISOString() : null,
    };

    setLocalProgress(newProgress);
    onProgressUpdate?.(newProgress);

    if (newCompleted.length === steps.length) {
      toast.success("🎉 Playbook complete! You're ready for your first sale!");
    }
  };

  const copyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Template copied!");
  };

  const toggleExpand = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">First Sale Playbook</h3>
          </div>
          <span className="text-sm font-medium">
            {completedCount}/{steps.length} complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {isComplete 
            ? "🎉 You've completed all steps! Your first sale is just around the corner." 
            : "Follow these steps to get your first sale within 48 hours."}
        </p>
      </div>

      {/* Celebration Banner */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center"
          >
            <PartyPopper className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <h3 className="text-xl font-bold mb-2">Playbook Complete! 🎉</h3>
            <p className="text-muted-foreground">
              You've done everything needed for your first sale. Now monitor your listings and respond quickly to any inquiries!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = localProgress.completedSteps.includes(step.id);
          const isExpanded = expandedStep === step.id;
          const PlatformIcon = PLATFORM_CONFIG[step.platform].icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`rounded-xl border transition-all ${
                isCompleted 
                  ? 'bg-primary/5 border-primary/30' 
                  : 'bg-card border-border hover:border-primary/20'
              }`}
            >
              {/* Step Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(step.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStepComplete(step.id);
                    }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Step {step.number}
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${PLATFORM_CONFIG[step.platform].color}`}>
                        <PlatformIcon className="w-3 h-3" />
                        {PLATFORM_CONFIG[step.platform].label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {step.timeEstimate}
                      </span>
                    </div>
                    <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Expand Icon */}
                  <button className="p-1 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-border ml-8 space-y-4">
                      {/* Why It Works */}
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">💡 Why this works:</p>
                        <p className="text-sm">{step.whyItWorks}</p>
                      </div>

                      {/* Templates */}
                      {step.templates.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-medium text-muted-foreground">📋 Copy-Paste Templates:</p>
                          {step.templates.map((template, idx) => (
                            <div key={idx} className="relative">
                              <p className="text-xs font-medium mb-1">{template.label}</p>
                              <div className="p-3 rounded-lg bg-background border border-border text-sm whitespace-pre-wrap">
                                {template.content}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-6 right-1 h-7"
                                onClick={() => copyTemplate(template.content)}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tips */}
                      {step.tips.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">✨ Pro Tips:</p>
                          <ul className="space-y-1">
                            {step.tips.map((tip, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Mark Complete Button */}
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => toggleStepComplete(step.id)}
                        className="w-full"
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-1" />
                            Mark as Complete
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Total Time Estimate */}
      <div className="p-3 rounded-lg bg-secondary/30 text-center">
        <p className="text-sm text-muted-foreground">
          <Clock className="w-4 h-4 inline mr-1" />
          Estimated total time: <span className="font-medium text-foreground">~2 hours</span>
        </p>
      </div>
    </div>
  );
};

// Generate dynamic playbook steps based on product data
function generateSteps(
  blueprint: ProductBlueprint,
  personalization: PersonalizationData,
  nicheName: string
): PlaybookStep[] {
  const productName = blueprint.productName;
  const audience = personalization.targetAudience;
  const tags = blueprint.marketingCopy?.seoTags?.slice(0, 5).join(", ") || nicheName;

  return [
    {
      id: "etsy-title",
      number: 1,
      title: "Perfect Your Etsy Title",
      description: "Optimize your title with high-converting keywords for maximum visibility.",
      platform: "etsy",
      timeEstimate: "10 mins",
      whyItWorks: "Etsy's search algorithm heavily weighs the first few words of your title. Front-loading with primary keywords dramatically improves visibility.",
      templates: [
        {
          label: "SEO-Optimized Title Formula",
          content: `${productName} | ${audience} | Digital Download | Printable | Instant Access`,
        },
      ],
      tips: [
        "Put your most important keyword first",
        "Use all 140 characters available",
        "Include 'Digital Download' and 'Printable' for clarity",
        "Add your target audience for better targeting",
      ],
    },
    {
      id: "launch-pricing",
      number: 2,
      title: "Set Launch Pricing Strategy",
      description: "Price 15-20% below your target to attract early buyers and reviews.",
      platform: "general",
      timeEstimate: "5 mins",
      whyItWorks: "Lower launch pricing reduces buyer hesitation and helps you get those crucial first reviews faster. You can raise prices once you have social proof.",
      templates: [
        {
          label: "Pricing Strategy",
          content: `Launch Price: Set 15-20% below your target
Target: ${personalization.priceTier}
Launch Period: First 50 sales or 2 weeks

After launch: Gradually increase to full price
Pro tip: Round to .97 (e.g., $7.97) - it outperforms .99 on Etsy!`,
        },
      ],
      tips: [
        "Don't go too low - it can signal low quality",
        "Plan to raise prices after 20-30 reviews",
        "Consider a 'launch sale' badge in your images",
      ],
    },
    {
      id: "pinterest-board",
      number: 3,
      title: "Create Pinterest Board",
      description: "Set up a Pinterest board to drive free traffic to your listing.",
      platform: "pinterest",
      timeEstimate: "15 mins",
      whyItWorks: "Pinterest is the #1 free traffic source for digital products. Pins continue driving traffic for months or even years after posting.",
      templates: [
        {
          label: "Board Name",
          content: `${nicheName} Ideas & Inspiration | ${audience}`,
        },
        {
          label: "Pin Description Template",
          content: `Looking for the perfect ${nicheName.toLowerCase()}? ✨

This ${blueprint.productName} is designed specifically for ${audience.toLowerCase()} who want to ${personalization.transformationFocus.toLowerCase()}.

🎯 What's included:
• Instant digital download
• Printable format
• ${personalization.styleVibe} design

Perfect for anyone ready to ${personalization.transformationFocus.toLowerCase()}!

#${nicheName.replace(/\s+/g, '')} #${audience.replace(/\s+/g, '')} #DigitalDownload #Printable`,
        },
      ],
      tips: [
        "Create 5-10 pins with different angles/text",
        "Post consistently (1-3 pins per day)",
        "Use rich pins for better engagement",
        "Join group boards in your niche",
      ],
    },
    {
      id: "reddit-post",
      number: 4,
      title: "Post to Reddit",
      description: "Share your product in relevant subreddits with a genuine, helpful approach.",
      platform: "reddit",
      timeEstimate: "15 mins",
      whyItWorks: "Reddit drives highly targeted traffic. A well-crafted post can get hundreds of views in hours. The key is being genuine, not salesy.",
      templates: [
        {
          label: "Reddit Post Template (Feedback Request)",
          content: `Title: Just launched my first ${nicheName.toLowerCase()} - would love your honest feedback!

Hey everyone! 👋

I've been working on a ${nicheName.toLowerCase()} designed specifically for ${audience.toLowerCase()}. It focuses on helping people ${personalization.transformationFocus.toLowerCase()}.

I'd really appreciate any feedback from this community - what works, what doesn't, what you'd want to see improved.

Here's what it includes:
• [Key feature 1]
• [Key feature 2]
• [Key feature 3]

Happy to answer any questions or share more details!

(I'm also offering a launch discount for early supporters if anyone's interested)`,
        },
      ],
      tips: [
        "Read subreddit rules before posting",
        "Engage genuinely in comments",
        "Don't just drop links - provide value first",
        `Try: r/Etsy, r/${audience.replace(/\s+/g, '')}, r/sidehustle`,
      ],
    },
    {
      id: "facebook-groups",
      number: 5,
      title: "Share in Facebook Groups",
      description: "Find and engage with Facebook groups where your ideal customers hang out.",
      platform: "facebook",
      timeEstimate: "15 mins",
      whyItWorks: "Facebook groups have highly engaged members actively looking for solutions. A helpful post in the right group can generate immediate sales.",
      templates: [
        {
          label: "Facebook Group Post",
          content: `Hi everyone! 👋

I just created something I'm really excited about - a ${nicheName.toLowerCase()} specifically for ${audience.toLowerCase()}.

I know how challenging it can be to ${personalization.transformationFocus.toLowerCase()}, so I designed this to make it as simple as possible.

If anyone's interested, I'd love to share more details! Also happy to answer any questions about ${nicheName.toLowerCase()}. 💙

(Mods: please let me know if this isn't allowed!)`,
        },
      ],
      tips: [
        "Join groups 2-3 days before posting (if new)",
        "Engage with other posts first",
        "Follow group rules for self-promotion",
        "Offer genuine help, not just promotion",
      ],
    },
    {
      id: "instagram-stories",
      number: 6,
      title: "Create Instagram Story Sequence",
      description: "Launch with a 3-story sequence to build excitement and drive traffic.",
      platform: "instagram",
      timeEstimate: "10 mins",
      whyItWorks: "Stories create urgency and personal connection. A well-crafted sequence takes followers on a journey from curiosity to purchase.",
      templates: [
        {
          label: "Story 1: Tease",
          content: `Been working on something special for ${audience.toLowerCase()}... 👀

Can you guess what it is?

🔥 Launching TODAY`,
        },
        {
          label: "Story 2: Reveal",
          content: `IT'S HERE! 🎉

Introducing: ${productName}

Perfect for ${audience.toLowerCase()} who want to ${personalization.transformationFocus.toLowerCase()}

Swipe up to grab yours! ⬆️`,
        },
        {
          label: "Story 3: Social Proof/Urgency",
          content: `Launch special ending soon! ⏰

${productName}

✨ ${personalization.styleVibe} design
📱 Instant download
💰 Special launch price

Link in bio! 🔗`,
        },
      ],
      tips: [
        "Add polls and questions to boost engagement",
        "Use your product mockups as backgrounds",
        "Save to highlights for ongoing visibility",
        "Post when your audience is most active",
      ],
    },
    {
      id: "personal-email",
      number: 7,
      title: "Email Your Personal Network",
      description: "Ask friends and family to support your launch (and maybe leave a review).",
      platform: "email",
      timeEstimate: "10 mins",
      whyItWorks: "Your personal network wants to support you. Even if they don't need the product, they might know someone who does - or leave a helpful review.",
      templates: [
        {
          label: "Personal Network Email",
          content: `Subject: Quick favor? Just launched my first digital product! 🚀

Hey [Name]!

I finally did it - I just launched my first digital product on Etsy!

It's a ${nicheName.toLowerCase()} called "${productName}" designed for ${audience.toLowerCase()}.

I know it might not be your thing, but would you mind:
1. Checking it out? (Even a view helps with Etsy's algorithm!)
2. Sharing with anyone who might be interested?
3. If you do buy, leaving an honest review?

Here's the link: [YOUR ETSY LINK]

This means so much to me as I'm just getting started! 🙏

Thanks!
[Your name]`,
        },
      ],
      tips: [
        "Send to 10-20 supportive people",
        "Don't be afraid to ask directly",
        "Personalize each email slightly",
        "Follow up with a thank you!",
      ],
    },
    {
      id: "etsy-ads",
      number: 8,
      title: "Enable Etsy Ads",
      description: "Start with a small budget to boost visibility for your new listing.",
      platform: "etsy",
      timeEstimate: "5 mins",
      whyItWorks: "New listings need visibility to compete. A small ad budget helps your product get seen while building organic ranking.",
      templates: [
        {
          label: "Etsy Ads Strategy",
          content: `Budget: $1-3/day to start
Duration: First 2 weeks
Target keywords: ${tags}

Monitor: Check which keywords perform best after 3-5 days
Adjust: Increase budget on winners, pause losers

Pro tip: Etsy Ads work best for listings with good photos and competitive pricing!`,
        },
      ],
      tips: [
        "Start small - $1/day is enough to test",
        "Let ads run at least 3-5 days before judging",
        "Focus budget on your best-performing keywords",
        "Pause underperforming ads, not all ads",
      ],
    },
    {
      id: "respond-quickly",
      number: 9,
      title: "Respond to Views & Questions Fast",
      description: "Set up notifications and respond to any inquiries within hours.",
      platform: "general",
      timeEstimate: "Ongoing",
      whyItWorks: "Quick responses dramatically increase conversion rates. Buyers often purchase from whoever responds first.",
      templates: [
        {
          label: "Quick Response Template",
          content: `Hi there! Thanks so much for your interest in ${productName}! 😊

To answer your question: [Address their specific question]

A few quick highlights:
• Instant digital download
• Works on [devices/software]
• [Key benefit for their question]

Let me know if you have any other questions - happy to help!

[Your name]`,
        },
      ],
      tips: [
        "Enable push notifications on the Etsy app",
        "Aim to respond within 1-2 hours",
        "Be friendly and helpful, even for simple questions",
        "Quick responses can lead to positive reviews!",
      ],
    },
    {
      id: "request-review",
      number: 10,
      title: "Follow Up for Reviews",
      description: "Politely ask happy customers to leave a review.",
      platform: "email",
      timeEstimate: "5 mins",
      whyItWorks: "Most happy customers simply forget to review. A friendly reminder dramatically increases review rates.",
      templates: [
        {
          label: "Review Request Message",
          content: `Hi [Name]! 👋

I hope you're loving your ${productName}!

If you have a moment, I'd really appreciate if you could leave a quick review on Etsy. It helps so much as a small creator!

Here's the direct link: [REVIEW LINK]

Even just a star rating helps! ⭐

Thank you so much for your support!
[Your name]`,
        },
      ],
      tips: [
        "Wait 3-5 days after purchase",
        "Keep it short and genuine",
        "Don't incentivize reviews (against TOS)",
        "Thank them regardless of outcome",
      ],
    },
    {
      id: "tiktok-bts",
      number: 11,
      title: 'Post "Behind the Scenes"',
      description: "Create a quick TikTok/Reel showing your creation process.",
      platform: "tiktok",
      timeEstimate: "15 mins",
      whyItWorks: "Behind-the-scenes content humanizes your brand and performs incredibly well on TikTok. People love seeing the creation process.",
      templates: [
        {
          label: "TikTok Script",
          content: `[Hook - 0-3 seconds]
"I just launched my first digital product and here's how it went..."

[Body - Show your process]
- Quick clips of you creating
- Show the final product
- Show any sales/messages you've gotten

[Call to Action]
"Link in bio if you want to check it out! What should I create next? 👇"

Hashtags: #digitalproducts #etsyseller #sidehustle #${nicheName.replace(/\s+/g, '').toLowerCase()} #smallbusiness`,
        },
      ],
      tips: [
        "Keep it under 30 seconds",
        "Use trending sounds",
        "Show your face if comfortable",
        "Post at peak times (7-9am, 12-2pm, 7-10pm)",
      ],
    },
    {
      id: "celebrate-share",
      number: 12,
      title: "Celebrate & Build Momentum",
      description: "Share your first sale win and keep the momentum going!",
      platform: "general",
      timeEstimate: "5 mins",
      whyItWorks: "Celebrating wins (even small ones) builds excitement and attracts more customers. Success stories are magnetic.",
      templates: [
        {
          label: "First Sale Celebration Post",
          content: `🎉 FIRST SALE!!! 🎉

I can't believe it - someone actually bought my ${nicheName.toLowerCase()}!

I've been working on this for weeks and to see it pay off is incredible.

Thank you so much to my first customer! This is just the beginning.

If you've been thinking about starting your own digital product business - DO IT. The feeling is worth every late night.

#FirstSale #EtsySeller #DigitalProducts #SideHustle`,
        },
      ],
      tips: [
        "Celebrate every milestone publicly",
        "Use this energy to create your next product",
        "Document your journey - people love following growth",
        "Start planning your next product while momentum is high",
      ],
    },
  ];
}

export default FirstSalePlaybook;
