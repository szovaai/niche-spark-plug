// Business HQ rules: launch stage mapping and the "next best action".
export const HQ_STAGES = ["Discover", "Create", "Brand", "Launch", "Market", "Grow"] as const;
export type HQStage = (typeof HQ_STAGES)[number];

/** Map overall progress (0-100) to the current launch stage index (0-5). */
export function stageIndexFromProgress(pct: number): number {
  const p = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  if (p >= 100) return HQ_STAGES.length - 1;
  return Math.floor(p / (100 / HQ_STAGES.length));
}

export interface NextActionInput {
  hasProject: boolean;
  projectId?: string;
  pendingApprovals: number;
  failedTasks: number;
  currentMissionLabel?: string | null;
  currentMissionId?: string | null;
}
export interface NextAction { label: string; detail: string; href: string }

/** Priority: start a business → approvals waiting → failed AI tasks → continue current mission. */
export function nextBestAction(i: NextActionInput): NextAction {
  if (!i.hasProject) {
    return { label: "Choose your business idea", detail: "Start your first business so your AI team can get to work.", href: "/dashboard" };
  }
  if (i.pendingApprovals > 0) {
    return {
      label: `Review ${i.pendingApprovals} item${i.pendingApprovals === 1 ? "" : "s"} waiting for approval`,
      detail: "Your AI team is paused on these until you decide.",
      href: "#approvals",
    };
  }
  if (i.failedTasks > 0) {
    return {
      label: `Fix ${i.failedTasks} failed task${i.failedTasks === 1 ? "" : "s"}`,
      detail: "Something didn't finish. Retry it from the mission it belongs to.",
      href: `/project/${i.projectId}`,
    };
  }
  return {
    label: i.currentMissionLabel ? `Continue: ${i.currentMissionLabel}` : "Continue your launch",
    detail: "Pick up exactly where you left off.",
    href: i.currentMissionId ? `/project/${i.projectId}/m/${i.currentMissionId}` : `/project/${i.projectId}`,
  };
}
