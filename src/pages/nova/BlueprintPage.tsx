import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useBlueprint, type Blueprint } from "@/hooks/useBlueprint";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Field = { key: keyof Blueprint; label: string; multiline?: boolean; type?: "number" | "date" };

const SECTIONS: { heading: string; fields: Field[] }[] = [
  {
    heading: "Positioning",
    fields: [
      { key: "business_name", label: "Business / brand name" },
      { key: "niche", label: "Niche" },
      { key: "target_audience", label: "Target audience", multiline: true },
      { key: "customer_problem", label: "Customer problem", multiline: true },
      { key: "desired_outcome", label: "Desired outcome", multiline: true },
    ],
  },
  {
    heading: "Product",
    fields: [
      { key: "product_concept", label: "Product concept" },
      { key: "product_promise", label: "Product promise", multiline: true },
    ],
  },
  {
    heading: "Offer",
    fields: [
      { key: "offer_summary", label: "Offer summary", multiline: true },
      { key: "price", label: "Price (USD)", type: "number" },
      { key: "order_bump", label: "Order bump" },
      { key: "upsell", label: "Upsell" },
      { key: "downsell", label: "Downsell" },
    ],
  },
  {
    heading: "Funnel & launch",
    fields: [
      { key: "funnel_platform", label: "Funnel platform" },
      { key: "payment_provider", label: "Payment provider" },
      { key: "traffic_source", label: "Primary traffic source" },
      { key: "brand_voice", label: "Brand voice" },
      { key: "launch_date", label: "Launch date", type: "date" },
      { key: "revenue_goal", label: "Revenue goal (USD)", type: "number" },
    ],
  },
];

export default function BlueprintPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { blueprint, loading, save } = useBlueprint(projectId);
  const [draft, setDraft] = useState<Partial<Blueprint>>({});
  const [projectName, setProjectName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (blueprint) setDraft({});
  }, [blueprint]);

  useEffect(() => {
    if (!projectId) return;
    supabase
      .from("business_projects")
      .select("project_name")
      .eq("id", projectId)
      .maybeSingle()
      .then(({ data }) => setProjectName(data?.project_name ?? ""));
  }, [projectId]);

  if (loading || !blueprint) {
    return (
      <DashboardLayout title="Blueprint">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const value = (key: keyof Blueprint) => {
    const v = draft[key] !== undefined ? draft[key] : blueprint[key];
    return v == null ? "" : String(v);
  };

  const setField = (key: keyof Blueprint, val: string, type?: Field["type"]) => {
    setDraft((d) => ({
      ...d,
      [key]:
        val === ""
          ? null
          : type === "number"
            ? Number(val)
            : val,
    }));
  };

  const doSave = async () => {
    setSaving(true);
    try {
      await save(draft);
      setDraft({});
      toast.success("Blueprint saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title={projectName}>
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${projectId}`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to missions
          </Button>
          <Button onClick={doSave} disabled={saving || Object.keys(draft).length === 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-1 h-4 w-4" /> Save</>}
          </Button>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-primary">Business Blueprint</div>
          <h1 className="mt-1 text-2xl font-semibold">{projectName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nova's persistent memory for this project. Every mission updates this — you can edit anything by hand.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <Card key={section.heading}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{section.heading}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.fields.map((f) => (
                <div key={String(f.key)} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  {f.multiline ? (
                    <Textarea
                      value={value(f.key)}
                      rows={2}
                      onChange={(e) => setField(f.key, e.target.value, f.type)}
                    />
                  ) : (
                    <Input
                      type={f.type ?? "text"}
                      value={value(f.key)}
                      onChange={(e) => setField(f.key, e.target.value, f.type)}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
