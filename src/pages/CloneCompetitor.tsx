import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Sparkles, RefreshCw, Wand2, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CloneCompetitor() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const seed = params.get("seed");
    if (seed) setUrl(seed);
  }, [params]);

  const analyze = async () => {
    if (!url.trim()) { toast.error("Paste a URL or product name."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-competitor", {
        body: { url: url.trim() },
      });
      if (error) throw error;
      setAnalysis(data);
      toast.success("Competitor analyzed.");
    } catch (e: any) {
      toast.error(e?.message || "Analysis failed.");
    } finally { setLoading(false); }
  };

  const cloneAndImprove = () => {
    const params = new URLSearchParams({
      title: analysis?.product_name || "Improved Version",
      niche: analysis?.niche || "",
      audience: analysis?.target_audience || "",
      pain: analysis?.pain_point || "",
    });
    navigate(`/wizard?${params.toString()}`);
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 gap-1.5"><Copy className="h-3 w-3" /> Clone Competitor</Badge>
          <h1 className="text-3xl font-black">Reverse-engineer any winning offer</h1>
          <p className="text-sm text-muted-foreground">Paste an Etsy / Gumroad / Shopify / sales page URL — get the angle, funnel breakdown, and a cloneable improved version.</p>
        </motion.div>

        <Card>
          <CardContent className="p-5 space-y-3">
            <Label>Competitor URL or product name</Label>
            <div className="flex gap-2">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://gumroad.com/l/yourcompetitor" className="flex-1" />
              <Button onClick={analyze} disabled={loading} variant="hero" className="gap-2">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysis && (
          <div className="space-y-4">
            {analysis.product_name && (
              <Card><CardContent className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Product Angle</h3>
                <p className="text-lg font-semibold">{analysis.product_name}</p>
                {analysis.angle && <p className="text-sm text-muted-foreground mt-2">{analysis.angle}</p>}
              </CardContent></Card>
            )}
            {analysis.funnel_breakdown && (
              <Card><CardContent className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Funnel Breakdown</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{typeof analysis.funnel_breakdown === "string" ? analysis.funnel_breakdown : JSON.stringify(analysis.funnel_breakdown, null, 2)}</p>
              </CardContent></Card>
            )}
            {analysis.offer_stack && (
              <Card><CardContent className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Offer Stack</h3>
                <ul className="space-y-1.5">
                  {(Array.isArray(analysis.offer_stack) ? analysis.offer_stack : [analysis.offer_stack]).map((o: any, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">→ {typeof o === "string" ? o : JSON.stringify(o)}</li>
                  ))}
                </ul>
              </CardContent></Card>
            )}
            {analysis.improvements && (
              <Card><CardContent className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Better Version Suggestions</h3>
                <ul className="space-y-1.5">
                  {(Array.isArray(analysis.improvements) ? analysis.improvements : [analysis.improvements]).map((s: any, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">✦ {typeof s === "string" ? s : JSON.stringify(s)}</li>
                  ))}
                </ul>
              </CardContent></Card>
            )}
            <Button onClick={cloneAndImprove} variant="hero" size="lg" className="w-full gap-2">
              <Wand2 className="h-4 w-4" /> Clone & Improve in Builder
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
