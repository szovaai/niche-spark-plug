import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Loader2, Search, Target, ArrowRight, Shield, Zap, Sparkles,
  DollarSign, Gift, Brain, AlertTriangle, Rocket, Globe, Package,
  TrendingUp, CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FunnelStep { step: string; purpose: string }
interface ConversionTrigger { trigger: string; description: string; strength: "strong" | "moderate" | "weak" }
interface OpportunityGap { gap: string; improvement: string; impact: "high" | "medium" | "low" }

interface AnalysisResult {
  offerDNA: {
    offerType: string; audience: string; corePromiseStyle: string;
    marketPositioning: string; strengthScore: number;
  };
  promisePattern: {
    promiseType: string; formula: string;
    timeframeAngle: string; simplicityAngle: string;
  };
  funnelStructure: {
    trafficSource: string; funnelSteps: FunnelStep[];
    urgencyPlacement: string; bonusPlacement: string;
  };
  pricingStack: {
    frontEnd: string; orderBump?: string; upsells?: string[];
    monetizationPath: string; suggestedUserPricing: string;
  };
  bonusStackPattern: {
    pattern: string; bonusTypes: string[];
    perceivedValueStrategy: string; suggestedUserBonuses: string[];
  };
  conversionTriggers: ConversionTrigger[];
  opportunityGaps: OpportunityGap[];
  uniqueRebuild: {
    productConcept: string; uniqueMechanism: string;
    differentiatedPromise: string; suggestedPricing: string;
    funnelOutline: string; bonusStack: string[];
    launchChecklist: string[]; suggestedNiche: string;
    suggestedAudience: string; suggestedTopic: string;
  };
}

const strengthColor = (s: string) =>
  s === "strong" ? "text-green-400" : s === "moderate" ? "text-yellow-400" : "text-muted-foreground";
const impactColor = (i: string) =>
  i === "high" ? "border-red-500/30 bg-red-500/5" : i === "medium" ? "border-yellow-500/30 bg-yellow-500/5" : "border-border/50";

const StealThisLaunch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<"url" | "name" | "style" | "niche">("url");
  const [url, setUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [launchStyle, setLaunchStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedFunnel, setExpandedFunnel] = useState<number | null>(null);

  const loadingSteps = [
    "Extracting launch patterns...",
    "Analyzing offer structure...",
    "Mapping funnel mechanics...",
    "Identifying conversion triggers...",
    "Finding opportunity gaps...",
  ];

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, loadingSteps.length - 1));
    }, 1500);

    try {
      let scrapedContent = "";

      if (inputMode === "url" && url.trim()) {
        const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke("firecrawl-scrape", {
          body: { url, options: { formats: ["markdown"] } },
        });
        if (scrapeError) throw scrapeError;
        scrapedContent = scrapeData?.data?.markdown || scrapeData?.markdown || "";
        if (!scrapedContent) throw new Error("Could not extract content from this URL");
      }

      const { data, error } = await supabase.functions.invoke("analyze-competitor-launch", {
        body: {
          scrapedContent: scrapedContent || undefined,
          url: inputMode === "url" ? url : undefined,
          productName: inputMode === "name" ? productName : undefined,
          niche: niche || undefined,
          launchStyle: inputMode === "style" ? launchStyle : undefined,
          userId: user?.id,
        },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Launch intelligence extracted!");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const buildMyVersion = () => {
    if (!result?.uniqueRebuild) return;
    const r = result.uniqueRebuild;
    const params = new URLSearchParams({
      niche: r.suggestedNiche || "",
      audience: r.suggestedAudience || "",
      topic: r.suggestedTopic || "",
      mechanism: r.uniqueMechanism || "",
    });
    navigate(`/wizard?${params.toString()}`);
  };

  const canAnalyze =
    (inputMode === "url" && url.trim()) ||
    (inputMode === "name" && productName.trim()) ||
    (inputMode === "style" && launchStyle.trim()) ||
    (inputMode === "niche" && niche.trim());

  return (
    <DashboardLayout title="Launch Intelligence">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Winning Launch Modeler</h1>
              <p className="text-muted-foreground text-sm">
                See the structure behind winning launches, then build your own version faster.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Tabs value={inputMode} onValueChange={v => setInputMode(v as any)}>
              <TabsList className="w-full rounded-none border-b border-border/50 bg-card/50 h-auto p-1">
                <TabsTrigger value="url" className="gap-1.5 text-xs"><Globe className="w-3.5 h-3.5" />Sales Page URL</TabsTrigger>
                <TabsTrigger value="name" className="gap-1.5 text-xs"><Package className="w-3.5 h-3.5" />Product Name</TabsTrigger>
                <TabsTrigger value="style" className="gap-1.5 text-xs"><Rocket className="w-3.5 h-3.5" />Launch Style</TabsTrigger>
                <TabsTrigger value="niche" className="gap-1.5 text-xs"><Target className="w-3.5 h-3.5" />Niche Pattern</TabsTrigger>
              </TabsList>

              <div className="p-5 space-y-3">
                <TabsContent value="url" className="mt-0">
                  <Input type="url" placeholder="https://warriorplus.com/o2/a/... or any product page" value={url} onChange={e => setUrl(e.target.value)} />
                </TabsContent>
                <TabsContent value="name" className="mt-0 space-y-3">
                  <Input placeholder="e.g., Commission Hero, 12 Minute Affiliate" value={productName} onChange={e => setProductName(e.target.value)} />
                  <Input placeholder="Niche (optional)" value={niche} onChange={e => setNiche(e.target.value)} />
                </TabsContent>
                <TabsContent value="style" className="mt-0 space-y-3">
                  <Input placeholder="e.g., low-ticket front end + upsell, TikTok organic launch" value={launchStyle} onChange={e => setLaunchStyle(e.target.value)} />
                  <Input placeholder="Niche (optional)" value={niche} onChange={e => setNiche(e.target.value)} />
                </TabsContent>
                <TabsContent value="niche" className="mt-0">
                  <Input placeholder="e.g., MMO ebook launches, AI tool launches, Pinterest traffic offers" value={niche} onChange={e => setNiche(e.target.value)} />
                </TabsContent>

                <Button onClick={analyze} disabled={loading || !canAnalyze} className="w-full gap-2" variant="hero" size="lg">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Analyze Launch Pattern
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <Brain className="w-7 h-7 text-primary-foreground animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  {loadingSteps.map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i <= loadingStep ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      {i < loadingStep ? (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      ) : i === loadingStep ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-muted shrink-0" />
                      )}
                      <span className={i <= loadingStep ? "text-foreground" : "text-muted-foreground/40"}>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* 1. Offer DNA */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Offer DNA</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Strength</span>
                    <Badge variant="secondary" className="font-mono">{result.offerDNA.strengthScore}/100</Badge>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Offer Type", value: result.offerDNA.offerType },
                    { label: "Audience", value: result.offerDNA.audience },
                    { label: "Core Promise Style", value: result.offerDNA.corePromiseStyle },
                    { label: "Market Positioning", value: result.offerDNA.marketPositioning },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</div>
                      <div className="text-sm text-foreground">{item.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2. Promise Pattern */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-primary" /> Promise Pattern</h3>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Formula</div>
                  <div className="text-sm font-medium text-foreground italic">"{result.promisePattern.formula}"</div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase mb-1">Promise Type</div>
                    <div className="text-sm">{result.promisePattern.promiseType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase mb-1">Timeframe Angle</div>
                    <div className="text-sm">{result.promisePattern.timeframeAngle}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase mb-1">Simplicity Angle</div>
                    <div className="text-sm">{result.promisePattern.simplicityAngle}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Funnel Structure */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-primary" /> Funnel Structure</h3>
                <div className="space-y-2">
                  {result.funnelStructure.funnelSteps?.map((step, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedFunnel(expandedFunnel === i ? null : i)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{i + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground flex-1">{step.step}</span>
                        {expandedFunnel === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      <AnimatePresence>
                        {expandedFunnel === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-10 p-3 text-sm text-muted-foreground">{step.purpose}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {i < (result.funnelStructure.funnelSteps?.length || 0) - 1 && (
                        <div className="ml-[22px] h-4 border-l-2 border-dashed border-primary/20" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-secondary/30 text-sm">
                    <span className="text-xs text-muted-foreground uppercase">Urgency Placement</span>
                    <p className="text-foreground mt-1">{result.funnelStructure.urgencyPlacement}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 text-sm">
                    <span className="text-xs text-muted-foreground uppercase">Bonus Placement</span>
                    <p className="text-foreground mt-1">{result.funnelStructure.bonusPlacement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Pricing Stack */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold flex items-center gap-2 mb-4"><DollarSign className="w-4 h-4 text-primary" /> Pricing Stack</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="text-xs text-muted-foreground uppercase">Front End</div>
                    <div className="text-sm font-medium">{result.pricingStack.frontEnd}</div>
                  </div>
                  {result.pricingStack.orderBump && (
                    <div className="p-3 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground uppercase">Order Bump</div>
                      <div className="text-sm">{result.pricingStack.orderBump}</div>
                    </div>
                  )}
                  {result.pricingStack.upsells?.map((u, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground uppercase">OTO {i + 1}</div>
                      <div className="text-sm">{u}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="text-xs text-muted-foreground uppercase">Suggested For Your Version</div>
                  <div className="text-sm font-medium text-foreground">{result.pricingStack.suggestedUserPricing}</div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Bonus Stack */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold flex items-center gap-2 mb-4"><Gift className="w-4 h-4 text-primary" /> Bonus Stack Pattern</h3>
                <p className="text-sm text-muted-foreground mb-3">{result.bonusStackPattern.pattern}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.bonusStackPattern.bonusTypes?.map((t, i) => (
                    <Badge key={i} variant="secondary">{t}</Badge>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="text-xs text-muted-foreground uppercase mb-2">Original Bonus Ideas For You</div>
                  <div className="space-y-1.5">
                    {result.bonusStackPattern.suggestedUserBonuses?.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. Conversion Triggers */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-primary" /> Conversion Triggers</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.conversionTriggers?.map((t, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/50 bg-card/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{t.trigger}</span>
                        <span className={`text-xs font-medium uppercase ${strengthColor(t.strength)}`}>{t.strength}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 7. Opportunity Gaps */}
            <Card className="border-yellow-500/20">
              <CardContent className="p-6">
                <h3 className="font-bold flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Opportunity Gaps</h3>
                <div className="space-y-3">
                  {result.opportunityGaps?.map((g, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${impactColor(g.impact)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{g.gap}</span>
                        <Badge variant="outline" className="text-xs">{g.impact} impact</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{g.improvement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 8. Your Unique Rebuild */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-5">
                  <Rocket className="w-5 h-5 text-primary" /> Your Unique Version
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase mb-1">Product Concept</div>
                    <div className="text-sm font-medium">{result.uniqueRebuild.productConcept}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase mb-1">Unique Mechanism</div>
                    <div className="text-sm font-medium text-primary">{result.uniqueRebuild.uniqueMechanism}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase mb-1">Differentiated Promise</div>
                    <div className="text-sm">{result.uniqueRebuild.differentiatedPromise}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase mb-1">Suggested Pricing</div>
                    <div className="text-sm">{result.uniqueRebuild.suggestedPricing}</div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-xs text-muted-foreground uppercase mb-2">Funnel Outline</div>
                  <div className="text-sm text-foreground">{result.uniqueRebuild.funnelOutline}</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase mb-2">Bonus Stack</div>
                    <div className="space-y-1">
                      {result.uniqueRebuild.bonusStack?.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Gift className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase mb-2">Launch Checklist</div>
                    <div className="space-y-1">
                      {result.uniqueRebuild.launchChecklist?.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={buildMyVersion} variant="hero" size="lg" className="w-full gap-2 dual-glow">
                  <Rocket className="w-5 h-5" />
                  Build My Unique Version
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StealThisLaunch;
