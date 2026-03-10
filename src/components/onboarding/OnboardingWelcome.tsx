import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onStart: () => void;
  onExplore: () => void;
}

const OnboardingWelcome = ({ onStart, onExplore }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="text-center space-y-8"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)]"
    >
      <Rocket className="w-12 h-12 text-primary-foreground" />
    </motion.div>

    <div className="space-y-3">
      <h1 className="text-4xl font-bold text-foreground">
        Welcome to <span className="gradient-text">LaunchStack AI</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
        Build and launch your first digital product in minutes — not weeks.
      </p>
    </div>

    <div className="space-y-3 pt-2">
      <Button
        variant="hero"
        size="xl"
        onClick={onStart}
        className="w-full max-w-xs mx-auto dual-glow gap-2"
      >
        Start My First Launch
        <ArrowRight className="w-5 h-5" />
      </Button>
      <button
        onClick={onExplore}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors block mx-auto"
      >
        or Explore Dashboard
      </button>
    </div>
  </motion.div>
);

export default OnboardingWelcome;
