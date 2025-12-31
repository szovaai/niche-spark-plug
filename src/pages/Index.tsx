import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { 
  Sparkles, ArrowRight, Check, Package, FileText, 
  Image, Download, Palette, Mail, BookOpen, ListChecks,
  Wand2, LayoutTemplate, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { 
      icon: LayoutTemplate, 
      title: "7+ Ready Templates", 
      description: "Start with coaching, marketing, health, productivity, finance, or creative business templates." 
    },
    { 
      icon: Wand2, 
      title: "AI Content Generation", 
      description: "Generate complete guides, worksheets, checklists, quizzes, and templates with one click." 
    },
    { 
      icon: Image, 
      title: "E-Cover Creator", 
      description: "Create professional product covers that make your toolkit look premium and sellable." 
    },
    { 
      icon: Mail, 
      title: "Sales Letter Builder", 
      description: "AI-written sales copy with ready-to-use HTML pages for any marketplace." 
    },
    { 
      icon: FileText, 
      title: "PDF Generation", 
      description: "Every component exports as a beautifully formatted, branded PDF document." 
    },
    { 
      icon: Download, 
      title: "One-Click ZIP Download", 
      description: "Download your complete toolkit package with all assets, ready to sell." 
    },
  ];

  const components = [
    { icon: BookOpen, name: "Main Guide/Ebook", description: "Core content piece" },
    { icon: FileText, name: "Worksheet", description: "Interactive exercises" },
    { icon: ListChecks, name: "Checklist", description: "Step-by-step action items" },
    { icon: Palette, name: "Resource List", description: "Curated tools and links" },
    { icon: FileText, name: "Templates", description: "Copy-paste swipe files" },
    { icon: Sparkles, name: "Quiz/Assessment", description: "Self-evaluation tool" },
  ];

  const howItWorks = [
    { step: "1", title: "Choose Template", description: "Pick from 7 proven toolkit templates or start from scratch" },
    { step: "2", title: "Define Your Niche", description: "Enter your topic, title, and target audience" },
    { step: "3", title: "Select Components", description: "Choose which elements to include in your toolkit" },
    { step: "4", title: "Generate Content", description: "AI creates all your content in seconds" },
    { step: "5", title: "Add Marketing Assets", description: "Create e-covers and sales letters automatically" },
    { step: "6", title: "Download & Sell", description: "Get your complete ZIP package ready to launch" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <HeroSection onGetStarted={() => navigate("/discover")} />
      
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
              <span className="text-sm gradient-text font-medium">Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Go from idea to sellable toolkit in just 6 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold gradient-text">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={() => navigate("/create-toolkit")}>
              <Package className="w-5 h-5" />
              Start Creating Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
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
              <span className="text-sm gradient-text font-medium">Powerful Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All the tools to create, package, and sell professional digital toolkits
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

      {/* Components Showcase */}
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
              <span className="text-sm gradient-text font-medium">Toolkit Components</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Can Create</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mix and match these components to build the perfect toolkit for any niche
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {components.map((component, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-card border border-border/50 text-center hover:border-primary/50 transition-colors"
              >
                <component.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm">{component.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{component.description}</p>
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
                Ready to Create Your First Toolkit?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join creators who are building and selling digital products with AI-powered toolkit creation.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="lg" onClick={() => navigate("/create-toolkit")}>
                  <Package className="w-5 h-5" />
                  Create Your Toolkit
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
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">Free to start</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">Instant download</span>
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
            DigiStream Toolkit Creator
          </span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate("/discover")} className="hover:text-foreground transition-colors">
              Explore Niches
            </button>
            <button onClick={() => navigate("/my-toolkits")} className="hover:text-foreground transition-colors">
              My Toolkits
            </button>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">
              Pricing
            </button>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 DigiStream</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
