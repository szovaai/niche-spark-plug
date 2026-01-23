import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Package, DollarSign, Flame, Plus, ArrowRight, Clock, 
  Download, Sparkles, TrendingUp, Zap, Crown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import RevenueGoalWidget from "@/components/RevenueGoalWidget";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DashboardStats {
  toolkitsCreated: number;
  totalDownloads: number;
  revenueEstimate: number;
  streakDays: number;
}

interface RecentToolkit {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

const hotNiches = [
  { name: "AI Prompt Libraries", demand: 95, icon: "🤖" },
  { name: "Productivity Systems", demand: 88, icon: "📈" },
  { name: "Email Marketing Templates", demand: 85, icon: "📧" },
  { name: "Content Creation Kits", demand: 82, icon: "📱" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentToolkits, setRecentToolkits] = useState<RecentToolkit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [toolkitsRes, profileRes] = await Promise.all([
        supabase
          .from("toolkits")
          .select("id, title, status, downloads, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("profiles").select("streak_days").eq("id", user!.id).maybeSingle(),
      ]);

      const toolkits = toolkitsRes.data || [];
      const totalDownloads = toolkits.reduce((sum, t) => sum + (t.downloads || 0), 0);

      setStats({
        toolkitsCreated: toolkits.length,
        totalDownloads,
        revenueEstimate: totalDownloads * 17, // Rough estimate
        streakDays: profileRes.data?.streak_days || 0,
      });

      setRecentToolkits(toolkits.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        created_at: t.created_at,
      })));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.email?.split("@")[0] || "Creator";

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            {format(new Date(), "EEEE, MMMM d")}
            {stats?.streakDays ? (
              <span className="flex items-center gap-1 text-accent">
                <Flame className="w-4 h-4" />
                {stats.streakDays} day streak
              </span>
            ) : null}
          </p>
        </motion.div>

        {/* Hero CTA for New Users */}
        {!loading && stats?.toolkitsCreated === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-8"
          >
            <div className="absolute inset-0 aurora-bg opacity-30" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold gradient-text">
                  Create Your First Toolkit
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Build a complete digital product in under 60 minutes. 
                  We'll guide you step by step.
                </p>
              </div>
              <Button
                onClick={() => navigate("/create")}
                variant="hero"
                size="lg"
                className="gap-2 glow-primary"
              >
                <Plus className="w-5 h-5" />
                Start Building
              </Button>
            </div>
          </motion.div>
        )}

        {/* Empire Mode CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shrink-0">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">AI Digital Product Empire</h3>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">NEW</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md">
                      6-step blueprint to build a complete faceless AI brand — from niche to Gumroad to viral content. 
                      Everything you need in one guided flow.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/empire")}
                  className="gap-2 shrink-0"
                >
                  <Crown className="w-4 h-4" />
                  Start Empire Mode
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard 
                icon={Package} 
                label="Toolkits Created" 
                value={stats?.toolkitsCreated || 0} 
                color="text-primary"
                delay={0}
              />
              <StatCard 
                icon={Download} 
                label="Total Downloads" 
                value={stats?.totalDownloads || 0} 
                color="text-green-500"
                delay={0.1}
              />
              <StatCard 
                icon={DollarSign} 
                label="Est. Revenue" 
                value={`$${stats?.revenueEstimate || 0}`} 
                color="text-accent"
                delay={0.2}
              />
              <StatCard 
                icon={Flame} 
                label="Current Streak" 
                value={`${stats?.streakDays || 0} days`} 
                color="text-orange-500"
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Toolkits */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Toolkits
            </h2>
            <Card>
              <CardContent className="p-4">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-14" />
                    ))}
                  </div>
                ) : recentToolkits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No toolkits yet</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/create")}
                      className="mt-2"
                    >
                      Create your first toolkit <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentToolkits.map((toolkit) => (
                      <div 
                        key={toolkit.id} 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/toolkit/${toolkit.id}`)}
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{toolkit.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(toolkit.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          toolkit.status === 'complete' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {toolkit.status}
                        </span>
                      </div>
                    ))}
                    {recentToolkits.length > 0 && (
                      <Button 
                        variant="ghost" 
                        className="w-full mt-2 text-muted-foreground"
                        onClick={() => navigate("/my-toolkits")}
                      >
                        View all toolkits <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Hot Niches */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Hot Niches Right Now
            </h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {hotNiches.map((niche, i) => (
                    <motion.div
                      key={niche.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/create?niche=${encodeURIComponent(niche.name)}`)}
                    >
                      <span className="text-2xl">{niche.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{niche.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                              style={{ width: `${niche.demand}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{niche.demand}%</span>
                        </div>
                      </div>
                      <Zap className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
              <div className="flex-1">
                  <h3 className="font-semibold mb-2">Pro Tip: The 60-Minute Launch Formula</h3>
                  <p className="text-sm text-muted-foreground">
                    The most successful digital product sellers focus on one thing: solving a specific problem 
                    with a complete toolkit. Use our wizard to create your guide, worksheets, e-cover, 
                    and sales letter all in one flow. Launch fast, iterate based on feedback.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Goal Widget */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <RevenueGoalWidget />
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
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
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
