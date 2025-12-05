import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface FirstTimeTooltipProps {
  children: React.ReactNode;
  tooltipId: string;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  showAlways?: boolean;
}

// Tooltip content definitions
export const TOOLTIP_CONTENT = {
  launchability_score: "This score shows how easy and profitable it is to launch this niche. Higher = better opportunity!",
  momentum_arrow: "Rising means this niche is growing in popularity. Steady = consistent demand. Declining = decreasing interest.",
  demand_tier: "Shows current market demand: Spark (emerging), Hot (strong), On Fire (exploding).",
  competition_tier: "Competition level: Easy (few sellers), Moderate (some competition), Saturated (crowded market).",
  launch_speed: "How fast you can create a product: Instant (templates ready), 1 Hour (quick creation), 1 Day (more effort).",
  fast_cash_filter: "Shows only niches with 70+ Launchability Score - your best opportunities for quick wins!",
  build_pack: "One click generates your complete product pack: title, description, bullets, and launch strategy.",
};

const FirstTimeTooltip = ({ 
  children, 
  tooltipId, 
  content, 
  side = "top",
  showAlways = false 
}: FirstTimeTooltipProps) => {
  const { user } = useAuth();
  const [hasSeenTooltip, setHasSeenTooltip] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user || showAlways) {
      setHasSeenTooltip(showAlways ? false : true);
      return;
    }

    // Check if user has seen this tooltip
    const checkTooltipSeen = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("tooltips_seen")
        .eq("id", user.id)
        .single();
      
      if (data?.tooltips_seen) {
        setHasSeenTooltip(data.tooltips_seen.includes(tooltipId));
      } else {
        setHasSeenTooltip(false);
      }
    };

    checkTooltipSeen();
  }, [user, tooltipId, showAlways]);

  const markAsSeen = async () => {
    if (!user || hasSeenTooltip || showAlways) return;

    // Update database
    const { data } = await supabase
      .from("profiles")
      .select("tooltips_seen")
      .eq("id", user.id)
      .single();

    const currentSeen = data?.tooltips_seen || [];
    if (!currentSeen.includes(tooltipId)) {
      await supabase
        .from("profiles")
        .update({ tooltips_seen: [...currentSeen, tooltipId] })
        .eq("id", user.id);
    }

    setHasSeenTooltip(true);
  };

  // If tooltip already seen and not showAlways, just render children
  if (hasSeenTooltip && !showAlways) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild onMouseEnter={() => markAsSeen()}>
          <span className="relative">
            {children}
            {!hasSeenTooltip && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FirstTimeTooltip;
