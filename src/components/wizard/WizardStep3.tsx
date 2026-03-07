import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Loader2, Copy, Check, ShoppingCart, ArrowUpCircle, DollarSign, Eye, RefreshCw } from "lucide-react";
import { Step1Product, Step2Content, Step3Funnel } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RenderedCopy from "@/components/RenderedCopy";
import { sanitizeHTML } from "@/lib/sanitize";
import { markdownToHTML } from "@/lib/copyUtils";
import ObjectionKiller from "./ObjectionKiller";

interface Props {
  productBrief: Step1Product | null;
  productContent: Step2Content | null;
  result: Step3Funnel | null;
  setResult: (v: Step3Funnel | null) => void;
  onNext: () => void;
  userId?: string;
  price?: number;
}

const FUNNEL_TABS = [
  { key: "salesPage", label: "Sales Page" },
  { key: "optInPage", label: "Opt-in Page" },
  { key: "thankYouPage", label: "Thank You" },
  { key: "bonusPage", label: "Bonus Page" },
  { key: "checkoutCopy", label: "Checkout" },
  { key: "orderBump", label: "Order Bump", icon: ShoppingCart },
  { key: "upsellOffer", label: "Upsell", icon: ArrowUpCircle },
] as const;

export default function WizardStep3({ productBrief, productContent, result, setResult, onNext, userId, price }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<{ title: string; html: string } | null>(null);

  const generate = async () => {
    if (!productBrief) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-funnel", {
        body: { productBrief, productContent, price: price || 17, userId },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Funnel copy generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const openPreview = (title: string, content: string) => {
    const html = sanitizeHTML(markdownToHTML(content));
    setPreviewContent({ title, html });
  };

  if (!productBrief) {
    return <div className="text-center py-12 text-muted-foreground">Complete previous steps first.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Funnel Builder</h2>
        <p className="text-muted-foreground">Generate complete sales funnel copy including order bump, upsell & offer stack.</p>
      </div>

      {!result && (
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Funnel Copy
        </Button>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={generate} disabled={loading} className="gap-1">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Regenerate All
            </Button>
          </div>

          <Tabs defaultValue="salesPage">
            <TabsList className="w-full flex-wrap h-auto gap-1">
              {FUNNEL_TABS.map(tab => {
                const content = result[tab.key as keyof Step3Funnel];
                if (!content || typeof content !== "string") return null;
                return (
                  <TabsTrigger key={tab.key} value={tab.key} className="text-xs gap-1">
                    {'icon' in tab && tab.icon && <tab.icon className="w-3 h-3" />}
                    {tab.label}
                  </TabsTrigger>
                );
              })}
              {result.offerStack && (
                <TabsTrigger value="offerStack" className="text-xs gap-1">
                  <DollarSign className="w-3 h-3" />
                  Offer Stack
                </TabsTrigger>
              )}
            </TabsList>

            {FUNNEL_TABS.map(tab => {
              const content = result[tab.key as keyof Step3Funnel];
              if (!content || typeof content !== "string") return null;
              return (
                <TabsContent key={tab.key} value={tab.key}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">{tab.label}</h3>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openPreview(tab.label, content)} className="gap-1">
                            <Eye className="w-3 h-3" /> Preview
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => copyText(content, tab.key)} className="gap-1">
                            {copied === tab.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copy Full Page
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-[80vh] overflow-y-auto pr-2">
                        <RenderedCopy
                          content={content}
                          mechanismName={productBrief?.uniqueMechanism}
                          showScore={tab.key === "salesPage" || tab.key === "upsellOffer"}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}

            {/* Offer Stack Tab */}
            {result.offerStack && (
              <TabsContent value="offerStack">
                <Card className="border-accent/30">
                  <CardContent className="p-6 space-y-5">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-accent" />
                      Value Stack
                    </h3>

                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className="mb-1">Core Product</Badge>
                          <p className="font-semibold">{result.offerStack.coreProduct.name}</p>
                        </div>
                        <span className="text-lg font-bold text-muted-foreground">${result.offerStack.coreProduct.value} value</span>
                      </div>
                    </div>

                    {result.offerStack.bonuses.map((bonus, i) => (
                      <div key={i} className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="secondary" className="mb-1">Bonus {i + 1}</Badge>
                            <p className="font-semibold">{bonus.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{bonus.description}</p>
                          </div>
                          <span className="text-lg font-bold text-muted-foreground shrink-0 ml-4">${bonus.value} value</span>
                        </div>
                      </div>
                    ))}

                    <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-3xl font-black line-through text-muted-foreground">${result.offerStack.totalValue}</p>
                      <p className="text-sm text-muted-foreground">Today Only</p>
                      <p className="text-4xl font-black text-primary">${result.offerStack.askingPrice}</p>
                    </div>

                    {result.offerStack.stackCopy && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">Stack Copy (for sales page)</h4>
                          <Button variant="ghost" size="sm" onClick={() => copyText(result.offerStack!.stackCopy, "stackCopy")} className="gap-1">
                            {copied === "stackCopy" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </Button>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 max-h-[80vh] overflow-y-auto">
                          <RenderedCopy content={result.offerStack.stackCopy} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
          {result.objections && result.objections.length > 0 && (
            <ObjectionKiller objections={result.objections} />
          )}

          <Button onClick={onNext} className="gap-2">Continue to Marketing Assets</Button>
        </div>
      )}

      {/* Full Page Preview Modal */}
      <Dialog open={!!previewContent} onOpenChange={() => setPreviewContent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewContent?.title} — Full Preview</DialogTitle>
          </DialogHeader>
          <div
            className="prose prose-sm prose-invert max-w-none text-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_hr]:border-border [&_p]:my-2"
            dangerouslySetInnerHTML={{ __html: previewContent?.html || "" }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
