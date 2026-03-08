import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Copy, ArrowRight, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Step1Product } from "@/types/launchWizard";

interface Props {
  productBrief: Step1Product | null;
  niche: string;
  productType: string;
  onSelectVariation: (topic: string, title: string) => void;
}

interface Variation {
  title: string;
  topic: string;
  angle: string;
}

export default function LaunchMultiplier({ productBrief, niche, productType, onSelectVariation }: Props) {
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);

  if (!productBrief) return null;

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-product", {
        body: {
          niche,
          productType,
          topic: `Generate 5 product angle variations based on: "${productBrief.title}" — same niche, different sub-angles. Return JSON array with fields: title, topic, angle.`,
          userId: null,
          multiplerMode: true,
        },
      });
      if (error) throw error;

      // The AI may return variations in different formats — normalize
      if (data?.variations && Array.isArray(data.variations)) {
        setVariations(data.variations);
      } else if (Array.isArray(data)) {
        setVariations(data);
      } else {
        // Fallback: generate simple variations from the title
        const base = productBrief.title.replace(/AI\s*/i, "").trim();
        const angles = [
          { title: `AI Blog Post ${base}`, topic: `Blog content automation using AI`, angle: "Content marketing angle" },
          { title: `AI Email ${base}`, topic: `Email newsletter creation with AI`, angle: "Email marketing angle" },
          { title: `AI Freelance ${base}`, topic: `Freelance service delivery with AI`, angle: "Freelance service angle" },
          { title: `AI Local Business ${base}`, topic: `Local business AI services`, angle: "Local business angle" },
          { title: `AI Course ${base}`, topic: `Creating mini-courses with AI`, angle: "Course creation angle" },
        ];
        setVariations(angles);
      }
      toast.success("Product variations generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate variations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent to-primary">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Multiply This Launch</h3>
            <p className="text-xs text-muted-foreground">Turn 1 product idea into 5 new launch angles</p>
          </div>
        </div>

        {variations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Your original product: <strong className="text-foreground">{productBrief.title}</strong>
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              The AI will generate 5 related product angles in the same niche — each one a new potential launch.
            </p>
            <Button onClick={generate} disabled={loading} variant="hero" className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Product Variations
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">1 Idea → 5 Products</p>
            {variations.map((v, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <Badge variant="secondary" className="shrink-0 text-xs">{i + 1}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{v.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{v.angle}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 gap-1 text-xs"
                  onClick={() => onSelectVariation(v.topic, v.title)}
                >
                  Launch This <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={generate} disabled={loading} variant="outline" size="sm" className="gap-1.5">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
