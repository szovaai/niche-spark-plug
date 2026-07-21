import { useEffect, useState } from "react";
import { Loader2, Rocket, Sparkles, CheckCircle2, Circle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useBlueprint } from "@/hooks/useBlueprint";
import { toast } from "sonner";

type Item = {
  key: string;
  label: string;
  detail: string;
  owner: "you" | "nova";
  priority: "critical" | "important" | "nice";
};

type Plan = {
  headline: string;
  launch_summary: string;
  pre_launch: Item[];
  launch_day: Item[];
  week_one: Item[];
  go_no_go: string[];
  first_promo_message: string;
};

const PRIORITY_COLOR: Record<Item["priority"], string> = {
  critical: "bg-red-500/15 text-red-500 border-red-500/30",
  important: "bg-primary/15 text-primary border-primary/30",
  nice: "bg-muted text-muted-foreground border-border/30",
};

export function LaunchEngine({ projectId }: { projectId: string }) {
  const { blueprint } = useBlueprint(projectId);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [live, setLive] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: task }, { data: milestone }] = await Promise.all([
        supabase
          .from("nova_tasks")
          .select("output_json")
          .eq("project_id", projectId)
          .eq("task_name", "launch_plan")
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(1),
        supabase
          .from("launch_milestones")
          .select("id")
          .eq("project_id", projectId)
          .eq("kind", "go_live")
          .maybeSingle(),
      ]);
      const out = task?.[0]?.output_json as Plan | null;
      if (out) setPlan(out);
      if (milestone) setLive(true);
      setLoading(false);
    })();
  }, [projectId]);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-plan", {
        body: { project_id: projectId },
      });
      if (error) throw error;
      setPlan(data as Plan);
      toast.success("Launch plan drafted.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't draft the launch plan. Try again.");
    } finally {
      setRunning(false);
    }
  };

  const toggle = (key: string) => setChecked((s) => ({ ...s, [key]: !s[key] }));

  const goLive = async () => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return;
    await supabase.from("launch_milestones").insert({
      project_id: projectId,
      user_id: uid,
      kind: "go_live",
      meta: { checked },
    } as never);
    const rows = ["launch_checklist", "go_live"].map((key) => ({
      project_id: projectId,
      user_id: uid,
      mission_id: "m10",
      task_key: key,
      label: key,
      status: "done",
      approved_at: new Date().toISOString(),
    }));
    await supabase.from("mission_tasks").upsert(rows as never, { onConflict: "project_id,mission_id,task_key" });
    await supabase.from("mission_progress").upsert(
      {
        project_id: projectId,
        user_id: uid,
        mission_id: "m10",
        status: "complete",
        progress_pct: 100,
        completed_at: new Date().toISOString(),
      } as never,
      { onConflict: "project_id,mission_id" },
    );
    setLive(true);
    toast.success("Launch marked live. Nova will meet you at Mission 11.");
  };

  const copyPromo = () => {
    if (!plan) return;
    navigator.clipboard.writeText(plan.first_promo_message);
    toast.success("Promo message copied.");
  };

  if (loading)
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  if (!blueprint?.product_concept || !blueprint?.offer_summary) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Finish Missions 4 & 5 first — Nova needs the product and offer before drafting a launch plan.
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <Rocket className="mx-auto h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-medium">No launch plan yet</div>
            <p className="text-xs text-muted-foreground">
              Costs 2 credits. Nova returns a pre-launch, launch-day, and week-one checklist plus a go/no-go and your first promo message.
            </p>
          </div>
          <Button onClick={run} disabled={running}>
            {running ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Drafting…
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-4 w-4" /> Draft launch plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allItems = [...plan.pre_launch, ...plan.launch_day, ...plan.week_one];
  const critical = allItems.filter((i) => i.priority === "critical");
  const criticalDone = critical.filter((i) => checked[i.key]).length;
  const canGoLive = critical.length === 0 || criticalDone === critical.length;

  const Section = ({ title, items }: { title: string; items: Item[] }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((i) => {
          const done = !!checked[i.key];
          return (
            <button
              key={i.key}
              onClick={() => toggle(i.key)}
              className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/30"
            >
              {done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                    {i.label}
                  </span>
                  <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLOR[i.priority]}`}>
                    {i.priority}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {i.owner === "nova" ? "Nova" : "You"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{i.detail}</p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-3">
      <Card className="border-primary/30 bg-primary/[0.03]">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base">{plan.headline}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{plan.launch_summary}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={run} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-draft (2)"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Go / no-go checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {plan.go_no_go.map((g, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary/70" />
              <span>{g}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Section title="Pre-launch" items={plan.pre_launch} />
      <Section title="Launch day" items={plan.launch_day} />
      <Section title="Week one" items={plan.week_one} />

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Your first promo message</CardTitle>
          <Button variant="ghost" size="sm" onClick={copyPromo}>
            <Copy className="mr-1 h-3.5 w-3.5" /> Copy
          </Button>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap rounded-md border border-border/30 bg-background/40 p-3 text-xs">
            {plan.first_promo_message}
          </p>
        </CardContent>
      </Card>

      <Button className="w-full" disabled={live || !canGoLive} onClick={goLive}>
        <Rocket className="mr-1 h-4 w-4" />
        {live
          ? "Launch is live 🚀"
          : canGoLive
          ? "Mark launch as live"
          : `Complete ${critical.length - criticalDone} critical item(s) to go live`}
      </Button>
    </div>
  );
}
