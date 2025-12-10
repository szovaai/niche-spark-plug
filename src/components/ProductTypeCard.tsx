import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductTypeConfig } from "@/types/niche";

interface ProductTypeCardProps {
  config: ProductTypeConfig;
  onClick: () => void;
}

const ProductTypeCard = ({ config, onClick }: ProductTypeCardProps) => {
  const difficultyColors = {
    Easy: "bg-ocean-400/10 text-ocean-300",
    Medium: "bg-accent/10 text-accent",
    Advanced: "bg-magenta-400/10 text-magenta-300",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-4 bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30 rounded-xl text-left transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{config.icon}</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
      </div>
      
      <h3 className="font-semibold text-foreground mb-1">{config.label}</h3>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {config.description}
      </p>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded">
          {config.avgPages}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${difficultyColors[config.difficulty]}`}>
          {config.difficulty}
        </span>
      </div>
    </motion.button>
  );
};

export default ProductTypeCard;
