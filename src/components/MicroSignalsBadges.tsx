import { Flame, Shield, TrendingUp, TrendingDown, Minus, Zap, Clock } from "lucide-react";
import { DemandTier, CompetitionTier, MomentumDirection, LaunchSpeed } from "@/types/niche";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MicroSignalsBadgesProps {
  demandTier: DemandTier;
  competitionTier: CompetitionTier;
  momentum: MomentumDirection;
  launchSpeed: LaunchSpeed;
  compact?: boolean;
}

const MicroSignalsBadges = ({
  demandTier,
  competitionTier,
  momentum,
  launchSpeed,
  compact = false
}: MicroSignalsBadgesProps) => {
  const demandColors = {
    "Spark": "text-blue-400 bg-blue-400/10",
    "Hot": "text-orange-400 bg-orange-400/10",
    "On Fire": "text-red-400 bg-red-400/10"
  };

  const competitionColors = {
    "Easy": "text-green-400 bg-green-400/10",
    "Moderate": "text-yellow-400 bg-yellow-400/10",
    "Saturated": "text-red-400 bg-red-400/10"
  };

  const momentumIcons = {
    "rising": TrendingUp,
    "steady": Minus,
    "declining": TrendingDown
  };

  const momentumColors = {
    "rising": "text-green-400 bg-green-400/10",
    "steady": "text-yellow-400 bg-yellow-400/10",
    "declining": "text-red-400 bg-red-400/10"
  };

  const speedColors = {
    "Instant": "text-green-400 bg-green-400/10",
    "1 Hour": "text-blue-400 bg-blue-400/10",
    "1 Day": "text-yellow-400 bg-yellow-400/10"
  };

  const MomentumIcon = momentumIcons[momentum];

  const signals = [
    {
      icon: Flame,
      label: "Demand",
      value: demandTier,
      color: demandColors[demandTier],
      tooltip: "Demand Heat Pulse - How much buyers are searching for this"
    },
    {
      icon: Shield,
      label: "Competition",
      value: competitionTier,
      color: competitionColors[competitionTier],
      tooltip: "Competition Friction - How many similar products exist"
    },
    {
      icon: MomentumIcon,
      label: "Momentum",
      value: momentum.charAt(0).toUpperCase() + momentum.slice(1),
      color: momentumColors[momentum],
      tooltip: "Trend Momentum Vector - Direction this niche is moving"
    },
    {
      icon: launchSpeed === "Instant" ? Zap : Clock,
      label: "Speed",
      value: launchSpeed,
      color: speedColors[launchSpeed],
      tooltip: "Launch Speed Factor - How fast you can create a product"
    }
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {signals.map((signal) => (
          <TooltipProvider key={signal.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${signal.color}`}>
                  <signal.icon className="w-3 h-3" />
                  <span>{signal.value}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{signal.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {signals.map((signal) => (
        <TooltipProvider key={signal.label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex flex-col items-center gap-1 p-3 rounded-lg border border-border/50 ${signal.color}`}>
                <signal.icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{signal.value}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{signal.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{signal.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default MicroSignalsBadges;
