import { motion } from "framer-motion";
import { TrendingUp, ExternalLink, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrendingProduct {
  id: string;
  name: string;
  category: string;
  trendScore: number;
  growth: string;
  searches: string;
  competition: "Low" | "Medium" | "High";
}

interface TrendingCardProps {
  product: TrendingProduct;
  index: number;
}

const TrendingCard = ({ product, index }: TrendingCardProps) => {
  const competitionColors = {
    Low: "text-ocean-300 bg-ocean-400/10",
    Medium: "text-accent bg-accent/10",
    High: "text-magenta-300 bg-magenta-400/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="gradient-border group"
    >
      <div className="relative bg-card rounded-lg p-6 h-full">
        {/* Hot badge for top items */}
        {index < 3 && (
          <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold rounded-full shadow-lg shadow-primary/30">
            <Flame className="w-3 h-3" />
            HOT
          </div>
        )}
        
        {/* Rank */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-lg text-primary">
            #{index + 1}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${competitionColors[product.competition]}`}>
            {product.competition} Competition
          </span>
        </div>
        
        {/* Product name */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Category tag */}
        <span className="inline-block px-2 py-1 bg-secondary/50 text-muted-foreground text-xs rounded mb-4">
          {product.category}
        </span>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Zap className="w-3 h-3" />
              Trend Score
            </div>
            <div className="text-xl font-bold gradient-text">{product.trendScore}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              Growth
            </div>
            <div className="text-xl font-bold text-ocean-300">{product.growth}</div>
          </div>
        </div>
        
        {/* Searches */}
        <div className="text-sm text-muted-foreground mb-4">
          <span className="font-medium text-foreground">{product.searches}</span> monthly searches
        </div>
        
        {/* Action */}
        <Button variant="outline" size="sm" className="w-full group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10">
          View Details
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
};

export default TrendingCard;
