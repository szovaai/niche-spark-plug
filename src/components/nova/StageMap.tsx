import { Check, Circle, CircleDot, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

// New mission ladder — Project Zero AI Launch Coach
export type MissionId =
  | "m0" | "m1" | "m2" | "m3" | "m4" | "m5"
  | "m6" | "m7" | "m8" | "m9" | "m10" | "m11";

// Legacy stage strings still stored in business_projects.current_stage
export type NovaStage =
  | "founder_profile" | "opportunity" | "niche" | "product"
  | "cover" | "sales" | "launch" | "published"
  | MissionId;

export const STAGE_TO_MISSION: Record<string, MissionId> = {
  founder_profile: "m0",
  opportunity: "m1",
  niche: "m2",
  product: "m3",
  cover: "m4",
  sales: "m5",
  launch: "m10",
  published: "m11",
};

export function toMissionId(stage: string | undefined | null): MissionId {
  if (!stage) return "m0";
  if (stage.startsWith("m") && /^m\d+$/.test(stage)) return stage as MissionId;
  return STAGE_TO_MISSION[stage] ?? "m0";
}

type Mission = { id: MissionId; label: string; hint?: string };
type Phase = { id: string; label: string; missions: Mission[]; accent?: boolean };

export const PHASES: Phase[] = [
  {
    id: "p1",
    label: "Phase 1 · Discover",
    missions: [
      { id: "m0", label: "Business Discovery", hint: "Founder profile" },
      { id: "m1", label: "Find Your Opportunity", hint: "Niche + demand" },
    ],
  },
  {
    id: "p2",
    label: "Phase 2 · Validate",
    missions: [{ id: "m2", label: "Validate the Idea", hint: "Proof + positioning" }],
  },
  {
    id: "p3",
    label: "Phase 3 · Build",
    missions: [
      { id: "m3", label: "Build the Product", hint: "Toolkit / PDF vault" },
      { id: "m4", label: "Brand Identity", hint: "Cover, colors, voice" },
    ],
  },
  {
    id: "p4",
    label: "Phase 4 · Offer & Funnel",
    missions: [
      { id: "m5", label: "Create the Offer", hint: "Pricing, bonuses, sales page" },
      { id: "m6", label: "Build the Funnel", hint: "Pages + checkout flow" },
      { id: "m7", label: "Connect Payments", hint: "Stripe / Gumroad" },
    ],
  },
  {
    id: "p5",
    label: "Phase 5 · Launch Assets",
    accent: true,
    missions: [
      { id: "m8", label: "Email Engine", hint: "Origin · Insight · Launch · Value" },
      { id: "m9", label: "Content Machine", hint: "Auto-repurpose to 6 channels" },
    ],
  },
  {
    id: "p6",
    label: "Phase 6 · Launch & Grow",
    missions: [
      { id: "m10", label: "Launch", hint: "Go-live checklist" },
      { id: "m11", label: "Improve", hint: "Post-launch optimization" },
    ],
  },
];

const ORDER: MissionId[] = PHASES.flatMap((p) => p.missions.map((m) => m.id));

function missionsBefore(current: MissionId): MissionId[] {
  const idx = ORDER.indexOf(current);
  return idx <= 0 ? [] : ORDER.slice(0, idx);
}

export function MissionMap({
  current,
  complete,
}: {
  current: MissionId | NovaStage;
  complete?: (MissionId | NovaStage)[];
}) {
  const cur = toMissionId(current);
  const done = new Set<MissionId>([
    ...missionsBefore(cur),
    ...(complete ?? []).map((s) => toMissionId(s)),
  ]);

  return (
    <div className="space-y-4">
      {PHASES.map((phase) => (
        <div key={phase.id} className="space-y-1.5">
          <div
            className={cn(
              "flex items-center gap-2 px-1 text-[11px] font-medium uppercase tracking-wide",
              phase.accent ? "text-primary" : "text-muted-foreground/70",
            )}
          >
            {phase.accent && <Mail className="h-3 w-3" />}
            {phase.label}
          </div>
          <ol className="space-y-1.5">
            {phase.missions.map((m) => {
              const isDone = done.has(m.id);
              const isActive = m.id === cur;
              return (
                <li
                  key={m.id}
                  className={cn(
                    "flex items-start gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "border-primary/40 bg-primary/5 text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]"
                      : isDone
                        ? "border-border/30 bg-background/40 text-muted-foreground"
                        : phase.accent
                          ? "border-primary/15 bg-primary/[0.02] text-muted-foreground"
                          : "border-border/20 bg-background/20 text-muted-foreground/70",
                  )}
                >
                  <span className="mt-0.5">
                    {isDone ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : isActive ? (
                      <CircleDot className="h-4 w-4 text-primary animate-pulse" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={cn("leading-tight", isActive && "font-medium text-foreground")}>
                      {m.label}
                    </div>
                    {m.hint && (
                      <div className="mt-0.5 text-[11px] text-muted-foreground/70">{m.hint}</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

// Back-compat alias so existing imports (`StageMap`) keep working.
export const StageMap = MissionMap;
