import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain, Sparkles, Loader2, TrendingUp, Target, Zap, BarChart3,
  CheckCircle, AlertTriangle, ArrowRight, Lightbulb, Star, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatorProfile {
  totalBuilds: number;
  ratedBuilds: number;
  successRate: number | null;
  topNiche: string | null;
  topProductType: string | null;
  avgPricePoint: number;
  favoritePlatform: string;
  mechanismsUsed: number;
}

interface AIInsights {
  patterns: string[];
  strengths: string[];
  opportunities: string[];
  nextProductSuggestion: {
    niche: string;
    productType: string;
    pricePoint: number;
    mechanismName: string;
    headlineStyle: string;
    reasoning: string;
  };
  warningPatterns: string[];
}

interface RecentBuild {
  id: string;
  projectId: string;
  niche: string;
  productType: string;
  mechanismName: string;
  price: number;
  rating: string;
  platform: string;
  createdAt: string;
}

interface Recommendation {
  hasRecommendation: boolean;
  confidence?: string;
  suggestedNiche?: string;
  suggestedTopic?: string;
  suggestedAudience?: string;
  suggestedMechanism?: string;
  suggestedPrice?: number;
  suggestedHeadlineStyle?: string;
  suggestedSalesStyle?: string;
  blueprintName?: string;
  reasoning?: string;
  estimatedSuccessRate?: string;
}

interface Props {
  userId?: string;
  onApplyRecommendation?: (rec: Recommendation) => void;
  currentNiche?: string;
  currentProductType?: string;
}

const RATING_OPTIONS = [
  { value: "excellent", label: "🔥 Excellent", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { value: "good", label: "✅ Good", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { value: "average", label: "😐 Average", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { value: "poor", label: "👎 Poor", color: "bg-red-500/10 text-red-700 dark:text-red-300" },
];

export default function LaunchIntelligenceAgent({ userId, onApplyRecommendation, currentNiche, currentProductType }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("insights");

  // Insights
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [recentBuilds, setRecentBuilds] = useState<RecentBuild[]>([]);
  const [totalBuilds, setTotalBuilds] = useState(0);

  // Recommendation
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  // Feedback
  const [feedbackProjectId, setFeedbackProjectId] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("");
  const [feedbackSales, setFeedbackSales] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [feedbackAffInterest, setFeedbackAffInterest] = useState("");
  const [feedbackSocial, setFeedbackSocial] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("launch-intelligence", {
        body: { mode: "get-insights" },
      });
      if (error) throw error;
      setTotalBuilds(data.totalBuilds || 0);
      setProfile(data.creatorProfile || null);
      setInsights(data.insights || null);
      setRecentBuilds(data.recentBuilds || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = async () => {
    setRecLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("launch-intelligence", {
        body: { mode: "get-recommendation", niche: currentNiche, productType: currentProductType },
      });
      if (error) throw error;
      setRecommendation(data);
      if (data.hasRecommendation) toast.success("Smart recommendation generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to get recommendation");
    } finally {
      setRecLoading(false);
    }
  };

  const saveFeedback = async () => {
    if (!feedbackProjectId || !feedbackRating) {
      toast.error("Select a project and rating");
      return;
    }
    setSavingFeedback(true);
    try {
      const { error } = await supabase.functions.invoke("launch-intelligence", {
        body: {
          mode: "save-feedback",
          projectId: feedbackProjectId,
          feedback: {
            rating: feedbackRating,
            salesCount: feedbackSales ? parseInt(feedbackSales) : null,
            affiliateInterest: feedbackAffInterest || null,
            socialEngagement: feedbackSocial || null,
            notes: feedbackNotes || null,
          },
        },
      });
      if (error) throw error;
      toast.success("Feedback saved! The agent is learning.");
      setFeedbackRating("");
      setFeedbackSales("");
      setFeedbackNotes("");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSavingFeedback(false);
    }
  };

  useEffect(() => {
    if (userId) loadInsights();
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Launch Intelligence Agent</h3>
          <p className="text-sm text-muted-foreground">Your AI learns from every build. Gets smarter with each launch.</p>
        </div>
        {totalBuilds > 0 && (
          <Badge variant="outline" className="ml-auto">{totalBuilds} builds tracked</Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full h-auto flex-wrap gap-1">
          <TabsTrigger value="insights" className="gap-1 text-xs"><BarChart3 className="w-3 h-3" /> Insights</TabsTrigger>
          <TabsTrigger value="recommend" className="gap-1 text-xs"><Sparkles className="w-3 h-3" /> Smart Build</TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1 text-xs"><Star className="w-3 h-3" /> Feedback</TabsTrigger>
          <TabsTrigger value="history" className="gap-1 text-xs"><Clock className="w-3 h-3" /> History</TabsTrigger>
        </TabsList>

        {/* === INSIGHTS TAB === */}
        <TabsContent value="insights" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : totalBuilds === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center space-y-3">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground/30" />
                <h4 className="font-semibold">No Launch Data Yet</h4>
                <p className="text-sm text-muted-foreground">
                  Complete your first product launch and the Intelligence Agent will start learning your patterns.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Creator Profile */}
              {profile && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-5">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" /> Your Creator DNA
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <p className="text-2xl font-bold text-primary">{profile.totalBuilds}</p>
                        <p className="text-[10px] text-muted-foreground">Products Built</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <p className="text-2xl font-bold text-primary">
                          {profile.successRate !== null ? `${profile.successRate}%` : "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <p className="text-2xl font-bold text-primary">${profile.avgPricePoint}</p>
                        <p className="text-[10px] text-muted-foreground">Avg Price</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <p className="text-2xl font-bold text-primary">{profile.mechanismsUsed}</p>
                        <p className="text-[10px] text-muted-foreground">Mechanisms Created</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.topNiche && <Badge variant="outline" className="text-xs">🎯 {profile.topNiche}</Badge>}
                      {profile.topProductType && <Badge variant="outline" className="text-xs">📦 {profile.topProductType}</Badge>}
                      <Badge variant="outline" className="text-xs">🏪 {profile.favoritePlatform}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Insights */}
              {insights && (
                <div className="space-y-3">
                  {insights.patterns?.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" /> Winning Patterns Detected
                        </h4>
                        <ul className="space-y-1.5">
                          {insights.patterns.map((p, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {insights.strengths?.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" /> Your Strengths
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {insights.strengths.map((s, i) => (
                            <Badge key={i} className="bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">{s}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {insights.opportunities?.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-500" /> Growth Opportunities
                        </h4>
                        <ul className="space-y-1.5">
                          {insights.opportunities.map((o, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <ArrowRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                              {o}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {insights.warningPatterns?.length > 0 && (
                    <Card className="border-destructive/30">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" /> Watch Out
                        </h4>
                        <ul className="space-y-1.5">
                          {insights.warningPatterns.map((w, i) => (
                            <li key={i} className="text-sm text-muted-foreground">{w}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Next Product Suggestion */}
                  {insights.nextProductSuggestion && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-5">
                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" /> AI Recommended Next Product
                        </h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Niche</p>
                            <p className="text-sm font-medium">{insights.nextProductSuggestion.niche}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Type</p>
                            <p className="text-sm font-medium">{insights.nextProductSuggestion.productType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Mechanism</p>
                            <p className="text-sm font-medium text-primary">{insights.nextProductSuggestion.mechanismName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="text-sm font-medium">${insights.nextProductSuggestion.pricePoint}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 p-2 bg-background/50 rounded">
                          {insights.nextProductSuggestion.reasoning}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <Button variant="outline" size="sm" onClick={loadInsights} disabled={loading} className="gap-1">
                <Loader2 className={`w-3 h-3 ${loading ? "animate-spin" : "hidden"}`} />
                Refresh Insights
              </Button>
            </>
          )}
        </TabsContent>

        {/* === SMART BUILD TAB === */}
        <TabsContent value="recommend" className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h4 className="font-semibold text-sm">Get a Smart Recommendation</h4>
              <p className="text-xs text-muted-foreground">
                The agent analyzes your successful past builds and suggests an optimized product structure.
              </p>
              <Button onClick={getRecommendation} disabled={recLoading || totalBuilds < 2} className="gap-2 w-full">
                {recLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {totalBuilds < 2 ? "Need 2+ builds to recommend" : "Generate Smart Blueprint"}
              </Button>
            </CardContent>
          </Card>

          {recommendation?.hasRecommendation && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {recommendation.blueprintName || "Optimized Blueprint"}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${
                      recommendation.confidence === "high" ? "bg-emerald-500/10 text-emerald-700" :
                      recommendation.confidence === "medium" ? "bg-amber-500/10 text-amber-700" :
                      "bg-secondary"
                    }`}>
                      {recommendation.confidence} confidence
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {recommendation.suggestedNiche && (
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-[10px] text-muted-foreground font-semibold">NICHE</p>
                      <p className="text-sm font-medium">{recommendation.suggestedNiche}</p>
                    </div>
                  )}
                  {recommendation.suggestedTopic && (
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-[10px] text-muted-foreground font-semibold">TOPIC</p>
                      <p className="text-sm font-medium">{recommendation.suggestedTopic}</p>
                    </div>
                  )}
                  {recommendation.suggestedAudience && (
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-[10px] text-muted-foreground font-semibold">AUDIENCE</p>
                      <p className="text-sm font-medium">{recommendation.suggestedAudience}</p>
                    </div>
                  )}
                  {recommendation.suggestedMechanism && (
                    <div className="p-3 rounded-lg bg-primary/10">
                      <p className="text-[10px] text-muted-foreground font-semibold">MECHANISM</p>
                      <p className="text-sm font-bold text-primary">{recommendation.suggestedMechanism}</p>
                    </div>
                  )}
                  {recommendation.suggestedPrice && (
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-[10px] text-muted-foreground font-semibold">PRICE</p>
                      <p className="text-sm font-medium">${recommendation.suggestedPrice}</p>
                    </div>
                  )}
                  {recommendation.suggestedSalesStyle && (
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-[10px] text-muted-foreground font-semibold">SALES STYLE</p>
                      <p className="text-sm font-medium">{recommendation.suggestedSalesStyle}</p>
                    </div>
                  )}
                </div>

                {recommendation.reasoning && (
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">WHY THIS WILL WORK</p>
                    <p className="text-sm">{recommendation.reasoning}</p>
                  </div>
                )}

                {onApplyRecommendation && (
                  <Button onClick={() => onApplyRecommendation(recommendation)} className="gap-2 w-full">
                    <Zap className="w-4 h-4" /> Apply This Blueprint
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === FEEDBACK TAB === */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Star className="w-4 h-4" /> Rate a Launch
              </h4>
              <p className="text-xs text-muted-foreground">
                Tell the agent how your launches performed so it can learn and improve recommendations.
              </p>

              {recentBuilds.length > 0 ? (
                <>
                  <Select value={feedbackProjectId} onValueChange={setFeedbackProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {recentBuilds.filter(b => b.projectId).map(b => (
                        <SelectItem key={b.id} value={b.projectId}>
                          {b.niche} — {b.productType} (${b.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Performance Rating</p>
                    <div className="flex flex-wrap gap-2">
                      {RATING_OPTIONS.map(opt => (
                        <Badge
                          key={opt.value}
                          className={`cursor-pointer text-xs transition-all ${
                            feedbackRating === opt.value ? opt.color + " ring-2 ring-primary" : "bg-secondary hover:bg-secondary/80"
                          }`}
                          onClick={() => setFeedbackRating(opt.value)}
                        >
                          {opt.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sales Count (optional)</p>
                      <Input type="number" value={feedbackSales} onChange={e => setFeedbackSales(e.target.value)} placeholder="e.g. 25" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Affiliate Interest</p>
                      <Select value={feedbackAffInterest} onValueChange={setFeedbackAffInterest}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes (optional)</p>
                    <Textarea value={feedbackNotes} onChange={e => setFeedbackNotes(e.target.value)} placeholder="What worked? What didn't?" rows={3} />
                  </div>

                  <Button onClick={saveFeedback} disabled={savingFeedback || !feedbackProjectId || !feedbackRating} className="gap-2 w-full">
                    {savingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Feedback
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Complete a launch first to provide feedback.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === HISTORY TAB === */}
        <TabsContent value="history" className="space-y-3">
          {recentBuilds.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No builds tracked yet.</p>
              </CardContent>
            </Card>
          ) : (
            recentBuilds.map(build => (
              <Card key={build.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{build.niche || "Unknown niche"}</p>
                        <Badge variant="outline" className="text-[10px]">{build.productType}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {build.mechanismName && <span>🔧 {build.mechanismName}</span>}
                        <span>💰 ${build.price}</span>
                        <span>🏪 {build.platform}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {build.rating && build.rating !== "not_rated" && (
                        <Badge className={`text-xs ${
                          RATING_OPTIONS.find(r => r.value === build.rating)?.color || "bg-secondary"
                        }`}>
                          {RATING_OPTIONS.find(r => r.value === build.rating)?.label || build.rating}
                        </Badge>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(build.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
