import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Loader2, Lightbulb, Sparkles, Trophy, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GradeAxis {
  score: number;
  suggestion: string;
}

interface GradeResult {
  scores: {
    clarity: GradeAxis;
    actionability: GradeAxis;
    uniqueness: GradeAxis;
    engagement: GradeAxis;
    salesPower: GradeAxis;
    readability: GradeAxis;
  };
  overall: number;
  topStrength: string;
  biggestGap: string;
  oneLineSummary: string;
}

const AXIS_LABELS: Record<string, { label: string; color: string }> = {
  clarity: { label: "Clarity", color: "hsl(var(--primary))" },
  actionability: { label: "Actionability", color: "hsl(210, 80%, 60%)" },
  uniqueness: { label: "Uniqueness", color: "hsl(280, 70%, 60%)" },
  engagement: { label: "Engagement", color: "hsl(30, 90%, 55%)" },
  salesPower: { label: "Sales Power", color: "hsl(0, 75%, 55%)" },
  readability: { label: "Readability", color: "hsl(150, 60%, 45%)" },
};

interface ContentGraderProps {
  text: string;
  productTitle?: string;
  targetAudience?: string;
  onAutoFix?: (axis: string, suggestion: string) => void;
}

export default function ContentGrader({ text, productTitle, targetAudience, onAutoFix }: ContentGraderProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);

  const grade = async () => {
    if (!text || text.length < 50) {
      toast.error("Need at least 50 characters to grade");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("grade-content", {
        body: { text, productTitle, targetAudience },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      toast.error(e.message || "Grading failed");
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <Button variant="outline" size="sm" onClick={grade} disabled={loading} className="gap-1.5 text-xs">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5" />}
        Grade Content
      </Button>
    );
  }

  const overallColor = result.overall >= 80 ? "text-green-500" : result.overall >= 60 ? "text-amber-400" : "text-destructive";

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">Content Quality Score</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${overallColor}`}>{result.overall}</span>
            <span className="text-sm text-muted-foreground">/100</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={grade} disabled={loading}>
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Re-grade"}
            </Button>
          </div>
        </div>

        {/* Radar-style Bars */}
        <div className="space-y-2.5">
          {Object.entries(result.scores).map(([key, axis]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{AXIS_LABELS[key]?.label || key}</span>
                <span className={axis.score >= 7 ? "text-green-500" : axis.score >= 5 ? "text-amber-400" : "text-destructive"}>
                  {axis.score}/10
                </span>
              </div>
              <Progress value={axis.score * 10} className="h-2" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex-1">{axis.suggestion}</p>
                {onAutoFix && axis.score < 7 && (
                  <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] gap-0.5 shrink-0 ml-2" onClick={() => onAutoFix(key, axis.suggestion)}>
                    <Sparkles className="w-2.5 h-2.5" /> Fix
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <div className="flex items-start gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Strength</p>
              <p className="text-xs">{result.topStrength}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Biggest Gap</p>
              <p className="text-xs">{result.biggestGap}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-secondary/50">
          <Lightbulb className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">{result.oneLineSummary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
