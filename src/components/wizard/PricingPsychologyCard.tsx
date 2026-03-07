import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DollarSign, Copy, Check, ChevronDown, Shield, Zap, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface PricingPsychology {
  tiers: { name: string; price: number; reasoning: string; recommended?: boolean }[];
  paymentPlanSuggestion: string;
  anchoringCopy: string;
  scarcityCopy: string;
  riskReversalCopy: string;
}

interface Props {
  pricing: PricingPsychology;
}

export default function PricingPsychologyCard({ pricing }: Props) {
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
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardContent className="p-6 space-y-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-lg">Pricing Psychology</h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4">
            {/* Pricing Tiers */}
            <div className="grid gap-3 sm:grid-cols-3">
              {pricing.tiers.map((tier, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    tier.recommended
                      ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-secondary/30"
                  }`}
                >
                  {tier.recommended && (
                    <Badge className="mb-2 text-xs">Recommended</Badge>
                  )}
                  <p className="text-sm font-medium text-muted-foreground">{tier.name}</p>
                  <p className="text-2xl font-black mt-1">${tier.price}</p>
                  <p className="text-xs text-muted-foreground mt-2">{tier.reasoning}</p>
                </div>
              ))}
            </div>

            {/* Payment Plan */}
            {pricing.paymentPlanSuggestion && (
              <div className="flex items-start justify-between gap-2 p-3 rounded-lg bg-secondary/50">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Payment Plan</p>
                    <p className="text-sm">{pricing.paymentPlanSuggestion}</p>
                  </div>
                </div>
                <CopyBtn text={pricing.paymentPlanSuggestion} label="payment" />
              </div>
            )}

            {/* Anchoring Copy */}
            {pricing.anchoringCopy && (
              <div className="flex items-start justify-between gap-2 p-3 rounded-lg bg-secondary/50">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Price Anchoring Copy</p>
                    <p className="text-sm">{pricing.anchoringCopy}</p>
                  </div>
                </div>
                <CopyBtn text={pricing.anchoringCopy} label="anchoring" />
              </div>
            )}

            {/* Scarcity Copy */}
            {pricing.scarcityCopy && (
              <div className="flex items-start justify-between gap-2 p-3 rounded-lg bg-secondary/50">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Scarcity / Urgency Copy</p>
                    <p className="text-sm">{pricing.scarcityCopy}</p>
                  </div>
                </div>
                <CopyBtn text={pricing.scarcityCopy} label="scarcity" />
              </div>
            )}

            {/* Risk Reversal */}
            {pricing.riskReversalCopy && (
              <div className="flex items-start justify-between gap-2 p-3 rounded-lg bg-secondary/50">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Risk Reversal / Guarantee Copy</p>
                    <p className="text-sm">{pricing.riskReversalCopy}</p>
                  </div>
                </div>
                <CopyBtn text={pricing.riskReversalCopy} label="risk" />
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
