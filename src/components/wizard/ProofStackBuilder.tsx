import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Star, Copy, Check, ChevronDown, MessageSquareQuote, ArrowLeftRight, Shield, Trophy } from "lucide-react";
import { toast } from "sonner";

export interface ProofStack {
  testimonialTemplates: { name: string; before: string; product: string; result: string; lifeNow: string }[];
  beforeAfterTable: { before: string; after: string }[];
  credibilityBuilder: string;
  earningsDisclaimer: string;
  quickWinsList: string[];
}

interface Props {
  proofStack: ProofStack;
}

export default function ProofStackBuilder({ proofStack }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, label }: { text: string; label: string }) => (
    <Button variant="ghost" size="sm" onClick={() => copyText(text, label)} className="gap-1 h-7 text-xs shrink-0">
      {copied === label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      Copy
    </Button>
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6 space-y-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Proof & Credibility Stack</h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <Tabs defaultValue="testimonials" className="mt-4">
              <TabsList className="w-full flex-wrap h-auto gap-1">
                <TabsTrigger value="testimonials" className="text-xs gap-1">
                  <MessageSquareQuote className="w-3 h-3" /> Testimonials
                </TabsTrigger>
                <TabsTrigger value="beforeAfter" className="text-xs gap-1">
                  <ArrowLeftRight className="w-3 h-3" /> Before/After
                </TabsTrigger>
                <TabsTrigger value="credibility" className="text-xs gap-1">
                  <Shield className="w-3 h-3" /> Credibility
                </TabsTrigger>
                <TabsTrigger value="quickWins" className="text-xs gap-1">
                  <Trophy className="w-3 h-3" /> Quick Wins
                </TabsTrigger>
              </TabsList>

              {/* Testimonial Templates */}
              <TabsContent value="testimonials" className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground">Replace [NAME] placeholders with real customer names when you have them.</p>
                {proofStack.testimonialTemplates?.map((t, i) => (
                  <div key={i} className="p-4 rounded-lg bg-secondary/30 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">[{t.name} — Replace with real customer]</Badge>
                      <CopyBtn
                        text={`"${t.before} Then I tried [Product]. ${t.product} ${t.result} ${t.lifeNow}" — ${t.name}`}
                        label={`test-${i}`}
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-red-400/80 italic">Before: "{t.before}"</p>
                      <p className="text-muted-foreground">Product: "{t.product}"</p>
                      <p className="text-green-400/80">Result: "{t.result}"</p>
                      <p className="text-primary/80">Life Now: "{t.lifeNow}"</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const all = proofStack.testimonialTemplates.map(t =>
                      `"${t.before} Then I tried [Product]. ${t.product} ${t.result} ${t.lifeNow}" — ${t.name}`
                    ).join("\n\n");
                    copyText(all, "all-testimonials");
                  }}
                  className="gap-1 text-xs"
                >
                  {copied === "all-testimonials" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy All Testimonials
                </Button>
              </TabsContent>

              {/* Before/After Table */}
              <TabsContent value="beforeAfter" className="mt-4">
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="grid grid-cols-2">
                    <div className="p-3 bg-red-500/10 border-b border-r border-border font-semibold text-sm text-center">❌ Before</div>
                    <div className="p-3 bg-green-500/10 border-b border-border font-semibold text-sm text-center">✅ After</div>
                  </div>
                  {proofStack.beforeAfterTable?.map((row, i) => (
                    <div key={i} className="grid grid-cols-2 border-b border-border last:border-b-0">
                      <div className="p-3 text-sm text-red-400/80 border-r border-border">{row.before}</div>
                      <div className="p-3 text-sm text-green-400/80">{row.after}</div>
                    </div>
                  ))}
                </div>
                <CopyBtn
                  text={proofStack.beforeAfterTable?.map(r => `Before: ${r.before} → After: ${r.after}`).join("\n") || ""}
                  label="ba-table"
                />
              </TabsContent>

              {/* Credibility Builder */}
              <TabsContent value="credibility" className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Credibility Copy (for beginners without proof yet)</p>
                    <CopyBtn text={proofStack.credibilityBuilder} label="cred" />
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{proofStack.credibilityBuilder}</p>
                </div>

                <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-yellow-500">⚠️ Earnings / Results Disclaimer</p>
                    <CopyBtn text={proofStack.earningsDisclaimer} label="disclaimer" />
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{proofStack.earningsDisclaimer}</p>
                </div>
              </TabsContent>

              {/* Quick Wins */}
              <TabsContent value="quickWins" className="mt-4 space-y-3">
                <p className="text-xs text-muted-foreground">Specific, tangible outcomes your buyer gets — use in sales page bullets and email hooks.</p>
                {proofStack.quickWinsList?.map((win, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
                    <Badge variant="secondary" className="shrink-0 mt-0.5 text-xs">✅ {i + 1}</Badge>
                    <p className="text-sm">{win}</p>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyText(proofStack.quickWinsList.join("\n"), "all-wins")}
                  className="gap-1 text-xs"
                >
                  {copied === "all-wins" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy All Quick Wins
                </Button>
              </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
