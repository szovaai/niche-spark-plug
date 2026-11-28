import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useBlueprint, type SalesProfile } from "@/hooks/useBlueprint";

const FIELDS: { key: keyof SalesProfile; label: string; hint: string }[] = [
  { key: "pain_points", label: "Customer pain points", hint: "What keeps your buyer stuck?" },
  { key: "verified_benefits", label: "Verified benefits", hint: "Only benefits you can actually back up." },
  { key: "objections", label: "Common objections", hint: "Why people hesitate to buy." },
  { key: "positioning", label: "Competitive positioning", hint: "Why you, not the alternatives." },
  { key: "approved_claims", label: "Approved factual claims", hint: "Claims copy is allowed to make. Nothing else." },
];

export function SalesProfileCard() {
  const project = useActiveProject();
  const { blueprint, loading, save } = useBlueprint(project.data?.id);
  const [form, setForm] = useState<SalesProfile>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(blueprint?.sales_profile ?? {}); }, [blueprint?.sales_profile]);

  if (project.isLoading) return null;
  if (!project.data) {
    return (
      <Card><CardContent className="p-5 text-sm text-muted-foreground">
        Start a business in <Link to="/hq" className="text-primary underline">Business HQ</Link> to build your Sales Intelligence Profile.
      </CardContent></Card>
    );
  }

  const b = blueprint;
  const pid = project.data.id;
  const facts: [string, string | null | undefined][] = [
    ["Audience", b?.target_audience], ["Desired outcome", b?.desired_outcome], ["Brand voice", b?.brand_voice],
    ["Product", b?.product_concept], ["Price", b?.price != null ? `$${b.price}` : null],
  ];
  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-lg">Sales Intelligence Profile — {project.data.project_name}</CardTitle>
        <p className="text-sm text-muted-foreground">Every copy tool should write from this. Audience, outcome, voice, product and price come from your Business Blueprint.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {facts.map(([k, v]) => (
                <div key={k} className="rounded-md bg-muted/30 px-3 py-2"><span className="text-muted-foreground">{k}: </span>{v || <Link to={`/project/${pid}/blueprint`} className="text-primary">add in Blueprint</Link>}</div>
              ))}
            </div>
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Textarea id={f.key} rows={2} placeholder={f.hint} value={form[f.key] ?? ""} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <Button disabled={saving} onClick={async () => { setSaving(true); await save({ sales_profile: form }); setSaving(false); toast.success("Sales profile saved"); }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
