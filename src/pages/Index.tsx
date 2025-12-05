import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import TrendingFeed from "@/components/TrendingFeed";
import NicheSnapshotCard from "@/components/NicheSnapshotCard";
import { trendingTopics, nicheSnapshots } from "@/data/mockNiches";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TrendingFeed topics={trendingTopics.slice(0, 5)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nicheSnapshots.slice(0, 4).map((niche, index) => (
                <NicheSnapshotCard key={niche.id} niche={niche} index={index} showBlur={true} />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={() => navigate("/discover")}>
              Explore All Niches <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: BarChart3, title: "Digital Profit Snapshots", description: "Instant clarity on demand, competition, and momentum." },
            { icon: Zap, title: "Build My Product Pack", description: "AI-powered product ideas and launch strategies." },
            { icon: Shield, title: "PLR Shortcuts", description: "Curated PLR sources filtered by niche." },
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
    </div>
  );
};

export default Index;