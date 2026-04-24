import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { calculateBoostScore, BAND_LABEL, BAND_CLASS, CATEGORY_LABELS, type BoostScoreInput } from "@/lib/boostScore";
import type { BoostScoreResult } from "@/types/toolkit";

interface Props {
  input: BoostScoreInput;
  onBoost?: () => void;
  isBoosting?: boolean;
}

export default function BoostScoreCard({ input, onBoost, isBoosting }: Props) {
  const result: BoostScoreResult = useMemo(() => calculateBoostScore(input), [
    input.title, input.subtitle, input.hook, input.promise, input.audience,
    input.productDescription, input.upsellBridge, input.niche,
    JSON.stringify(input.salesPageBullets || []),
  ]);

  const bandClass = BAND_CLASS[result.band];

  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${bandClass}`}>
            <span className="text-2xl font-bold leading-none">{result.overall}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">/100</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Boost Score</h3>
              <Badge variant="outline" className={`ml-auto ${bandClass}`}>
                {BAND_LABEL[result.band]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live analysis across 10 launch readiness factors. Updates as you edit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map(key => {
            const cat = result.categories[key];
            const color =
              cat.score >= 85 ? "bg-emerald-500" :
              cat.score >= 70 ? "bg-primary" :
              cat.score >= 50 ? "bg-amber-500" : "bg-destructive";
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{CATEGORY_LABELS[key]}</span>
                  <span className="tabular-nums text-muted-foreground">{cat.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full ${color} transition-all`} style={{ width: `${cat.score}%` }} />
                </div>
                {cat.score < 70 && (
                  <p className="text-[11px] text-muted-foreground leading-snug">{cat.tip}</p>
                )}
              </div>
            );
          })}
        </div>

        {onBoost && (
          <Button
            onClick={onBoost}
            disabled={isBoosting}
            variant="hero"
            className="w-full gap-2"
          >
            {isBoosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Boost This Product
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
