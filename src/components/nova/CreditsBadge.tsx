import { Sparkles } from "lucide-react";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function CreditsBadge() {
  const { balance, reserved, available, loading } = useCreditBalance();
  if (loading || balance === null) return null;
  const low = available < 5;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border border-border/40 bg-background/60 px-3 py-1 text-xs backdrop-blur",
            low && "border-amber-500/40 text-amber-400",
          )}
        >
          <Sparkles className="h-3 w-3" />
          <span className="font-medium">{available}</span>
          <span className="text-muted-foreground">credits</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="text-xs">
          <div>Balance: {balance}</div>
          {reserved > 0 && <div>Reserved: {reserved}</div>}
          <div className="mt-1 text-muted-foreground">
            Chatting with Nova is free. Big AI tasks cost 1–5.
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
