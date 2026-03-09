import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bot, ArrowRight, Lightbulb, TrendingUp, AlertTriangle, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Tip {
  icon: React.ElementType;
  text: string;
  action?: string;
  route?: string;
  priority: "high" | "medium" | "low";
}

function getCoachTips(project: any): Tip[] {
  if (!project) {
    return [
      { icon: Rocket, text: "Start your first launch — you're 60 minutes away from a live product.", action: "Launch Now", route: "/wizard", priority: "high" },
    ];
  }

  const tips: Tip[] = [];
  const p = project;

  if (!p.step1_product) {
    tips.push({ icon: Lightbulb, text: "Define your product idea to unlock the full launch pipeline.", action: "Start Building", route: `/wizard/${p.id}`, priority: "high" });
  } else if (!p.step2_product_content) {
    tips.push({ icon: TrendingUp, text: "Your product outline is ready — generate content to bring it to life.", action: "Generate Content", route: `/wizard/${p.id}`, priority: "high" });
  } else if (!p.step3_funnel) {
    tips.push({ icon: Rocket, text: "You're one step away from having a live sales page. Build your funnel now.", action: "Build Funnel", route: `/wizard/${p.id}`, priority: "high" });
  } else if (!p.step4_marketing) {
    tips.push({ icon: TrendingUp, text: "Your funnel is ready! Generate emails and social posts to drive traffic.", action: "Create Marketing", route: `/wizard/${p.id}`, priority: "high" });
  } else {
    tips.push({ icon: Rocket, text: "Your launch system is complete! Deploy and start promoting.", action: "Deploy Now", route: "/checklist", priority: "high" });
  }

  // Contextual secondary tips
  const score = (p.step1_product as any)?.launchScore;
  if (score && score.overall < 70) {
    tips.push({ icon: AlertTriangle, text: `Your Launch Score is ${score.overall}/100. Sharpen your offer angle to boost conversions.`, priority: "medium" });
  }

  if (p.step3_funnel && !p.step4_marketing) {
    tips.push({ icon: TrendingUp, text: "Adding an upsell could increase your revenue by 30%. Consider a premium tier.", priority: "low" });
  }

  if (p.step1_product && !p.buyer_avatar) {
    tips.push({ icon: Lightbulb, text: "Define your buyer avatar for sharper copy that converts.", priority: "medium" });
  }

  return tips.slice(0, 3);
}

interface Props {
  project: any;
}

export default function AILaunchCoach({ project }: Props) {
  const navigate = useNavigate();
  const tips = useMemo(() => getCoachTips(project), [project]);

  const priorityStyles = {
    high: "border-l-primary",
    medium: "border-l-accent",
    low: "border-l-muted-foreground/40",
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-sm">AI Launch Coach</h3>
        </div>

        <div className="space-y-2">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-lg bg-secondary/40 border-l-2 ${priorityStyles[tip.priority]}`}
              >
                <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <p className="text-sm leading-snug">{tip.text}</p>
                  {tip.action && tip.route && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary"
                      onClick={() => navigate(tip.route!)}
                    >
                      {tip.action} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
