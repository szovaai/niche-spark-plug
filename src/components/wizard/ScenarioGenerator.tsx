import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Copy, Check, Users, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Scenario {
  clientType: string;
  name: string;
  problem: string;
  action: string;
  exampleOutput: string;
  outreachMessage: string;
  result: string;
  timeToResult: string;
}

interface ScenarioData {
  scenarios: Scenario[];
  transformationSummary?: {
    before: string;
    after: string;
  };
}

interface Props {
  productTitle: string;
  niche: string;
  targetAudience: string;
  promisedResult: string;
  uniqueMechanism: string;
}

export default function ScenarioGenerator({ productTitle, niche, targetAudience, promisedResult, uniqueMechanism }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScenarioData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-scenarios", {
        body: { productTitle, niche, targetAudience, promisedResult, uniqueMechanism },
      });
      if (error) throw error;
      setData(result);
      toast.success("5 client scenarios generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate scenarios");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-accent/20">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-bold text-sm">Client Scenario Walkthroughs</h3>
              <p className="text-xs text-muted-foreground">Real-world examples showing your product in action</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="gap-1.5 text-xs" disabled={loading} onClick={generate}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {data ? "Regenerate" : "Generate 5 Scenarios"}
          </Button>
        </div>

        {data && (
          <div className="space-y-4">
            {/* Transformation Summary */}
            {data.transformationSummary && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/15 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-destructive/80">Before</p>
                  <p className="text-xs text-muted-foreground">{data.transformationSummary.before}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">After</p>
                  <p className="text-xs text-muted-foreground">{data.transformationSummary.after}</p>
                </div>
              </div>
            )}

            {/* Scenarios */}
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {data.scenarios.map((sc, i) => (
                  <div key={i} className="rounded-lg border border-border/50 bg-secondary/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">Scenario {i + 1}</Badge>
                        <span className="text-sm font-semibold">{sc.name} — {sc.clientType}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">{sc.timeToResult}</Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-destructive/80">Problem: </span>
                        <span className="text-muted-foreground">{sc.problem}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-accent">Action: </span>
                        <span className="text-muted-foreground">{sc.action}</span>
                      </div>
                      <div className="p-2 rounded bg-background/60 border border-border/30">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Example Output</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{sc.exampleOutput}</p>
                      </div>
                      <div className="p-2 rounded bg-primary/5 border border-primary/10">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-semibold text-primary uppercase">Outreach Message</p>
                          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]" onClick={() => copyText(sc.outreachMessage, `msg-${i}`)}>
                            {copied === `msg-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <p className="text-muted-foreground italic">"{sc.outreachMessage}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-emerald-400" />
                        <span className="font-semibold text-emerald-400">Result: </span>
                        <span className="text-muted-foreground">{sc.result}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
