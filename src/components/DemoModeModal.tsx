import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Package, Rocket, ArrowRight, X } from "lucide-react";
import LaunchabilityScoreBadge from "./LaunchabilityScoreBadge";
import MicroSignalsBadges from "./MicroSignalsBadges";

interface DemoModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const demoSteps = [
  {
    title: "Find a Hot Niche",
    description: "Browse trending digital products with our curated feed. Each niche shows real-time market signals.",
    highlight: "niche",
  },
  {
    title: "Check the Launchability Score™",
    description: "Our proprietary 0-100 score tells you exactly how easy and profitable this niche is to launch.",
    highlight: "score",
  },
  {
    title: "Read the Micro-Signals",
    description: "Four key indicators show demand, competition, trend direction, and how fast you can create a product.",
    highlight: "signals",
  },
  {
    title: "Build Your Pack & Launch!",
    description: "One click generates your complete product pack with title, description, and launch strategy. You're ready to sell!",
    highlight: "launch",
  },
];

const DemoModeModal = ({ open, onOpenChange }: DemoModeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  const step = demoSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 p-1 rounded-full bg-background/80 hover:bg-background"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Progress */}
          <div className="flex gap-1 mb-6">
            {demoSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground mt-2">{step.description}</p>
              </div>

              {/* Visual Demo */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                {step.highlight === "niche" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">AI Coloring Pages</div>
                        <div className="text-sm text-muted-foreground">Printables • Trending Now</div>
                      </div>
                    </div>
                  </div>
                )}

                {step.highlight === "score" && (
                  <div className="flex justify-center">
                    <LaunchabilityScoreBadge score={92} size="lg" showTagline />
                  </div>
                )}

                {step.highlight === "signals" && (
                  <MicroSignalsBadges
                    demandTier="On Fire"
                    competitionTier="Easy"
                    momentum="rising"
                    launchSpeed="Instant"
                  />
                )}

                {step.highlight === "launch" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <Package className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">Build My Product Pack</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <Rocket className="w-5 h-5 text-accent-foreground" />
                      <span className="font-medium text-foreground">Launch in 60 Minutes</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => onOpenChange(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip demo
            </button>
            <Button onClick={handleNext} className="gap-2">
              {currentStep < demoSteps.length - 1 ? (
                <>Next <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Start Exploring <Zap className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModeModal;
