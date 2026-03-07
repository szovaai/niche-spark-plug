import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { Step1Product, Step2Content } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AssetDownloadButtons from "@/components/AssetDownloadButtons";
import ProofStackBuilder from "./ProofStackBuilder";

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
    toast.success("Copied!");
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={generate} disabled={loading} className="gap-1">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Regenerate
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-lg">Product Outline</h3>
                <div className="flex items-center gap-2">
                  <AssetDownloadButtons content={result.outline} title={`${productBrief.title} - Outline`} />
                  <Button variant="ghost" size="sm" onClick={() => copyText(result.outline, "outline")} className="gap-1">
                    {copied === "outline" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.outline}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h3 className="font-bold text-lg">Chapters ({result.chapters?.length || 0})</h3>
                <AssetDownloadButtons
                  content={result.chapters?.map((ch, i) =>
                    `Chapter ${i + 1}: ${ch.title}\n${ch.summary}\n\nKey Points:\n${ch.keyPoints?.map(kp => `- ${kp}`).join("\n") || ""}`
                  ).join("\n\n---\n\n") || ""}
                  title={`${productBrief.title} - Chapters`}
                />
              </div>
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
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => copyText(`${ch.title}\n\n${ch.summary}\n\n${ch.keyPoints?.join("\n")}`, `ch-${i}`)} className="gap-1 text-xs">
                          {copied === `ch-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-lg">Bonus Ideas</h3>
                <AssetDownloadButtons
                  content={result.bonuses?.join("\n\n") || ""}
                  title={`${productBrief.title} - Bonuses`}
                />
              </div>
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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-lg">Product Description</h3>
                <div className="flex items-center gap-2">
                  <AssetDownloadButtons content={result.description} title={`${productBrief.title} - Description`} />
                  <Button variant="ghost" size="sm" onClick={() => copyText(result.description, "desc")} className="gap-1">
                    {copied === "desc" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.description}</p>
            </CardContent>
          </Card>

          {result.proofStack && <ProofStackBuilder proofStack={result.proofStack} />}

          <Button onClick={onNext} className="gap-2">Continue to Funnel Builder</Button>
        </div>
      )}
    </div>
  );
}
