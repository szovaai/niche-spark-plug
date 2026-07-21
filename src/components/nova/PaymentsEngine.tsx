import { useEffect, useState } from "react";
import { Loader2, Sparkles, CreditCard, CheckCircle2, Circle, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useBlueprint } from "@/hooks/useBlueprint";
import { toast } from "sonner";

type Path = "fast" | "starter" | "advanced";
type Option = {
  path: Path;
  funnel_platform: string;
  payment_provider: string;
  reasoning: string;
  monthly_cost_estimate: string;
  setup_time_estimate: string;
  pros: string[];
  cons: string[];
};
type ChecklistItem = { key: string; label: string; detail: string; link_hint: string | null };
type Plan = {
  recommended_path: Path;
  headline: string;
  summary: string;
  options: Option[];
  setup_checklist: ChecklistItem[];
  test_transaction_steps: string[];
  common_pitfalls: string[];
};

const PATH_LABELS: Record<Path, string> = {
  fast: "Fast Path",
  starter: "Starter",
  advanced: "Advanced",
};

export function PaymentsEngine({ projectId }: { projectId: string }) {
  const { blueprint, save } = useBlueprint(projectId);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [chosen, setChosen] = useState<Path | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [testDone, setTestDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("nova_tasks")
        .select("output_json")
        .eq("project_id", projectId)
        .eq("task_name", "payments_plan")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);
      const out = data?.[0]?.output_json as Plan | null;
      if (out) {
        setPlan(out);
        setChosen(out.recommended_path);
      }
      setLoading(false);
    })();
  }, [projectId]);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-payments-plan", {
        body: { project_id: projectId },
      });
      if (error) throw error;
      const out = data as Plan;
      setPlan(out);
      setChosen(out.recommended_path);
      setCheckedItems(new Set());
      toast.success("Payments plan drafted.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't draft the payments plan.");
    } finally {
      setRunning(false);
    }
  };

  const toggleItem = (key: string) => {
    const next = new Set(checkedItems);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setCheckedItems(next);
  };

  const lockIn = async () => {
    if (!plan || !chosen) return;
    const opt = plan.options.find((o) => o.path === chosen);
    if (!opt) return;

    await save({
      funnel_platform: opt.funnel_platform,
      payment_provider: opt.payment_provider,
    });

    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (uid) {
      const allChecked = checkedItems.size >= plan.setup_checklist.length;
      const doneKeys = ["funnel_path"];
      if (allChecked) doneKeys.push("platform_setup");
      if (testDone) doneKeys.push("payments_connected");

      const rows = doneKeys.map((key) => ({
        project_id: projectId,
        user_id: uid,
        mission_id: "m7",
        task_key: key,
        label: key,
        status: "done",
        approved_at: new Date().toISOString(),
      }));
      await supabase.from("mission_tasks").upsert(rows as never, { onConflict: "project_id,mission_id,task_key" });

      const pct = Math.round((doneKeys.length / 3) * 100);
      await supabase.from("mission_progress").upsert(
        {
          project_id: projectId,
          user_id: uid,
          mission_id: "m7",
          status: pct === 100 ? "complete" : "active",
          progress_pct: pct,
          ...(pct === 100 ? { completed_at: new Date().toISOString() } : {}),
        } as never,
        { onConflict: "project_id,mission_id" },
      );
    }
    toast.success(`Locked in ${opt.funnel_platform} + ${opt.payment_provider}.`);
  };

  if (loading)
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  if (!blueprint?.product_concept || !blueprint?.price) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Finish Missions 3–5 first — Nova needs your product and price before choosing payments.
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <CreditCard className="mx-auto h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-medium">No payments plan yet</div>
            <p className="text-xs text-muted-foreground">
              Costs 1 credit. Nova recommends Fast / Starter / Advanced paths with a setup checklist.
            </p>
          </div>
          <Button onClick={run} disabled={running}>
            {running ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Drafting…
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-4 w-4" /> Draft payments plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const chosenOpt = plan.options.find((o) => o.path === chosen);
  const checklistPct = plan.setup_checklist.length
    ? Math.round((checkedItems.size / plan.setup_checklist.length) * 100)
    : 0;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base">{plan.headline}</CardTitle>
              <p className="text-xs text-muted-foreground">{plan.summary}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={run} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-draft (1)"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-2 md:grid-cols-3">
        {plan.options.map((opt) => {
          const isChosen = chosen === opt.path;
          const isRec = plan.recommended_path === opt.path;
          return (
            <Card
              key={opt.path}
              onClick={() => setChosen(opt.path)}
              className={`cursor-pointer transition-colors ${
                isChosen ? "border-primary/50 bg-primary/[0.04]" : "border-border/30 hover:border-border/50"
              }`}
            >
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide">{PATH_LABELS[opt.path]}</span>
                  {isRec && (
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[10px]">Recommended</Badge>
                  )}
                </div>
                <div className="text-sm font-semibold">{opt.funnel_platform}</div>
                <div className="text-xs text-primary">+ {opt.payment_provider}</div>
                <p className="text-xs text-muted-foreground">{opt.reasoning}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
                  <span>{opt.monthly_cost_estimate}</span>
                  <span>·</span>
                  <span>{opt.setup_time_estimate}</span>
                </div>
                {isChosen && (
                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="text-primary">
                      <CheckCircle2 className="mr-1 inline h-3 w-3" /> Selected
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground/70">Pros:</span> {opt.pros.join(" · ")}
                    </div>
                    {opt.cons.length > 0 && (
                      <div className="text-muted-foreground">
                        <span className="font-medium text-foreground/70">Cons:</span> {opt.cons.join(" · ")}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {chosenOpt && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Setup checklist — {chosenOpt.funnel_platform}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {checkedItems.size}/{plan.setup_checklist.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {plan.setup_checklist.map((item) => {
                const done = checkedItems.has(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleItem(item.key)}
                    className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/30"
                  >
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm ${done ? "text-muted-foreground line-through" : ""}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-muted-foreground">{item.detail}</div>
                      {item.link_hint && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-primary/80">
                          <ExternalLink className="h-3 w-3" />
                          {item.link_hint}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Test transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
                {plan.test_transaction_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={testDone}
                  onChange={(e) => setTestDone(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                I ran a real test purchase end-to-end
              </label>
            </CardContent>
          </Card>

          {plan.common_pitfalls.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/[0.03]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Common pitfalls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {plan.common_pitfalls.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Button className="w-full" onClick={lockIn} disabled={!chosen}>
            Lock in {chosenOpt.funnel_platform} + {chosenOpt.payment_provider}
            {checklistPct === 100 && testDone ? " · complete mission" : ""}
          </Button>
        </>
      )}
    </div>
  );
}
