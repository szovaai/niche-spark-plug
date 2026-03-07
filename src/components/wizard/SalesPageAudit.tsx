import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CheckCircle, XCircle, Sparkles, Loader2, Shield } from "lucide-react";
import { auditSalesPage } from "@/lib/contentAudit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Step1Product, Step2Content, Step3Funnel } from "@/types/launchWizard";

interface Props {
  salesPageCopy: string;
  productBrief: Step1Product;
  productContent: Step2Content | null;
  onOptimized: (newFunnel: Step3Funnel) => void;
  price?: number;
}

export default function SalesPageAudit({ salesPageCopy, productBrief, productContent, onOptimized, price }: Props) {
  const [open, setOpen] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const { score, elements } = auditSalesPage(salesPageCopy);
  const missing = elements.filter(e => !e.present);
  const present = elements.filter(e => e.present);

  const scoreColor = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-destructive";

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const missingList = missing.map(m => `- ${m.name}: ${m.recommendation}`).join("\n");
      const { data, error } = await supabase.functions.invoke("generate-launch-funnel", {
        body: {
          productBrief,
          productContent,
          price: price || 17,
          optimizationMode: true,
          existingSalesPage: salesPageCopy,
          missingElements: missingList,
        },
      });
      if (error) throw error;
      onOptimized(data);
      toast.success("Sales page optimized with missing conversion elements!");
    } catch (e: any) {
      toast.error(e.message || "Optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card className="border-accent/20">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-accent/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-semibold text-sm">Sales Page Conversion Audit</p>
                  <p className="text-xs text-muted-foreground">
                    Your page is <span className={`font-bold ${scoreColor}`}>{score}%</span> optimized
                    {missing.length > 0 && ` — ${missing.length} element(s) missing`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black ${scoreColor}`}>{score}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 space-y-4">
            <Progress value={score} className="h-2" />

            {present.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Present</p>
                {present.map((el, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{el.name}</span>
                  </div>
                ))}
              </div>
            )}

            {missing.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Missing</p>
                {missing.map((el, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span className="font-medium">{el.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-5">{el.recommendation}</p>
                  </div>
                ))}
              </div>
            )}

            {missing.length > 0 && (
              <Button onClick={handleOptimize} disabled={optimizing} className="gap-2 w-full">
                {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Optimize This Page (+{missing.length} elements)
              </Button>
            )}

            {score >= 80 && (
              <div className="text-center py-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  🎯 High-Converting — Ready to Launch
                </Badge>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
