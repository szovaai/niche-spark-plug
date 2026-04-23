import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Loader2, Zap, Lock, MessageSquareWarning, TrendingUp } from "lucide-react";
import { ContentAuditResult, auditFullContent, DimensionScore, tallyFactoryAssets } from "@/lib/contentAudit";
import { Step2Content } from "@/types/launchWizard";
import type { ProductAssets } from "@/types/productAssets";

interface Props {
  content: Step2Content;
  assets?: ProductAssets;
  onExpandChapter?: (chapterIndex: number) => void;
  expandingIndex?: number | null;
  onHumanize?: () => void;
  humanizing?: boolean;
}

const statusConfig: Record<DimensionScore["status"], { color: string; label: string; icon: typeof CheckCircle }> = {
  pass: { color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", label: "Pass", icon: CheckCircle },
  "needs-improvement": { color: "text-amber-400 border-amber-500/30 bg-amber-500/10", label: "Needs Improvement", icon: AlertTriangle },
  weak: { color: "text-orange-400 border-orange-500/30 bg-orange-500/10", label: "Weak Promise", icon: MessageSquareWarning },
  unsafe: { color: "text-destructive border-destructive/30 bg-destructive/10", label: "Unsafe / Risky", icon: ShieldAlert },
};

const ASSET_CHIPS: { key: keyof ProductAssets; label: string; emoji: string }[] = [
  { key: "workbook", label: "Workbook", emoji: "📘" },
  { key: "cheatsheet", label: "Cheatsheet", emoji: "⚡" },
  { key: "toolkit", label: "Toolkit", emoji: "🧰" },
  { key: "templates", label: "Templates", emoji: "📝" },
  { key: "promptPack", label: "Prompts", emoji: "💬" },
  { key: "bonusGuides", label: "Bonuses", emoji: "🎁" },
  { key: "caseStudies", label: "Cases", emoji: "📈" },
];

export default function ContentQualityReport({ content, assets, onExpandChapter, expandingIndex, onHumanize, humanizing }: Props) {
  const [open, setOpen] = useState(true);
  const audit = auditFullContent(content, assets);
  const assetDepthDim = audit.dimensions.find(d => d.label === "Asset Depth");

  // Animated +N pts delta when Asset Depth jumps after generation
  const prevAssetDepth = useRef<number | null>(null);
  const [delta, setDelta] = useState<number | null>(null);
  useEffect(() => {
    if (!assetDepthDim) return;
    const current = assetDepthDim.score;
    if (prevAssetDepth.current !== null && current > prevAssetDepth.current) {
      const diff = current - prevAssetDepth.current;
      setDelta(diff);
      const t = setTimeout(() => setDelta(null), 3000);
      prevAssetDepth.current = current;
      return () => clearTimeout(t);
    }
    prevAssetDepth.current = current;
  }, [assetDepthDim?.score]);

  if (audit.dimensions.length === 0) return null;

  const overallColor = audit.overall >= 75 ? "text-emerald-400" : audit.overall >= 50 ? "text-amber-400" : "text-destructive";
  const weakDims = audit.dimensions.filter(d => d.status !== "pass");

  return (
    <Card className="border-accent/20 overflow-hidden">
      {/* Gate banner */}
      {audit.gateMessage && (
        <div className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 ${
          audit.canContinue ? "bg-amber-500/10 text-amber-300 border-b border-amber-500/20" : "bg-destructive/10 text-destructive border-b border-destructive/20"
        }`}>
          {audit.canContinue ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <Lock className="w-3.5 h-3.5 shrink-0" />}
          {audit.gateMessage}
        </div>
      )}

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-accent/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {audit.canContinue && audit.overall >= 70 ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <p className="font-semibold text-sm">Pre-Continue Optimization Report</p>
                  <p className="text-xs text-muted-foreground">
                    {weakDims.length === 0 ? "All 8 pillars pass — ready to continue." : `${weakDims.length} pillar(s) need attention before continuing.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-2xl font-black tabular-nums ${overallColor}`}>{audit.overall}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">/ 100</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 pb-5 pt-0 space-y-4">
            {/* Overall progress */}
            <div className="space-y-1">
              <Progress value={audit.overall} className="h-2.5" />
            </div>

            {/* 8 Scoring Pillars */}
            <div className="grid gap-3">
              {audit.dimensions.map((dim, i) => {
                const cfg = statusConfig[dim.status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={i} className={`rounded-lg border p-3 space-y-2 ${dim.status === "pass" ? "border-border/40" : cfg.color.split(" ").slice(2).join(" ") + " border-" + cfg.color.split("border-")[1]?.split(" ")[0]}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{dim.icon}</span>
                        <span className="text-sm font-semibold">{dim.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums">{dim.score}/100</span>
                        <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={dim.score} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">{dim.details}</p>
                    {/* Coaching message */}
                    {dim.status !== "pass" && (
                      <p className="text-xs font-medium text-amber-300/90 flex items-start gap-1.5">
                        <Zap className="w-3 h-3 shrink-0 mt-0.5" />
                        {dim.coaching}
                      </p>
                    )}
                    {dim.flaggedItems && dim.flaggedItems.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {dim.flaggedItems.slice(0, 6).map((item, j) => (
                          <Badge key={j} variant="outline" className="text-[10px] text-destructive/80 border-destructive/20">
                            "{item}"
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Coaching summary */}
            {audit.coachingMessages.length > 0 && (
              <div className="rounded-lg bg-secondary/40 border border-border/50 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What to fix next</p>
                <ul className="space-y-1.5">
                  {audit.coachingMessages.slice(0, 6).map((msg, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-400 shrink-0">→</span>
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {onHumanize && (
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs" disabled={humanizing} onClick={onHumanize}>
                  {humanizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Humanize + Simplify All
                </Button>
              )}
              {audit.overall < 80 && onExpandChapter && (
                <>
                  {content.chapters?.map((ch, i) => (
                    <Button key={i} variant="outline" size="sm" className="text-xs gap-1" disabled={expandingIndex === i} onClick={() => onExpandChapter(i)}>
                      {expandingIndex === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Fix Ch {i + 1}
                    </Button>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
