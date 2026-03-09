import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BelievabilityIssue {
  original: string;
  risk: string;
  rewrite: string;
  severity: "high" | "medium" | "low";
}

interface BelievabilityResult {
  overallScore: number;
  verdict: string;
  issues: BelievabilityIssue[];
  strengths: string[];
}

interface Props {
  copyText: string;
  productName: string;
}

export default function BelievabilityFilter({ copyText, productName }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BelievabilityResult | null>(null);

  const runCheck = async () => {
    if (!copyText?.trim()) {
      toast.error("No copy to check");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sales-hooks", {
        body: { productName, mode: "believability-check", copyText },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Believability check complete!");
    } catch {
      toast.error("Check failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict === "Safe") return "text-green-500";
    if (verdict === "Risky") return "text-red-500";
    return "text-amber-500";
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === "high") return "bg-red-500/10 text-red-600 border-red-500/20";
    if (severity === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-4 h-4 text-primary" />
          Believability Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Scan your sales copy for unrealistic claims, exaggerated promises, and refund-risk language. Get safer rewrites automatically.
        </p>

        <Button onClick={runCheck} disabled={loading || !copyText?.trim()} variant="outline" size="sm" className="gap-2">
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
          {result ? "Re-scan Copy" : "Run Believability Check"}
        </Button>

        {loading && (
          <div className="text-center text-sm text-muted-foreground animate-pulse py-4">
            Scanning copy for risky claims...
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Score + Verdict */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="text-center">
                <div className={cn("text-2xl font-bold", result.overallScore >= 80 ? "text-green-500" : result.overallScore >= 60 ? "text-amber-500" : "text-red-500")}>
                  {result.overallScore}
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div>
                <span className={cn("font-semibold", getVerdictColor(result.verdict))}>
                  {result.verdict === "Safe" && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                  {result.verdict === "Risky" && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                  {result.verdict}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {result.issues.length === 0 ? "No risky claims detected." : `${result.issues.length} issue${result.issues.length > 1 ? "s" : ""} found.`}
                </p>
              </div>
            </div>

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Strengths</p>
                {result.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-3 h-3 text-green-500 mt-1 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Issues Found</p>
                {result.issues.map((issue, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-red-500 line-through">{issue.original}</p>
                      <Badge variant="outline" className={cn("text-xs shrink-0", getSeverityBadge(issue.severity))}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{issue.risk}</p>
                    <div className="bg-green-500/5 border border-green-500/20 rounded p-2">
                      <p className="text-xs font-medium text-green-600 mb-1">Suggested rewrite:</p>
                      <p className="text-sm">{issue.rewrite}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
