import { motion } from "framer-motion";
import { 
  Lightbulb, FileText, Palette, Globe, Megaphone, 
  ShoppingCart, Rocket, TrendingUp, DollarSign, CheckCircle2, Circle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const journeySteps = [
  { key: "idea", label: "Product Idea", icon: Lightbulb },
  { key: "mechanism", label: "Mechanism", icon: FileText },
  { key: "content", label: "Content Built", icon: FileText },
  { key: "graphics", label: "Graphics", icon: Palette },
  { key: "salespage", label: "Sales Page", icon: Globe },
  { key: "funnel", label: "Funnel Ready", icon: ShoppingCart },
  { key: "deploy", label: "Deployed", icon: Rocket },
  { key: "promote", label: "Promoting", icon: Megaphone },
  { key: "firstsale", label: "First Sale!", icon: DollarSign },
];

function getCompletedSteps(project: any): Set<string> {
  const done = new Set<string>();
  if (!project) return done;

  const p1 = project.step1_product as any;
  if (p1) {
    done.add("idea");
    if (p1.mechanism || p1.uniqueMechanism) done.add("mechanism");
  }
  if (project.step2_product_content) done.add("content");
  if (project.step2_assets) done.add("graphics");
  if (project.step3_funnel) {
    done.add("salespage");
    done.add("funnel");
  }
  if (project.status === "complete" || project.step5_checklist) done.add("deploy");
  if (project.step4_marketing) done.add("promote");

  return done;
}

interface Props {
  project: any;
}

export default function LaunchJourney({ project }: Props) {
  const completed = getCompletedSteps(project);
  const pct = Math.round((completed.size / journeySteps.length) * 100);

  return (
    <Card className="border-accent/20 overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Launch Journey</h3>
          </div>
          <span className="text-xs font-semibold text-primary">{pct}%</span>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-secondary" />
          <div 
            className="absolute left-[15px] top-4 w-0.5 bg-gradient-to-b from-primary to-accent transition-all duration-700"
            style={{ height: `${Math.max(0, (completed.size / journeySteps.length) * 100)}%` }}
          />

          <div className="space-y-1">
            {journeySteps.map((step, i) => {
              const done = completed.has(step.key);
              const Icon = step.icon;
              const isNext = !done && (i === 0 || completed.has(journeySteps[i - 1].key));

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 py-1.5 pl-1 rounded-lg transition-colors ${
                    isNext ? "bg-primary/5" : ""
                  }`}
                >
                  <div className={`relative z-10 p-1 rounded-full ${
                    done ? "bg-primary text-primary-foreground" : isNext ? "bg-accent/20 text-accent ring-2 ring-accent/40" : "bg-secondary text-muted-foreground"
                  }`}>
                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-sm ${done ? "font-medium" : isNext ? "font-medium text-accent" : "text-muted-foreground"}`}>
                    {step.label}
                    {isNext && <span className="ml-2 text-xs text-accent">← Next</span>}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
