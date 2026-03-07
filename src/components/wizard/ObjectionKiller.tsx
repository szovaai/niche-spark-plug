import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ShieldAlert, Copy, Check, ChevronDown, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface Objection {
  objection: string;
  reframe: string;
  proof: string;
  followUpQuestion: string;
}

interface Props {
  objections: Objection[];
}

export default function ObjectionKiller({ objections }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  if (!objections?.length) return null;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    const text = objections.map((o, i) =>
      `OBJECTION ${i + 1}: "${o.objection}"\nReframe: ${o.reframe}\nProof: ${o.proof}\nFollow-up: ${o.followUpQuestion}`
    ).join("\n\n---\n\n");
    copyText(text, "all-objections");
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardContent className="p-6 space-y-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-lg">Objection Killer ({objections.length})</h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pre-written rebuttals for your sales page FAQ, emails, and ads.</p>
              <Button variant="outline" size="sm" onClick={copyAll} className="gap-1 text-xs shrink-0">
                {copied === "all-objections" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy All
              </Button>
            </div>

            <Accordion type="multiple" className="space-y-2">
              {objections.map((obj, i) => (
                <AccordionItem key={i} value={`obj-${i}`} className="border rounded-lg px-4 bg-secondary/20">
                  <AccordionTrigger className="text-sm font-medium text-left">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      "{obj.objection}"
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-4">
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <p className="text-xs font-medium text-green-500 mb-1">↪ Reframe</p>
                      <p className="text-sm">{obj.reframe}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs font-medium text-primary mb-1">📊 Proof / Evidence</p>
                      <p className="text-sm">{obj.proof}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="text-xs font-medium text-accent mb-1 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> Follow-up Question
                      </p>
                      <p className="text-sm italic">"{obj.followUpQuestion}"</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyText(
                        `Objection: "${obj.objection}"\nReframe: ${obj.reframe}\nProof: ${obj.proof}\nFollow-up: ${obj.followUpQuestion}`,
                        `obj-${i}`
                      )}
                      className="gap-1 text-xs"
                    >
                      {copied === `obj-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy This Objection
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
