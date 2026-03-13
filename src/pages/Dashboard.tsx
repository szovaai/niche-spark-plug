import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Wand2, Flame, ArrowRight, Clock, 
  Sparkles, TrendingUp, Package, BarChart3, CheckCircle2, Circle,
  Rocket, Copy
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RevenueProjector from "@/components/wizard/RevenueProjector";
import LaunchDNACard from "@/components/wizard/LaunchDNACard";
import ProductScorecard from "@/components/wizard/ProductScorecard";
import PreLaunchAudit from "@/components/wizard/PreLaunchAudit";
import DailyLaunchTasks from "@/components/momentum/DailyLaunchTasks";
import AILaunchCoach from "@/components/momentum/AILaunchCoach";
import LaunchJourney from "@/components/momentum/LaunchJourney";
import ProductFactoryCard from "@/components/momentum/ProductFactoryCard";
import RevenueGoalWidget from "@/components/RevenueGoalWidget";
import GettingStartedChecklist from "@/components/GettingStartedChecklist";
import ReferralWidget from "@/components/ReferralWidget";
import DailyBriefing from "@/components/DailyBriefing";

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

  const cloneProject = async (project: any) => {
    if (!user) return;
    const { id, created_at, updated_at, ...rest } = project;
    const { data, error } = await supabase.from("launch_projects").insert({
      ...rest,
      user_id: user.id,
      name: `${project.name} (Copy)`,
      status: "in_progress",
      current_step: 1,
    }).select().single();
    if (error) { toast.error("Clone failed"); return; }
    toast.success("Project cloned!");
    navigate(`/wizard/${data.id}`);
  };

  const latestProject = projects[0];

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {displayName}! 👋</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            {format(new Date(), "EEEE, MMMM d")}
            {stats.streak > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-accent cursor-help">
                    <Flame className="w-4 h-4" />{stats.streak} day streak
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">You've been active {stats.streak} days in a row. Keep it up to unlock streak badges!</p>
                </TooltipContent>
              </Tooltip>
            )}
          </p>
          {/* Keyboard shortcut hint */}
          <p className="text-xs text-muted-foreground/50 mt-1">
            Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono border border-border/50">⌘K</kbd> to quick-navigate anywhere
          </p>
        </motion.div>

        {/* Getting Started Checklist (new users) */}
        {!loading && (
          <GettingStartedChecklist
            hasProjects={stats.products > 0}
            hasFunnels={stats.funnels > 0}
            hasAssets={stats.assets > 0}
          />
        )}

        {/* AI Daily Briefing */}
        {user && !loading && stats.products > 0 && <DailyBriefing />}

        {/* Research Agent CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="relative overflow-hidden border-accent/30 bg-gradient-to-br from-accent/10 via-primary/5 to-transparent cursor-pointer" onClick={() => navigate("/research-agent")}>
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
                    <Button onClick={(e) => { e.stopPropagation(); navigate("/research-agent"); }} variant="outline" className="gap-2 shrink-0 border-accent/40 hover:bg-accent/10">
                      <Sparkles className="w-4 h-4" />
                      Start Research Chat
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">AI-powered niche research — find profitable topics in minutes</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>

        {/* 🚀 Launch Tonight CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="relative overflow-hidden border-primary/40 bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 shadow-lg shadow-primary/10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/25 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-transparent rounded-tr-full" />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shrink-0 animate-pulse">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">🚀 Launch Tonight</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Generate your complete product, funnel, emails & affiliate kit in 60 minutes.
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => navigate("/wizard")} variant="hero" size="lg" className="gap-2 shrink-0">
                      <Rocket className="w-4 h-4" />
                      Launch Tonight
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">AI generates product, sales page, funnel, emails & marketing in one click</p>
            </TooltipContent>
          </Tooltip>
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

        {/* ===== MOMENTUM ENGINE ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <LaunchJourney project={latestProject} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <DailyLaunchTasks project={latestProject} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
            <AILaunchCoach project={latestProject} />
          </motion.div>
        </div>

        {/* Product Factory Card */}
        <ProductFactoryCard projectCount={stats.products} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            <>
              <StatCard icon={Package} label="Products Created" value={stats.products} color="text-primary" delay={0} tooltip="Total products you've generated with the AI Product Builder." />
              <StatCard icon={BarChart3} label="Funnels Built" value={stats.funnels} color="text-green-500" delay={0.1} tooltip="Sales funnels with landing pages, upsells & checkout flows." />
              <StatCard icon={Sparkles} label="Assets Generated" value={stats.assets} color="text-accent" delay={0.2} tooltip="Marketing assets: email sequences, social posts, affiliate kits." />
              <StatCard icon={Flame} label="Current Streak" value={`${stats.streak} days`} color="text-orange-500" delay={0.3} tooltip="Consecutive days you've been active. Build habits, earn badges!" />
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
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="p-2 rounded-lg bg-primary/10 cursor-pointer" onClick={() => navigate(`/wizard/${p.id}`)}>
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/wizard/${p.id}`)}>
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.niche} · Step {p.current_step}/5</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); cloneProject(p); }}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Clone this project to create a variant</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant={p.status === "complete" ? "default" : "secondary"} className="text-xs cursor-help">
                            {p.status}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{p.status === "complete" ? "Ready to launch!" : `In progress — step ${p.current_step} of 5`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Goal + Scorecard + Audit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
            <RevenueGoalWidget />
          </motion.div>
          {latestProject && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <ProductScorecard project={latestProject} />
            </motion.div>
          )}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}>
            <ReferralWidget />
          </motion.div>
        </div>

        {latestProject && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
            <PreLaunchAudit project={latestProject} />
          </motion.div>
        )}

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
  tooltip: string;
}

const StatCard = ({ icon: Icon, label, value, color, delay, tooltip }: StatCardProps) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="hover:border-primary/30 transition-colors cursor-help">
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
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs max-w-[200px]">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </motion.div>
);

export default Dashboard;
