import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  currentStep: number;
  completedSteps: number[];
}

const STEPS = [
  { num: 1, label: "Generating Product Concept", estimate: "~15s" },
  { num: 2, label: "Creating Product Content", estimate: "~20s" },
  { num: 3, label: "Building Funnel Copy", estimate: "~25s" },
  { num: 4, label: "Generating Marketing Assets", estimate: "~25s" },
  { num: 5, label: "Creating Launch Timeline", estimate: "~10s" },
];

export default function GenerateAllModal({ open, currentStep, completedSteps }: Props) {
  const totalDone = completedSteps.length;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">Building Your Launch System</h2>
            <p className="text-sm text-muted-foreground">
              {totalDone === 5 ? "All done! 🚀" : `Step ${currentStep} of 5 — please wait...`}
            </p>
          </div>

          <div className="space-y-3">
            {STEPS.map((step) => {
              const isDone = completedSteps.includes(step.num);
              const isActive = currentStep === step.num && !isDone;

              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.num * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isDone ? "bg-primary/5" : isActive ? "bg-accent/10" : "bg-secondary/30"
                  }`}
                >
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDone ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{isDone ? "✓" : step.estimate}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(totalDone / 5) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
