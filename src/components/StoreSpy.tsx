import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link, Search, Loader2, ArrowRight, Copy, Check,
  TrendingUp, TrendingDown, Target, Zap, X, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitorAnalysis } from "@/types/competitorAnalysis";
import { MarketProduct } from "@/types/marketScanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StoreSpyScanner from "./StoreSpyScanner";

interface StoreSpyProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProduct: (analysis: CompetitorAnalysis) => void;
}

const StoreSpy = ({ isOpen, onClose, onCreateProduct }: StoreSpyProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"scanner" | "analyze">("scanner");

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const analyzeCompetitor = async (productUrl?: string) => {
    const targetUrl = productUrl || url;
    if (!targetUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-competitor", {
        body: { url: targetUrl },
      });

      if (error) throw error;
      setAnalysis(data);
      setActiveTab("analyze");
      toast.success("Product analyzed!");
    } catch (err) {
      console.error("Error analyzing competitor:", err);
      toast.error("Failed to analyze product listing");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeFromScanner = (productUrl: string) => {
    setUrl(productUrl);
    analyzeCompetitor(productUrl);
  };

  const handleCreateFromScanner = (product: MarketProduct) => {
    // Create a simplified analysis from scanner product
    const simpleAnalysis: CompetitorAnalysis = {
      originalProduct: {
        title: product.title,
        price: product.priceValue,
        description: product.description || '',
        strengths: [],
        weaknesses: ['Not yet analyzed'],
        tags: [],
        reviewInsights: [],
        estimatedMonthlySales: 'Unknown',
      },
      suggestedProduct: {
        newTitle: `Improved ${product.title}`,
        newDescription: `A better version of ${product.title}`,
        suggestedPrice: { 
          min: Math.max(product.priceValue - 5, 5), 
          max: product.priceValue + 10 
        },
        keyDifferentiators: ['Add practical worksheets', 'Include templates'],
        betterTags: [],
        productType: 'toolkit',
        targetAudience: 'Beginners',
        styleVibe: 'Professional',
        transformationFocus: 'Practical skills',
      },
      differentiationStrategy: {
        uniqueAngle: 'Add worksheets and action guides',
        targetAudienceTwist: 'Target beginners with step-by-step approach',
        pricingStrategy: 'Value-based pricing with bonuses',
        improvementOpportunities: ['Add interactive elements', 'Include templates', 'Add video content'],
        gapToExploit: 'Missing interactive elements',
      },
      competitiveAdvantages: ['Add practical worksheets', 'Include video tutorials', 'Provide templates'],
      actionPlan: ['Analyze the full product', 'Identify specific gaps', 'Create your differentiated version'],
    };
    onCreateProduct(simpleAnalysis);
    onClose();
  };

  const handleCreateProduct = () => {
    if (analysis) {
      onCreateProduct(analysis);
      onClose();
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setUrl("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Store Spy - Market Intelligence
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "scanner" | "analyze")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Market Scanner
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Analyze URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="mt-4">
            <StoreSpyScanner 
              onAnalyzeProduct={handleAnalyzeFromScanner}
              onCreateSimilar={handleCreateFromScanner}
            />
          </TabsContent>

          <TabsContent value="analyze" className="mt-4">
            <AnimatePresence mode="wait">
              {!analysis ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-4"
                >
                  <div className="text-center">
                    <p className="text-muted-foreground mb-6">
                      Paste a product URL to analyze and create a differentiated, better version.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://www.etsy.com/listing/... or https://gumroad.com/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={() => analyzeCompetitor()} disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Analyze <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">What this tool does:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Extracts product structure, pricing, and tags</li>
                      <li>• Identifies strengths and weaknesses</li>
                      <li>• Suggests differentiation strategies</li>
                      <li>• Generates improved title, description, and tags</li>
                      <li>• Pre-fills Toolkit Wizard for instant creation</li>
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-4"
                >
                  {/* Comparison Header */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <h4 className="text-sm font-medium text-red-400 mb-2">Original Product</h4>
                      <p className="text-sm font-medium">{analysis.originalProduct.title}</p>
                      <p className="text-lg font-bold text-red-400">${analysis.originalProduct.price}</p>
                    </div>
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="text-sm font-medium text-green-400 mb-2">Your Better Version</h4>
                      <p className="text-sm font-medium">{analysis.suggestedProduct.newTitle}</p>
                      <p className="text-lg font-bold text-green-400">
                        ${analysis.suggestedProduct.suggestedPrice.min} - ${analysis.suggestedProduct.suggestedPrice.max}
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        Their Strengths
                      </h4>
                      <ul className="text-sm space-y-1">
                        {analysis.originalProduct.strengths.map((s, i) => (
                          <li key={i} className="text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        Weaknesses to Exploit
                      </h4>
                      <ul className="text-sm space-y-1">
                        {analysis.originalProduct.weaknesses.map((w, i) => (
                          <li key={i} className="text-yellow-400">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Differentiation Strategy */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-primary" />
                      Differentiation Strategy
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Unique Angle:</span> {analysis.differentiationStrategy.uniqueAngle}</p>
                      <p><span className="text-muted-foreground">Target Twist:</span> {analysis.differentiationStrategy.targetAudienceTwist}</p>
                      <p><span className="text-muted-foreground">Pricing:</span> {analysis.differentiationStrategy.pricingStrategy}</p>
                      <p><span className="text-muted-foreground">Gap to Exploit:</span> <span className="text-yellow-400">{analysis.differentiationStrategy.gapToExploit}</span></p>
                    </div>
                  </div>

                  {/* Improved Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Your Improved Description</h4>
                      <button
                        onClick={() => copyToClipboard(analysis.suggestedProduct.newDescription, "desc")}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {copiedField === "desc" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <p className="text-sm p-3 bg-secondary/30 rounded-lg">
                      {analysis.suggestedProduct.newDescription}
                    </p>
                  </div>

                  {/* Better Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Optimized Tags (13)</h4>
                      <button
                        onClick={() => copyToClipboard(analysis.suggestedProduct.betterTags.join(", "), "tags")}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {copiedField === "tags" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.suggestedProduct.betterTags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-secondary rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Differentiators */}
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Your Competitive Advantages
                    </h4>
                    <ul className="text-sm space-y-1">
                      {analysis.competitiveAdvantages.map((adv, i) => (
                        <li key={i} className="text-green-400">✓ {adv}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Plan */}
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Quick Action Plan</h4>
                    <ol className="text-sm space-y-1 text-muted-foreground">
                      {analysis.actionPlan.map((step, i) => (
                        <li key={i}>{i + 1}. {step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={resetAnalysis} className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Analyze Another
                    </Button>
                    <Button onClick={handleCreateProduct} className="flex-1">
                      <Zap className="w-4 h-4 mr-2" />
                      Build Improved Version
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StoreSpy;
