import { motion } from "framer-motion";
import { Package, ArrowRight, Crown } from "lucide-react";
import { LaunchPack } from "@/types/niche";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface LaunchPackCardProps {
  pack: LaunchPack;
  index: number;
  onUpgradeClick: () => void;
}

const LaunchPackCard = ({ pack, index, onUpgradeClick }: LaunchPackCardProps) => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const isPro = role === "pro";

  const handleClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isPro) {
      onUpgradeClick();
      return;
    }
    navigate(`/launch-packs/${pack.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={handleClick}
      className="gradient-border group cursor-pointer"
    >
      <div className="relative bg-card rounded-lg p-5 h-full">
        {/* Pro Badge */}
        {!isPro && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-accent px-2 py-1 rounded-full">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          </div>
        )}

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
          <Package className="w-6 h-6 text-primary" />
        </div>

        {/* Category */}
        <span className="inline-block px-2 py-1 bg-secondary/50 text-muted-foreground text-xs rounded mb-2">
          {pack.category}
        </span>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
          {pack.title}
        </h3>

        {/* Why Hot Preview */}
        <p className={`text-sm text-muted-foreground mb-4 line-clamp-2 ${!isPro && "blur-sm"}`}>
          {pack.whyHot}
        </p>

        {/* Niche */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{pack.nicheName}</span>
          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
};

export default LaunchPackCard;
