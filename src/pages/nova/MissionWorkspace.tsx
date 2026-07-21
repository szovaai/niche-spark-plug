import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle2, Circle, Sparkles, ArrowRight, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NovaChat } from "@/components/nova/NovaChat";
import { OpportunityEngine } from "@/components/nova/OpportunityEngine";
import { ValidationEngine } from "@/components/nova/ValidationEngine";
import { ProductConceptEngine } from "@/components/nova/ProductConceptEngine";
import { ProductBuildEngine } from "@/components/nova/ProductBuildEngine";
import { OfferArchitectEngine } from "@/components/nova/OfferArchitectEngine";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMissionProgress } from "@/hooks/useMissionProgress";
import { useBlueprint } from "@/hooks/useBlueprint";
import { MISSION_BY_ID, nextMissionAfter } from "@/lib/missions";
import type { MissionId } from "@/components/nova/StageMap";
import type { UIMessage } from "ai";
import { toast } from "sonner";

type ConvRow = { id: string };
type MsgRow = {
  message_id: string;
  role: string;
  parts: unknown;
  metadata: unknown;
  sequence_no: number;
};

export default function MissionWorkspace() {
  const { projectId, missionId } = useParams<{ projectId: string; missionId: MissionId }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [ready, setReady] = useState(false);
  const { blueprint } = useBlueprint(projectId);
  const { tasks, missions, overallPct, toggleTask } = useMissionProgress(projectId);

  const def = missionId ? MISSION_BY_ID[missionId] : undefined;
  const missionRow = missionId ? missions[missionId] : undefined;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || !projectId) return;
    (async () => {
      const { data: proj } = await supabase
        .from("business_projects")
        .select("project_name")
        .eq("id", projectId)
        .maybeSingle();
      if (!proj) {
        toast.error("Project not found.");
        navigate("/dashboard");
        return;
      }
      setProjectName(proj.project_name);

      const { data: convs } = await supabase
        .from("nova_conversations")
        .select("id")
        .eq("project_id", projectId)
        .eq("kind", "coach")
        .order("created_at", { ascending: true })
        .limit(1);
      let conv: ConvRow | null = (convs?.[0] as ConvRow) ?? null;
      if (!conv) {
        const { data: newConv } = await supabase
          .from("nova_conversations")
          .insert({ user_id: user.id, project_id: projectId, title: proj.project_name, kind: "coach" })
          .select("id")
          .single();
        conv = newConv as ConvRow;
      }
      setConversationId(conv.id);

      const { data: msgs } = await supabase
        .from("nova_messages")
        .select("message_id, role, parts, metadata, sequence_no")
        .eq("conversation_id", conv.id)
        .is("summarized_at", null)
        .order("sequence_no", { ascending: true });

      setInitialMessages(
        (msgs ?? []).map((m: MsgRow) => ({
          id: m.message_id,
          role: m.role as UIMessage["role"],
          parts: (Array.isArray(m.parts) ? m.parts : []) as UIMessage["parts"],
          metadata: (m.metadata ?? {}) as UIMessage["metadata"],
        })),
      );
      setReady(true);
    })();
  }, [user, projectId, navigate]);

  if (authLoading || !ready || !def || !conversationId) {
    return (
      <DashboardLayout title="Mission">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const missionTasks = tasks.filter((t) => t.mission_id === missionId);
  const taskState = (key: string) =>
    missionTasks.find((t) => t.task_key === key)?.status === "done";
  const doneCount = def.tasks.filter((t) => taskState(t.key)).length;
  const pct = Math.round((doneCount / def.tasks.length) * 100);
  const next = nextMissionAfter(missionId!);

  const blueprintChips = [
    blueprint?.niche && { label: "Niche", value: blueprint.niche },
    blueprint?.target_audience && { label: "Audience", value: blueprint.target_audience },
    blueprint?.product_concept && { label: "Product", value: blueprint.product_concept },
    blueprint?.price != null && { label: "Price", value: `$${blueprint.price}` },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <DashboardLayout title={projectName}>
      <div className="mx-auto max-w-6xl space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${projectId}`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> All missions
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Overall {overallPct}%</span>
            <div className="w-32">
              <Progress value={overallPct} className="h-1.5" />
            </div>
          </div>
        </div>

        {blueprintChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blueprintChips.map((c) => (
              <div
                key={c.label}
                className="rounded-full border border-border/30 bg-background/40 px-3 py-1 text-[11px] text-muted-foreground"
              >
                <span className="uppercase tracking-wide opacity-60">{c.label}:</span>{" "}
                <span className="text-foreground/80">{c.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="text-[10px] font-medium uppercase tracking-wide text-primary">
                  {def.phase} · Mission {def.id.slice(1)}
                </div>
                <CardTitle className="text-lg">{def.label}</CardTitle>
                <p className="text-sm text-muted-foreground">{def.headline}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{def.promise}</p>
                <div className="flex items-center gap-3">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{doneCount}/{def.tasks.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/project/${projectId}/blueprint`)}
                  >
                    <FileText className="mr-1 h-4 w-4" /> Open Blueprint
                  </Button>
                  {def.primaryAction?.href && (
                    <Button
                      size="sm"
                      onClick={() => navigate(def.primaryAction!.href!(projectId!))}
                    >
                      {def.primaryAction.label}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {missionId === "m1" && <OpportunityEngine projectId={projectId!} />}
            {missionId === "m2" && <ValidationEngine projectId={projectId!} />}
            {missionId === "m3" && <ProductConceptEngine projectId={projectId!} />}
            {missionId === "m4" && <ProductBuildEngine projectId={projectId!} />}
            {missionId === "m5" && <OfferArchitectEngine projectId={projectId!} />}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mission tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {def.tasks.map((t) => {
                  const done = taskState(t.key);
                  return (
                    <button
                      key={t.key}
                      onClick={() => toggleTask(missionId!, t.key, t.label, !done)}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted/30"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={done ? "line-through text-muted-foreground" : ""}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {missionRow?.status === "complete" && next && (
              <Card className="border-primary/40 bg-primary/5">
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div className="text-sm">
                    <div className="font-medium">Mission complete.</div>
                    <div className="text-muted-foreground">Nova unlocked {MISSION_BY_ID[next].label}.</div>
                  </div>
                  <Button onClick={() => navigate(`/project/${projectId}/m/${next}`)}>
                    Continue <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="h-[calc(100vh-260px)] overflow-hidden">
            <CardHeader className="border-b border-border/20 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" /> Talk to Nova
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-49px)] p-0">
              <NovaChat
                conversationId={conversationId}
                projectId={projectId!}
                initialMessages={initialMessages}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
