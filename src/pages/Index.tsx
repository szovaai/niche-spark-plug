import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { 
  Sparkles, ArrowRight, Check, 
  Wand2, Zap, Target, DollarSign, Users, Search, Brain,
  Package, Mail, Megaphone, FileText, ClipboardList, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { 
      icon: Target, 
      title: "Launch Score Advisor", 
      description: "AI analyzes your idea before you build — scoring demand, competition, monetization, and offer strength." 
    },
    { 
      icon: Zap, 
      title: "Unique Mechanism Generator", 
      description: "Generate 3 proprietary frameworks like 'The Rapid Launch Protocol' that make your product feel one-of-a-kind." 
    },
    { 
      icon: DollarSign, 
      title: "Offer Stack Builder", 
      description: "Auto-generate a WarriorPlus-style value stack with core product, 3 bonuses, perceived values, and irresistible pricing." 
    },
    { 
      icon: Users, 
      title: "Affiliate Kit Generator", 
      description: "Create JV page copy, affiliate email swipes, promo angles, and bonus page headlines — no other AI tool does this." 
    },
    { 
      icon: Search, 
      title: "Steal This Launch", 
      description: "Paste any competitor's URL and the AI reverse-engineers their offer, angles, and funnel — then builds your counter-launch." 
    },
    { 
      icon: Brain, 
      title: "Launch DNA Memory", 
      description: "The AI remembers your product, angle, mechanism, and audience — ensuring every asset tells the same story." 
    },
  ];

  const whatGetsGenerated = [
    { icon: Package, name: "Product Concept", description: "Title, subtitle, mechanism" },
    { icon: FileText, name: "Product Content", description: "Full outline & chapters" },
    { icon: BarChart3, name: "Sales Funnel", description: "Sales page, upsell, order bump" },
    { icon: Mail, name: "Email Sequence", description: "5 launch emails" },
    { icon: Megaphone, name: "Ad Copy & Social", description: "5 ads, 10 posts, pins" },
    { icon: ClipboardList, name: "Launch Checklist", description: "Day-by-day timeline" },
  ];

  const howItWorks = [
    { step: "1", title: "Define Your Niche", description: "Enter your niche, audience, and topic — AI scores it instantly" },
    { step: "2", title: "Choose Your Mechanism", description: "Pick from 3 AI-generated proprietary frameworks" },
    { step: "3", title: "Generate Everything", description: "One click builds product, funnel, emails, ads, and affiliate kit" },
    { step: "4", title: "Review & Customize", description: "Edit, copy, and export every asset from one dashboard" },
    { step: "5", title: "Launch & Sell", description: "Follow the checklist and go live in under 60 minutes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <HeroSection onGetStarted={() => navigate("/wizard")} />
      
      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">5-Step Launch Engine</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Go from idea to complete launch system in 5 guided steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <span className="text-lg font-bold gradient-text">{item.step}</span>
                    </div>
                    <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={() => navigate("/wizard")}>
              <Wand2 className="w-5 h-5" />
              Start AI Launch Wizard
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid — Category-of-One Differentiators */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Category-of-One Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What No Other Tool Does</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Six AI-powered features that turn DigiLaunchKit from a generator into a launch strategist
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Gets Generated */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Complete Launch Package</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Gets Generated</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every asset you need to launch and sell — created in one session
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {whatGetsGenerated.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-card border border-border/50 text-center hover:border-primary/50 transition-colors"
              >
                <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border border-primary/20 p-8 md:p-12 text-center"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(56,182,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(56,182,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Launch Your Digital Product?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join creators using the AI Launch Operating System to build and sell digital products in under 60 minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="lg" onClick={() => navigate("/wizard")}>
                  <Wand2 className="w-5 h-5" />
                  Start Your Launch
                  <ArrowRight className="w-5 h-5" />
                </Button>
                {!user && (
                  <Button variant="outline" size="lg" onClick={() => navigate("/auth")}>
                    Sign Up Free
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-8 text-sm">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Free to start</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">No credit card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">30+ assets generated</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            DigiLaunchKit AI
          </span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate("/wizard")} className="hover:text-foreground transition-colors">
              Launch Wizard
            </button>
            <button onClick={() => navigate("/steal")} className="hover:text-foreground transition-colors">
              Steal a Launch
            </button>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">
              Pricing
            </button>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 DigiLaunchKit AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
