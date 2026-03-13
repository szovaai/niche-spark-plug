import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, Circle, Calendar } from "lucide-react";
import { Step1Product, Step2Content, Step3Graphics, Step3Funnel, Step4Marketing, Step5Checklist } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FunnelSiteExport from "./FunnelSiteExport";
import LaunchBoxExportButton from "./LaunchBoxExportButton";
import LaunchMultiplier from "./LaunchMultiplier";
import type { ProductAssets } from "@/types/productAssets";
import PublishSalesPageButton from "@/components/PublishSalesPageButton";
import PlatformExport from "@/components/PlatformExport";

import type { LaunchMode } from "@/pages/LaunchWizard";

interface Props {
  productBrief: Step1Product | null;
  hasContent: boolean;
  hasFunnel: boolean;
  hasMarketing: boolean;
  result: Step5Checklist | null;
  setResult: (v: Step5Checklist | null) => void;
  onSave: () => void;
  userId?: string;
  funnelData?: Step3Funnel | null;
  contentData?: Step2Content | null;
  marketingData?: Step4Marketing | null;
  assets?: ProductAssets;
  price?: number;
  niche?: string;
  productType?: string;
  launchMode?: LaunchMode;
  graphicsData?: Step3Graphics | null;
}

export default function WizardStep5({ productBrief, hasContent, hasFunnel, hasMarketing, result, setResult, onSave, userId, funnelData, contentData, marketingData, assets, price, niche, productType, launchMode, graphicsData }: Props) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-checklist", {
        body: { productBrief, hasContent, hasFunnel, hasMarketing, userId, launchMode },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Launch timeline generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepId: string) => {
    if (!result) return;
    setResult({
      steps: result.steps.map(s =>
        s.id === stepId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const completedCount = result?.steps?.filter(s => s.completed).length || 0;
  const totalCount = result?.steps?.length || 0;

  // Group steps by day
  const stepsByDay: Record<number, typeof result.steps> = {};
  if (result?.steps) {
    result.steps.forEach(step => {
      const day = step.day || 1;
      if (!stepsByDay[day]) stepsByDay[day] = [];
      stepsByDay[day].push(step);
    });
  }
  const days = Object.keys(stepsByDay).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Launch Timeline</h2>
        <p className="text-muted-foreground">Your personalized 7-day launch roadmap.</p>
      </div>

      {!result && (
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Launch Timeline
        </Button>
      )}

      {result && (
        <div className="space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{completedCount}/{totalCount} complete</span>
              </div>
              <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {days.map(day => (
              <div key={day} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Day {day}</h3>
                  <Badge variant="outline" className="text-xs">
                    {stepsByDay[day].filter(s => s.completed).length}/{stepsByDay[day].length}
                  </Badge>
                </div>
                <div className="space-y-2 ml-6 border-l-2 border-border pl-4">
                  {stepsByDay[day].map((step) => (
                    <Card key={step.id} className={`transition-colors ${step.completed ? "bg-primary/5 border-primary/20" : ""}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleStep(step.id)} className="mt-0.5 shrink-0">
                            {step.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                          <div>
                            <p className={`text-sm font-medium ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                              {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Launch In A Box Export */}
          <LaunchBoxExportButton
            product={productBrief}
            content={contentData || null}
            funnel={funnelData || null}
            marketing={marketingData || null}
            checklist={result}
            graphics={graphicsData}
            assets={assets || {}}
            niche={niche || ""}
            price={price || 17}
          />

          {/* Instant Funnel Site Export */}
          {funnelData && (
            <FunnelSiteExport
              funnel={funnelData}
              productTitle={productBrief?.title || "My Product"}
              productSubtitle={productBrief?.subtitle}
              price={price}
              niche={niche}
            />
          )}

          {/* Launch Multiplier */}
          <LaunchMultiplier
            productBrief={productBrief}
            niche={niche || ""}
            productType={productType || "ebook"}
            onSelectVariation={(newTopic, newTitle) => {
              navigate(`/wizard?niche=${encodeURIComponent(niche || "")}&topic=${encodeURIComponent(newTopic)}&productType=${encodeURIComponent(productType || "ebook")}`);
              toast.success(`Starting new launch: ${newTitle}`);
            }}
          />

          <Button onClick={onSave} variant="hero" className="gap-2 w-full">
            Save Launch Project
          </Button>
        </div>
      )}
    </div>
  );
}
