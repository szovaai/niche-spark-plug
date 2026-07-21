import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { MissionId } from "@/components/nova/StageMap";
import { MISSIONS, MISSION_BY_ID, computeOverallProgress, nextMissionAfter } from "@/lib/missions";

export type MissionRow = {
  mission_id: MissionId;
  status: "locked" | "active" | "in_review" | "complete";
  progress_pct: number;
};

export type TaskRow = {
  id?: string;
  mission_id: MissionId;
  task_key: string;
  label: string;
  status: "pending" | "done" | "skipped";
};

export function useMissionProgress(projectId: string | undefined) {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Record<MissionId, MissionRow>>({} as never);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user || !projectId) return;
    const [{ data: m }, { data: t }] = await Promise.all([
      supabase.from("mission_progress").select("*").eq("project_id", projectId),
      supabase.from("mission_tasks").select("*").eq("project_id", projectId),
    ]);
    const map: Record<string, MissionRow> = {};
    (m ?? []).forEach((r) => {
      map[r.mission_id] = {
        mission_id: r.mission_id as MissionId,
        status: r.status as MissionRow["status"],
        progress_pct: r.progress_pct,
      };
    });
    // Ensure m0 default active
    if (!map["m0"]) map["m0"] = { mission_id: "m0", status: "active", progress_pct: 0 };
    setMissions(map as Record<MissionId, MissionRow>);
    setTasks((t ?? []) as TaskRow[]);
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const missionPcts: Partial<Record<MissionId, number>> = {};
  Object.values(missions).forEach((r) => {
    missionPcts[r.mission_id] = r.progress_pct;
  });
  const overallPct = computeOverallProgress(missionPcts);

  const currentMission: MissionId =
    (Object.values(missions).find((m) => m.status === "active")?.mission_id as MissionId) ||
    (Object.values(missions).find((m) => m.status !== "complete")?.mission_id as MissionId) ||
    "m0";

  const toggleTask = useCallback(
    async (missionId: MissionId, taskKey: string, label: string, done: boolean) => {
      if (!user || !projectId) return;
      const upsert = {
        project_id: projectId,
        user_id: user.id,
        mission_id: missionId,
        task_key: taskKey,
        label,
        status: done ? "done" : "pending",
        approved_at: done ? new Date().toISOString() : null,
      };
      await supabase
        .from("mission_tasks")
        .upsert(upsert as never, { onConflict: "project_id,mission_id,task_key" });

      // Recompute mission %
      const def = MISSION_BY_ID[missionId];
      const currentTasks = tasks.filter((t) => t.mission_id === missionId);
      const others = currentTasks.filter((t) => t.task_key !== taskKey);
      const doneCount =
        others.filter((t) => t.status === "done").length + (done ? 1 : 0);
      const pct = Math.round((doneCount / (def?.tasks.length || 1)) * 100);
      const status: MissionRow["status"] = pct >= 100 ? "complete" : "active";

      await supabase
        .from("mission_progress")
        .upsert(
          {
            project_id: projectId,
            user_id: user.id,
            mission_id: missionId,
            status,
            progress_pct: pct,
            started_at: new Date().toISOString(),
            completed_at: pct >= 100 ? new Date().toISOString() : null,
          } as never,
          { onConflict: "project_id,mission_id" },
        );

      // Advance to next mission if complete
      if (pct >= 100) {
        const next = nextMissionAfter(missionId);
        if (next) {
          await supabase.from("mission_progress").upsert(
            {
              project_id: projectId,
              user_id: user.id,
              mission_id: next,
              status: "active",
              progress_pct: 0,
              started_at: new Date().toISOString(),
            } as never,
            { onConflict: "project_id,mission_id" },
          );
          await supabase
            .from("business_projects")
            .update({ current_mission_id: next, last_action_at: new Date().toISOString() })
            .eq("id", projectId);
        }
      } else {
        await supabase
          .from("business_projects")
          .update({ last_action_at: new Date().toISOString() })
          .eq("id", projectId);
      }

      void reload();
    },
    [user, projectId, tasks, reload],
  );

  const completedMissionIds = Object.values(missions)
    .filter((m) => m.status === "complete")
    .map((m) => m.mission_id);

  return {
    missions,
    tasks,
    loading,
    overallPct,
    currentMission,
    completedMissionIds,
    toggleTask,
    reload,
    allMissions: MISSIONS,
  };
}
