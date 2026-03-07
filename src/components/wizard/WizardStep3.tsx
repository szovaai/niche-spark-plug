import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Step1Product, Step2Content, Step3Funnel } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  productBrief: Step1Product | null;
  productContent: Step2Content | null;
  result: Step3Funnel | null;
  setResult: (v: Step3Funnel | null) => void;
  onNext: () => void;
  userId?: string;
}

const FUNNEL_TABS = [
  { key: "salesPage", label: "Sales Page" },
  { key: "optInPage", label: "Opt-in Page" },
  { key: "thankYouPage", label: "Thank You" },
  { key: "bonusPage", label: "Bonus Page" },
  { key: "checkoutCopy", label: "Checkout" },
] as const;

export default function WizardStep3({ productBrief, productContent, result, setResult, onNext, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    if (!productBrief) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-funnel", {
        body: { productBrief, productContent, userId },
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
    setTimeout(() => setCopied(null), 2000);
  };

  if (!productBrief) {
    return <div className="text-center py-12 text-muted-foreground">Complete previous steps first.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Funnel Builder</h2>
        <p className="text-muted-foreground">Generate complete sales funnel copy for your product.</p>
      </div>

      {!result && (
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Funnel Copy
        </Button>
      )}

      {result && (
        <div className="space-y-4">
          <Tabs defaultValue="salesPage">
            <TabsList className="w-full flex-wrap h-auto gap-1">
              {FUNNEL_TABS.map(tab => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-xs">{tab.label}</TabsTrigger>
              ))}
            </TabsList>
            {FUNNEL_TABS.map(tab => (
              <TabsContent key={tab.key} value={tab.key}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">{tab.label}</h3>
                      <Button variant="ghost" size="sm" onClick={() => copyText(result[tab.key], tab.key)} className="gap-1">
                        {copied === tab.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                      {result[tab.key]}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
          <Button onClick={onNext} className="gap-2">Continue to Marketing Assets</Button>
        </div>
      )}
    </div>
  );
}
