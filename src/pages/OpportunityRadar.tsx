import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Radar, TrendingUp, Zap, ArrowRight, RefreshCw, Sparkles,
  Target, DollarSign, Users, Flame, Copy, Wand2, Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Opportunity {
  title: string;
  niche: string;
  description: string;
  demandScore: number;
  competitionScore: number;
  monetizationScore: number;
  audienceUrgency: number;
  launchScore: number;
  suggestedPrice: number;
  targetAudience: string;
  mechanism: string;
  salesPromise: string;
  tags: string[];
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "ai-tools", label: "AI Tools" },
  { value: "marketing", label: "Marketing" },
  { value: "automation", label: "Automation" },
  { value: "freelancing", label: "Freelancing" },
  { value: "content-creation", label: "Content Creation" },
  { value: "e-commerce", label: "E-Commerce" },
];

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500/10 border-green-500/30";
  if (score >= 60) return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-red-500/10 border-red-500/30";
}

const OpportunityRadar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    if (!user) {
      toast.error("Sign in to discover opportunities");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("opportunity-radar", {
        body: { category },
      });
      if (error) throw error;
      setOpportunities(data.opportunities || []);
      toast.success("Fresh opportunities loaded!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const launchFromOpportunity = (opp: Opportunity) => {
    // Navigate to wizard with pre-filled data via query params
    const params = new URLSearchParams({
      niche: opp.niche,
      topic: opp.title,
      audience: opp.targetAudience,
      mechanism: opp.mechanism,
    });
    navigate(`/wizard?${params.toString()}`);
  };

  const cloneVariation = (opp: Opportunity) => {
    toast.success(`Generating variation of "${opp.title}"...`);
    // Re-fetch with the niche as filter to get similar ideas
    setCategory(opp.niche.toLowerCase().replace(/\s+/g, "-"));
    fetchOpportunities();
  };

  return (
    <DashboardLayout title="Opportunity Radar">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Radar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Opportunity Radar</h1>
              <p className="text-sm text-muted-foreground">
                AI-detected product opportunities based on real market signals
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={fetchOpportunities} disabled={loading} className="gap-2">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
                  {loading ? "Scanning Market..." : opportunities.length > 0 ? "Refresh Opportunities" : "Scan for Opportunities"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && opportunities.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Radar className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Discover Opportunities</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Click "Scan for Opportunities" to have AI analyze the market and find trending digital product ideas you can launch today.
            </p>
            <Button onClick={fetchOpportunities} size="lg" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Scan Market Now
            </Button>
          </motion.div>
        )}

        {/* Opportunities Grid */}
        {!loading && opportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {opportunities.map((opp, i) => (
                <motion.div
                  key={opp.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/40 ${
                      expanded === opp.title ? "ring-2 ring-primary/30" : ""
                    }`}
                    onClick={() => setExpanded(expanded === opp.title ? null : opp.title)}
                  >
                    <CardContent className="p-5 space-y-3">
                      {/* Score + Title */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-bold text-sm leading-tight">{opp.title}</h3>
                          <p className="text-xs text-muted-foreground">{opp.niche}</p>
                        </div>
                        <div className={`text-2xl font-black ${getScoreColor(opp.launchScore)} shrink-0`}>
                          {opp.launchScore}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed">{opp.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {opp.tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] py-0">{tag}</Badge>
                        ))}
                      </div>

                      {/* Score Bars */}
                      <div className="space-y-1.5">
                        <ScoreBar label="Demand" value={opp.demandScore} />
                        <ScoreBar label="Monetization" value={opp.monetizationScore} />
                        <ScoreBar label="Urgency" value={opp.audienceUrgency} />
                      </div>

                      {/* Price + Audience */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <DollarSign className="w-3 h-3" />${opp.suggestedPrice}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />{opp.targetAudience}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expanded === opp.title && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-3 overflow-hidden"
                          >
                            <div className="pt-2 border-t border-border space-y-2">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Unique Mechanism</p>
                                <p className="text-sm font-medium">{opp.mechanism}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sales Promise</p>
                                <p className="text-sm">{opp.salesPromise}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1 gap-1.5" onClick={(e) => { e.stopPropagation(); launchFromOpportunity(opp); }}>
                                  <Wand2 className="w-3.5 h-3.5" />
                                  Build This Product
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1.5" onClick={(e) => { e.stopPropagation(); cloneVariation(opp); }}>
                                  <Copy className="w-3.5 h-3.5" />
                                  Variations
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const ScoreBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
    <Progress value={value * 10} className="flex-1 h-1.5" />
    <span className="text-[10px] font-medium w-4 text-right">{value}</span>
  </div>
);

export default OpportunityRadar;
