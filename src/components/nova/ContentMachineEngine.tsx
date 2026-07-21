import { useEffect, useState } from "react";
import { Loader2, Sparkles, Megaphone, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useBlueprint } from "@/hooks/useBlueprint";
import { toast } from "sonner";

const CHANNELS = [
  { id: "Pinterest", label: "Pinterest", note: "Long-tail search traffic" },
  { id: "YouTube Shorts", label: "YouTube Shorts", note: "Compounding video reach" },
  { id: "TikTok", label: "TikTok", note: "Fastest cold traffic" },
  { id: "Instagram Reels", label: "Instagram", note: "Warm audience nurture" },
  { id: "X/Twitter", label: "X / Twitter", note: "Text threads + founder story" },
  { id: "LinkedIn", label: "LinkedIn", note: "B2B / professional niches" },
];

type Post = {
  day: number;
  channel: string;
  format: string;
  hook: string;
  body: string;
  cta: string;
  repurposed_from: string;
};
type Playbook = { channel: string; voice: string; best_formats: string[]; posting_rules: string[] };
type Plan = {
  primary_channel: string;
  secondary_channels: string[];
  cadence: string;
  headline: string;
  strategy_summary: string;
  channel_playbooks: Playbook[];
  thirty_day_plan: Post[];
  batching_tips: string[];
};

export function ContentMachineEngine({ projectId }: { projectId: string }) {
  const { blueprint, save } = useBlueprint(projectId);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [primary, setPrimary] = useState<string>("Pinterest");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("nova_tasks")
        .select("output_json, input_json")
        .eq("project_id", projectId)
        .eq("task_name", "content_plan")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);
      const out = data?.[0]?.output_json as Plan | null;
      if (out) {
        setPlan(out);
        setPrimary(out.primary_channel);
      } else if (blueprint?.traffic_source) {
        setPrimary(blueprint.traffic_source);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content-plan", {
        body: { project_id: projectId, primary_channel: primary },
      });
      if (error) throw error;
      const out = data as Plan;
      setPlan(out);
      toast.success("30-day content plan drafted.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't draft the content plan.");
    } finally {
      setRunning(false);
    }
  };

  const approve = async () => {
    if (!plan) return;
    await save({ traffic_source: plan.primary_channel });

    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (uid) {
      const rows = ["primary_channel", "content_plan"].map((key) => ({
        project_id: projectId,
        user_id: uid,
        mission_id: "m9",
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
          mission_id: "m9",
          status: "complete",
          progress_pct: 100,
          completed_at: new Date().toISOString(),
        } as never,
        { onConflict: "project_id,mission_id" },
      );
    }
    toast.success("Content plan approved.");
  };

  const copyPost = (p: Post) => {
    const text = `${p.hook}\n\n${p.body}\n\n${p.cta}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied.");
  };

  if (loading)
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  if (!blueprint?.product_concept) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Finish Mission 3 first — Nova needs your product before drafting content.
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="text-center">
            <Megaphone className="mx-auto h-6 w-6 text-primary" />
            <div className="mt-2 text-sm font-medium">Pick your primary channel</div>
            <p className="text-xs text-muted-foreground">
              Nova will build a 30-day plan around it and repurpose to 1–3 supporting channels.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                onClick={() => setPrimary(c.id)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  primary === c.id
                    ? "border-primary/50 bg-primary/[0.05]"
                    : "border-border/30 hover:border-border/60"
                }`}
              >
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.note}</div>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">Costs 2 credits.</p>
          <Button className="w-full" onClick={run} disabled={running || !primary}>
            {running ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Drafting…
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-4 w-4" /> Build 30-day plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base">{plan.headline}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{plan.strategy_summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[10px]">
                  Primary · {plan.primary_channel}
                </Badge>
                {plan.secondary_channels.map((c) => (
                  <Badge key={c} variant="outline" className="text-[10px]">
                    {c}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-[10px]">
                  {plan.cadence}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={run} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-draft (2)"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Channel playbooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {plan.channel_playbooks.map((pb) => (
            <div key={pb.channel} className="rounded-md border border-border/30 bg-background/40 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{pb.channel}</div>
                <div className="text-[11px] text-muted-foreground">{pb.voice}</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Formats: {pb.best_formats.join(" · ")}
              </div>
              <ul className="mt-1 list-disc pl-5 text-[11px] text-muted-foreground/90">
                {pb.posting_rules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">30-day plan ({plan.thirty_day_plan.length} posts)</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[520px] space-y-2 overflow-y-auto">
          {plan.thirty_day_plan
            .slice()
            .sort((a, b) => a.day - b.day)
            .map((p, i) => (
              <div key={i} className="rounded-md border border-border/30 bg-background/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      Day {p.day}
                    </Badge>
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/15 text-[10px]">
                      {p.channel}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{p.format}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyPost(p)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="mt-2 text-sm font-medium">{p.hook}</div>
                <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{p.body}</p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-primary/80">CTA: {p.cta}</span>
                  <span className="text-muted-foreground/70">from: {p.repurposed_from}</span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {plan.batching_tips.length > 0 && (
        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Batching tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              {plan.batching_tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Button className="w-full" onClick={approve}>
        <CheckCircle2 className="mr-1 h-4 w-4" /> Approve plan &amp; lock {plan.primary_channel}
      </Button>
    </div>
  );
}
