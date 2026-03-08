import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Circle, Rocket, Eye, Download, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface Props {
  open: boolean;
  currentStep: number;
  completedSteps: number[];
  onPreviewProduct?: () => void;
  onPreviewFunnel?: () => void;
  onExportKit?: () => void;
}

// 12 visual sub-steps mapped to 6 real API steps
const SUB_STEPS = [
  { realStep: 1, label: "Researching your market", icon: "🔍" },
  { realStep: 1, label: "Analyzing audience frustrations", icon: "🎯" },
  { realStep: 2, label: "Generating product concept", icon: "💡" },
  { realStep: 2, label: "Writing ebook content", icon: "📝" },
  { realStep: 2, label: "Creating worksheets & templates", icon: "📋" },
  { realStep: 3, label: "Designing product graphics", icon: "🎨" },
  { realStep: 4, label: "Writing sales page", icon: "📄" },
  { realStep: 4, label: "Building funnel assets", icon: "🔗" },
  { realStep: 5, label: "Creating email launch sequence", icon: "📧" },
  { realStep: 5, label: "Generating affiliate kit", icon: "🤝" },
  { realStep: 6, label: "Building launch timeline", icon: "📅" },
  { realStep: 6, label: "Preparing launch kit", icon: "📦" },
];

export default function GenerateAllModal({ open, currentStep, completedSteps, onPreviewProduct, onPreviewFunnel, onExportKit }: Props) {
  const confettiFired = useRef(false);
  const totalDone = completedSteps.length;
  const isComplete = totalDone === 6;

  // Fire confetti on completion
  useEffect(() => {
    if (isComplete && !confettiFired.current) {
      confettiFired.current = true;
      const duration = 2000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#10b981", "#3b82f6", "#f59e0b"] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#10b981", "#3b82f6", "#f59e0b"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
    if (!open) confettiFired.current = false;
  }, [isComplete, open]);

  // Determine which sub-steps are done/active
  const getSubStepStatus = (sub: typeof SUB_STEPS[number], idx: number) => {
    if (completedSteps.includes(sub.realStep)) return "done";
    if (currentStep === sub.realStep) {
      // Within a real step, animate sub-steps sequentially
      const subsForStep = SUB_STEPS.filter(s => s.realStep === sub.realStep);
      const indexInStep = subsForStep.indexOf(sub);
      const firstGlobalIdx = SUB_STEPS.indexOf(subsForStep[0]);
      // Animate through subs within the active real step
      if (indexInStep === 0) return "active";
      // Check if prior sub in same real step has been "visually" active for a bit
      const priorDone = SUB_STEPS.slice(0, idx).filter(s => completedSteps.includes(s.realStep)).length;
      if (priorDone >= firstGlobalIdx) return "active";
      return "pending";
    }
    return "pending";
  };

  const progressPct = isComplete ? 100 : Math.round((totalDone / 6) * 100);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="space-y-5 py-2">
          {/* Header */}
          <div className="text-center space-y-2">
            {isComplete ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.5 }}>
                <div className="text-5xl mb-3">🚀</div>
                <h2 className="text-2xl font-black">Your Digital Product Launch Is Ready!</h2>
                <p className="text-sm text-muted-foreground mt-1">Everything has been generated and is ready to export.</p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl font-bold">Building Your Launch System</h2>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of 6 — please wait...
                </p>
                <p className="text-xs text-muted-foreground/60">Estimated build time: ~45 seconds</p>
              </>
            )}
          </div>

          {/* Sub-steps list */}
          {!isComplete && (
            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {SUB_STEPS.map((sub, idx) => {
                const status = getSubStepStatus(sub, idx);
                const isDone = status === "done";
                const isActive = status === "active";

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isDone ? "bg-primary/5" : isActive ? "bg-accent/10" : "bg-secondary/20"
                    }`}
                  >
                    <span className="text-sm shrink-0">{sub.icon}</span>
                    <div className="flex-1 min-w-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-primary inline mr-2" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-accent animate-spin inline mr-2" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/30 inline mr-2" />
                      )}
                      <span className={`text-sm ${isDone ? "text-primary font-medium" : isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {sub.label}
                      </span>
                    </div>
                    {isDone && <span className="text-xs text-primary">✓</span>}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Completion summary */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Product", icon: "📚" },
                  { label: "Funnel", icon: "🔗" },
                  { label: "Marketing", icon: "📣" },
                  { label: "Graphics", icon: "🎨" },
                  { label: "Affiliates", icon: "🤝" },
                  { label: "Timeline", icon: "📅" },
                ].map(item => (
                  <div key={item.label} className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-xs font-medium mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Progress bar */}
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">{progressPct}% complete</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
