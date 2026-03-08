import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw, Download, Image } from "lucide-react";
import type { Step1Product, Step3Graphics } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  productBrief: Step1Product | null;
  niche: string;
  result: Step3Graphics | null;
  setResult: (v: Step3Graphics | null) => void;
  onNext: () => void;
  userId?: string;
}

const GRAPHIC_STYLES = [
  { id: "warriorplus", label: "WarriorPlus Launch", desc: "Dark + neon highlights, bold 3D boxes" },
  { id: "minimal", label: "Minimal Ebook", desc: "Clean, white, modern SaaS aesthetic" },
  { id: "premium", label: "Premium Course", desc: "Gold accents, luxury feel" },
  { id: "dark-saas", label: "Dark SaaS", desc: "Charcoal + cyan, tech-forward" },
] as const;

type GraphicStyle = typeof GRAPHIC_STYLES[number]["id"];

const GRAPHIC_TYPES = [
  { key: "cover", label: "Ebook Cover", components: ["guide"] },
  { key: "bundle", label: "Product Bundle", components: ["guide", "worksheet", "checklist", "templates"] },
  { key: "bonus", label: "Bonus Stack", components: ["resourceList", "templates", "quiz"] },
] as const;

export default function WizardStep3Graphics({ productBrief, niche, result, setResult, onNext, userId }: Props) {
  const [style, setStyle] = useState<GraphicStyle>("warriorplus");
  const [loading, setLoading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateGraphic = async (type: typeof GRAPHIC_TYPES[number]) => {
    if (!productBrief) return;
    setLoading(type.key);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ecover", {
        body: {
          title: productBrief.title,
          niche,
          targetAudience: productBrief.painPoints?.join(", "),
          selectedComponents: type.components,
          stylePreset: style,
          depthMode: type.key === "cover" ? "minimal" : "stacked",
        },
      });
      if (error) throw error;
      if (!data?.imageUrl) throw new Error("No image returned");

      const updated = { ...(result || { coverUrl: null, bundleUrl: null, bonusCoverUrls: [] }) };
      if (type.key === "cover") updated.coverUrl = data.imageUrl;
      else if (type.key === "bundle") updated.bundleUrl = data.imageUrl;
      else if (type.key === "bonus") updated.bonusCoverUrls = [...(updated.bonusCoverUrls || []), data.imageUrl];
      setResult(updated);
      toast.success(`${type.label} generated!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate graphic");
    } finally {
      setLoading(null);
    }
  };

  const generateAll = async () => {
    if (!productBrief) return;
    setGenerating(true);
    for (const type of GRAPHIC_TYPES) {
      await generateGraphic(type);
    }
    setGenerating(false);
    toast.success("All graphics generated!");
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const getImageForType = (key: string) => {
    if (!result) return null;
    if (key === "cover") return result.coverUrl;
    if (key === "bundle") return result.bundleUrl;
    if (key === "bonus") return result.bonusCoverUrls?.[0] || null;
    return null;
  };

  if (!productBrief) {
    return <div className="text-center py-12 text-muted-foreground">Complete previous steps first.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Product Graphics</h2>
        <p className="text-muted-foreground">Generate high-converting product bundle graphics for your sales page, bonuses, and affiliate promos.</p>
      </div>

      {/* Style Selector */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Graphic Style</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {GRAPHIC_STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`p-3 rounded-xl border text-left transition-colors ${
                style === s.id ? "border-primary bg-primary/10" : "border-border hover:bg-secondary/50"
              }`}
            >
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate All Button */}
      <Button onClick={generateAll} disabled={generating || !!loading} className="gap-2" variant="hero">
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Generate All Product Graphics
      </Button>

      {/* Individual Graphics */}
      <div className="grid gap-4">
        {GRAPHIC_TYPES.map(type => {
          const imageUrl = getImageForType(type.key);
          const isLoading = loading === type.key;

          return (
            <Card key={type.key} className={imageUrl ? "border-primary/20" : ""}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">{type.label}</h3>
                    {imageUrl && <Badge variant="outline" className="text-xs text-primary">Generated</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {imageUrl && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadImage(imageUrl, `${productBrief.title}_${type.label}.png`)}
                          className="gap-1"
                        >
                          <Download className="w-3 h-3" /> Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateGraphic(type)}
                          disabled={isLoading}
                          className="gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} /> Regenerate
                        </Button>
                      </>
                    )}
                    {!imageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateGraphic(type)}
                        disabled={isLoading}
                        className="gap-1"
                      >
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Generate
                      </Button>
                    )}
                  </div>
                </div>

                {isLoading && !imageUrl && (
                  <div className="h-48 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">Generating {type.label.toLowerCase()}...</p>
                      <p className="text-xs text-muted-foreground">This takes ~30 seconds</p>
                    </div>
                  </div>
                )}

                {imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-border bg-secondary/30">
                    <img
                      src={imageUrl}
                      alt={type.label}
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button onClick={onNext} className="gap-2">
        Continue to Funnel Copy
      </Button>
    </div>
  );
}
