import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, BarChart3, TrendingUp, DollarSign, Package, Users, Eye, ShoppingCart, Mail, MousePointerClick } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricData {
  totalRevenue: number;
  totalSales: number;
  totalVisitors: number;
  totalOptins: number;
  avgConversion: number;
  emailOpens: number;
  emailClicks: number;
  affiliateClicks: number;
  dailyData: any[];
}

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [metrics, setMetrics] = useState<MetricData>({
    totalRevenue: 0, totalSales: 0, totalVisitors: 0, totalOptins: 0,
    avgConversion: 0, emailOpens: 0, emailClicks: 0, affiliateClicks: 0, dailyData: [],
  });

  useEffect(() => {
    if (user) loadData();
    else setLoading(false);
  }, [user, selectedProject]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load projects for filter
      const { data: proj } = await supabase
        .from("launch_projects")
        .select("id, name")
        .order("created_at", { ascending: false });
      setProjects(proj || []);

      // Load metrics
      let query = supabase
        .from("launch_metrics")
        .select("*")
        .order("date", { ascending: true });

      if (selectedProject !== "all") {
        query = query.eq("project_id", selectedProject);
      }

      const { data: metricsData } = await query;
      const rows = metricsData || [];

      const totals = rows.reduce(
        (acc, r) => ({
          revenue: acc.revenue + Number(r.revenue || 0),
          sales: acc.sales + (r.sales || 0),
          visitors: acc.visitors + (r.visitors || 0),
          optins: acc.optins + (r.optins || 0),
          emailOpens: acc.emailOpens + (r.email_opens || 0),
          emailClicks: acc.emailClicks + (r.email_clicks || 0),
          affiliateClicks: acc.affiliateClicks + (r.affiliate_clicks || 0),
        }),
        { revenue: 0, sales: 0, visitors: 0, optins: 0, emailOpens: 0, emailClicks: 0, affiliateClicks: 0 }
      );

      setMetrics({
        totalRevenue: totals.revenue,
        totalSales: totals.sales,
        totalVisitors: totals.visitors,
        totalOptins: totals.optins,
        avgConversion: totals.visitors > 0 ? (totals.sales / totals.visitors) * 100 : 0,
        emailOpens: totals.emailOpens,
        emailClicks: totals.emailClicks,
        affiliateClicks: totals.affiliateClicks,
        dailyData: rows,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    { label: "Total Revenue", value: `$${metrics.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-500", tip: "Sum of all recorded sales revenue" },
    { label: "Total Sales", value: metrics.totalSales.toString(), icon: ShoppingCart, color: "text-primary", tip: "Number of completed purchases" },
    { label: "Page Views", value: metrics.totalVisitors.toLocaleString(), icon: Eye, color: "text-accent", tip: "Total visitors to your sales pages" },
    { label: "Opt-ins", value: metrics.totalOptins.toString(), icon: Users, color: "text-blue-400", tip: "Email list signups from opt-in pages" },
    { label: "Conversion Rate", value: `${metrics.avgConversion.toFixed(1)}%`, icon: TrendingUp, color: "text-orange-500", tip: "Sales ÷ Visitors — your sales efficiency" },
    { label: "Email Opens", value: metrics.emailOpens.toLocaleString(), icon: Mail, color: "text-purple-400", tip: "How many recipients opened your emails" },
    { label: "Email Clicks", value: metrics.emailClicks.toLocaleString(), icon: MousePointerClick, color: "text-cyan-400", tip: "Click-throughs from your email sequences" },
    { label: "Affiliate Clicks", value: metrics.affiliateClicks.toLocaleString(), icon: Users, color: "text-pink-400", tip: "Clicks from affiliate partners" },
  ];

  // Simple sparkline for daily revenue
  const revenueByDay = metrics.dailyData.slice(-14);
  const maxRevenue = Math.max(...revenueByDay.map((d) => Number(d.revenue || 0)), 1);

  return (
    <DashboardLayout title="Analytics">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your launch performance and growth metrics.</p>
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            metricCards.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="bg-card/40 backdrop-blur-md border-border/20 cursor-help hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <m.icon className={`h-4 w-4 ${m.color}`} />
                        </div>
                        <p className="text-2xl font-bold">{m.value}</p>
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{m.label}</p>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{m.tip}</p></TooltipContent>
                </Tooltip>
              </motion.div>
            ))
          )}
        </div>

        {/* Revenue Sparkline */}
        <Card className="bg-card/40 backdrop-blur-md border-border/20">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Daily Revenue (Last 14 Days)
            </h3>
            {revenueByDay.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <LineChart className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No data yet. Log your first metrics in the Command Center.</p>
                <Button variant="link" size="sm" className="mt-2" onClick={() => window.location.href = "/command-center"}>
                  Go to Command Center →
                </Button>
              </div>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {revenueByDay.map((d, i) => {
                  const rev = Number(d.revenue || 0);
                  const h = Math.max((rev / maxRevenue) * 100, 4);
                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex-1 bg-primary/60 rounded-t hover:bg-primary transition-colors cursor-help"
                          style={{ height: `${h}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-mono">{d.date}: ${rev.toFixed(2)}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Breakdown Table */}
        {metrics.dailyData.length > 0 && (
          <Card className="bg-card/40 backdrop-blur-md border-border/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left p-3 text-xs text-muted-foreground font-medium">Date</th>
                      <th className="text-right p-3 text-xs text-muted-foreground font-medium">Visitors</th>
                      <th className="text-right p-3 text-xs text-muted-foreground font-medium">Opt-ins</th>
                      <th className="text-right p-3 text-xs text-muted-foreground font-medium">Sales</th>
                      <th className="text-right p-3 text-xs text-muted-foreground font-medium">Revenue</th>
                      <th className="text-right p-3 text-xs text-muted-foreground font-medium">Conv %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.dailyData.slice(-14).reverse().map((d, i) => {
                      const conv = d.visitors > 0 ? ((d.sales / d.visitors) * 100).toFixed(1) : "0.0";
                      return (
                        <tr key={i} className="border-b border-border/10 hover:bg-secondary/30">
                          <td className="p-3 font-mono text-xs">{d.date}</td>
                          <td className="p-3 text-right">{d.visitors}</td>
                          <td className="p-3 text-right">{d.optins}</td>
                          <td className="p-3 text-right font-medium">{d.sales}</td>
                          <td className="p-3 text-right font-medium text-green-500">${Number(d.revenue).toFixed(2)}</td>
                          <td className="p-3 text-right">{conv}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
