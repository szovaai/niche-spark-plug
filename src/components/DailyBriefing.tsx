import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ArrowRight, Clock, Zap, Target, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface BriefingAction {
  title: string;
  description: string;
  projectId: string | null;
  projectName: string | null;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
  link: string;
}

interface Briefing {
  greeting: string;
  actions: BriefingAction[];
  motivationalNote: string;
}

const PRIORITY_STYLES = {
  high: { icon: Zap, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  medium: { icon: Target, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  low: { icon: Clock, color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
};

export default function DailyBriefing() {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-daily-briefing");
      if (error) throw error;
      setBriefing(data);
    } catch {
      // Silent fail — briefing is optional
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if already fetched today
    const cached = sessionStorage.getItem("dailyBriefing");
    if (cached) {
      try {
        setBriefing(JSON.parse(cached));
        return;
      } catch { /* refetch */ }
    }
    fetchBriefing();
  }, []);

  useEffect(() => {
    if (briefing) {
      sessionStorage.setItem("dailyBriefing", JSON.stringify(briefing));
    }
  }, [briefing]);

  if (dismissed) return null;

  if (loading) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <span className="text-sm text-muted-foreground">Preparing your daily briefing...</span>
        </CardContent>
      </Card>
    );
  }

  if (!briefing) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 via-primary/5 to-transparent overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full" />
        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-primary">
                <Sun className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Your Daily Briefing</h3>
                <p className="text-xs text-muted-foreground">{briefing.greeting}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setDismissed(true)}>
              Dismiss
            </Button>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {briefing.actions.map((action, i) => {
              const style = PRIORITY_STYLES[action.priority];
              const Icon = style.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${style.border} ${style.bg} cursor-pointer hover:scale-[1.01] transition-transform`}
                  onClick={() => {
                    if (action.projectId) navigate(`/wizard/${action.projectId}`);
                    else navigate(action.link);
                  }}
                >
                  <Icon className={`w-4 h-4 ${style.color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{action.title}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">{action.estimatedMinutes}min</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    {action.projectName && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1">Project: {action.projectName}</p>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                </motion.div>
              );
            })}
          </div>

          {/* Motivation */}
          <div className="flex items-center gap-2 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
            <p className="text-xs text-muted-foreground italic">{briefing.motivationalNote}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
