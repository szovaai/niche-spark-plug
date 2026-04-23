import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, RefreshCw, Download, Image, Package, Monitor, BookOpen, Wrench, DollarSign, Palette, Type, Layout, Zap, TextCursorInput } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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

// ─── Design Style Engine ──────────────────────────────────────────────────
const DESIGN_STYLES = [
  { id: "premium-authority", label: "Premium Authority", desc: "Black / gold / silver — luxury high-ticket feel", icon: "✨", colors: "black, gold, silver", typography: "serif headline, clean sans subtext", mood: "luxurious, exclusive, authoritative" },
  { id: "high-energy", label: "High Energy IM", desc: "Bold colors, thick fonts, dynamic shapes", icon: "🔥", colors: "deep black, vibrant orange, electric blue", typography: "bold impact sans-serif, thick strokes", mood: "energetic, action-oriented, results-driven" },
  { id: "corporate-pro", label: "Corporate Professional", desc: "Blue / white — clean, trustworthy, simple", icon: "💼", colors: "corporate blue, white, light gray", typography: "clean sans-serif, minimal weight variation", mood: "professional, reliable, corporate" },
  { id: "creator-economy", label: "Creator Economy", desc: "Modern gradients, glass UI, light aesthetic", icon: "🎨", colors: "soft gradients, pastel accents, glass effects", typography: "modern geometric sans-serif, rounded corners", mood: "modern, creative, approachable" },
  { id: "dark-saas", label: "Dark SaaS", desc: "Charcoal + cyan, tech-forward futuristic", icon: "🚀", colors: "charcoal, electric cyan, deep navy", typography: "geometric mono-inspired, clean and sharp", mood: "futuristic, sleek, cutting-edge" },
] as const;

type DesignStyle = typeof DESIGN_STYLES[number]["id"];

// ─── Scene Layout Presets ──────────────────────────────────────────────────
const SCENE_LAYOUTS = [
  { id: "classic-bundle", label: "Classic Bundle", desc: "Main ebook + 3-5 bonus assets in perspective", icon: Package, components: ["guide", "worksheet", "checklist", "templates", "resourceList"], prompt: "Premium 3D product bundle: Large main hardcover ebook angled at 25° front-center, 4 supporting items (workbook, cheat sheet, checklist, template pack) arranged in elegant arc behind. Each item has individual drop shadow. Stacked with depth. Items overlap slightly for premium bundle feel." },
  { id: "software-course", label: "Software + Course", desc: "Laptop screen + phone + ebook + workbook", icon: Monitor, components: ["guide", "worksheet"], prompt: "Premium digital course bundle: Open laptop showing course interface center, smartphone beside showing mobile view, hardcover ebook standing at angle, workbook pages fanned. Modern tech-meets-education aesthetic. Clean reflective surface." },
  { id: "authority-pack", label: "Authority Pack", desc: "Hardcover book + tablet + binder-style guide", icon: BookOpen, components: ["guide", "worksheet", "checklist", "resourceList"], prompt: "Authority product pack: Thick premium hardcover book as hero (25° angle, visible spine), tablet displaying content, spiral-bound workbook, binder-style guide with tab dividers. Academic yet premium feel. Leather-texture elements." },
  { id: "toolkit-bundle", label: "Toolkit Bundle", desc: "Folders + templates + guides + playbook", icon: Wrench, components: ["guide", "templates", "checklist", "worksheet", "resourceList", "quiz"], prompt: "Comprehensive digital toolkit: Branded folder at back, layered template sheets fanning out, main guide centered, checklist cards, worksheet stack, prompt library card. 6-item professional bundle. Organized yet abundant look. Each item distinct." },
] as const;

type SceneLayout = typeof SCENE_LAYOUTS[number]["id"];

// ─── Price Tier Value Visualizer ──────────────────────────────────────────
const PRICE_TIERS = [
  { id: "budget", label: "$7-$17", itemCount: 2, desc: "Simple ebook + checklist", components: ["guide", "checklist"] },
  { id: "standard", label: "$27-$47", itemCount: 4, desc: "Ebook + workbook + templates + checklist", components: ["guide", "worksheet", "templates", "checklist"] },
  { id: "premium", label: "$47-$97", itemCount: 6, desc: "Full bundle stack — 6 items", components: ["guide", "worksheet", "templates", "checklist", "resourceList", "quiz"] },
] as const;

type PriceTier = typeof PRICE_TIERS[number]["id"];

// ─── Cover Headline Formulas ──────────────────────────────────────────────
const HEADLINE_FORMULAS = [
  { id: "result", label: "Main Result", template: "How To [Result] Without [Pain]", example: "$500 AI Client System\nHow To Land Your First Client In 7 Days Without Experience" },
  { id: "number-result", label: "Number + Result", template: "[Number]-Day [System Name]", example: "7-Day AI Service Launch\nTurn Simple AI Tools Into Paying Clients" },
  { id: "system-name", label: "System Name", template: "The [System Name]\nA Simple System For [Result]", example: "The AI Client Magnet\nA Simple System For Landing Local Clients Fast" },
] as const;

// ─── Graphic Output Types ──────────────────────────────────────────────────
interface GraphicOutput {
  type: string;
  label: string;
  url: string | null;
}

const LAUNCH_GRAPHIC_TYPES = [
  { type: "bundle", label: "Product Bundle", size: "1536x1024" },
  { type: "hero", label: "Hero Banner", size: "1920x1080" },
  { type: "ad1", label: "Ad Creative 1 — Pain → Promise", size: "1080x1080" },
  { type: "ad2", label: "Ad Creative 2 — Social Proof", size: "1080x1080" },
  { type: "ad3", label: "Ad Creative 3 — Urgency", size: "1080x1080" },
  { type: "thumbnail", label: "Product Thumbnail", size: "800x800" },
];

export default function WizardStep3Graphics({ productBrief, niche, result, setResult, onNext, userId }: Props) {
  const [designStyle, setDesignStyle] = useState<DesignStyle>("premium-authority");
  const [sceneLayout, setSceneLayout] = useState<SceneLayout>("classic-bundle");
  const [priceTier, setPriceTier] = useState<PriceTier>("standard");
  const [headlineFormula, setHeadlineFormula] = useState("result");
  const [loading, setLoading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [launchGraphics, setLaunchGraphics] = useState<GraphicOutput[]>([]);
  const [includeSubtitle, setIncludeSubtitle] = useState(false);
  const [includeSideLabels, setIncludeSideLabels] = useState(false);

  const shortenCoverTitle = (raw: string): string => {
    if (!raw) return "";
    const beforeColon = raw.split(/[:—–-]/)[0].trim() || raw.trim();
    const words = beforeColon.split(/\s+/).slice(0, 8);
    return words.join(" ");
  };
  const coverTitle = shortenCoverTitle(productBrief?.title || "");
  const coverSubtitle = includeSubtitle ? (productBrief?.subtitle || "").slice(0, 80) : "";

  const getStyleConfig = () => DESIGN_STYLES.find(s => s.id === designStyle)!;
  const getLayoutConfig = () => SCENE_LAYOUTS.find(l => l.id === sceneLayout)!;
  const getTierConfig = () => PRICE_TIERS.find(t => t.id === priceTier)!;

  const generateGraphic = async (type: string, customPromptOverride?: string) => {
    if (!productBrief) return null;
    setLoading(type);
    try {
      const styleConfig = getStyleConfig();
      const layoutConfig = getLayoutConfig();
      const tierConfig = getTierConfig();
      const formula = HEADLINE_FORMULAS.find(f => f.id === headlineFormula);

      const { data, error } = await supabase.functions.invoke("generate-ecover", {
        body: {
          title: coverTitle || productBrief.title,
          subtitle: coverSubtitle,
          productConcept: productBrief.concept,
          uniqueMechanism: productBrief.uniqueMechanism,
          niche,
          targetAudience: productBrief.painPoints?.join(", "),
          selectedComponents: tierConfig.components,
          stylePreset: designStyle,
          depthMode: "stacked",
          designStyle: styleConfig.id,
          designColors: styleConfig.colors,
          designTypography: styleConfig.typography,
          designMood: styleConfig.mood,
          sceneLayout: layoutConfig.prompt,
          headlineFormula: formula?.template,
          priceTier: tierConfig.label,
          includeSubtitle,
          includeSideLabels,
          maxCoverWords: 8,
          customPromptOverride,
        },
      });
      if (error) throw error;
      if (!data?.imageUrl) throw new Error("No image returned");
      return data.imageUrl;
    } catch (e: any) {
      toast.error(e.message || "Failed to generate graphic");
      return null;
    } finally {
      setLoading(null);
    }
  };

  const generateSingleBundle = async () => {
    const url = await generateGraphic("bundle");
    if (url) {
      const updated = { ...(result || { coverUrl: null, bundleUrl: null, bonusCoverUrls: [] }) };
      updated.bundleUrl = url;
      updated.coverUrl = url;
      setResult(updated);
      toast.success("Product bundle generated!");
    }
  };

  const generateLaunchGraphics = async () => {
    if (!productBrief) return;
    setGenerating(true);
    setGenerateProgress(0);
    const outputs: GraphicOutput[] = [];
    const styleConfig = getStyleConfig();

    const prompts: { type: string; label: string; override: string }[] = [
      { type: "bundle", label: "Product Bundle", override: "" },
      { type: "hero", label: "Hero Banner", override: `Create a wide hero banner (16:9) for "${productBrief.title}". Show the product bundle spread across frame. Large bold title text "${productBrief.title}" overlaid. Colors: ${styleConfig.colors}. Mood: ${styleConfig.mood}. Professional sales page header graphic.` },
      { type: "ad1", label: "Ad Creative — Pain", override: `Square ad creative (1:1) for "${productBrief.title}". Show the product with dramatic lighting. Text overlay: "Struggling with ${productBrief.painPoints?.[0] || 'getting results'}?" at top, product bundle center, "$${productBrief.launchScore?.estimatedPriceCeiling || 17}" price badge. Colors: ${styleConfig.colors}. Bold ${styleConfig.typography}.` },
      { type: "ad2", label: "Ad Creative — Proof", override: `Square ad creative (1:1) for "${productBrief.title}". Product bundle with "BESTSELLER" badge. 5-star rating graphic. Text: "Join 1,000+ creators who launched in 60 minutes." Clean professional layout. Colors: ${styleConfig.colors}. ${styleConfig.mood}.` },
      { type: "ad3", label: "Ad Creative — Urgency", override: `Square ad creative (1:1) for "${productBrief.title}". Product bundle with red "LIMITED TIME" banner. Countdown-style urgency graphic. Text: "Launch Price Ends Soon." Bold and urgent. Colors: ${styleConfig.colors} with red accents.` },
      { type: "thumbnail", label: "Product Thumbnail", override: `Small square thumbnail graphic for "${productBrief.title}". Compact product bundle, bold readable title, simple clean layout optimized for marketplace listings. Colors: ${styleConfig.colors}.` },
    ];

    for (let i = 0; i < prompts.length; i++) {
      const p = prompts[i];
      const url = await generateGraphic(p.type, p.override || undefined);
      outputs.push({ type: p.type, label: p.label, url });
      setGenerateProgress(((i + 1) / prompts.length) * 100);

      // Save bundle to result
      if (p.type === "bundle" && url) {
        const updated = { ...(result || { coverUrl: null, bundleUrl: null, bonusCoverUrls: [] }) };
        updated.bundleUrl = url;
        updated.coverUrl = url;
        setResult(updated);
      }
    }

    setLaunchGraphics(outputs);
    setGenerating(false);
    toast.success("All launch graphics generated!");
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (!productBrief) {
    return <div className="text-center py-12 text-muted-foreground">Complete previous steps first.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Product Launch Graphics</h2>
        <p className="text-muted-foreground">Generate high-converting 3D product bundles, ad creatives, hero banners, and thumbnails — all matching your brand.</p>
      </div>

      {/* Design Style Engine */}
      <Card className="border-accent/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold">Design Style</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {DESIGN_STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setDesignStyle(s.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  designStyle === s.id ? "border-primary bg-primary/10" : "border-border hover:bg-secondary/50"
                }`}
              >
                <p className="text-sm font-medium">{s.icon} {s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scene Layout */}
      <Card className="border-accent/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold">Scene Layout</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SCENE_LAYOUTS.map(l => (
              <button
                key={l.id}
                onClick={() => setSceneLayout(l.id)}
                className={`p-3 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  sceneLayout === l.id ? "border-primary bg-primary/10" : "border-border hover:bg-secondary/50"
                }`}
              >
                <l.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{l.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Tier Value Visualizer */}
      <Card className="border-accent/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold">Product Value Tier</h3>
            <span className="text-xs text-muted-foreground">— Graphics match perceived value</span>
          </div>
          <RadioGroup value={priceTier} onValueChange={(v) => setPriceTier(v as PriceTier)} className="grid grid-cols-3 gap-2">
            {PRICE_TIERS.map(t => (
              <Label
                key={t.id}
                htmlFor={`tier-${t.id}`}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                  priceTier === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={t.id} id={`tier-${t.id}`} className="sr-only" />
                <span className="text-sm font-bold">{t.label}</span>
                <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                <Badge variant="outline" className="text-[10px] mt-1">{t.itemCount} items</Badge>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Cover Headline Formula */}
      <Card className="border-accent/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold">Cover Headline Formula</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {HEADLINE_FORMULAS.map(f => (
              <button
                key={f.id}
                onClick={() => setHeadlineFormula(f.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  headlineFormula === f.id ? "border-primary bg-primary/10" : "border-border hover:bg-secondary/50"
                }`}
              >
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono whitespace-pre-line">{f.example}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={generateSingleBundle} disabled={generating || !!loading} variant="outline" className="gap-2">
          {loading === "bundle" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
          Generate Product Bundle
        </Button>
        <Button onClick={generateLaunchGraphics} disabled={generating || !!loading} className="gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Generate All Launch Graphics
        </Button>
      </div>

      {/* Progress */}
      {generating && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Generating 6 graphics (bundle + hero + 3 ads + thumbnail)...</span>
            <span>{Math.round(generateProgress)}%</span>
          </div>
          <Progress value={generateProgress} className="h-2" />
        </div>
      )}

      {/* Bundle Preview */}
      {result?.bundleUrl && !launchGraphics.length && (
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Product Bundle</h3>
                <Badge variant="outline" className="text-xs text-primary">Generated</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => downloadImage(result.bundleUrl!, `${productBrief.title}_Bundle.png`)} className="gap-1">
                <Download className="w-3 h-3" /> Download
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden border border-border bg-secondary/30">
              <img src={result.bundleUrl} alt="Product Bundle" className="w-full h-auto max-h-[400px] object-contain" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Launch Graphics Gallery */}
      {launchGraphics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Launch Graphics Suite</h3>
            <Badge variant="secondary" className="text-xs">{launchGraphics.filter(g => g.url).length}/{launchGraphics.length} generated</Badge>
          </div>
          <div className="grid gap-4">
            {launchGraphics.map((graphic, i) => (
              <Card key={i} className={graphic.url ? "border-primary/20" : "border-border/50"}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">{graphic.label}</h4>
                      {graphic.url && <Badge variant="outline" className="text-xs text-primary">✓</Badge>}
                    </div>
                    {graphic.url && (
                      <Button variant="ghost" size="sm" onClick={() => downloadImage(graphic.url!, `${productBrief.title}_${graphic.type}.png`)} className="gap-1 text-xs">
                        <Download className="w-3 h-3" /> Download
                      </Button>
                    )}
                  </div>
                  {graphic.url ? (
                    <div className="rounded-lg overflow-hidden border border-border bg-secondary/30">
                      <img src={graphic.url} alt={graphic.label} className="w-full h-auto max-h-[350px] object-contain" />
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg bg-secondary/30 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Failed to generate</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onNext} className="gap-2">
        Continue to Funnel Copy
      </Button>
    </div>
  );
}
