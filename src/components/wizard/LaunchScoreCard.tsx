import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp } from "lucide-react";
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
  if (score >= 85) return "text-green-500";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Great";
  if (score >= 50) return "Good";
  return "Needs Work";
}

export default function LaunchScoreCard({ score }: Props) {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-6 space-y-5">
        {/* Header with overall score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Launch Score</h3>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-black ${getScoreColor(score.overall)}`}>
              {score.overall}<span className="text-lg text-muted-foreground">/100</span>
            </div>
            <Badge variant="outline" className="text-xs mt-1">{getScoreLabel(score.overall)}</Badge>
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
