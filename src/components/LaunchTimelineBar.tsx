import { motion } from "framer-motion";
import { Search, Package, Rocket, Check } from "lucide-react";

interface LaunchTimelineBarProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { id: 1, label: "Choose Niche", icon: Search },
  { id: 2, label: "Build Pack", icon: Package },
  { id: 3, label: "Launch!", icon: Rocket },
];

const LaunchTimelineBar = ({ currentStep }: LaunchTimelineBarProps) => {
  return (
    <div className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted mx-12">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const isComplete = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isComplete
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-card border-muted text-muted-foreground"
                }`}
                initial={{ scale: 1 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </motion.div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {isCurrent && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-primary mt-0.5"
                >
                  You're here!
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LaunchTimelineBar;
