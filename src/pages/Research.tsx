import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, Wand2, Target, Eye, Sparkles, 
  ChevronRight, TrendingUp, Lightbulb
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NicheWizard from "@/components/NicheWizard";
import GapFinder from "@/components/GapFinder";
import StoreSpy from "@/components/StoreSpy";
import { useNavigate } from "react-router-dom";
import { CompetitorAnalysis } from "@/types/competitorAnalysis";

const Research = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"wizard" | "gaps" | "storespy" | null>(null);
  const [nicheWizardOpen, setNicheWizardOpen] = useState(false);
  const [storeSpyOpen, setStoreSpyOpen] = useState(false);

  const handleCreateFromGap = (productSuggestion: string) => {
    navigate("/create", { state: { productType: productSuggestion } });
  };

  const handleCreateFromStoreSpy = (analysis: CompetitorAnalysis) => {
    navigate("/create", { 
      state: { 
        competitorAnalysis: analysis,
        productType: analysis.suggestedProduct.productType 
      } 
    });
  };

  const tools = [
    {
      id: "wizard",
      title: "Niche Wizard",
      description: "Find your perfect niche based on your skills, interests, and goals",
      icon: Wand2,
      color: "from-primary to-accent",
      action: () => setNicheWizardOpen(true),
    },
    {
      id: "gaps",
      title: "Gap Finder",
      description: "Discover untapped opportunities and underserved audiences in any niche",
      icon: Target,
      color: "from-ocean-400 to-ocean-600",
      action: () => setActiveTab("gaps"),
    },
    {
      id: "storespy",
      title: "Store Spy",
      description: "See what's selling on Etsy and Gumroad right now and create better versions",
      icon: Eye,
      color: "from-magenta-400 to-magenta-600",
      action: () => setStoreSpyOpen(true),
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Search className="w-5 h-5 text-primary-foreground" />
            </div>
            Research Hub
          </h1>
          <p className="text-muted-foreground">
            Find profitable niches, discover market gaps, and spy on competitors before building your toolkit.
          </p>
        </motion.div>

        {/* Research Tools Grid */}
        {!activeTab && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card 
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 h-full"
                  onClick={tool.action}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      {tool.title}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tips Section */}
        {!activeTab && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-4"
          >
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  Research First Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>The most successful digital product sellers always research before building:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Start with Niche Wizard to find niches matching your skills</li>
                  <li>Use Gap Finder to identify underserved markets</li>
                  <li>Spy on competitors to find differentiation angles</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-ocean-500/5 to-transparent border-ocean-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-ocean-400" />
                  Quick Win Mindset
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Focus on quick wins for your first products:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Look for "Easy" difficulty gaps in Gap Finder</li>
                  <li>Target "Growing" markets over saturated ones</li>
                  <li>Price competitively for faster first sales</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Gap Finder Expanded View */}
        {activeTab === "gaps" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Gap Finder
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)}>
                ← Back to Tools
              </Button>
            </div>
            <Card className="p-6">
              <GapFinder onCreateProduct={handleCreateFromGap} />
            </Card>
          </motion.div>
        )}

        {/* Niche Wizard Modal */}
        <NicheWizard 
          isOpen={nicheWizardOpen} 
          onClose={() => setNicheWizardOpen(false)} 
        />

        {/* Store Spy Modal */}
        <StoreSpy
          isOpen={storeSpyOpen}
          onClose={() => setStoreSpyOpen(false)}
          onCreateProduct={handleCreateFromStoreSpy}
        />
      </div>
    </DashboardLayout>
  );
};

export default Research;
