import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, X, Rocket, Search, Target, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Step {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
  done: boolean;
}

interface Props {
  hasProjects: boolean;
  hasFunnels: boolean;
  hasAssets: boolean;
}

export default function GettingStartedChecklist({ hasProjects, hasFunnels, hasAssets }: Props) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const steps: Step[] = [
    { id: "research", label: "Talk to the Research Agent", description: "Discover a profitable niche before building anything.", icon: Search, path: "/research-agent", done: hasProjects },
    { id: "product", label: "Create your first product", description: "Use the AI Product Builder to generate your launch system.", icon: Rocket, path: "/wizard", done: hasProjects },
    { id: "funnel", label: "Build a funnel", description: "Create a sales funnel with landing page, upsells & email capture.", icon: Target, path: "/funnels", done: hasFunnels },
    { id: "launch", label: "Generate marketing assets", description: "Email sequences, social posts, and affiliate materials.", icon: Mail, path: "/wizard", done: hasAssets },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = (completedCount / steps.length) * 100;

  if (dismissed || completedCount === steps.length) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 relative overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground/50 hover:text-foreground z-10"
            onClick={() => setDismissed(true)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                🚀 Getting Started
                <span className="text-xs font-normal text-muted-foreground">
                  {completedCount}/{steps.length} complete
                </span>
              </h3>
              <Progress value={progress} className="h-1.5 mt-2" />
            </div>

            <div className="space-y-2">
              {steps.map((step) => (
                <Tooltip key={step.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate(step.path)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        step.done
                          ? "bg-primary/5 text-muted-foreground"
                          : "hover:bg-secondary/60"
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${step.done ? "line-through opacity-60" : ""}`}>
                          {step.label}
                        </p>
                      </div>
                      <step.icon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[200px]">
                    <p className="text-xs">{step.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
