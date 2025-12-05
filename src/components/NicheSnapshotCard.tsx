import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Star, Flame, Zap, BarChart3, Lock, Crown, Clock } from "lucide-react";
import { NicheSnapshot } from "@/types/niche";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSavedNiches } from "@/hooks/useSavedNiches";
import LaunchabilityScoreBadge from "@/components/LaunchabilityScoreBadge";

interface NicheSnapshotCardProps {
  niche: NicheSnapshot;
  index: number;
  showBlur?: boolean;
  onUpgradeClick?: () => void;
}

const NicheSnapshotCard = ({ niche, index, showBlur = false, onUpgradeClick }: NicheSnapshotCardProps) => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { isNicheSaved, saveNiche, unsaveNiche } = useSavedNiches();
  const isPro = role === "pro";

  const demandColors = {
    Spark: "text-ocean-300 bg-ocean-400/10",
    Hot: "text-accent bg-accent/10",
    "On Fire": "text-magenta-300 bg-magenta-400/10",
  };

  const competitionColors = {
    Easy: "text-ocean-300 bg-ocean-400/10",
    Moderate: "text-accent bg-accent/10",
    Saturated: "text-magenta-300 bg-magenta-400/10",
  };

  const MomentumIcon = {
    rising: TrendingUp,
    steady: Minus,
    declining: TrendingDown,
  }[niche.momentum];

  const momentumColor = {
    rising: "text-ocean-300",
    steady: "text-muted-foreground",
    declining: "text-magenta-300",
  }[niche.momentum];

  const DemandIcon = {
    Spark: Zap,
    Hot: Flame,
    "On Fire": Flame,
  }[niche.demandTier];

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isNicheSaved(niche.id)) {
      await unsaveNiche(niche.id);
    } else {
      await saveNiche(niche.id, niche.name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/niche/${niche.id}`)}
      className="gradient-border group cursor-pointer"
    >
      <div className="relative bg-card rounded-lg p-5 h-full">
        {/* XLS Score Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <LaunchabilityScoreBadge score={niche.launchabilityScore} size="sm" />
        </div>

        {/* Save Button - Below XLS */}
        {user && (
          <button
            onClick={handleSaveToggle}
            className={`absolute top-16 right-3 p-2 rounded-full transition-all ${
              isNicheSaved(niche.id)
                ? "bg-primary/20 text-primary"
                : "bg-secondary/50 text-muted-foreground hover:text-primary"
            }`}
          >
            <Star className={`w-4 h-4 ${isNicheSaved(niche.id) ? "fill-current" : ""}`} />
          </button>
        )}

        {/* Category Tag */}
        <span className="inline-block px-2 py-1 bg-secondary/50 text-muted-foreground text-xs rounded mb-3">
          {niche.category}
        </span>

        {/* Niche Name - Always visible */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors pr-14">
          {niche.name}
        </h3>
        
        {/* Demand + Launch Speed */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${demandColors[niche.demandTier]}`}>
            <DemandIcon className="w-3 h-3" />
            {niche.demandTier}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
            {niche.launchSpeed === "Instant" ? <Zap className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {niche.launchSpeed}
          </span>
        </div>

        {/* Locked Content */}
        <div className="space-y-3">
          {/* Competition - Blurred for non-Pro */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Competition</span>
            {isPro ? (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${competitionColors[niche.competitionTier]}`}>
                {niche.competitionTier}
              </span>
            ) : showBlur || !user ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                {user ? <Crown className="w-3 h-3 text-accent" /> : "Sign up"}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Crown className="w-3 h-3 text-accent" />
                Pro
              </span>
            )}
          </div>

          {/* Momentum - Blurred for non-Pro */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Momentum</span>
            {isPro ? (
              <span className={`flex items-center gap-1 ${momentumColor}`}>
                <MomentumIcon className="w-4 h-4" />
                {niche.momentum}
              </span>
            ) : showBlur || !user ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                {user ? <Crown className="w-3 h-3 text-accent" /> : "Sign up"}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Crown className="w-3 h-3 text-accent" />
                Pro
              </span>
            )}
          </div>

          {/* Price Range - Visible for Free, blurred for non-users */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Price Range</span>
            {user ? (
              <span className="text-sm font-medium text-foreground">
                ${niche.priceRange.min}–${niche.priceRange.max}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                Sign up
              </span>
            )}
          </div>

          {/* Platform */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Platform</span>
            <span className="text-xs px-2 py-1 bg-secondary rounded">{niche.platform}</span>
          </div>
        </div>

        {/* View Button */}
        <button className="w-full mt-4 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
          <BarChart3 className="w-4 h-4" />
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default NicheSnapshotCard;
