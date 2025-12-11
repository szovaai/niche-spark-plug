import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Home, Package, Bookmark, DollarSign, Flame, Compass, 
  Sparkles, Rocket, Map, Zap, Video, ArrowRight, Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/DashboardLayout";
import InspirationOfTheDay from "@/components/InspirationOfTheDay";
import RevenueGoalWidget from "@/components/RevenueGoalWidget";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DashboardStats {
  productsCreated: number;
  savedNiches: number;
  currentRevenue: number;
  streakDays: number;
}

interface RecentActivity {
  id: string;
  type: "product" | "niche";
  name: string;
  created_at: string;
}

const shortcuts = [
  { title: "Discover Niches", icon: Compass, url: "/discover", color: "text-primary" },
  { title: "My Products", icon: Package, url: "/my-products", color: "text-green-500" },
  { title: "Money Map", icon: Map, url: "/money-map", color: "text-yellow-500" },
  { title: "Launch Packs", icon: Rocket, url: "/launch-packs", color: "text-accent", pro: true },
  { title: "Saved Niches", icon: Bookmark, url: "/saved", color: "text-blue-500" },
  { title: "UGC Vault", icon: Video, url: "/ugc-vault", color: "text-purple-500", pro: true },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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
      // Fetch all data in parallel
      const [productsRes, nichesRes, profileRes, revenueRes] = await Promise.all([
        supabase.from("user_product_builds").select("id, product_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("saved_niches").select("id, niche_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("streak_days").eq("id", user!.id).maybeSingle(),
        supabase.from("revenue_goals").select("current_amount").eq("is_active", true).maybeSingle(),
      ]);

      // Build stats
      setStats({
        productsCreated: productsRes.data?.length || 0,
        savedNiches: nichesRes.data?.length || 0,
        currentRevenue: revenueRes.data?.current_amount || 0,
        streakDays: profileRes.data?.streak_days || 0,
      });

      // Build recent activity (merge and sort)
      const products: RecentActivity[] = (productsRes.data || []).map(p => ({
        id: p.id,
        type: "product" as const,
        name: p.product_name,
        created_at: p.created_at,
      }));
      const niches: RecentActivity[] = (nichesRes.data || []).map(n => ({
        id: n.id,
        type: "niche" as const,
        name: n.niche_name,
        created_at: n.created_at,
      }));
      
      const merged = [...products, ...niches]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      setRecentActivity(merged);
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
                label="Products Created" 
                value={stats?.productsCreated || 0} 
                color="text-green-500"
                delay={0}
              />
              <StatCard 
                icon={Bookmark} 
                label="Saved Niches" 
                value={stats?.savedNiches || 0} 
                color="text-blue-500"
                delay={0.1}
              />
              <StatCard 
                icon={DollarSign} 
                label="Revenue" 
                value={`$${stats?.currentRevenue || 0}`} 
                color="text-primary"
                delay={0.2}
              />
              <StatCard 
                icon={Flame} 
                label="Current Streak" 
                value={`${stats?.streakDays || 0} days`} 
                color="text-accent"
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Quick Shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Shortcuts
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {shortcuts.map((shortcut, i) => (
              <motion.div
                key={shortcut.url}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group"
                  onClick={() => navigate(shortcut.url)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={`p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors`}>
                      <shortcut.icon className={`w-5 h-5 ${shortcut.color}`} />
                    </div>
                    <span className="text-sm font-medium">{shortcut.title}</span>
                    {shortcut.pro && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent">PRO</span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Activity
            </h2>
            <Card>
              <CardContent className="p-4">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No activity yet</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/discover")}
                      className="mt-2"
                    >
                      Start discovering niches <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentActivity.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className={`p-1.5 rounded ${activity.type === "product" ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                          {activity.type === "product" ? (
                            <Package className="w-4 h-4 text-green-500" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.type === "product" ? "Product created" : "Niche saved"}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="w-full mt-2 text-muted-foreground"
                      onClick={() => navigate(recentActivity[0]?.type === "product" ? "/my-products" : "/saved")}
                    >
                      View all <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Inspiration */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Today's Inspiration
            </h2>
            <InspirationOfTheDay />
          </motion.div>
        </div>

        {/* Revenue Goal Widget */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          <div className={`p-2 rounded-lg bg-secondary`}>
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
