import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Activity, DollarSign, Users, Eye, TrendingUp, Target,
  ChevronDown, ChevronRight, AlertTriangle, Lightbulb,
  ArrowDown, Zap, ShoppingCart, Gift, Mail, Share2, Globe,
  BarChart3, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AnimatedNum({ value, prefix = "" }: { value: number; prefix?: string }) {
  return <span>{prefix}{value.toLocaleString()}</span>;
}

// --- Funnel Node ---
interface FunnelNodeData {
  id: string;
  label: string;
  icon: typeof Target;
  conversionLabel: string;
  value: number;
  revenue?: number;
  details?: { label: string; value: string }[];
  color: string;
}

function FunnelNodeBlock({ node, isLast }: { node: FunnelNodeData; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        whileHover={{ scale: 1.02, x: 4 }}
        onClick={() => setExpanded(!expanded)}
        className={`w-full max-w-sm cursor-pointer rounded-xl border transition-all ${
          expanded ? "border-primary/30 bg-primary/5 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)]" : "border-border/20 bg-card/40 backdrop-blur-md hover:border-primary/20"
        }`}
      >
        <div className="p-4 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${node.color}`}>
            <node.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{node.label}</p>
            <p className="text-[10px] text-muted-foreground/50">{node.conversionLabel}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold">{node.value.toLocaleString()}</p>
            {node.revenue !== undefined && (
              <p className="text-[10px] text-chart-2 font-mono">${node.revenue.toLocaleString()}</p>
            )}
          </div>
          {node.details && (
            expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/30" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
          )}
        </div>

        <AnimatePresence>
          {expanded && node.details && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 border-t border-border/10 space-y-2">
                {node.details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground/60">{d.label}</span>
                    <span className="text-[11px] font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!isLast && (
        <div className="flex flex-col items-center py-1">
          <div className="w-px h-4 bg-primary/20" />
          <ArrowDown className="h-3 w-3 text-primary/30" />
        </div>
      )}
    </div>
  );
}

// --- Weak Point Card ---
function WeakPointCard({ title, description, severity }: { title: string; description: string; severity: "high" | "medium" | "low" }) {
  const colors = {
    high: "border-destructive/20 bg-destructive/5 text-destructive",
    medium: "border-chart-4/20 bg-chart-4/5 text-chart-4",
    low: "border-primary/20 bg-primary/5 text-primary",
  };
  return (
    <motion.div whileHover={{ x: 3 }} className={`p-3 rounded-lg border ${colors[severity]} flex items-start gap-2.5`}>
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold">{title}</p>
        <p className="text-[10px] opacity-70 mt-0.5">{description}</p>
      </div>
      <Badge variant="outline" className="shrink-0 text-[8px] ml-auto">{severity}</Badge>
    </motion.div>
  );
}

export default function FunnelSimulation() {
  const [visitors, setVisitors] = useState(3000);
  const [optinRate, setOptinRate] = useState(30);
  const [salesRate, setSalesRate] = useState(3);
  const [price, setPrice] = useState(27);
  const [upsellRate, setUpsellRate] = useState(12);
  const [upsellPrice, setUpsellPrice] = useState(47);

  const leads = Math.round(visitors * (optinRate / 100));
  const buyers = Math.round(leads * (salesRate / 100));
  const upsells = Math.round(buyers * (upsellRate / 100));
  const feRevenue = buyers * price;
  const upsellRevenue = upsells * upsellPrice;
  const totalRevenue = feRevenue + upsellRevenue;
  const epc = visitors > 0 ? (totalRevenue / visitors).toFixed(2) : "0.00";

  // Funnel nodes
  const funnelNodes: FunnelNodeData[] = useMemo(() => [
    {
      id: "traffic", label: "Traffic Sources", icon: Globe, conversionLabel: "100% reach",
      value: visitors, color: "bg-primary/10 text-primary",
      details: [
        { label: "Primary", value: "TikTok / Reels" },
        { label: "Secondary", value: "Pinterest, YouTube Shorts" },
        { label: "Backup", value: "Email List" },
      ],
    },
    {
      id: "optin", label: "Opt-in Page", icon: Mail, conversionLabel: `${optinRate}% conversion`,
      value: leads, color: "bg-chart-4/10 text-chart-4",
      details: [
        { label: "Opt-in Rate", value: `${optinRate}%` },
        { label: "Leads Captured", value: leads.toLocaleString() },
        { label: "Lead Magnet", value: "Free checklist / guide" },
      ],
    },
    {
      id: "sales", label: "Sales Page", icon: Target, conversionLabel: `${salesRate}% conversion`,
      value: buyers, revenue: feRevenue, color: "bg-chart-2/10 text-chart-2",
      details: [
        { label: "Price Point", value: `$${price}` },
        { label: "Conversion Rate", value: `${salesRate}%` },
        { label: "Buyers", value: buyers.toLocaleString() },
        { label: "Front-End Revenue", value: `$${feRevenue.toLocaleString()}` },
      ],
    },
    {
      id: "upsell", label: "Upsell / OTO", icon: Gift, conversionLabel: `${upsellRate}% take rate`,
      value: upsells, revenue: upsellRevenue, color: "bg-accent/10 text-accent",
      details: [
        { label: "Upsell Price", value: `$${upsellPrice}` },
        { label: "Take Rate", value: `${upsellRate}%` },
        { label: "Upsell Buyers", value: upsells.toLocaleString() },
        { label: "Upsell Revenue", value: `$${upsellRevenue.toLocaleString()}` },
      ],
    },
    {
      id: "thankyou", label: "Thank You Page", icon: Sparkles, conversionLabel: "Delivery + next steps",
      value: buyers, color: "bg-primary/10 text-primary",
      details: [
        { label: "Total Customers", value: buyers.toLocaleString() },
        { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}` },
        { label: "EPC", value: `$${epc}` },
      ],
    },
  ], [visitors, optinRate, salesRate, price, upsellRate, upsellPrice, leads, buyers, upsells, feRevenue, upsellRevenue, totalRevenue, epc]);

  // Weak points
  const weakPoints = useMemo(() => {
    const points: { title: string; description: string; severity: "high" | "medium" | "low" }[] = [];
    if (salesRate < 2) points.push({ title: "Low Sales Conversion", description: "Your sales conversion is below 2%. Strengthen your headline, add more proof, or lower your price.", severity: "high" });
    if (price < 17) points.push({ title: "Price Too Low", description: "At this price you need massive volume. Consider testing $27-$47 for better margins.", severity: "medium" });
    if (optinRate < 20) points.push({ title: "Weak Opt-in Rate", description: "Below 20% opt-in suggests a weak lead magnet. Try a more specific, results-oriented freebie.", severity: "high" });
    if (upsellRate < 10) points.push({ title: "Low Upsell Take Rate", description: "Add a one-time-offer countdown or bundle discount to boost upsell conversions.", severity: "medium" });
    if (visitors < 500) points.push({ title: "Insufficient Traffic", description: "Under 500 visitors makes it hard to validate. Focus on one traffic source first.", severity: "high" });
    if (price > 47 && salesRate > 3) points.push({ title: "Strong Setup", description: "Good price/conversion combo. Consider adding a downsell for non-buyers.", severity: "low" });
    if (points.length === 0) points.push({ title: "Looking Good!", description: "No critical weak points detected. Your funnel setup is solid.", severity: "low" });
    return points;
  }, [salesRate, price, optinRate, upsellRate, visitors]);

  const controls = [
    { label: "Visitors", value: visitors, set: (v: number[]) => setVisitors(v[0]), min: 100, max: 10000, step: 100, icon: Eye },
    { label: "Opt-in Rate", value: optinRate, set: (v: number[]) => setOptinRate(v[0]), min: 5, max: 60, step: 1, icon: Users, suffix: "%" },
    { label: "Sales Conversion", value: salesRate, set: (v: number[]) => setSalesRate(v[0]), min: 0.5, max: 10, step: 0.5, icon: TrendingUp, suffix: "%" },
    { label: "Front-End Price", value: price, set: (v: number[]) => setPrice(v[0]), min: 7, max: 97, step: 1, icon: DollarSign, prefix: "$" },
    { label: "Upsell Take Rate", value: upsellRate, set: (v: number[]) => setUpsellRate(v[0]), min: 5, max: 40, step: 1, icon: Activity, suffix: "%" },
    { label: "Upsell Price", value: upsellPrice, set: (v: number[]) => setUpsellPrice(v[0]), min: 17, max: 197, step: 1, icon: DollarSign, prefix: "$" },
  ];

  return (
    <DashboardLayout title="Launch Simulation">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]">
              <BarChart3 className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Launch Simulation Engine</h1>
              <p className="text-xs text-muted-foreground/50">Model your funnel, forecast profit, detect weak points</p>
            </div>
          </div>
        </motion.div>

        {/* Top Revenue Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Front-End", value: feRevenue, color: "text-primary", bg: "from-primary/5 to-primary/0", icon: ShoppingCart },
            { label: "Upsell", value: upsellRevenue, color: "text-accent", bg: "from-accent/5 to-accent/0", icon: Gift },
            { label: "Total Revenue", value: totalRevenue, color: "text-chart-2", bg: "from-chart-2/5 to-chart-2/0", icon: DollarSign },
            { label: "EPC", value: parseFloat(epc), color: "text-chart-4", bg: "from-chart-4/5 to-chart-4/0", icon: TrendingUp, isEpc: true },
          ].map((card) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border border-border/20 bg-gradient-to-br ${card.bg} backdrop-blur-md p-4 text-center`}>
              <card.icon className={`h-4 w-4 mx-auto mb-1.5 ${card.color} opacity-50`} />
              <p className={`text-xl font-black ${card.color}`}>
                {(card as any).isEpc ? `$${card.value.toFixed(2)}` : `$${card.value.toLocaleString()}`}
              </p>
              <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mt-0.5">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left: Sliders */}
          <div className="xl:col-span-4 space-y-3">
            <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-chart-4/70" /> Scenario Controls
            </h3>
            {controls.map((ctrl) => (
              <Card key={ctrl.label} className="bg-card/40 backdrop-blur-md border-border/20">
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ctrl.icon className="h-3.5 w-3.5 text-primary/50" />
                      <span className="text-xs font-medium">{ctrl.label}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{ctrl.prefix || ""}{ctrl.value}{ctrl.suffix || ""}</span>
                  </div>
                  <Slider value={[ctrl.value]} onValueChange={ctrl.set} min={ctrl.min} max={ctrl.max} step={ctrl.step} className="w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Center: Visual Funnel */}
          <div className="xl:col-span-4 space-y-3">
            <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
              <Target className="h-3 w-3 text-accent/70" /> Visual Funnel Builder
            </h3>
            <div className="space-y-0">
              {funnelNodes.map((node, i) => (
                <FunnelNodeBlock key={node.id} node={node} isLast={i === funnelNodes.length - 1} />
              ))}
            </div>
          </div>

          {/* Right: Profit Map + Weak Points */}
          <div className="xl:col-span-4 space-y-4">
            {/* Profit Map Flow */}
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <DollarSign className="h-3 w-3 text-chart-2/70" /> Profit Map
              </h3>
              <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-border/20">
                <CardContent className="p-4 space-y-3">
                  {[
                    { label: "Traffic", value: visitors.toLocaleString(), sub: "visitors", icon: Eye, barPct: 100 },
                    { label: "Leads", value: leads.toLocaleString(), sub: `${optinRate}% opted in`, icon: Users, barPct: (leads / visitors) * 100 },
                    { label: "Buyers", value: buyers.toLocaleString(), sub: `${salesRate}% converted`, icon: ShoppingCart, barPct: (buyers / visitors) * 100 },
                    { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, sub: `$${epc} per visitor`, icon: DollarSign, barPct: 100, highlight: true },
                  ].map((row, i) => (
                    <motion.div key={row.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <div className="flex items-center gap-3 mb-1">
                        <row.icon className={`h-3.5 w-3.5 shrink-0 ${row.highlight ? "text-chart-2" : "text-muted-foreground/40"}`} />
                        <span className="text-xs font-medium flex-1">{row.label}</span>
                        <span className={`text-sm font-bold ${row.highlight ? "text-chart-2" : "text-foreground"}`}>{row.value}</span>
                      </div>
                      <div className="ml-6 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted/15 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(row.barPct, 1)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.15 }}
                            className={`h-full rounded-full ${row.highlight ? "bg-chart-2" : "bg-primary/40"}`}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground/35 w-20 text-right">{row.sub}</span>
                      </div>
                      {i < 3 && (
                        <div className="flex justify-center py-1">
                          <ArrowDown className="h-2.5 w-2.5 text-border/30" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Weak Point Detector */}
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <AlertTriangle className="h-3 w-3 text-chart-4/70" /> Weak Point Detector
              </h3>
              <div className="space-y-2">
                {weakPoints.map((wp, i) => (
                  <WeakPointCard key={i} {...wp} />
                ))}
              </div>
            </div>

            {/* Scenario Comparison */}
            <Card className="bg-card/40 backdrop-blur-md border-border/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                  <Lightbulb className="h-3 w-3 text-primary/70" /> Scenario Comparison
                </h3>
                {[
                  { label: "Low Ticket ($17)", p: 17, conv: salesRate + 1, traffic: visitors },
                  { label: "Mid Ticket ($27)", p: 27, conv: salesRate, traffic: visitors },
                  { label: "High Ticket ($47)", p: 47, conv: Math.max(salesRate - 0.5, 0.5), traffic: visitors },
                  { label: "Premium ($97)", p: 97, conv: Math.max(salesRate - 1, 0.5), traffic: visitors },
                ].map((s) => {
                  const sLeads = Math.round(s.traffic * (optinRate / 100));
                  const sSales = Math.round(sLeads * (s.conv / 100));
                  const sRev = sSales * s.p;
                  return (
                    <motion.div key={s.label} whileHover={{ x: 3 }}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-default ${
                        s.p === price ? "border-primary/30 bg-primary/5" : "border-border/10 bg-muted/5"
                      }`}>
                      <div>
                        <span className="text-[11px] font-medium">{s.label}</span>
                        <span className="text-[9px] text-muted-foreground/35 ml-2">{s.conv}% conv</span>
                      </div>
                      <span className={`text-sm font-bold ${s.p === price ? "text-primary" : "text-foreground/70"}`}>${sRev.toLocaleString()}</span>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
