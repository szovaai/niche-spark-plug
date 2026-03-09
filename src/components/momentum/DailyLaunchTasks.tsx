import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Zap, RefreshCw, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";

interface DailyTask {
  id: string;
  label: string;
  category: "product" | "funnel" | "marketing" | "optimize";
  minutes: number;
}

function generateTasks(project: any): DailyTask[] {
  const tasks: DailyTask[] = [];
  const step = project?.current_step || 1;
  const hasProduct = !!project?.step1_product;
  const hasContent = !!project?.step2_product_content;
  const hasFunnel = !!project?.step3_funnel;
  const hasMarketing = !!project?.step4_marketing;

  if (!hasProduct) {
    tasks.push(
      { id: "t1", label: "Define your product niche & audience", category: "product", minutes: 5 },
      { id: "t2", label: "Run a Launch Score analysis", category: "product", minutes: 3 },
      { id: "t3", label: "Generate your product outline", category: "product", minutes: 5 },
    );
  } else if (!hasContent) {
    tasks.push(
      { id: "t4", label: "Generate product content chapters", category: "product", minutes: 10 },
      { id: "t5", label: "Create 5 bonus asset ideas", category: "product", minutes: 5 },
    );
  } else if (!hasFunnel) {
    tasks.push(
      { id: "t6", label: "Generate your sales page copy", category: "funnel", minutes: 5 },
      { id: "t7", label: "Build your funnel map", category: "funnel", minutes: 5 },
      { id: "t8", label: "Create 10 viral sales hooks", category: "marketing", minutes: 5 },
    );
  } else if (!hasMarketing) {
    tasks.push(
      { id: "t9", label: "Generate email launch sequence", category: "marketing", minutes: 5 },
      { id: "t10", label: "Create 5 social media posts", category: "marketing", minutes: 5 },
      { id: "t11", label: "Write 3 ad copy variations", category: "marketing", minutes: 5 },
    );
  } else {
    tasks.push(
      { id: "t12", label: "Review your pre-launch audit", category: "optimize", minutes: 5 },
      { id: "t13", label: "Improve your sales headline", category: "optimize", minutes: 5 },
      { id: "t14", label: "Add an upsell to your funnel", category: "optimize", minutes: 10 },
      { id: "t15", label: "Deploy your funnel page", category: "optimize", minutes: 5 },
    );
  }

  return tasks.slice(0, 5);
}

const categoryColors: Record<string, string> = {
  product: "text-primary",
  funnel: "text-green-500",
  marketing: "text-accent",
  optimize: "text-yellow-500",
};

interface Props {
  project: any;
}

export default function DailyLaunchTasks({ project }: Props) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTasks(generateTasks(project));
    // Load completed from localStorage for today
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`momentum_tasks_${today}`);
    if (saved) setCompleted(new Set(JSON.parse(saved)));
  }, [project]);

  const toggleTask = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const today = new Date().toDateString();
      localStorage.setItem(`momentum_tasks_${today}`, JSON.stringify([...next]));
      if (next.size === tasks.length && tasks.length > 0) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
      return next;
    });
  };

  const pct = tasks.length > 0 ? Math.round((completed.size / tasks.length) * 100) : 0;
  const allDone = pct === 100 && tasks.length > 0;

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="font-bold">Today's Launch Tasks</h3>
          </div>
          {allDone && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-green-500 text-xs font-medium">
              <Trophy className="w-4 h-4" />
              All done!
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Progress value={pct} className="flex-1 h-2" />
          <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
        </div>

        <div className="space-y-1.5">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const done = completed.has(task.id);
              return (
                <motion.button
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all text-sm ${
                    done ? "bg-green-500/10 line-through text-muted-foreground" : "hover:bg-secondary/60"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="flex-1">{task.label}</span>
                  <span className={`text-xs ${categoryColors[task.category] || "text-muted-foreground"}`}>
                    ~{task.minutes}m
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
