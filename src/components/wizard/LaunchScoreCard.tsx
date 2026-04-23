import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, DollarSign, Sparkles, Loader2, Check, X, ArrowUpRight } from "lucide-react";
import type { LaunchScore } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BoostUpgrade {
  current: string | number;
  improved: string | number;
  why: string;
}
interface BoostResult {
  weakestDimensions: string[];
  upgrades: Partial<Record<"niche" | "audience" | "topic" | "mechanism" | "price", BoostUpgrade>>;
  projectedScore: number;
  summary: string;
}

interface Props {
  score: LaunchScore;
  // Optional context + setters for AI Boost
  niche?: string;
  setNiche?: (v: string) => void;
  targetAudience?: string;
  setTargetAudience?: (v: string) => void;
  topic?: string;
  setTopic?: (v: string) => void;
  productType?: string;
  productConcept?: string;
  uniqueMechanism?: string;
  selectedAngle?: string;
  price?: number;
  setPrice?: (v: number) => void;
  setUniqueMechanism?: (v: string) => void;
  onRescore?: () => void;
}

const dimensions = [
  { key: "demand", label: "Demand Potential" },
  { key: "competition", label: "Competition Edge" },
  { key: "monetization", label: "Monetization" },
  { key: "audienceClarity", label: "Audience Clarity" },
  { key: "offerStrength", label: "Offer Strength" },
] as const;

function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

function getVerdict(score: LaunchScore): { color: string; bg: string; border: string; icon: string; label: string } {
  const v = score.verdict || (score.overall >= 75 ? "green" : score.overall >= 50 ? "yellow" : "red");
  if (v === "green") return { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30", icon: "🟢", label: "Strong — Build This Now" };
  if (v === "yellow") return { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "🟡", label: "Viable — Sharpen Your Angle" };
  return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", icon: "🔴", label: "Risky — Consider Pivoting" };
}

const FIELD_LABEL: Record<string, string> = {
  niche: "Sharpened Niche",
  audience: "Tighter Audience",
  topic: "Stronger Topic Angle",
  mechanism: "Mechanism Upgrade",
  price: "Pricing Tweak",
};

export default function LaunchScoreCard(props: Props) {
  const { score } = props;
  const verdict = getVerdict(score);
  const canBoost = !!(props.setNiche || props.setTargetAudience || props.setTopic || props.setPrice || props.setUniqueMechanism);

  const [boosting, setBoosting] = useState(false);
  const [boost, setBoost] = useState<BoostResult | null>(null);
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [delta, setDelta] = useState<number | null>(null);
  const prevOverallRef = useRef<number>(score.overall);

  // Detect score increase after Apply All to show +N pts chip
  useEffect(() => {
    const prev = prevOverallRef.current;
    if (score.overall > prev) {
      setDelta(score.overall - prev);
      const t = setTimeout(() => setDelta(null), 3000);
      return () => clearTimeout(t);
    }
    prevOverallRef.current = score.overall;
  }, [score.overall]);

  const runBoost = async () => {
    setBoosting(true);
    setBoost(null);
    setAppliedKeys(new Set());
    try {
      const { data, error } = await supabase.functions.invoke("boost-launch-score", {
        body: {
          niche: props.niche,
          targetAudience: props.targetAudience,
          productType: props.productType,
          topic: props.topic,
          productConcept: props.productConcept,
          uniqueMechanism: props.uniqueMechanism,
          selectedAngle: props.selectedAngle,
          price: props.price,
          launchScore: score,
        },
      });
      if (error) throw error;
      setBoost(data);
      toast.success(`AI projects +${Math.max(0, (data.projectedScore || 0) - score.overall)} pts boost`);
    } catch (e: any) {
      toast.error(e.message || "Boost failed");
    } finally {
      setBoosting(false);
    }
  };

  const applyOne = (key: string, upgrade: BoostUpgrade) => {
    const improved = upgrade.improved;
    if (key === "niche" && props.setNiche) props.setNiche(String(improved));
    else if (key === "audience" && props.setTargetAudience) props.setTargetAudience(String(improved));
    else if (key === "topic" && props.setTopic) props.setTopic(String(improved));
    else if (key === "price" && props.setPrice) props.setPrice(Number(improved) || props.price || 17);
    else if (key === "mechanism" && props.setUniqueMechanism) props.setUniqueMechanism(String(improved));
    else {
      toast.error("This field is not editable here");
      return;
    }
    setAppliedKeys(prev => new Set(prev).add(key));
    toast.success(`Applied ${FIELD_LABEL[key]}`);
  };

  const applyAll = () => {
    if (!boost) return;
    prevOverallRef.current = score.overall;
    Object.entries(boost.upgrades).forEach(([key, upgrade]) => {
      if (!upgrade || appliedKeys.has(key)) return;
      const improved = upgrade.improved;
      if (key === "niche" && props.setNiche) props.setNiche(String(improved));
      else if (key === "audience" && props.setTargetAudience) props.setTargetAudience(String(improved));
      else if (key === "topic" && props.setTopic) props.setTopic(String(improved));
      else if (key === "price" && props.setPrice) props.setPrice(Number(improved) || props.price || 17);
      else if (key === "mechanism" && props.setUniqueMechanism) props.setUniqueMechanism(String(improved));
    });
    setAppliedKeys(new Set(Object.keys(boost.upgrades)));
    toast.success("All upgrades applied — re-scoring...");
    setTimeout(() => props.onRescore?.(), 200);
  };

  const showBoostBtn = canBoost && score.overall < 80;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-6 space-y-5">
        {/* Header with overall score + verdict */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Launch Score</h3>
            {delta !== null && delta > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/40 text-green-500 text-xs font-bold animate-in fade-in slide-in-from-left-2">
                <ArrowUpRight className="w-3 h-3" /> +{delta} pts
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showBoostBtn && (
              <Button
                size="sm"
                onClick={runBoost}
                disabled={boosting}
                className="gap-1.5 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-white"
              >
                {boosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Boost Score to 80+
              </Button>
            )}
            <div className="text-right space-y-1">
              <div className={`text-3xl font-black ${getScoreColor(score.overall)}`}>
                {score.overall}<span className="text-lg text-muted-foreground">/100</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${verdict.bg} ${verdict.border} border`}>
                <span>{verdict.icon}</span>
                <span className={verdict.color}>{verdict.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dimension bars */}
        <div className="space-y-3">
          {dimensions.map(dim => {
            const value = score[dim.key];
            const weak = typeof value === "number" && value <= 6;
            return (
              <div key={dim.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{dim.label}</span>
                    {weak && canBoost && (
                      <button
                        onClick={runBoost}
                        disabled={boosting}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                      >
                        Weak — Fix
                      </button>
                    )}
                  </div>
                  <span className="font-semibold">{value}/10</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${value * 10}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Boost Panel */}
        {boost && (
          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/30">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h4 className="font-bold text-sm">AI Boost Recommendations</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 font-semibold">
                  Projected: {boost.projectedScore}/100
                </span>
              </div>
              <button onClick={() => setBoost(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            {boost.summary && <p className="text-xs text-muted-foreground italic">{boost.summary}</p>}

            <div className="space-y-2">
              {Object.entries(boost.upgrades).map(([key, upgrade]) => {
                if (!upgrade) return null;
                const applied = appliedKeys.has(key);
                return (
                  <div key={key} className="p-3 rounded-md bg-background/50 border border-border space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wide text-primary">
                        {FIELD_LABEL[key] || key}
                      </span>
                      <Button
                        size="sm"
                        variant={applied ? "secondary" : "outline"}
                        onClick={() => applyOne(key, upgrade)}
                        disabled={applied}
                        className="h-7 text-xs gap-1"
                      >
                        {applied ? (<><Check className="w-3 h-3" /> Applied</>) : "Apply"}
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</div>
                        <div className="text-muted-foreground line-through">{String(upgrade.current)}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase tracking-wide text-green-500">Improved</div>
                        <div className="text-foreground font-medium">{String(upgrade.improved)}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Why: </span>{upgrade.why}
                    </p>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={applyAll}
              className="w-full gap-2 bg-gradient-to-r from-accent to-primary text-white hover:opacity-90"
              size="sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply All & Re-Score
            </Button>
          </div>
        )}

        {/* Price ceiling + affiliate */}
        {(score.estimatedPriceCeiling || score.affiliateCommissionSweet) && (
          <div className="flex flex-wrap gap-3">
            {score.estimatedPriceCeiling && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Price Ceiling:</span>
                <span className="font-semibold">${score.estimatedPriceCeiling}</span>
              </div>
            )}
            {score.affiliateCommissionSweet && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm">
                <span className="text-muted-foreground">Affiliate Sweet Spot:</span>
                <span className="font-semibold">{score.affiliateCommissionSweet}</span>
              </div>
            )}
          </div>
        )}

        {/* AI-suggested pivots for low scores */}
        {score.suggestedPivots && score.suggestedPivots.length > 0 && score.overall < 50 && (
          <div className="space-y-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h4 className="font-semibold text-sm">Suggested Pivots</h4>
            </div>
            <ul className="space-y-1.5">
              {score.suggestedPivots.map((p, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">→</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {score.suggestions?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <h4 className="font-semibold text-sm">AI Improvement Suggestions</h4>
            </div>
            <ul className="space-y-1.5">
              {score.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
