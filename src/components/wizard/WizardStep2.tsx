import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Step1Product, Step2Content } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  productBrief: Step1Product | null;
  productType: string;
  result: Step2Content | null;
  setResult: (v: Step2Content | null) => void;
  onNext: () => void;
  userId?: string;
}

export default function WizardStep2({ productBrief, productType, result, setResult, onNext, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    if (!productBrief) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-content", {
        body: { productBrief, productType, userId },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Product content generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!productBrief) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Complete Step 1 first to generate your product concept.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Product Generator</h2>
        <p className="text-muted-foreground">Generate your complete product outline and content structure.</p>
      </div>

      <Card className="bg-secondary/30">
        <CardContent className="p-4">
          <p className="text-sm"><strong>Product:</strong> {productBrief.title} — {productBrief.subtitle}</p>
        </CardContent>
      </Card>

      {!result && (
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Full Product
        </Button>
      )}

      {result && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Product Outline</h3>
                <Button variant="ghost" size="sm" onClick={() => copyText(result.outline, "outline")} className="gap-1">
                  {copied === "outline" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.outline}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Chapters ({result.chapters?.length || 0})</h3>
              <Accordion type="multiple" className="space-y-2">
                {result.chapters?.map((ch, i) => (
                  <AccordionItem key={i} value={`ch-${i}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium">
                      Chapter {i + 1}: {ch.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{ch.summary}</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {ch.keyPoints?.map((kp, j) => <li key={j}>{kp}</li>)}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-bold text-lg">Bonus Ideas</h3>
              {result.bonuses?.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">#{i + 1}</Badge>
                  <p className="text-sm text-muted-foreground">{b}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Product Description</h3>
                <Button variant="ghost" size="sm" onClick={() => copyText(result.description, "desc")} className="gap-1">
                  {copied === "desc" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.description}</p>
            </CardContent>
          </Card>

          <Button onClick={onNext} className="gap-2">Continue to Funnel Builder</Button>
        </div>
      )}
    </div>
  );
}
