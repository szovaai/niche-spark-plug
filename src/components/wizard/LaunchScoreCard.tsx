import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import type { LaunchScore } from "@/types/launchWizard";

interface Props {
  score: LaunchScore;
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

export default function LaunchScoreCard({ score }: Props) {
  const verdict = getVerdict(score);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-6 space-y-5">
        {/* Header with overall score + verdict */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Launch Score</h3>
          </div>
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

        {/* Dimension bars */}
        <div className="space-y-3">
          {dimensions.map(dim => {
            const value = score[dim.key];
            return (
              <div key={dim.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{dim.label}</span>
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
