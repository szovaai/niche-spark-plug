import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { TrendingTopic } from "@/types/niche";
import { useNavigate } from "react-router-dom";

interface TrendingFeedProps {
  topics: TrendingTopic[];
}

const TrendingFeed = ({ topics }: TrendingFeedProps) => {
  const navigate = useNavigate();

  const MomentumIcon = {
    rising: TrendingUp,
    steady: Minus,
    declining: TrendingDown,
  };

  const momentumColor = {
    rising: "text-ocean-300",
    steady: "text-muted-foreground",
    declining: "text-magenta-300",
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold gradient-text">Today's Digital Winners</h2>
        <span className="text-xs text-muted-foreground">Updated hourly</span>
      </div>

      <div className="space-y-2">
        {topics.slice(0, 8).map((topic, index) => {
          const Icon = MomentumIcon[topic.momentum];
          
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/niche/${topic.id}`)}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-6">
                  #{index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">{topic.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 bg-secondary rounded">{topic.platform}</span>
                <Icon className={`w-4 h-4 ${momentumColor[topic.momentum]}`} />
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TrendingFeed;