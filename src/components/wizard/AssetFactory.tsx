import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Download, BookOpen, Zap, Wrench, FileText, MessageSquare, Gift, TrendingUp, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import AssetCard from "./AssetCard";
import type { Step1Product, Step2Content } from "@/types/launchWizard";
import type { ProductAssets, AssetType, ASSET_TYPE_CONFIG } from "@/types/productAssets";

const ICONS: Record<string, any> = { BookOpen, Zap, Wrench, FileText, MessageSquare, Gift, TrendingUp, Layers };

const ASSET_TYPES: { key: AssetType; label: string; icon: string; description: string }[] = [
  { key: "workbook", label: "Workbook", icon: "BookOpen", description: "Worksheets & exercises for each chapter" },
  { key: "cheatsheet", label: "Cheat Sheets", icon: "Zap", description: "Quick-reference guides & frameworks" },
  { key: "toolkit", label: "Toolkit", icon: "Wrench", description: "Scripts, templates & checklists" },
  { key: "templates", label: "Templates", icon: "FileText", description: "Reusable proposals, emails & offers" },
  { key: "promptPack", label: "Prompt Pack", icon: "MessageSquare", description: "15-20 AI prompts for ChatGPT" },
  { key: "bonusGuides", label: "Bonus Guides", icon: "Gift", description: "3-5 high-value bonus products" },
  { key: "caseStudies", label: "Case Studies", icon: "TrendingUp", description: "Detailed before/after stories" },
  { key: "multiplier", label: "Product Multiplier", icon: "Layers", description: "Turn 1 product into 6 formats" },
];

interface Props {
  productBrief: Step1Product;
  productContent: Step2Content;
  productType: string;
  assets: ProductAssets;
  setAssets: (a: ProductAssets) => void;
}

export default function AssetFactory({ productBrief, productContent, productType, assets, setAssets }: Props) {
  const [selected, setSelected] = useState<Set<AssetType>>(new Set(["workbook", "cheatsheet", "toolkit", "bonusGuides"]));
  const [generating, setGenerating] = useState<AssetType | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleAsset = (key: AssetType) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelected(next);
  };

  const generateSingle = async (assetType: AssetType) => {
    setGenerating(assetType);
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-assets", {
        body: { assetType, productBrief, productContent, productType },
      });
      if (error) throw error;
      const updated = { ...assets, [assetType]: data };
      setAssets(updated);
      toast.success(`${ASSET_TYPES.find(a => a.key === assetType)?.label} generated!`);
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setGenerating(null);
    }
  };

  const generateAll = async () => {
    const toGenerate = Array.from(selected).filter(k => !assets[k]);
    if (!toGenerate.length) { toast.info("All selected assets already generated"); return; }

    setGeneratingAll(true);
    setProgress(0);
    let updated = { ...assets };

    for (let i = 0; i < toGenerate.length; i++) {
      const assetType = toGenerate[i];
      setGenerating(assetType);
      setProgress(Math.round(((i) / toGenerate.length) * 100));
      try {
        const { data, error } = await supabase.functions.invoke("generate-product-assets", {
          body: { assetType, productBrief, productContent, productType },
        });
        if (error) throw error;
        updated = { ...updated, [assetType]: data };
        setAssets(updated);
      } catch (e: any) {
        toast.error(`Failed to generate ${assetType}: ${e.message}`);
      }
    }

    setProgress(100);
    setGenerating(null);
    setGeneratingAll(false);
    toast.success("🎉 Product Asset Stack generated!");
  };

  const downloadBundle = async () => {
    const zip = new JSZip();
    const title = productBrief.title || "Product";

    const addText = (folder: string, name: string, content: string) => {
      zip.file(`${folder}/${name}.txt`, content);
    };

    if (assets.workbook?.worksheets) {
      assets.workbook.worksheets.forEach((w, i) => {
        addText("Workbooks", `Worksheet-${i + 1}-${w.title.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}`,
          `${w.title}\n\n${w.intro}\n\nQuestions:\n${w.questions.map((q, j) => `${j + 1}. ${q}`).join("\n")}\n\nReflection:\n${w.reflectionPrompt}`);
      });
    }
    if (assets.cheatsheet?.sheets) {
      assets.cheatsheet.sheets.forEach((s, i) => {
        addText("Cheat-Sheets", `CheatSheet-${i + 1}-${s.title.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}`,
          `${s.title}\n${s.subtitle}\n\n${s.steps.map(st => `Step ${st.number}: ${st.title}\n${st.description}`).join("\n\n")}\n\nPro Tip: ${s.proTip}`);
      });
    }
    if (assets.toolkit?.tools) {
      assets.toolkit.tools.forEach((t, i) => {
        addText("Toolkit", `${t.type}-${i + 1}-${t.name.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}`,
          `${t.name}\nType: ${t.type}\n\n${t.description}\n\n${t.content}`);
      });
    }
    if (assets.templates?.templates) {
      assets.templates.templates.forEach((t, i) => {
        addText("Templates", `Template-${i + 1}-${t.name.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}`,
          `${t.name}\nCategory: ${t.category}\n\n${t.instructions}\n\n${t.content}`);
      });
    }
    if (assets.promptPack?.categories) {
      let allPrompts = "";
      assets.promptPack.categories.forEach(c => {
        allPrompts += `=== ${c.name} ===\n\n`;
        c.prompts.forEach(p => {
          allPrompts += `${p.title}\n\n${p.prompt}\n\nExpected: ${p.expectedOutput}\n\n---\n\n`;
        });
      });
      addText("Prompt-Pack", "AI-Prompt-Pack", allPrompts);
    }
    if (assets.bonusGuides?.bonuses) {
      assets.bonusGuides.bonuses.forEach((b, i) => {
        addText("Bonuses", `Bonus-${i + 1}-${b.name.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}`,
          `${b.name}\nValue: $${b.perceivedValue}\n${b.tagline}\n\n${b.content}`);
      });
    }
    if (assets.caseStudies?.caseStudies) {
      assets.caseStudies.caseStudies.forEach((c, i) => {
        addText("Case-Studies", `CaseStudy-${i + 1}-${c.name.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}`,
          `Case Study: ${c.name}\n\nBackground: ${c.background}\nChallenge: ${c.challenge}\nMethod: ${c.method}\nResults: ${c.results}\n\n"${c.quote}"`);
      });
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${title.replace(/[^a-zA-Z0-9]/g, "-")}-Product-Bundle.zip`);
    toast.success("Product bundle downloaded!");
  };

  const generatedCount = Object.keys(assets).filter(k => assets[k as AssetType]).length;

  return (
    <div className="space-y-6">
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Digital Product Asset Factory
              </h3>
              <p className="text-sm text-muted-foreground">Select assets to generate your complete sellable product stack.</p>
            </div>
            {generatedCount > 0 && (
              <Badge variant="default" className="text-xs">{generatedCount}/{ASSET_TYPES.length} Generated</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ASSET_TYPES.map(asset => {
              const Icon = ICONS[asset.icon] || Sparkles;
              const isGenerated = !!assets[asset.key];
              const isCurrentlyGenerating = generating === asset.key;
              return (
                <div key={asset.key} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isGenerated ? "border-accent/40 bg-accent/5" : "border-border"}`}>
                  <Checkbox
                    checked={selected.has(asset.key)}
                    onCheckedChange={() => toggleAsset(asset.key)}
                    disabled={generatingAll}
                  />
                  <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{asset.label}</p>
                      {isGenerated && <Badge variant="outline" className="text-xs text-accent">✓</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{asset.description}</p>
                  </div>
                  {!isGenerated && !generatingAll && (
                    <Button variant="ghost" size="sm" className="shrink-0 h-7 text-xs" onClick={() => generateSingle(asset.key)} disabled={!!generating}>
                      {isCurrentlyGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Generate"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {generatingAll && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Generating {generating ? ASSET_TYPES.find(a => a.key === generating)?.label : ""}... {progress}%
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={generateAll} disabled={!!generating || generatingAll} className="gap-2">
              {generatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate All Selected
            </Button>
            {generatedCount > 0 && (
              <Button variant="outline" onClick={downloadBundle} className="gap-2">
                <Download className="w-4 h-4" />
                Download Product Bundle (.zip)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rendered asset cards */}
      {ASSET_TYPES.filter(a => assets[a.key]).map(asset => (
        <AssetCard
          key={asset.key}
          assetType={asset.key}
          label={asset.label}
          data={assets[asset.key]}
          productTitle={productBrief.title}
        />
      ))}
    </div>
  );
}
