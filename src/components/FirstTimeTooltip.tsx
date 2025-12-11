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
  // Core metrics
  launchability_score: "This score shows how easy and profitable it is to launch this niche. Higher = better opportunity!",
  momentum_arrow: "Rising means this niche is growing in popularity. Steady = consistent demand. Declining = decreasing interest.",
  demand_tier: "Shows current market demand: Spark (emerging), Hot (strong), On Fire (exploding).",
  competition_tier: "Competition level: Easy (few sellers), Moderate (some competition), Saturated (crowded market).",
  launch_speed: "How fast you can create a product: Instant (templates ready), 1 Hour (quick creation), 1 Day (more effort).",
  
  // Features
  fast_cash_filter: "Shows only niches with 70+ Launchability Score - your best opportunities for quick wins!",
  build_pack: "One click generates your complete product pack: title, description, bullets, and launch strategy.",
  
  // Pro tools
  profit_calculator: "Estimate your monthly earnings based on price, platform, and sales volume. See fee breakdowns and profit margins.",
  gap_finder: "AI scans for hidden opportunities in any niche - underserved audiences, missing product types, and pricing gaps.",
  plr_upgrader: "Transform generic PLR content into unique, premium products with AI rewriting, fresh styling, and new ecover concepts.",
  
  // Product creation
  product_factory: "Turn any trending niche into a complete product blueprint with page-by-page content, style guides, and marketing copy.",
  ecover_factory: "Generate professional product mockups, thumbnails, and social media graphics for your digital products.",
  content_multiplier: "Create 30 days of marketing content from one product - Instagram posts, TikTok scripts, emails, and more.",
  bundle_generator: "Automatically create Lite versions, premium bundles, and bonus add-ons from your main product.",
  
  // Navigation
  money_map: "Your 7-day action plan to first sale. Daily challenges, progress tracking, and step-by-step guidance.",
  launch_packs: "Pre-built product packages for trending niches. Complete with PLR sources, listing copy, and promo ideas.",
  niche_wizard: "Not sure where to start? Answer a few questions and we'll recommend the perfect niche for your skills.",
  
  // Other
  competitor_clone: "Analyze any Etsy listing to find weaknesses and generate a better, differentiated version.",
  store_blueprint: "Preview how your 1-product store would look with branding, homepage layout, and product positioning.",
  saved_niches: "Your bookmarked opportunities. Enable alerts to get notified when momentum changes.",
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
