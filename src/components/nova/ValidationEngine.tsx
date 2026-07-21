import { useEffect, useState } from "react";
import { Loader2, Shield, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useBlueprint } from "@/hooks/useBlueprint";
import { toast } from "sonner";

type Report = {
  verdict: "strong" | "viable" | "risky" | "avoid";
  headline: string;
  demand_score: number;
  urgency_score: number;
  competition_score: number;
  monetization_score: number;
  overall_score: number;
  problem_statement: string;
  target_audience: string;
  proof_points: string[];
  risks: string[];
  recommended_next_step: string;
};

const VERDICT_STYLE: Record<Report["verdict"], string> = {
  strong: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  viable: "bg-primary/15 text-primary border-primary/30",
  risky: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  avoid: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function ValidationEngine({ projectId }: { projectId: string }) {
  const { save } = useBlueprint(projectId);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("nova_tasks")
        .select("output_json")
        .eq("project_id", projectId)
        .eq("task_name", "validation_report")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);
      setReport((data?.[0]?.output_json as Report) ?? null);
      setLoading(false);
    })();
  }, [projectId]);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-problem", {
        body: { project_id: projectId },
      });
      if (error) throw error;
      const r = data as Report;
      setReport(r);
      toast.success(`Verdict: ${r.verdict}`);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't run validation. Try again.");
    } finally {
      setRunning(false);
    }
  };

  const approve = async () => {
    if (!report) return;
    await save({
      customer_problem: report.problem_statement,
      target_audience: report.target_audience,
    });
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (uid) {
      await supabase.from("mission_tasks").upsert(
        [
          { project_id: projectId, user_id: uid, mission_id: "m2", task_key: "review_scores", label: "Review scoring factors", status: "done", approved_at: new Date().toISOString() },
          { project_id: projectId, user_id: uid, mission_id: "m2", task_key: "approve_problem", label: "Approve the validated problem statement", status: "done", approved_at: new Date().toISOString() },
        ] as never,
        { onConflict: "project_id,mission_id,task_key" },
      );
      await supabase.from("mission_progress").upsert(
        { project_id: projectId, user_id: uid, mission_id: "m2", status: "complete", progress_pct: 100, completed_at: new Date().toISOString() } as never,
        { onConflict: "project_id,mission_id" },
      );
    }
    toast.success("Validated. Nova unlocked Mission 3.");
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  if (!report) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <Shield className="mx-auto h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-medium">Nova hasn't validated yet</div>
            <p className="text-xs text-muted-foreground">Costs 2 credits. Nova returns a scored, honest verdict.</p>
          </div>
          <Button onClick={run} disabled={running}>
            {running ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Validating…</> : <><Shield className="mr-1 h-4 w-4" /> Run validation</>}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm">Validation report</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{report.headline}</p>
          </div>
          <Badge variant="outline" className={VERDICT_STYLE[report.verdict]}>
            {report.verdict.toUpperCase()} · {report.overall_score}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="grid grid-cols-4 gap-2">
          {([
            ["Demand", report.demand_score],
            ["Urgency", report.urgency_score],
            ["Open", report.competition_score],
            ["Monetize", report.monetization_score],
          ] as const).map(([label, val]) => (
            <div key={label}>
              <div className="mb-0.5 text-[10px] uppercase text-muted-foreground/70">{label}</div>
              <Progress value={val} className="h-1" />
              <div className="mt-0.5 text-[10px] text-muted-foreground">{val}</div>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="text-[10px] uppercase text-muted-foreground/70">Sharpened problem</div>
          <p className="text-muted-foreground">{report.problem_statement}</p>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase text-muted-foreground/70">Sharpened audience</div>
          <p className="text-muted-foreground">{report.target_audience}</p>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-1 text-[10px] uppercase text-muted-foreground/70">
            <TrendingUp className="h-3 w-3" /> Proof
          </div>
          <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
            {report.proof_points.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-1 text-[10px] uppercase text-muted-foreground/70">
            <AlertTriangle className="h-3 w-3" /> Risks
          </div>
          <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
            {report.risks.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>

        <div className="rounded-md border border-primary/20 bg-primary/[0.04] p-3">
          <div className="text-[10px] uppercase text-primary">Nova recommends</div>
          <p className="mt-0.5 text-foreground/90">{report.recommended_next_step}</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={approve}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve & continue
          </Button>
          <Button size="sm" variant="outline" onClick={run} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-run (2 credits)"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
