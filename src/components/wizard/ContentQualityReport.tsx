import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, AlertTriangle, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { ContentAuditResult, auditFullContent } from "@/lib/contentAudit";
import { Step2Content } from "@/types/launchWizard";

interface Props {
  content: Step2Content;
  onExpandChapter?: (chapterIndex: number) => void;
  expandingIndex?: number | null;
}

const gradeColor: Record<string, string> = {
  A: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  B: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  C: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  D: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  F: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function ContentQualityReport({ content, onExpandChapter, expandingIndex }: Props) {
  const [open, setOpen] = useState(false);
  const audit = auditFullContent(content);

  if (audit.dimensions.length === 0) return null;

  const overallColor = audit.overall >= 80 ? "text-emerald-400" : audit.overall >= 60 ? "text-amber-400" : "text-destructive";

  return (
    <Card className="border-accent/20">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-accent/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {audit.overall >= 70 ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <p className="font-semibold text-sm">Content Quality Report</p>
                  <p className="text-xs text-muted-foreground">
                    Your content is <span className={`font-bold ${overallColor}`}>{audit.overall}%</span> specific and actionable
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black ${overallColor}`}>{audit.overall}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            {audit.dimensions.map((dim, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dim.label}</span>
                  <Badge variant="outline" className={`text-xs ${gradeColor[dim.grade] || ""}`}>
                    {dim.grade}
                  </Badge>
                </div>
                <Progress value={dim.score} className="h-1.5" />
                <p className="text-xs text-muted-foreground">{dim.details}</p>
                {dim.flaggedItems && dim.flaggedItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dim.flaggedItems.slice(0, 5).map((item, j) => (
                      <Badge key={j} variant="outline" className="text-[10px] text-destructive/80 border-destructive/20">
                        "{item}"
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {audit.overall < 80 && onExpandChapter && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">
                  Expand weak chapters to add examples, walkthroughs, and troubleshooting:
                </p>
                <div className="flex flex-wrap gap-2">
                  {content.chapters?.map((ch, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      disabled={expandingIndex === i}
                      onClick={() => onExpandChapter(i)}
                    >
                      {expandingIndex === i ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Ch {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
