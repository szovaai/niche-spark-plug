import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Flame, ArrowRight, Clock, Sparkles, Package, BarChart3,
  Rocket, Copy, Radar, Wand2, GitBranch, Bookmark,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

  const quickLinks = [
    { icon: Radar, label: "Profit Radar", desc: "Find hot opportunities", path: "/opportunities", color: "text-primary" },
    { icon: Wand2, label: "Product Builder", desc: "Launch a new product", path: "/wizard", color: "text-accent" },
    { icon: GitBranch, label: "Funnel Builder", desc: "Design your funnel", path: "/funnels", color: "text-green-500" },
    { icon: Bookmark, label: "Saved Projects", desc: "Continue your work", path: "/saved-projects", color: "text-orange-500" },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome + primary CTAs */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {displayName} 👋</h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              {format(new Date(), "EEEE, MMMM d")}
              {stats.streak > 0 && (
                <span className="flex items-center gap-1 text-accent">
                  <Flame className="w-4 h-4" />{stats.streak} day streak
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="hero" size="lg" className="gap-2" onClick={() => navigate("/opportunities")}>
              <Radar className="w-4 h-4" /> Open Profit Radar
            </Button>
            <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate("/wizard")}>
              <Rocket className="w-4 h-4" /> New Launch
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            <>
              <StatCard icon={Package} label="Products Built" value={stats.products} color="text-primary" delay={0} />
              <StatCard icon={BarChart3} label="Funnels Generated" value={stats.funnels} color="text-green-500" delay={0.05} />
              <StatCard icon={Sparkles} label="Marketing Assets" value={stats.assets} color="text-accent" delay={0.1} />
              <StatCard icon={Flame} label="Streak Days" value={stats.streak} color="text-orange-500" delay={0.15} />
            </>
          )}
        </div>

        {/* Recent Projects */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Launches
          </h2>
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No launches yet</p>
                  <Button variant="link" onClick={() => navigate("/opportunities")} className="mt-2">
                    Find your first opportunity <ArrowRight className="w-4 h-4 ml-1" />
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
                        <p className="text-xs text-muted-foreground">{p.niche || "—"} · Step {p.current_step}/5</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => navigate(`/wizard/${p.id}`)}>
                        Continue <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); cloneProject(p); }}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">Clone this project</p></TooltipContent>
                      </Tooltip>
                      <Badge variant={p.status === "complete" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, i) => (
              <Card
                key={link.path}
                className="cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => navigate(link.path)}
              >
                <CardContent className="p-4">
                  <div className="p-2 rounded-lg bg-secondary w-fit mb-3">
                    <link.icon className={`w-5 h-5 ${link.color}`} />
                  </div>
                  <p className="font-semibold text-sm">{link.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
