import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowRight, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMissionProgress } from "@/hooks/useMissionProgress";
import { MISSIONS } from "@/lib/missions";
import { cn } from "@/lib/utils";

export default function MissionsHub() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [projectName, setProjectName] = useState<string>("");
  const { missions, overallPct, loading } = useMissionProgress(projectId);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!projectId) return;
    supabase
      .from("business_projects")
      .select("project_name")
      .eq("id", projectId)
      .maybeSingle()
      .then(({ data }) => setProjectName(data?.project_name ?? "Project"));
  }, [projectId]);

  if (loading) {
    return (
      <DashboardLayout title="Missions">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const grouped = MISSIONS.reduce<Record<string, typeof MISSIONS>>((acc, m) => {
    (acc[m.phase] ||= []).push(m);
    return acc;
  }, {});

  return (
    <DashboardLayout title={projectName}>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-primary">Mission ladder</div>
          <h1 className="mt-1 text-2xl font-semibold">{projectName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            12 missions across 6 phases. Nova does the heavy lifting — you approve each step.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={overallPct} className="h-2 flex-1" />
            <span className="text-sm font-medium">{overallPct}%</span>
          </div>
        </div>

        {Object.entries(grouped).map(([phase, list]) => (
          <div key={phase} className="space-y-2">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {phase}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((m) => {
                const row = missions[m.id];
                const status = row?.status ?? "locked";
                const pct = row?.progress_pct ?? 0;
                const isActive = status === "active";
                const isDone = status === "complete";
                return (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/project/${projectId}/m/${m.id}`)}
                    className={cn(
                      "group flex flex-col rounded-lg border p-4 text-left transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/[0.04]"
                        : isDone
                          ? "border-border/40 bg-background/40"
                          : "border-border/20 bg-background/20 hover:border-border/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : isActive ? (
                          <PlayCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/60" />
                        )}
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Mission {m.id.slice(1)}
                        </span>
                      </div>
                      {isActive && <Badge variant="outline" className="text-[10px]">Active</Badge>}
                    </div>
                    <div className="mt-2 text-sm font-medium">{m.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {m.headline}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={pct} className="h-1 flex-1" />
                      <span className="text-[11px] text-muted-foreground">{pct}%</span>
                      <ArrowRight className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
