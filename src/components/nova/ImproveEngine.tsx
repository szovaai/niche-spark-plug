import { useEffect, useState } from "react";
import { Loader2, LineChart, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Retro = {
  verdict: "strong" | "promising" | "flat" | "struggling";
  scoreboard: { conversion_rate: string; revenue_per_visitor: string; biggest_lever: string };
  what_worked: string[];
  what_didnt: string[];
  next_plays: { title: string; why: string; effort: "low" | "medium" | "high" }[];
  coach_note: string;
};

type MetricInput = {
  visitors: string;
  optins: string;
  sales: string;
  revenue: string;
  refunds: string;
  upsell_sales: string;
  upsell_revenue: string;
  email_opens: string;
  email_clicks: string;
  notes: string;
};

const EMPTY: MetricInput = {
  visitors: "",
  optins: "",
  sales: "",
  revenue: "",
  refunds: "",
  upsell_sales: "",
  upsell_revenue: "",
  email_opens: "",
  email_clicks: "",
  notes: "",
};

const VERDICT: Record<Retro["verdict"], { label: string; color: string }> = {
  strong: { label: "Strong", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  promising: { label: "Promising", color: "bg-primary/15 text-primary border-primary/30" },
  flat: { label: "Flat", color: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  struggling: { label: "Struggling", color: "bg-red-500/15 text-red-500 border-red-500/30" },
};

export function ImproveEngine({ projectId }: { projectId: string }) {
  const [form, setForm] = useState<MetricInput>(EMPTY);
  const [retro, setRetro] = useState<Retro | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [hasMetrics, setHasMetrics] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: metrics }, { data: task }] = await Promise.all([
        supabase.from("launch_metrics").select("id").eq("project_id", projectId).limit(1),
        supabase
          .from("nova_tasks")
          .select("output_json")
          .eq("project_id", projectId)
          .eq("task_name", "launch_retro")
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(1),
      ]);
      setHasMetrics((metrics?.length ?? 0) > 0);
      const out = task?.[0]?.output_json as Retro | null;
      if (out) setRetro(out);
      setLoading(false);
    })();
  }, [projectId]);

  const set = (k: keyof MetricInput, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const saveMetrics = async () => {
    setSaving(true);
    try {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      if (!uid) throw new Error("no_user");
      const row = {
        project_id: projectId,
        user_id: uid,
        date: new Date().toISOString().slice(0, 10),
        visitors: Number(form.visitors || 0),
        optins: Number(form.optins || 0),
        sales: Number(form.sales || 0),
        revenue: Number(form.revenue || 0),
        refunds: Number(form.refunds || 0),
        upsell_sales: Number(form.upsell_sales || 0),
        upsell_revenue: Number(form.upsell_revenue || 0),
        email_opens: Number(form.email_opens || 0),
        email_clicks: Number(form.email_clicks || 0),
        notes: form.notes || null,
      };
      const { error } = await supabase.from("launch_metrics").insert(row as never);
      if (error) throw error;
      setHasMetrics(true);
      setForm(EMPTY);
      toast.success("Metrics logged.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save metrics.");
    } finally {
      setSaving(false);
    }
  };

  const runRetro = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-retro", {
        body: { project_id: projectId },
      });
      if (error) throw error;
      setRetro(data as Retro);
      toast.success("Retro delivered.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't run the retro. Log at least one metrics row first.");
    } finally {
      setRunning(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <LineChart className="h-4 w-4 text-primary" /> Log launch metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {(
              [
                ["visitors", "Visitors"],
                ["optins", "Opt-ins"],
                ["sales", "Sales"],
                ["revenue", "Revenue ($)"],
                ["refunds", "Refunds"],
                ["upsell_sales", "Upsell sales"],
                ["upsell_revenue", "Upsell rev ($)"],
                ["email_opens", "Email opens"],
                ["email_clicks", "Email clicks"],
              ] as [keyof MetricInput, string][]
            ).map(([k, label]) => (
              <div key={k} className="space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</label>
                <Input
                  type="number"
                  min="0"
                  value={form[k]}
                  onChange={(e) => set(k, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Notes: what happened today, questions from buyers, objections you heard…"
            className="text-sm"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={saveMetrics} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save metrics"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <div className="text-sm">
            <div className="font-medium">Ready for a retro with Nova?</div>
            <p className="text-xs text-muted-foreground">
              Costs 2 credits. Nova reads every metrics row you've logged and returns wins, misses, and next plays.
            </p>
          </div>
          <Button onClick={runRetro} disabled={running || !hasMetrics}>
            {running ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-4 w-4" /> Run retro
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {retro && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Verdict</CardTitle>
                <Badge variant="outline" className={VERDICT[retro.verdict].color}>
                  {VERDICT[retro.verdict].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-2 md:grid-cols-3">
                <div className="rounded-md border border-border/30 bg-background/40 p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">Conversion</div>
                  <div className="text-sm font-medium">{retro.scoreboard.conversion_rate}</div>
                </div>
                <div className="rounded-md border border-border/30 bg-background/40 p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">RPV</div>
                  <div className="text-sm font-medium">{retro.scoreboard.revenue_per_visitor}</div>
                </div>
                <div className="rounded-md border border-border/30 bg-background/40 p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">Biggest lever</div>
                  <div className="text-sm font-medium">{retro.scoreboard.biggest_lever}</div>
                </div>
              </div>
              <p className="text-xs italic text-muted-foreground">{retro.coach_note}</p>
            </CardContent>
          </Card>

          <div className="grid gap-2 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">What worked</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                {retro.what_worked.map((w, i) => (
                  <div key={i}>• {w}</div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">What didn't</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                {retro.what_didnt.map((w, i) => (
                  <div key={i}>• {w}</div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" /> Next plays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {retro.next_plays.map((p, i) => (
                <div key={i} className="rounded-md border border-border/30 bg-background/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium">{p.title}</div>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {p.effort} effort
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.why}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
