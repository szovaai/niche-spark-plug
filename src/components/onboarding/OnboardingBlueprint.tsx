import { motion } from "framer-motion";
import { Package, Users, DollarSign, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlueprintData {
  productType: string;
  niche: string;
  goal: string;
}

interface Props {
  data: BlueprintData;
  onContinue: () => void;
}

const nicheLabels: Record<string, string> = {
  "ai-tools": "AI Tools",
  "marketing": "Online Marketing",
  "health": "Health & Fitness",
  "personal-dev": "Personal Development",
  "local-business": "Local Business",
  "finance": "Finance & Investing",
};

const productLabels: Record<string, string> = {
  digital: "Digital Product",
  course: "Online Course",
  ebook: "eBook Guide",
  saas: "SaaS MVP",
  affiliate: "Affiliate Funnel",
};

const getBlueprint = (data: BlueprintData) => {
  const niche = nicheLabels[data.niche] || data.niche;
  const type = productLabels[data.productType] || data.productType;

  const concepts: Record<string, string> = {
    "ai-tools": "AI Automation Toolkit",
    "marketing": "Digital Marketing Playbook",
    "health": "30-Day Transformation System",
    "personal-dev": "Peak Performance Blueprint",
    "local-business": "Local Business Growth Kit",
    "finance": "Smart Money Strategy Guide",
  };

  return {
    product: concepts[data.niche] || `${niche} Mastery ${type}`,
    type,
    audience: `${niche} enthusiasts seeking results`,
    funnel: "TikTok → Opt-in → Sales Page → Upsell",
    price: "$27",
    revenue: "$2,430",
  };
};

const OnboardingBlueprint = ({ data, onContinue }: Props) => {
  const blueprint = getBlueprint(data);

  const cards = [
    { icon: Package, label: "Product Idea", value: blueprint.product, color: "from-primary to-primary/60" },
    { icon: DollarSign, label: "Offer", value: `${blueprint.price} ${blueprint.type.toLowerCase()}`, color: "from-accent to-accent/60" },
    { icon: Users, label: "Target Audience", value: blueprint.audience, color: "from-primary to-accent" },
    { icon: TrendingUp, label: "Revenue Simulation", value: `${blueprint.revenue} potential`, color: "from-accent to-primary" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-6 h-6 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Your Launch Blueprint</h2>
        <p className="text-sm text-muted-foreground">AI generated a complete launch plan for you</p>
      </div>

      <div className="grid gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm flex items-center gap-4"
          >
            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.color} shrink-0`}>
              <card.icon className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</div>
              <div className="font-semibold text-foreground text-sm truncate">{card.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Funnel preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center"
      >
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Funnel Flow</div>
        <div className="text-sm font-medium text-foreground">{blueprint.funnel}</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Button variant="hero" size="lg" onClick={onContinue} className="w-full gap-2 dual-glow">
          Go to Command Center
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingBlueprint;
