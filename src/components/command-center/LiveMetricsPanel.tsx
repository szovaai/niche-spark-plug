import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Activity, BarChart3, DollarSign, Users, Eye, Mail,
  Plus, TrendingUp, TrendingDown, ArrowUpRight, CalendarDays
} from "lucide-react";

interface MetricRow {
  id: string;
  date: string;
  visitors: number;
  optins: number;
  sales: number;
  revenue: number;
  refunds: number;
  upsell_sales: number;
  upsell_revenue: number;
  affiliate_clicks: number;
  email_opens: number;
  email_clicks: number;
}

interface Props {
  projectId: string;
  userId: string;
  onMetricsLoaded?: (metrics: MetricRow[]) => void;
}

export default function LiveMetricsPanel({ projectId, userId, onMetricsLoaded }: Props) {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputOpen, setInputOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    visitors: "", optins: "", sales: "", revenue: "",
    refunds: "", upsell_sales: "", upsell_revenue: "",
    affiliate_clicks: "", email_opens: "", email_clicks: "",
  });

  useEffect(() => { fetchMetrics(); }, [projectId]);

  const fetchMetrics = async () => {
    const { data } = await supabase
      .from("launch_metrics")
      .select("*")
      .eq("project_id", projectId)
      .order("date", { ascending: false })
      .limit(30) as any;
    const rows = (data || []) as MetricRow[];
    setMetrics(rows);
    onMetricsLoaded?.(rows);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        project_id: projectId,
        date: form.date,
        visitors: Number(form.visitors) || 0,
        optins: Number(form.optins) || 0,
        sales: Number(form.sales) || 0,
        revenue: Number(form.revenue) || 0,
        refunds: Number(form.refunds) || 0,
        upsell_sales: Number(form.upsell_sales) || 0,
        upsell_revenue: Number(form.upsell_revenue) || 0,
        affiliate_clicks: Number(form.affiliate_clicks) || 0,
        email_opens: Number(form.email_opens) || 0,
        email_clicks: Number(form.email_clicks) || 0,
      };
      const { error } = await supabase.from("launch_metrics").upsert(payload, { onConflict: "project_id,date" }) as any;
      if (error) throw error;
      toast.success("Metrics saved!");
      setInputOpen(false);
      setForm({ date: new Date().toISOString().split("T")[0], visitors: "", optins: "", sales: "", revenue: "", refunds: "", upsell_sales: "", upsell_revenue: "", affiliate_clicks: "", email_opens: "", email_clicks: "" });
      fetchMetrics();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally { setSaving(false); }
  };

  // Aggregates
  const totals = metrics.reduce((acc, m) => ({
    visitors: acc.visitors + m.visitors,
    optins: acc.optins + m.optins,
    sales: acc.sales + m.sales,
    revenue: acc.revenue + Number(m.revenue),
    refunds: acc.refunds + m.refunds,
    upsellRevenue: acc.upsellRevenue + Number(m.upsell_revenue),
    emailOpens: acc.emailOpens + m.email_opens,
  }), { visitors: 0, optins: 0, sales: 0, revenue: 0, refunds: 0, upsellRevenue: 0, emailOpens: 0 });

  const convRate = totals.visitors > 0 ? ((totals.sales / totals.visitors) * 100).toFixed(2) : "0";
  const optinRate = totals.visitors > 0 ? ((totals.optins / totals.visitors) * 100).toFixed(1) : "0";
  const hasData = metrics.length > 0;

  // Trend: compare last 2 days
  const trend = (() => {
    if (metrics.length < 2) return null;
    const today = Number(metrics[0]?.revenue || 0);
    const yesterday = Number(metrics[1]?.revenue || 0);
    if (yesterday === 0) return null;
    const pct = ((today - yesterday) / yesterday) * 100;
    return { pct: Math.round(pct), up: pct >= 0 };
  })();

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
            <Activity className="h-3 w-3 text-chart-2/70" /> Live Metrics
          </div>
          <Button variant="outline" size="sm" onClick={() => setInputOpen(true)} className="h-6 px-2 text-[9px] gap-1">
            <Plus className="h-2.5 w-2.5" /> Log Data
          </Button>
        </div>

        {!hasData ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 rounded-lg bg-muted/5 border border-border/10 text-center space-y-2">
            <BarChart3 className="h-8 w-8 text-muted-foreground/20 mx-auto" />
            <p className="text-xs text-muted-foreground/40">No metrics logged yet</p>
            <Button variant="outline" size="sm" onClick={() => setInputOpen(true)} className="text-xs gap-1">
              <Plus className="h-3 w-3" /> Log Your First Day
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/10 text-center">
                <p className="text-[8px] text-muted-foreground/40 uppercase">Total Revenue</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-black text-chart-2">${totals.revenue.toLocaleString()}</span>
                  {trend && (
                    <Badge className={`text-[7px] h-4 px-1 ${trend.up ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                      {trend.up ? <TrendingUp className="h-2 w-2 mr-0.5" /> : <TrendingDown className="h-2 w-2 mr-0.5" />}
                      {Math.abs(trend.pct)}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
                <p className="text-[8px] text-muted-foreground/40 uppercase">Total Sales</p>
                <span className="text-lg font-black text-primary">{totals.sales}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                <p className="text-[8px] text-muted-foreground/40 uppercase">Visitors</p>
                <span className="text-sm font-bold">{totals.visitors.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                <p className="text-[8px] text-muted-foreground/40 uppercase">Conv Rate</p>
                <span className="text-sm font-bold">{convRate}%</span>
              </div>
            </div>

            {/* Mini sparkline-style daily bars */}
            <div className="space-y-1">
              <p className="text-[9px] text-muted-foreground/30 uppercase tracking-wider font-semibold">Daily Revenue (last {Math.min(metrics.length, 7)} days)</p>
              <div className="flex items-end gap-1 h-12">
                {metrics.slice(0, 7).reverse().map((m, i) => {
                  const maxRev = Math.max(...metrics.slice(0, 7).map(x => Number(x.revenue)), 1);
                  const h = Math.max((Number(m.revenue) / maxRev) * 100, 4);
                  return (
                    <motion.div key={m.date} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="flex-1 rounded-t bg-chart-2/40 hover:bg-chart-2/70 transition-colors relative group cursor-default">
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[7px] font-mono text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${Number(m.revenue)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Extra stats */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="p-2 rounded bg-muted/5 border border-border/10 text-center">
                <p className="text-[7px] text-muted-foreground/30 uppercase">Opt-in</p>
                <span className="text-[10px] font-bold">{optinRate}%</span>
              </div>
              <div className="p-2 rounded bg-muted/5 border border-border/10 text-center">
                <p className="text-[7px] text-muted-foreground/30 uppercase">Refunds</p>
                <span className="text-[10px] font-bold">{totals.refunds}</span>
              </div>
              <div className="p-2 rounded bg-muted/5 border border-border/10 text-center">
                <p className="text-[7px] text-muted-foreground/30 uppercase">Upsell $</p>
                <span className="text-[10px] font-bold">${totals.upsellRevenue}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Input Dialog */}
      <Dialog open={inputOpen} onOpenChange={setInputOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Log Daily Metrics
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground/50 uppercase block mb-1">Date</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "visitors", label: "Visitors", icon: Eye },
                { key: "optins", label: "Opt-ins", icon: Users },
                { key: "sales", label: "Sales", icon: DollarSign },
                { key: "revenue", label: "Revenue ($)", icon: DollarSign },
                { key: "refunds", label: "Refunds", icon: TrendingDown },
                { key: "upsell_sales", label: "Upsell Sales", icon: ArrowUpRight },
                { key: "upsell_revenue", label: "Upsell Revenue ($)", icon: DollarSign },
                { key: "email_opens", label: "Email Opens", icon: Mail },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[9px] font-semibold text-muted-foreground/40 uppercase block mb-0.5">{field.label}</label>
                  <Input type="number" placeholder="0"
                    value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              <Activity className="h-4 w-4" /> {saving ? "Saving..." : "Save Metrics"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
