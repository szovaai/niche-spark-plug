import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Rocket, Loader2 } from "lucide-react";
import { PRODUCT_TYPES, Step1Product } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CampaignAngleSelector from "./CampaignAngleSelector";
import LaunchScoreCard from "./LaunchScoreCard";
import MechanismSelector from "./MechanismSelector";

interface Props {
  niche: string;
  setNiche: (v: string) => void;
  targetAudience: string;
  setTargetAudience: (v: string) => void;
  productType: string;
  setProductType: (v: string) => void;
  topic: string;
  setTopic: (v: string) => void;
  result: Step1Product | null;
  setResult: (v: Step1Product | null) => void;
  onNext: () => void;
  onGenerateAll: () => void;
  generatingAll: boolean;
  userId?: string;
}

export default function WizardStep1({ niche, setNiche, targetAudience, setTargetAudience, productType, setProductType, topic, setTopic, result, setResult, onNext, onGenerateAll, generatingAll, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);

  const canGenerate = niche.trim() && productType && topic.trim();

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-product", {
        body: { niche, targetAudience, productType, topic, userId },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Product concept generated!");

      // Auto-trigger launch score
      generateScore(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const generateScore = async (productData: Step1Product) => {
    setScoreLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-score", {
        body: {
          niche, targetAudience, productType, topic,
          productConcept: productData.concept,
          campaignAngles: productData.campaignAngles,
          userId,
        },
      });
      if (error) throw error;
      setResult({ ...productData, launchScore: data });
    } catch (e: any) {
      console.error("Score generation failed:", e);
    } finally {
      setScoreLoading(false);
    }
  };

  const selectMechanism = (mech: { name: string; tagline: string }) => {
    if (!result) return;
    setResult({ ...result, uniqueMechanism: `${mech.name} — ${mech.tagline}` });
  };

  const selectAngle = (name: string) => {
    if (!result) return;
    setResult({ ...result, selectedAngle: name });
  };

  // Determine which sections to show based on selection state
  const hasMechanismSelected = result?.uniqueMechanism?.includes(" — ");
  const hasAngleSelected = !!result?.selectedAngle;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Niche + Product Setup</h2>
        <p className="text-muted-foreground">Define your niche and product type to get started.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Niche *</label>
          <Input placeholder="e.g. Affiliate Marketing" value={niche} onChange={e => setNiche(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Audience</label>
          <Input placeholder="e.g. Beginners" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Type *</label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Topic *</label>
          <Input placeholder="e.g. AI traffic generation" value={topic} onChange={e => setTopic(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={generate} disabled={!canGenerate || loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Product Concept
        </Button>
        <Button onClick={onGenerateAll} disabled={!canGenerate || generatingAll} variant="hero" className="gap-2">
          {generatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
          Build My Launch System
        </Button>
      </div>

      {result && (
        <div className="space-y-5">
          {/* Product concept card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{result.title}</h3>
                <Badge variant="secondary">Generated</Badge>
              </div>
              <p className="text-muted-foreground italic">{result.subtitle}</p>
              <div>
                <h4 className="font-semibold text-sm mb-1">Concept</h4>
                <p className="text-sm text-muted-foreground">{result.concept}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Unique Mechanism</h4>
                <p className="text-sm text-muted-foreground">{result.uniqueMechanism}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Pain Points</h4>
                <div className="flex flex-wrap gap-2">
                  {result.painPoints?.map((p, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Launch Score */}
          {scoreLoading && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Analyzing launch potential...</span>
            </div>
          )}
          {result.launchScore && <LaunchScoreCard score={result.launchScore} />}

          {/* Mechanism Selector */}
          {result.mechanisms && result.mechanisms.length > 0 && (
            <MechanismSelector
              mechanisms={result.mechanisms}
              selectedMechanism={result.uniqueMechanism}
              onSelect={selectMechanism}
            />
          )}

          {/* Campaign Angles - shown after mechanism selected (or if no mechanisms available) */}
          {(hasMechanismSelected || !result.mechanisms?.length) && result.campaignAngles && result.campaignAngles.length > 0 && (
            <CampaignAngleSelector
              angles={result.campaignAngles}
              selectedAngle={result.selectedAngle || ""}
              onSelect={selectAngle}
              angleScores={result.launchScore?.angleScores}
            />
          )}

          {/* Continue button */}
          {hasAngleSelected ? (
            <Button onClick={onNext} className="gap-2 mt-2">
              Continue to Product Content
            </Button>
          ) : hasMechanismSelected ? (
            <p className="text-sm text-muted-foreground mt-2">↑ Select a campaign angle above to continue</p>
          ) : result.mechanisms?.length ? (
            <p className="text-sm text-muted-foreground mt-2">↑ Select your unique mechanism to unlock campaign angles</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">↑ Select a campaign angle above to continue</p>
          )}
        </div>
      )}
    </div>
  );
}
