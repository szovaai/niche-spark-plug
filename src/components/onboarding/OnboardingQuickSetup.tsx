import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Package, BookOpen, GraduationCap, Code, Users, Target, DollarSign, Megaphone, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onComplete: (data: { productType: string; niche: string; goal: string }) => void;
}

const productTypes = [
  { id: "digital", label: "Digital Product", icon: Package },
  { id: "course", label: "Course", icon: GraduationCap },
  { id: "ebook", label: "Ebook", icon: BookOpen },
  { id: "saas", label: "SaaS Idea", icon: Code },
  { id: "affiliate", label: "Affiliate Offer", icon: Users },
];

const niches = [
  { id: "ai-tools", label: "AI Tools" },
  { id: "marketing", label: "Online Marketing" },
  { id: "health", label: "Health & Fitness" },
  { id: "personal-dev", label: "Personal Development" },
  { id: "local-business", label: "Local Business" },
  { id: "finance", label: "Finance & Investing" },
];

const goals = [
  { id: "first-sale", label: "First Online Sale", icon: DollarSign },
  { id: "1k-launch", label: "$1K Launch", icon: Target },
  { id: "audience", label: "Build Audience", icon: Megaphone },
  { id: "validate", label: "Test an Idea", icon: Lightbulb },
];

const OnboardingQuickSetup = ({ onComplete }: Props) => {
  const [question, setQuestion] = useState(0);
  const [productType, setProductType] = useState("");
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("");

  const handleNext = () => {
    if (question < 2) {
      setQuestion(q => q + 1);
    } else {
      onComplete({ productType, niche, goal });
    }
  };

  const canProceed = question === 0 ? !!productType : question === 1 ? !!niche : !!goal;

  return (
    <motion.div
      key={`q-${question}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-6"
    >
      {/* Question indicator */}
      <div className="flex items-center gap-2 justify-center">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === question ? "w-8 bg-primary" : i < question ? "w-4 bg-primary/50" : "w-4 bg-muted"
            }`}
          />
        ))}
      </div>

      {question === 0 && (
        <div className="space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">What do you want to launch?</h2>
            <p className="text-muted-foreground mt-1 text-sm">Pick the closest match — you can change later</p>
          </div>
          <div className="grid gap-2">
            {productTypes.map(p => (
              <button
                key={p.id}
                onClick={() => setProductType(p.id)}
                className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 text-left ${
                  productType === p.id
                    ? "border-primary bg-primary/10 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]"
                    : "border-border/50 hover:border-primary/40 bg-card/50 backdrop-blur-sm"
                }`}
              >
                <div className={`p-2 rounded-lg ${productType === p.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p.icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-foreground text-sm">{p.label}</span>
                {productType === p.id && <Check className="w-4 h-4 text-primary ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {question === 1 && (
        <div className="space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Select your niche</h2>
            <p className="text-muted-foreground mt-1 text-sm">We'll find the best opportunities</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {niches.map(n => (
              <button
                key={n.id}
                onClick={() => setNiche(n.id)}
                className={`p-3.5 rounded-xl border transition-all text-center ${
                  niche === n.id
                    ? "border-primary bg-primary/10 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]"
                    : "border-border/50 hover:border-primary/40 bg-card/50 backdrop-blur-sm"
                }`}
              >
                <span className="font-medium text-foreground text-sm">{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {question === 2 && (
        <div className="space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Your goal for this launch?</h2>
            <p className="text-muted-foreground mt-1 text-sm">We'll tailor your strategy</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {goals.map(g => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  goal === g.id
                    ? "border-primary bg-primary/10 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]"
                    : "border-border/50 hover:border-primary/40 bg-card/50 backdrop-blur-sm"
                }`}
              >
                <g.icon className={`w-5 h-5 ${goal === g.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-medium text-foreground text-sm text-center">{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        size="lg"
        onClick={handleNext}
        disabled={!canProceed}
        className="w-full gap-2"
      >
        {question < 2 ? "Continue" : "Generate My Launch Plan"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default OnboardingQuickSetup;
