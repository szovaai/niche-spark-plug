import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, CheckCircle2, Circle } from "lucide-react";
import { Step1Product, Step5Checklist, ChecklistStep } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  productBrief: Step1Product | null;
  hasContent: boolean;
  hasFunnel: boolean;
  hasMarketing: boolean;
  result: Step5Checklist | null;
  setResult: (v: Step5Checklist | null) => void;
  onSave: () => void;
  userId?: string;
}

export default function WizardStep5({ productBrief, hasContent, hasFunnel, hasMarketing, result, setResult, onSave, userId }: Props) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-checklist", {
        body: { productBrief, hasContent, hasFunnel, hasMarketing, userId },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Launch checklist generated!");
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Launch Checklist</h2>
        <p className="text-muted-foreground">Your personalized roadmap to launch.</p>
      </div>

      {!result && (
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Launch Checklist
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

          <div className="space-y-2">
            {result.steps?.map((step, i) => (
              <Card key={step.id} className={`transition-colors ${step.completed ? "bg-primary/5 border-primary/20" : ""}`}>
                <CardContent className="p-4">
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
                        Step {i + 1}: {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={onSave} variant="hero" className="gap-2 w-full">
            Save Launch Project
          </Button>
        </div>
      )}
    </div>
  );
}
