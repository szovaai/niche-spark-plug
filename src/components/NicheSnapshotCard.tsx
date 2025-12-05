import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Star, Flame, Zap, BarChart3 } from "lucide-react";
import { NicheSnapshot } from "@/types/niche";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSavedNiches } from "@/hooks/useSavedNiches";
import BlurOverlay from "./BlurOverlay";

interface NicheSnapshotCardProps {
  niche: NicheSnapshot;
  index: number;
  showBlur?: boolean;
}

const NicheSnapshotCard = ({ niche, index, showBlur = false }: NicheSnapshotCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isNicheSaved, saveNiche, unsaveNiche } = useSavedNiches();

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

  const publicContent = (
    <>
      {/* Niche Name - Always visible */}
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {niche.name}
      </h3>
      
      {/* Demand Tier - Always visible */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${demandColors[niche.demandTier]}`}>
          <DemandIcon className="w-3 h-3" />
          {niche.demandTier}
        </span>
      </div>
    </>
  );

  const lockedContent = (
    <div className="space-y-3">
      {/* Competition */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Competition</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${competitionColors[niche.competitionTier]}`}>
          {niche.competitionTier}
        </span>
      </div>

      {/* Momentum */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Momentum</span>
        <span className={`flex items-center gap-1 ${momentumColor}`}>
          <MomentumIcon className="w-4 h-4" />
          {niche.momentum}
        </span>
      </div>

      {/* Price Range */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Price Range</span>
        <span className="text-sm font-medium text-foreground">
          ${niche.priceRange.min}–${niche.priceRange.max}
        </span>
      </div>

      {/* Platform */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Platform</span>
        <span className="text-xs px-2 py-1 bg-secondary rounded">{niche.platform}</span>
      </div>
    </div>
  );

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
        {/* Save Button */}
        {user && (
          <button
            onClick={handleSaveToggle}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
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

        {publicContent}

        <BlurOverlay isBlurred={showBlur && !user} message="Sign up to see full insights">
          {lockedContent}
        </BlurOverlay>

        {/* View Button */}
        <button className="w-full mt-4 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
          <BarChart3 className="w-4 h-4" />
          View Niches
        </button>
      </div>
    </motion.div>
  );
};

export default NicheSnapshotCard;