import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

interface Props {
  onComplete: () => void;
}

const steps = [
  "Analyzing market demand",
  "Creating product concept",
  "Designing funnel strategy",
  "Generating marketing assets",
  "Forecasting revenue potential",
];

const OnboardingGeneration = ({ onComplete }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 text-center"
    >
      {/* Pulsing orb */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-[0_0_40px_-5px_hsl(var(--primary)/0.5)]">
          <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">AI is building your launch plan...</h2>
        <p className="text-muted-foreground text-sm mt-1">This takes about 10 seconds</p>
      </div>

      <div className="space-y-3 text-left max-w-xs mx-auto">
        <AnimatePresence>
          {steps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3"
            >
              {i <= currentStep ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: i < currentStep ? 0 : 0.3 }}
                >
                  <CheckCircle2 className={`w-5 h-5 ${i < currentStep ? "text-primary" : "text-primary animate-pulse"}`} />
                </motion.div>
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/30" />
              )}
              <span className={`text-sm ${i <= currentStep ? "text-foreground" : "text-muted-foreground/40"}`}>
                {step}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mx-auto h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

export default OnboardingGeneration;
