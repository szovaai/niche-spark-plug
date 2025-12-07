import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import TrendingFeed from "@/components/TrendingFeed";
import NicheSnapshotCard from "@/components/NicheSnapshotCard";
import InspirationOfTheDay from "@/components/InspirationOfTheDay";
import DemoModeModal from "@/components/DemoModeModal";
import OnboardingWizard from "@/components/OnboardingWizard";
import { trendingTopics, nicheSnapshots } from "@/data/mockNiches";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Zap, BarChart3, Play, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";

const Index = () => {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
      
      <HeroSection onGetStarted={() => navigate("/discover")} />
      
      {/* Preview Section */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Live Trends</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Today's Digital Winners</h2>
            
            {/* Demo Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDemoModal(true)}
              className="mt-2 gap-2"
            >
              <Play className="w-4 h-4" />
              See How It Works
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Trending + Inspiration */}
            <div className="space-y-6">
              <TrendingFeed topics={trendingTopics.slice(0, 5)} />
              <InspirationOfTheDay />
            </div>
            
            {/* Right columns: Niche cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nicheSnapshots.slice(0, 4).map((niche, index) => (
                <NicheSnapshotCard key={niche.id} niche={niche} index={index} showBlur={true} />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={() => navigate("/discover")}>
              Explore All Niches <ArrowRight className="w-5 h-5" />
            </Button>
            
            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Unlimited exports</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: BarChart3, title: "Launchability Score™", description: "Our proprietary 0-100 score tells you exactly how easy and profitable each niche is." },
            { icon: Zap, title: "60-Minute Launch", description: "AI-powered product packs and launch strategies get you selling fast." },
            { icon: Shield, title: "PLR Shortcuts", description: "Curated PLR sources filtered by niche save you hours of work." },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 bg-card border border-border rounded-xl">
              <f.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-primary" />DigiStream</span>
          <p className="text-sm text-muted-foreground">© 2024 DigiStream</p>
        </div>
      </footer>

      <DemoModeModal
        open={showDemoModal}
        onOpenChange={setShowDemoModal}
      />
    </div>
  );
};

export default Index;
