import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Target, Users, Package, DollarSign, Zap, AlertCircle,
  ChevronRight, Loader2, Lightbulb, TrendingUp, Copy, Check, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { GapAnalysis } from "@/types/gapFinder";

interface GapFinderProps {
  initialNiche?: string;
  onCreateProduct?: (productSuggestion: string) => void;
}

const GapFinder = ({ initialNiche = "", onCreateProduct }: GapFinderProps) => {
  const { user } = useAuth();
  const [niche, setNiche] = useState(initialNiche);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleScan = async () => {
    if (!niche.trim()) {
      toast.error("Please enter a niche to analyze");
      return;
    }

    if (!user) {
      toast.error("Please sign in to use Gap Finder");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('find-gaps', {
        body: { nicheName: niche }
      });

      if (error) throw error;
      setAnalysis(data);
      toast.success("Gap analysis complete!");
    } catch (error) {
      console.error("Gap finder error:", error);
      toast.error("Failed to analyze niche. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const demandColors = {
    Strong: "bg-green-500/20 text-green-400",
    Moderate: "bg-yellow-500/20 text-yellow-400",
    Emerging: "bg-blue-500/20 text-blue-400",
  };

  const difficultyColors = {
    Easy: "bg-ocean-400/20 text-ocean-300",
    Medium: "bg-accent/20 text-accent",
    Hard: "bg-magenta-400/20 text-magenta-300",
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Enter a niche (e.g., Self-improvement planners)"
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
        </div>
        <Button onClick={handleScan} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              Find Gaps
            </>
          )}
        </Button>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 rounded-xl bg-card border border-border text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="font-semibold mb-2">Analyzing {niche}...</h3>
            <p className="text-sm text-muted-foreground">
              Finding opportunity gaps, underserved audiences, and quick wins
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {analysis && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Market Overview */}
          <div className="p-4 rounded-xl gradient-ocean border border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Market Overview: {analysis.nicheName}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold">{analysis.marketOverview.totalListings}</div>
                <div className="text-xs text-muted-foreground">Est. Listings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{analysis.marketOverview.averagePrice}</div>
                <div className="text-xs text-muted-foreground">Avg. Price</div>
              </div>
              <div className="text-center">
                <Badge variant="secondary">{analysis.marketOverview.marketMaturity}</Badge>
                <div className="text-xs text-muted-foreground mt-1">Maturity</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">
                  {analysis.marketOverview.dominantProductTypes.slice(0, 2).join(", ")}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for Different Gap Types */}
          <Tabs defaultValue="gaps" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="gaps" className="gap-1 text-xs">
                <Target className="w-3 h-3" /> Gaps
              </TabsTrigger>
              <TabsTrigger value="audiences" className="gap-1 text-xs">
                <Users className="w-3 h-3" /> Audiences
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-1 text-xs">
                <Package className="w-3 h-3" /> Products
              </TabsTrigger>
              <TabsTrigger value="quickwins" className="gap-1 text-xs">
                <Zap className="w-3 h-3" /> Quick Wins
              </TabsTrigger>
            </TabsList>

            {/* Opportunity Gaps */}
            <TabsContent value="gaps" className="space-y-3 mt-4">
              {analysis.opportunityGaps.map((gap, i) => (
                <motion.div
                  key={gap.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{gap.title}</h4>
                        <Badge className={demandColors[gap.demandSignal]} variant="secondary">
                          {gap.demandSignal}
                        </Badge>
                        <Badge className={difficultyColors[gap.difficultyToFill]} variant="secondary">
                          {gap.difficultyToFill}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{gap.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-primary">{gap.suggestedProductType}</span>
                        <span className="text-muted-foreground">~{gap.potentialRevenue}/mo</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onCreateProduct?.(gap.suggestedProductType)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-3 p-2 rounded-lg bg-secondary/50 text-xs">
                    <Lightbulb className="w-3 h-3 inline mr-1 text-accent" />
                    {gap.whyItWorks}
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            {/* Underserved Audiences */}
            <TabsContent value="audiences" className="space-y-3 mt-4">
              {analysis.underservedAudiences.map((audience, i) => (
                <motion.div
                  key={audience.audience}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">{audience.audience}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{audience.currentGap}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Pain Points:</span>
                      <ul className="text-xs mt-1 space-y-1">
                        {audience.painPoints.map((pain, j) => (
                          <li key={j} className="flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                            {pain}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10 text-xs">
                      <strong>Product Idea:</strong> {audience.productSuggestion}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground italic">"{audience.messagingAngle}"</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(audience.messagingAngle, `audience-${i}`)}
                      >
                        {copied === `audience-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            {/* Missing Products */}
            <TabsContent value="products" className="space-y-3 mt-4">
              {analysis.missingProductTypes.map((product, i) => (
                <motion.div
                  key={product.productType}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">{product.productType}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{product.reason}</p>
                  <div className="text-xs p-2 rounded-lg bg-accent/10">
                    <strong className="text-accent">Demand Evidence:</strong> {product.demandEvidence}
                  </div>
                  <div className="mt-2 text-xs">
                    <strong>Implementation:</strong> {product.implementationIdea}
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 gap-1"
                    onClick={() => onCreateProduct?.(product.productType)}
                  >
                    <Sparkles className="w-3 h-3" /> Create This
                  </Button>
                </motion.div>
              ))}

              {/* Pricing Gaps */}
              <div className="p-4 rounded-xl gradient-ocean border border-primary/20 mt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Pricing Gaps
                </h4>
                <div className="space-y-2">
                  {analysis.pricingGaps.map((gap, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <span className="font-medium text-sm">{gap.priceRange}</span>
                      <span className="text-xs text-muted-foreground">{gap.opportunity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Quick Wins */}
            <TabsContent value="quickwins" className="space-y-3 mt-4">
              {analysis.quickWinOpportunities.map((win, i) => (
                <motion.div
                  key={win.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-accent" />
                        <h4 className="font-semibold">{win.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{win.description}</p>
                    </div>
                    <div className="text-right text-xs">
                      <div className={`px-2 py-1 rounded ${
                        win.effort === 'Low' ? 'bg-green-500/20 text-green-400' :
                        win.effort === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {win.effort} Effort
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        {win.timeToMarket}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      win.potentialReward === 'High' ? 'bg-green-500/20 text-green-400' :
                      win.potentialReward === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {win.potentialReward} Reward
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCreateProduct?.(win.title)}
                    >
                      Create This
                    </Button>
                  </div>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>

          {/* Competitor Weaknesses */}
          {analysis.competitorWeaknesses.length > 0 && (
            <div className="p-4 rounded-xl bg-card border border-border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Competitor Weaknesses to Exploit
              </h4>
              <div className="space-y-2">
                {analysis.competitorWeaknesses.map((weakness, i) => (
                  <div key={i} className="p-3 rounded-lg bg-secondary/50">
                    <div className="font-medium text-sm text-destructive">{weakness.weakness}</div>
                    <div className="text-xs text-muted-foreground mt-1">{weakness.howToExploit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!analysis && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Enter a niche above to discover untapped opportunities</p>
        </div>
      )}
    </div>
  );
};

export default GapFinder;
