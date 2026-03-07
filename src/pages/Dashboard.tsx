import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Wand2, Flame, ArrowRight, Clock, 
  Sparkles, TrendingUp, Package, BarChart3, CheckCircle2, Circle,
  Rocket
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import RevenueProjector from "@/components/wizard/RevenueProjector";
import LaunchDNACard from "@/components/wizard/LaunchDNACard";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ products: 0, funnels: 0, assets: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
    else setLoading(false);
  }, [user]);

  const fetchData = async () => {
    try {
      const [projectsRes, profileRes] = await Promise.all([
        supabase.from("launch_projects").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("streak_days").eq("id", user!.id).maybeSingle(),
      ]);
      const all = projectsRes.data || [];
      setProjects(all);
      setStats({
        products: all.length,
        funnels: all.filter(p => p.step3_funnel).length,
        assets: all.filter(p => p.step4_marketing).length,
        streak: profileRes.data?.streak_days || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.email?.split("@")[0] || "Creator";

  // Get latest project's checklist for progress tracker
  const latestProject = projects[0];
  const checklist = latestProject?.step5_checklist as any;
  const checklistSteps = checklist?.steps || [];
  const completedSteps = checklistSteps.filter((s: any) => s.completed).length;

  const progressStages = [
    { label: "Product", done: !!latestProject?.step1_product },
    { label: "Content", done: !!latestProject?.step2_product_content },
    { label: "Funnel", done: !!latestProject?.step3_funnel },
    { label: "Marketing", done: !!latestProject?.step4_marketing },
    { label: "Ready", done: !!latestProject?.step5_checklist },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {displayName}! 👋</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            {format(new Date(), "EEEE, MMMM d")}
            {stats.streak > 0 && (
              <span className="flex items-center gap-1 text-accent">
                <Flame className="w-4 h-4" />{stats.streak} day streak
              </span>
            )}
          </p>
        </motion.div>

        {/* Research Agent CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 }}>
          <Card className="relative overflow-hidden border-accent/30 bg-gradient-to-br from-accent/10 via-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-primary shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Find a Profitable Topic First</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Talk to the AI Research Agent and discover what to launch before building your funnel.
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate("/research-agent")} variant="outline" className="gap-2 shrink-0 border-accent/40 hover:bg-accent/10">
                  <Sparkles className="w-4 h-4" />
                  Start Research Chat
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Launch CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shrink-0">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Launch Wizard</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Create your complete digital product launch — product, funnel, emails, marketing — all in one guided flow.
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate("/wizard")} variant="hero" className="gap-2 shrink-0">
                  <Rocket className="w-4 h-4" />
                  Start New Launch
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Launch DNA Card */}
        {latestProject?.step1_product && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <LaunchDNACard
              product={latestProject.step1_product as any}
              targetAudience={latestProject.target_audience || ""}
            />
          </motion.div>
        )}

        {/* Launch Progress Tracker */}
        {latestProject && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Launch Progress — {latestProject.name}</h3>
                  <Badge variant={latestProject.status === "complete" ? "default" : "secondary"}>{latestProject.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {progressStages.map((stage, i) => (
                    <div key={stage.label} className="flex items-center gap-2 flex-1">
                      <div className={`flex items-center gap-1.5 ${stage.done ? "text-primary" : "text-muted-foreground"}`}>
                        {stage.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        <span className="text-xs font-medium hidden sm:inline">{stage.label}</span>
                      </div>
                      {i < progressStages.length - 1 && (
                        <div className={`flex-1 h-0.5 rounded ${stage.done ? "bg-primary" : "bg-secondary"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            <>
              <StatCard icon={Package} label="Products Created" value={stats.products} color="text-primary" delay={0} />
              <StatCard icon={BarChart3} label="Funnels Built" value={stats.funnels} color="text-green-500" delay={0.1} />
              <StatCard icon={Sparkles} label="Assets Generated" value={stats.assets} color="text-accent" delay={0.2} />
              <StatCard icon={Flame} label="Current Streak" value={`${stats.streak} days`} color="text-orange-500" delay={0.3} />
            </>
          )}
        </div>

        {/* Active Projects */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Active Launch Projects
          </h2>
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No projects yet</p>
                  <Button variant="link" onClick={() => navigate("/wizard")} className="mt-2">
                    Start your first launch <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => navigate("/products")}>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.niche} · Step {p.current_step}/5</p>
                      </div>
                      <Badge variant={p.status === "complete" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Projector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <RevenueProjector />
        </motion.div>

        {/* Pro Tip */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Pro Tip: The 60-Minute Launch</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the "Generate Entire Launch System" button in the wizard to create your product, funnel, emails, and marketing assets all at once. Then follow the launch checklist to go live.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}

const StatCard = ({ icon: Icon, label, value, color, delay }: StatCardProps) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary">
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default Dashboard;
