import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, DollarSign, Gauge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  QUALITY_MODES,
  MODEL_PREFERENCES,
  previewModel,
  costLabel,
  speedLabel,
  type QualityMode,
  type UserPreference,
  type TaskKind,
} from "@/lib/aiRouting";

interface AIRoutingTabProps {
  userId: string;
}

const TASK_LABELS: { kind: TaskKind; label: string; icon: string }[] = [
  { kind: "fast",      label: "Ideation, niches, fast drafts", icon: "⚡" },
  { kind: "longform",  label: "PDF chapters, guides, workbooks", icon: "📚" },
  { kind: "salescopy", label: "Sales copy, headlines, emails",   icon: "💬" },
];

const AIRoutingTab = ({ userId }: AIRoutingTabProps) => {
  const [qualityMode, setQualityMode] = useState<QualityMode>("balanced");
  const [modelPreference, setModelPreference] = useState<UserPreference>("auto");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("ai_quality_mode, ai_model_preference")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        if (data.ai_quality_mode) setQualityMode(data.ai_quality_mode as QualityMode);
        if (data.ai_model_preference) setModelPreference(data.ai_model_preference as UserPreference);
      }
      setLoading(false);
    })();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ai_quality_mode: qualityMode, ai_model_preference: modelPreference })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("Could not save AI routing preferences");
    } else {
      toast.success("AI routing saved");
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Smart AI Model Routing</CardTitle>
          </div>
          <CardDescription>
            PDF Empire AI picks the right model for each task instead of using one model for everything.
            Choose how aggressively to optimize for quality, speed, or cost.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Quality mode */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Quality Mode</Label>
            <RadioGroup
              value={qualityMode}
              onValueChange={(v) => setQualityMode(v as QualityMode)}
              className="grid gap-3 md:grid-cols-3"
            >
              {QUALITY_MODES.map((m) => (
                <label
                  key={m.value}
                  htmlFor={`qm-${m.value}`}
                  className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition ${
                    qualityMode === m.value
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id={`qm-${m.value}`} value={m.value} />
                    <span className="text-sm font-medium">{m.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground pl-6">{m.desc}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Model preference */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Model Preference</Label>
            <RadioGroup
              value={modelPreference}
              onValueChange={(v) => setModelPreference(v as UserPreference)}
              className="grid gap-3 md:grid-cols-2"
            >
              {MODEL_PREFERENCES.map((p) => (
                <label
                  key={p.value}
                  htmlFor={`mp-${p.value}`}
                  className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition ${
                    modelPreference === p.value
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id={`mp-${p.value}`} value={p.value} />
                    <span className="text-sm font-medium">{p.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground pl-6">{p.desc}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Live routing preview */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">What you'll get with these settings</Label>
            <div className="grid gap-2">
              {TASK_LABELS.map((t) => {
                const m = previewModel(t.kind, qualityMode, modelPreference);
                return (
                  <div
                    key={t.kind}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-card/40 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{t.icon}</span>
                      <span className="text-sm">{t.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        {m.label}
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-[11px]">
                        <DollarSign className="w-3 h-3" />
                        {costLabel(m.costTier)}
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-[11px]">
                        <Gauge className="w-3 h-3" />
                        {speedLabel(m.speedTier)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              If a model fails, PDF Empire automatically falls back to a backup model so generation
              never breaks.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRoutingTab;
