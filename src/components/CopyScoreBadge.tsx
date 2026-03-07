import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { CopyScore } from "@/lib/copyUtils";

interface Props {
  score: CopyScore;
  className?: string;
}

export default function CopyScoreBadge({ score, className = "" }: Props) {
  const [expanded, setExpanded] = useState(false);

  const color = score.total >= 75
    ? "bg-green-500/10 text-green-400 border-green-500/30"
    : score.total >= 50
    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
    : "bg-red-500/10 text-red-400 border-red-500/30";

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Badge className={`${color} border text-xs font-bold`}>
          {score.total}/100
        </Badge>
        {score.ready ? (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle2 className="w-3 h-3" /> Ready to Use
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-yellow-400">
            <AlertTriangle className="w-3 h-3" /> Needs Improvement
          </span>
        )}
        {score.suggestions.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {score.suggestions.length} fix{score.suggestions.length !== 1 && 'es'}
          </Button>
        )}
      </div>

      {expanded && score.suggestions.length > 0 && (
        <Card className="mt-2 border-border/50">
          <CardContent className="p-3 space-y-1.5">
            {score.suggestions.map((s, i) => (
              <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <AlertTriangle className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
                {s}
              </p>
            ))}
            <div className="flex gap-4 pt-1 text-xs text-muted-foreground/70">
              <span>CTA: {score.ctaStrength}</span>
              <span>Grade Level: ~{score.readabilityGrade}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
