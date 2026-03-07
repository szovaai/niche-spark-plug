import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Target, ArrowRight, Shield, Zap, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AnalysisResult {
  productName: string;
  detectedAngle: string;
  pricingStrategy: string;
  funnelStructure: string;
  offerBreakdown: {
    mainProduct: string;
    bonuses: string[];
    pricePoint: string;
    valueStack: string;
  };
  strengths: string[];
  weaknesses: string[];
  alternativeAngles: { name: string; description: string }[];
  counterPositioning: string;
  suggestedNiche: string;
  suggestedAudience: string;
  suggestedTopic: string;
}

const StealThisLaunch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      // Step 1: Scrape the URL
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url, options: { formats: ["markdown"] } },
      });
      if (scrapeError) throw scrapeError;

      const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";
      if (!markdown) throw new Error("Could not extract content from this URL");

      // Step 2: Analyze with AI
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyze-competitor-launch", {
        body: { scrapedContent: markdown, url, userId: user?.id },
      });
      if (analysisError) throw analysisError;

      setResult(analysisData);
      toast.success("Launch analyzed!");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  const buildCompetingLaunch = () => {
    if (!result) return;
    const params = new URLSearchParams({
      niche: result.suggestedNiche || "",
      audience: result.suggestedAudience || "",
      topic: result.suggestedTopic || "",
    });
    navigate(`/wizard?${params.toString()}`);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout title="Steal This Launch">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Search className="w-7 h-7 text-primary" />
            Steal This Launch
          </h1>
          <p className="text-muted-foreground mt-1">
            Paste any product page URL and the AI will reverse-engineer the launch strategy — then help you build a better one.
          </p>
        </motion.div>

        {/* URL Input */}
        <Card>
          <CardContent className="p-5">
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://warriorplus.com/o2/a/... or any product page URL"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={analyze} disabled={loading || !url.trim()} className="gap-2 shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Analyze
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Works with WarriorPlus, ClickBank, Gumroad, JVZoo, Etsy, and most product pages.</p>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Scraping page and analyzing launch strategy...</p>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Product Overview */}
            <Card className="border-primary/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{result.productName}</h2>
                  <Badge>{result.detectedAngle} Angle</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Pricing Strategy</h4>
                    <p className="text-sm text-muted-foreground">{result.pricingStrategy}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Funnel Structure</h4>
                    <p className="text-sm text-muted-foreground">{result.funnelStructure}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offer Breakdown */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Offer Breakdown</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Main Product: </span>
                    <span className="text-sm text-muted-foreground">{result.offerBreakdown.mainProduct}</span>
                  </div>
                  {result.offerBreakdown.bonuses?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Bonuses: </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {result.offerBreakdown.bonuses.map((b, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{b}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium">Price: </span>
                    <span className="text-sm text-muted-foreground">{result.offerBreakdown.pricePoint}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-500/20">
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-green-500" /> Strengths</h3>
                  <ul className="space-y-1.5">
                    {result.strengths?.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-red-500/20">
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-red-500" /> Exploitable Gaps</h3>
                  <ul className="space-y-1.5">
                    {result.weaknesses?.map((w, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-red-500">→</span>{w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Alternative Angles */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold">Alternative Angles to Compete</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {result.alternativeAngles?.map((angle, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/50 space-y-1">
                      <Badge variant="outline" className="text-xs">{angle.name}</Badge>
                      <p className="text-xs text-muted-foreground">{angle.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Counter-Positioning */}
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">Counter-Positioning Strategy</h3>
                  <Button variant="ghost" size="sm" onClick={() => copyText(result.counterPositioning, "counter")} className="gap-1">
                    {copied === "counter" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{result.counterPositioning}</p>
              </CardContent>
            </Card>

            {/* CTA */}
            <Button onClick={buildCompetingLaunch} variant="hero" size="lg" className="w-full gap-2">
              <Zap className="w-5 h-5" />
              Build a Competing Launch
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StealThisLaunch;
