import { useAuth } from "@/hooks/useAuth";

interface UsageLimitBadgeProps {
  type: "searches" | "views";
}

const UsageLimitBadge = ({ type }: UsageLimitBadgeProps) => {
  const { role, usage } = useAuth();

  if (role === "pro") return null;

  const current = type === "searches" ? usage.searchesUsedToday : usage.viewsUsedToday;
  const max = type === "searches" ? usage.maxSearches : usage.maxViews;
  const remaining = max - current;
  const label = type === "searches" ? "searches" : "views";

  const isLow = remaining <= 1;
  const isEmpty = remaining === 0;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        isEmpty
          ? "bg-destructive/20 text-destructive"
          : isLow
          ? "bg-accent/20 text-accent"
          : "bg-secondary text-muted-foreground"
      }`}
    >
      <span className="tabular-nums">{remaining}/{max}</span>
      <span>{label} left today</span>
    </div>
  );
};

export default UsageLimitBadge;
