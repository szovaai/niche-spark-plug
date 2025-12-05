import { Crown, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";

interface FastCashFilterToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onUpgradeClick: () => void;
}

const FastCashFilterToggle = ({ enabled, onToggle, onUpgradeClick }: FastCashFilterToggleProps) => {
  const { role } = useAuth();
  const isPro = role === "pro";

  const handleClick = () => {
    if (!isPro) {
      onUpgradeClick();
      return;
    }
    onToggle(!enabled);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
        enabled && isPro
          ? "bg-primary/20 border-primary/50 text-primary"
          : "bg-secondary/50 border-border hover:border-primary/30"
      }`}
    >
      <Zap className={`w-4 h-4 ${enabled && isPro ? "text-primary" : "text-muted-foreground"}`} />
      <span className="text-sm font-medium">Fast-Launch Only</span>
      
      {isPro ? (
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="ml-2"
        />
      ) : (
        <Crown className="w-4 h-4 text-accent ml-2" />
      )}
    </button>
  );
};

export default FastCashFilterToggle;
