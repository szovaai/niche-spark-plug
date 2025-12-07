import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Shield, Zap, Sparkles, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import CountdownTimer from "@/components/CountdownTimer";
import ComparisonTable from "@/components/ComparisonTable";
import UpgradeModal from "@/components/UpgradeModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Set founder deal end date - 14 days from now or a specific date
const founderDealEndDate = new Date("2025-01-15T00:00:00");

const faqs = [
  {
    question: "What exactly do I get with Pro?",
    answer: "Pro unlocks everything: unlimited searches and niche views, full Launchability Score™ (0-100), AI-powered Build My Product Pack, 60-Minute Launch Recipes, Done-For-You Launch Packs, complete PLR source panel, keyword ideas, saved niches with alerts, and the Fast-Launch Filter. Everything you need to go from trend discovery to launched product in under 60 minutes."
  },
  {
    question: "What is the Launchability Score™?",
    answer: "Our proprietary 0-100 score that tells you exactly how launchable a niche is TODAY. It combines four weighted signals: Demand Heat (30%), Competition Friction (25%), Trend Momentum (25%), and Launch Speed (20%). Scores 85+ are 'Excellent' opportunities—these are the niches you should launch immediately."
  },
  {
    question: "What does 'Founder pricing locked FOR LIFE' mean?",
    answer: "If you join during our founder period, you lock in $17/month forever. When we raise prices to $27/month (and eventually higher), you keep paying $17. No tricks, no asterisks—it's our thank you for believing in us early."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. Cancel in one click from your account settings. No hoops, no retention calls, no guilt trips. We believe if you want to leave, we haven't earned your business yet."
  },
  {
    question: "What's your refund policy?",
    answer: "We have a 30-day 'First Launch' guarantee. If you can't launch your first digital product using DigiStream within 30 days, email us for a full refund. We're that confident in the system."
  },
  {
    question: "What are PLR sources?",
    answer: "PLR (Private Label Rights) products are pre-made digital products—templates, planners, courses, ebooks—that you can customize and sell as your own. We curate the best PLR sources for each niche so you don't have to create from scratch."
  },
  {
    question: "Do I need design skills?",
    answer: "Nope! Our PLR sources come ready-to-use, and our 60-Minute Launch Recipes walk you through exactly what to do. If you can follow a recipe, you can launch a digital product."
  },
  {
    question: "What platforms does DigiStream work with?",
    answer: "DigiStream helps you find and validate niches for any platform: Etsy, Shopify, Gumroad, Amazon KDP, Creative Market, Teachable, and more. The niches we surface are platform-agnostic—you choose where to sell."
  }
];

const Pricing = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isPro = role === "pro";

  const handleGetPro = () => {
    if (!user) {
      navigate("/auth");
    } else {
      setShowUpgradeModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {/* Founder Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">FOUNDER PRICING — LIMITED TIME</span>
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Launch Digital Products <span className="gradient-text">Faster Than Ever</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join 500+ creators using DigiStream to find winning niches and launch in under 60 minutes
            </p>

            {/* Countdown Timer */}
            <CountdownTimer targetDate={founderDealEndDate} className="mb-8" />

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-2xl border border-border/50 text-left"
              >
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Explore trending niches with limited access
                </p>
                <ul className="space-y-3 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    3 searches per day
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    2 niche views per day
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Basic demand tier visibility
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center text-xs">✕</span>
                    Full XLS score locked
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  Start Free
                </Button>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative glass-card p-6 rounded-2xl border-2 border-primary/50 text-left overflow-hidden"
              >
                {/* Popular Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-accent" />
                  <h3 className="text-xl font-bold">Pro</h3>
                </div>
                <div className="mb-1">
                  <span className="text-lg text-muted-foreground line-through mr-2">$27</span>
                  <span className="text-4xl font-bold gradient-text">$17</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-accent font-medium mb-4">
                  🔒 Lock in this price FOR LIFE
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Everything you need to launch winning products
                </p>
                <ul className="space-y-3 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <strong>Unlimited</strong> searches & views
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    Full Launchability Score™ (0-100)
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    AI Build My Product Pack
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    60-Minute Launch Recipes
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    Done-For-You Launch Packs
                  </li>
                </ul>
                <Button 
                  variant="glow" 
                  className="w-full"
                  onClick={handleGetPro}
                  disabled={isPro}
                >
                  {isPro ? "You're on Pro!" : "Lock In $17/mo Forever"}
                  {!isPro && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-16">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                30-day "First Launch" Guarantee
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                147/200 founder spots claimed
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Cancel anytime
              </div>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Compare <span className="gradient-text">Plans</span>
            </h2>
            <ComparisonTable />
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            
            <div className="glass-card rounded-2xl p-6 border border-border/50">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                    <AccordionTrigger className="text-left hover:no-underline hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-4">
              Ready to launch your first winning digital product?
            </p>
            <Button 
              variant="glow" 
              size="xl"
              onClick={handleGetPro}
              disabled={isPro}
            >
              {isPro ? "You're Already Pro!" : "Start Launching Today"}
              {!isPro && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </motion.div>
        </div>
      </main>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        trigger="pricing_page"
      />
    </div>
  );
};

export default Pricing;
