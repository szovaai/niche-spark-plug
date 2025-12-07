import { motion } from "framer-motion";
import { Check, X, Crown, Lock } from "lucide-react";

const features = [
  { name: "Daily searches", free: "3/day", pro: "Unlimited", category: "usage" },
  { name: "Niche detail views", free: "2/day", pro: "Unlimited", category: "usage" },
  { name: "Launchability Score™", free: "Tier only", pro: "Full 0-100 score", category: "insights" },
  { name: "Competition data", free: false, pro: true, category: "insights" },
  { name: "Momentum tracking", free: false, pro: true, category: "insights" },
  { name: "Price range data", free: false, pro: true, category: "insights" },
  { name: "PLR Sources", free: "1 partial", pro: "Full panel (3+)", category: "tools" },
  { name: "Keyword Ideas", free: false, pro: "5-15 keywords", category: "tools" },
  { name: "Build My Product Pack", free: false, pro: true, category: "tools" },
  { name: "60-Minute Launch Recipes", free: false, pro: true, category: "tools" },
  { name: "Done-For-You Launch Packs", free: false, pro: true, category: "tools" },
  { name: "Store Blueprint Preview", free: false, pro: true, category: "tools" },
  { name: "Saved Niches", free: false, pro: "Unlimited", category: "features" },
  { name: "Fast-Launch Filter", free: false, pro: true, category: "features" },
  { name: "Momentum Alerts", free: false, pro: "Weekly", category: "features" },
];

const ComparisonTable = () => {
  const renderValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-green-400 mx-auto" />;
    }
    if (value === false) {
      return <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />;
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
        {/* Header */}
        <div className="grid grid-cols-3 bg-card/80 border-b border-border/50">
          <div className="p-4 md:p-6">
            <span className="text-sm text-muted-foreground">Feature</span>
          </div>
          <div className="p-4 md:p-6 text-center border-l border-border/30">
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">Free</span>
              <span className="text-sm text-muted-foreground">$0/mo</span>
            </div>
          </div>
          <div className="p-4 md:p-6 text-center border-l border-border/30 bg-gradient-to-b from-primary/10 to-transparent">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Crown className="w-4 h-4 text-accent" />
                <span className="font-semibold text-primary">Pro</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground line-through">$27</span>
                <span className="text-sm font-bold text-accent">$17/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/30">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="grid grid-cols-3 hover:bg-card/50 transition-colors"
            >
              <div className="p-3 md:p-4 flex items-center gap-2">
                <span className="text-sm md:text-base">{feature.name}</span>
                {feature.free === false && (
                  <Lock className="w-3 h-3 text-muted-foreground/50 md:hidden" />
                )}
              </div>
              <div className="p-3 md:p-4 text-center border-l border-border/30 flex items-center justify-center">
                {renderValue(feature.free)}
              </div>
              <div className="p-3 md:p-4 text-center border-l border-border/30 flex items-center justify-center bg-gradient-to-b from-primary/5 to-transparent">
                {renderValue(feature.pro)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonTable;
