import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, DollarSign, Users, Shield, Zap, Trophy,
  Share2, Copy, ArrowUpRight, ArrowDownRight, Minus,
  Target, BarChart3, Sparkles, AlertTriangle, CheckCircle2,
  Loader2, ChevronRight
} from "lucide-react";

interface AffiliateResult {
  scores: {
    epcPotential: number;
    conversionStrength: number;
    offerAppeal: number;
    commissionPower: number;
    refundRisk: number;
    buyerAppeal: number;
  };
  overallScore: number;
  verdict: string;
  verdictMessage: string;
  projections: {
    estimatedEPC: number;
    conversionRangeMin: number;
    conversionRangeMax: number;
    averageCartValue: number;
    estimatedRefundRate: number;
    affiliateEarningsPerSale: number;
    top10AffiliateEarnings: number;
    top25AffiliateEarnings: number;
    top50AffiliateEarnings: number;
  };
  optimizations: Array<{ action: string; impact: string; priority: string }>;
  commissionAdvice: {
    currentStructure: string;
    recommendedStructure: string;
    reasoning: string;
    projectedImpact: string;
  };
  affiliateSwipeSuggestions: {
    subjectLines: string[];
    angleRecommendation: string;
  };
  leaderboardSimulation: {
    prizePool: string;
    projectedContestEntries: number;
    topAffiliateProjection: string;
    midTierProjection: string;
  };
  competitivePosition: {
    nicheAvgEPC: number;
    nicheAvgConversion: number;
    positionVsAverage: string;
    standoutFactors: string[];
  };
}

const ScoreRing = ({ score, label, size = "md" }: { score: number; label: string; size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: 64, md: 80, lg: 120 };
  const s = sizes[size];
  const r = (s - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = score / 10;
  const color = score >= 7 ? "hsl(var(--chart-2))" : score >= 5 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={s} height={s} className="-rotate-90">
        <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={4} />
        <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <span className="text-lg font-bold absolute" style={{ marginTop: s / 2 - 12 }}>{score.toFixed(1)}</span>
      <span className="text-[11px] text-muted-foreground font-medium text-center leading-tight mt-1">{label}</span>
    </div>
  );
};

export default function AffiliatePredictor() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AffiliateResult | null>(null);

  // Form state
  const [niche, setNiche] = useState("");
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("ebook");
  const [frontEndPrice, setFrontEndPrice] = useState(17);
  const [commissionPercent, setCommissionPercent] = useState(50);
  const [hasUpsells, setHasUpsells] = useState(false);
  const [upsellPrices, setUpsellPrices] = useState("");
  const [bonusCount, setBonusCount] = useState(3);
  const [targetAudience, setTargetAudience] = useState("");
  const [offerSummary, setOfferSummary] = useState("");
  const [guaranteeType, setGuaranteeType] = useState("30-day money back");

  const handlePredict = async () => {
    if (!niche || !productType) {
      toast.error("Please fill in niche and product type");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("predict-affiliate-profit", {
        body: {
          niche, productName, productType, frontEndPrice,
          commissionPercent, hasUpsells, bonusCount,
          targetAudience, offerSummary, guaranteeType,
          upsellPrices: upsellPrices ? upsellPrices.split(",").map(p => parseFloat(p.trim())).filter(Boolean) : [],
        },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Affiliate prediction complete!");
    } catch (e: any) {
      toast.error(e.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!result) return;
    const report = `
═══════════════════════════════════════
  PDF Empire AI — Affiliate Profit Report
═══════════════════════════════════════

Product: ${productName || "Unnamed"}
Niche: ${niche}
Price: $${frontEndPrice} | Commission: ${commissionPercent}%

── AFFILIATE SCORE: ${result.overallScore}/100 ──

EPC Potential: ${result.scores.epcPotential}/10
Conversion Strength: ${result.scores.conversionStrength}/10
Offer Appeal: ${result.scores.offerAppeal}/10
Commission Power: ${result.scores.commissionPower}/10
Buyer Appeal: ${result.scores.buyerAppeal}/10
Refund Risk: ${result.scores.refundRisk}/10 (lower = better)

── PROJECTIONS ──
Estimated EPC: $${result.projections.estimatedEPC}
Conversion: ${result.projections.conversionRangeMin}%–${result.projections.conversionRangeMax}%
Avg Cart Value: $${result.projections.averageCartValue}
Earnings/Sale: $${result.projections.affiliateEarningsPerSale}

── LEADERBOARD SIMULATION ──
🥇 Top 10: $${result.projections.top10AffiliateEarnings}
🥈 Top 25: $${result.projections.top25AffiliateEarnings}
🥉 Top 50: $${result.projections.top50AffiliateEarnings}

Powered by PDF Empire AI
    `.trim();
    navigator.clipboard.writeText(report);
    toast.success("Report copied to clipboard!");
  };

  const verdictConfig = {
    strong: { color: "text-chart-2", bg: "bg-chart-2/10", icon: CheckCircle2, label: "Strong Launch" },
    moderate: { color: "text-chart-4", bg: "bg-chart-4/10", icon: AlertTriangle, label: "Needs Work" },
    weak: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle, label: "High Risk" },
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Affiliate Profit Predictor™
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Predict affiliate performance before you launch. Share reports to recruit top JV partners.
            </p>
          </div>
          {result && (
            <Button variant="outline" size="sm" onClick={copyReport} className="gap-2">
              <Share2 className="h-4 w-4" /> Share Report
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product Details</CardTitle>
              <CardDescription>Enter your launch details for AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Product Name</Label>
                <Input placeholder="AI Client Magnet System" value={productName} onChange={e => setProductName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Niche *</Label>
                <Input placeholder="Make Money Online" value={niche} onChange={e => setNiche(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Product Type *</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["ebook", "video course", "software", "templates", "coaching", "PLR bundle", "prompt pack", "toolkit"].map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">FE Price ($)</Label>
                  <Input type="number" value={frontEndPrice} onChange={e => setFrontEndPrice(Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Commission %</Label>
                  <Input type="number" value={commissionPercent} onChange={e => setCommissionPercent(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Has Upsells?</Label>
                <Switch checked={hasUpsells} onCheckedChange={setHasUpsells} />
              </div>
              {hasUpsells && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Upsell Prices (comma-separated)</Label>
                  <Input placeholder="47, 97, 197" value={upsellPrices} onChange={e => setUpsellPrices(e.target.value)} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Bonus Count</Label>
                <Input type="number" value={bonusCount} onChange={e => setBonusCount(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Target Audience</Label>
                <Input placeholder="Beginner marketers" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Offer Summary</Label>
                <Textarea placeholder="Brief description of what the product delivers..." value={offerSummary} onChange={e => setOfferSummary(e.target.value)} rows={3} />
              </div>
              <Button onClick={handlePredict} disabled={loading} className="w-full gap-2" variant="hero">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Analyzing..." : "Predict Affiliate Profit"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Overall Score */}
                  {(() => {
                    const v = verdictConfig[result.verdict as keyof typeof verdictConfig] || verdictConfig.moderate;
                    const Icon = v.icon;
                    return (
                      <Card className={`border-2 ${result.overallScore >= 75 ? "border-chart-2/30" : result.overallScore >= 50 ? "border-chart-4/30" : "border-destructive/30"}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-6">
                            <div className="relative flex items-center justify-center">
                              <svg width={140} height={140} className="-rotate-90">
                                <circle cx={70} cy={70} r={60} fill="none" stroke="hsl(var(--muted))" strokeWidth={8} />
                                <circle cx={70} cy={70} r={60} fill="none"
                                  stroke={result.overallScore >= 75 ? "hsl(var(--chart-2))" : result.overallScore >= 50 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))"}
                                  strokeWidth={8} strokeDasharray={377} strokeDashoffset={377 * (1 - result.overallScore / 100)}
                                  strokeLinecap="round" className="transition-all duration-1000"
                                />
                              </svg>
                              <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-black">{result.overallScore}</span>
                                <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={`${v.bg} ${v.color} border-0`}>
                                  <Icon className="h-3 w-3 mr-1" />{v.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{result.verdictMessage}</p>
                              <div className="grid grid-cols-3 gap-4 pt-2">
                                <div className="text-center">
                                  <p className="text-lg font-bold text-primary">${result.projections.estimatedEPC}</p>
                                  <p className="text-[10px] text-muted-foreground">Est. EPC</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-bold text-primary">
                                    {result.projections.conversionRangeMin}%–{result.projections.conversionRangeMax}%
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">Conv. Range</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-bold text-primary">${result.projections.averageCartValue}</p>
                                  <p className="text-[10px] text-muted-foreground">Avg Cart</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Dimension Scores */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                        {[
                          { key: "epcPotential", label: "EPC" },
                          { key: "conversionStrength", label: "Conversion" },
                          { key: "offerAppeal", label: "Offer" },
                          { key: "commissionPower", label: "Commission" },
                          { key: "buyerAppeal", label: "Buyer Appeal" },
                          { key: "refundRisk", label: "Refund Risk" },
                        ].map(({ key, label }) => {
                          const val = result.scores[key as keyof typeof result.scores];
                          const isRisk = key === "refundRisk";
                          const color = isRisk
                            ? (val <= 3 ? "bg-chart-2" : val <= 6 ? "bg-chart-4" : "bg-destructive")
                            : (val >= 7 ? "bg-chart-2" : val >= 5 ? "bg-chart-4" : "bg-destructive");
                          return (
                            <div key={key} className="text-center space-y-2">
                              <div className="text-lg font-bold">{val.toFixed(1)}</div>
                              <Progress value={val * 10} className={`h-1.5 [&>div]:${color}`} />
                              <p className="text-[10px] text-muted-foreground">{label}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Leaderboard Simulation */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-chart-4" />Leaderboard Simulation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-chart-4/5">
                          <span className="text-lg">🥇</span>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Top 10 Affiliate</p>
                            <p className="text-sm font-bold">${result.projections.top10AffiliateEarnings?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                          <span className="text-lg">🥈</span>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Top 25 Affiliate</p>
                            <p className="text-sm font-bold">${result.projections.top25AffiliateEarnings?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                          <span className="text-lg">🥉</span>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Top 50 Affiliate</p>
                            <p className="text-sm font-bold">${result.projections.top50AffiliateEarnings?.toLocaleString()}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><strong>Prize Pool:</strong> {result.leaderboardSimulation.prizePool}</p>
                          <p><strong>Projected Entries:</strong> {result.leaderboardSimulation.projectedContestEntries} affiliates</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Commission Advice */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-chart-2" />Commission Optimizer</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Current</p>
                          <p className="text-sm font-medium">{result.commissionAdvice.currentStructure}</p>
                        </div>
                        <div className="flex justify-center"><ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" /></div>
                        <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/20 space-y-1">
                          <p className="text-[10px] text-chart-2 uppercase tracking-wide font-semibold">Recommended</p>
                          <p className="text-sm font-medium">{result.commissionAdvice.recommendedStructure}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{result.commissionAdvice.reasoning}</p>
                        <Badge variant="secondary" className="text-[10px]">{result.commissionAdvice.projectedImpact}</Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Optimizations */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Optimization Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.optimizations?.map((opt, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                            <Badge variant={opt.priority === "high" ? "destructive" : opt.priority === "medium" ? "default" : "secondary"}
                              className="text-[9px] mt-0.5 shrink-0">
                              {opt.priority}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">{opt.action}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{opt.impact}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Competitive Position & Swipe Suggestions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />vs. Niche Average</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Your EPC</span>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-sm">${result.projections.estimatedEPC}</span>
                            {result.competitivePosition?.positionVsAverage === "above"
                              ? <ArrowUpRight className="h-3 w-3 text-chart-2" />
                              : result.competitivePosition?.positionVsAverage === "below"
                                ? <ArrowDownRight className="h-3 w-3 text-destructive" />
                                : <Minus className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Niche Avg EPC</span>
                          <span className="font-bold text-sm">${result.competitivePosition?.nicheAvgEPC}</span>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase">Standout Factors</p>
                          <div className="flex flex-wrap gap-1">
                            {result.competitivePosition?.standoutFactors?.map((f, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">{f}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Affiliate Swipe Ideas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs text-muted-foreground">{result.affiliateSwipeSuggestions?.angleRecommendation}</p>
                        <Separator />
                        <p className="text-[10px] text-muted-foreground uppercase">Subject Lines</p>
                        <div className="space-y-2">
                          {result.affiliateSwipeSuggestions?.subjectLines?.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => { navigator.clipboard.writeText(s); toast.success("Copied!"); }}>
                              <Copy className="h-3 w-3 text-muted-foreground shrink-0" />
                              <p className="text-xs">{s}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Predict Your Launch Performance</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Enter your product details and our AI will predict EPC, conversion rates,
                      affiliate earnings, and give you optimization suggestions before you launch.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["EPC Prediction", "Commission Optimizer", "Leaderboard Sim", "Shareable Report"].map(f => (
                      <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
