import { Check, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

export type NovaStage =
  | "founder_profile"
  | "opportunity"
  | "niche"
  | "product"
  | "cover"
  | "sales"
  | "launch"
  | "published";

const STAGES: { id: NovaStage; label: string }[] = [
  { id: "founder_profile", label: "Founder Profile" },
  { id: "opportunity", label: "Opportunity Research" },
  { id: "niche", label: "Niche Selected" },
  { id: "product", label: "Product Creation" },
  { id: "cover", label: "Cover Design" },
  { id: "sales", label: "Sales Page" },
  { id: "launch", label: "Launch Plan" },
  { id: "published", label: "Published" },
];

export function StageMap({ current, complete }: { current: NovaStage; complete: NovaStage[] }) {
  return (
    <ol className="space-y-2">
      {STAGES.map((s) => {
        const isDone = complete.includes(s.id);
        const isActive = s.id === current;
        return (
          <li
            key={s.id}
            className={cn(
              "flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
              isActive
                ? "border-primary/40 bg-primary/5 text-foreground"
                : isDone
                  ? "border-border/30 bg-background/40 text-muted-foreground"
                  : "border-border/20 bg-background/20 text-muted-foreground/60",
            )}
          >
            {isDone ? (
              <Check className="h-4 w-4 text-primary" />
            ) : isActive ? (
              <CircleDot className="h-4 w-4 text-primary animate-pulse" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            <span className={cn(isActive && "font-medium")}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
