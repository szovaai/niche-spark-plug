import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Activity, DollarSign, Users, Eye, TrendingUp, Target,
  ChevronDown, ChevronRight, AlertTriangle, Lightbulb,
  ArrowDown, Zap, ShoppingCart, Gift, Mail, Globe,
  BarChart3, Sparkles, RefreshCw, Rocket, Brain, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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

// Launch Score ring
function LaunchScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "hsl(var(--chart-2))" : score >= 50 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))";
  const label = score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Needs Work";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" opacity="0.15" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-black"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {score}
          </motion.span>
          <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <p className="text-xs font-semibold mt-1" style={{ color }}>{label}</p>
      <p className="text-[10px] text-muted-foreground/50">Launch Potential</p>
    </div>
  );
}

// Score breakdown bar
function ScoreBreakdown({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-[11px] text-muted-foreground/60">{label}</span>
        <span className="text-[11px] font-bold">{value}</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

const trafficSources = [
  { value: "warriorplus", label: "Affiliate Network Traffic", avgConv: 5 },
  { value: "organic", label: "Organic Traffic", avgConv: 2 },
  { value: "pinterest", label: "Pinterest", avgConv: 2.5 },
  { value: "tiktok", label: "TikTok", avgConv: 1.5 },
  { value: "email", label: "Email List", avgConv: 8 },
  { value: "youtube", label: "YouTube", avgConv: 4 },
  { value: "facebook-ads", label: "Facebook Ads", avgConv: 3 },
];

export default function FunnelSimulation() {
  const [visitors, setVisitors] = useState(1000);
  const [trafficSource, setTrafficSource] = useState("warriorplus");
  const [salesRate, setSalesRate] = useState(3);
  const [price, setPrice] = useState(17);
  const [affiliateCommission, setAffiliateCommission] = useState(50);
  const [refundRate, setRefundRate] = useState(5);
  const [upsellRate, setUpsellRate] = useState(25);
  const [upsellPrice, setUpsellPrice] = useState(37);
  const [optimized, setOptimized] = useState(false);

  // Calculations
  const buyers = Math.round(visitors * (salesRate / 100));
  const grossRevenue = buyers * price;
  const affiliatePayout = Math.round(grossRevenue * (affiliateCommission / 100));
  const netAfterAffiliate = grossRevenue - affiliatePayout;
  const refunds = Math.round(netAfterAffiliate * (refundRate / 100));
  const netRevenue = netAfterAffiliate - refunds;
  const upsellBuyers = Math.round(buyers * (upsellRate / 100));
  const upsellRevenue = upsellBuyers * upsellPrice;
  const upsellAffiliatePayout = Math.round(upsellRevenue * (affiliateCommission / 100));
  const netUpsellRevenue = upsellRevenue - upsellAffiliatePayout;
  const totalRevenue = netRevenue + netUpsellRevenue;
  const epc = visitors > 0 ? (grossRevenue + upsellRevenue) / visitors : 0;

  // Launch Success Score
  const launchScore = useMemo(() => {
    const demandStrength = Math.min(100, Math.round(
      (salesRate / 5) * 40 + (visitors / 5000) * 30 + (price >= 17 && price <= 47 ? 30 : 15)
    ));
    const competitionScore = Math.round(
      affiliateCommission >= 50 ? 70 : affiliateCommission >= 30 ? 50 : 30
    );
    const offerValue = Math.round(
      (salesRate >= 3 ? 40 : 20) + (upsellRate >= 20 ? 30 : 15) + (refundRate <= 5 ? 30 : 15)
    );
    const trafficViability = Math.round(
      (visitors >= 1000 ? 50 : visitors / 20) + (epc >= 1 ? 35 : epc * 35) + 15
    );
    const overall = Math.min(100, Math.round((demandStrength + competitionScore + offerValue + trafficViability) / 4));
    return { overall, demandStrength, competitionScore, offerValue, trafficViability };
  }, [salesRate, visitors, price, affiliateCommission, upsellRate, refundRate, epc]);

  // Traffic projection table
  const projections = useMemo(() => {
    return [100, 500, 1000, 2500, 5000, 10000].map(v => {
      const b = Math.round(v * (salesRate / 100));
      const gr = b * price;
      const ap = Math.round(gr * (affiliateCommission / 100));
      const nr = gr - ap - Math.round((gr - ap) * (refundRate / 100));
      const ub = Math.round(b * (upsellRate / 100));
      const ur = ub * upsellPrice;
      const uap = Math.round(ur * (affiliateCommission / 100));
      const total = nr + (ur - uap);
      return { visitors: v, sales: b, revenue: total };
    });
  }, [salesRate, price, affiliateCommission, refundRate, upsellRate, upsellPrice]);

  // AI Insights
  const insights = useMemo(() => {
    const tips: { text: string; type: "success" | "warning" | "tip" }[] = [];
    const src = trafficSources.find(s => s.value === trafficSource);
    if (src) {
      if (salesRate > src.avgConv * 1.5) tips.push({ text: `Your ${salesRate}% conversion is optimistic for ${src.label}. Average is ~${src.avgConv}%.`, type: "warning" });
      else if (salesRate >= src.avgConv) tips.push({ text: `Your conversion rate is realistic for ${src.label} traffic.`, type: "success" });
    }
    if (price <= 17) tips.push({ text: `$${price} is a strong impulse buy price. Great for first-time buyers.`, type: "success" });
    if (price > 47) tips.push({ text: "Higher price points need stronger proof and bonuses. Make sure your sales page converts.", type: "warning" });
    if (upsellRate < 20) tips.push({ text: `Adding a one-time-offer countdown could boost your ${upsellRate}% upsell rate to 25-30%.`, type: "tip" });
    if (affiliateCommission < 50) tips.push({ text: "Raising affiliate commission to 50%+ attracts more affiliates from networks like ClickBank and Gumroad.", type: "tip" });
    if (affiliateCommission >= 50) tips.push({ text: "50%+ commission makes your offer attractive to affiliate marketers.", type: "success" });
    if (refundRate > 10) tips.push({ text: "Refund rate above 10% signals offer-market mismatch. Strengthen your delivery.", type: "warning" });
    if (epc >= 1) tips.push({ text: `Your EPC of $${epc.toFixed(2)} is competitive for affiliate recruitment.`, type: "success" });
    else tips.push({ text: `EPC of $${epc.toFixed(2)} is below $1. Affiliates prefer $1+ EPC.`, type: "tip" });
    const potentialUpsellIncrease = Math.round(((upsellPrice * (upsellRate / 100)) / price) * 100);
    if (potentialUpsellIncrease < 50) tips.push({ text: `Adding a $${Math.round(price * 2.5)} upsell could increase revenue by 40-60%.`, type: "tip" });
    return tips;
  }, [salesRate, price, trafficSource, upsellRate, upsellPrice, affiliateCommission, refundRate, epc]);

  // Weak points
  const weakPoints = useMemo(() => {
    const points: { title: string; description: string; severity: "high" | "medium" | "low" }[] = [];
    if (salesRate < 2) points.push({ title: "Low Conversion", description: "Below 2% conversion. Strengthen your headline and add proof elements.", severity: "high" });
    if (price < 10) points.push({ title: "Price Too Low", description: "Under $10 makes profitability difficult. Test $17-$27.", severity: "medium" });
    if (visitors < 500) points.push({ title: "Insufficient Traffic", description: "Under 500 visitors won't validate. Focus on one traffic channel.", severity: "high" });
    if (refundRate > 10) points.push({ title: "High Refund Rate", description: "Above 10% refunds signals a problem with delivery or expectations.", severity: "high" });
    if (upsellRate < 15) points.push({ title: "Weak Upsell", description: "Add urgency and a clear value step-up to boost upsell take rate.", severity: "medium" });
    if (points.length === 0) points.push({ title: "Looking Good!", description: "No critical weak points detected.", severity: "low" });
    return points;
  }, [salesRate, price, visitors, refundRate, upsellRate]);

  // Funnel nodes
  const funnelNodes: FunnelNodeData[] = useMemo(() => [
    { id: "traffic", label: "Traffic", icon: Globe, conversionLabel: `${trafficSources.find(s => s.value === trafficSource)?.label}`, value: visitors, color: "bg-primary/10 text-primary" },
    { id: "sales", label: "Sales Page", icon: Target, conversionLabel: `${salesRate}% conversion`, value: buyers, revenue: grossRevenue, color: "bg-chart-2/10 text-chart-2",
      details: [
        { label: "Gross Revenue", value: `$${grossRevenue.toLocaleString()}` },
        { label: "Affiliate Payout", value: `-$${affiliatePayout.toLocaleString()}` },
        { label: "Refunds", value: `-$${refunds.toLocaleString()}` },
        { label: "Net Front-End", value: `$${netRevenue.toLocaleString()}` },
      ] },
    { id: "upsell", label: "Upsell / OTO", icon: Gift, conversionLabel: `${upsellRate}% take rate`, value: upsellBuyers, revenue: upsellRevenue, color: "bg-accent/10 text-accent",
      details: [
        { label: "Upsell Price", value: `$${upsellPrice}` },
        { label: "Upsell Revenue", value: `$${upsellRevenue.toLocaleString()}` },
        { label: "After Commission", value: `$${netUpsellRevenue.toLocaleString()}` },
      ] },
    { id: "profit", label: "Total Profit", icon: DollarSign, conversionLabel: "After all deductions", value: buyers, revenue: totalRevenue, color: "bg-chart-2/10 text-chart-2",
      details: [
        { label: "EPC", value: `$${epc.toFixed(2)}` },
        { label: "Net per Sale", value: `$${buyers > 0 ? (totalRevenue / buyers).toFixed(2) : "0"}` },
      ] },
  ], [visitors, trafficSource, salesRate, buyers, grossRevenue, affiliatePayout, refunds, netRevenue, upsellRate, upsellBuyers, upsellPrice, upsellRevenue, netUpsellRevenue, totalRevenue, epc]);

  // Optimize handler
  const handleOptimize = () => {
    setOptimized(true);
    // Suggest better values
    if (price < 19) setPrice(19);
    if (affiliateCommission < 60) setAffiliateCommission(60);
    if (upsellPrice < 47) setUpsellPrice(47);
    if (upsellRate < 25) setUpsellRate(25);
    toast.success("Launch optimized! Check the updated projections.");
  };

  const controls = [
    { label: "Visitors", value: visitors, set: (v: number[]) => setVisitors(v[0]), min: 100, max: 10000, step: 100, icon: Eye },
    { label: "Conversion Rate", value: salesRate, set: (v: number[]) => setSalesRate(v[0]), min: 0.5, max: 15, step: 0.5, icon: TrendingUp, suffix: "%" },
    { label: "Product Price", value: price, set: (v: number[]) => setPrice(v[0]), min: 7, max: 97, step: 1, icon: DollarSign, prefix: "$" },
    { label: "Affiliate Commission", value: affiliateCommission, set: (v: number[]) => setAffiliateCommission(v[0]), min: 0, max: 75, step: 5, icon: Users, suffix: "%" },
    { label: "Refund Rate", value: refundRate, set: (v: number[]) => setRefundRate(v[0]), min: 0, max: 20, step: 1, icon: RefreshCw, suffix: "%" },
    { label: "Upsell Price", value: upsellPrice, set: (v: number[]) => setUpsellPrice(v[0]), min: 17, max: 197, step: 1, icon: Gift, prefix: "$" },
    { label: "Upsell Take Rate", value: upsellRate, set: (v: number[]) => setUpsellRate(v[0]), min: 5, max: 50, step: 1, icon: Activity, suffix: "%" },
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
              <p className="text-xs text-muted-foreground/50">Predict your launch outcome before you build</p>
            </div>
          </div>
        </motion.div>

        {/* Top Revenue Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Projected Sales", value: `${buyers}`, color: "text-primary", bg: "from-primary/5 to-primary/0", icon: ShoppingCart },
            { label: "Gross Revenue", value: `$${grossRevenue.toLocaleString()}`, color: "text-chart-2", bg: "from-chart-2/5 to-chart-2/0", icon: DollarSign },
            { label: "Affiliate Payout", value: `$${affiliatePayout.toLocaleString()}`, color: "text-chart-4", bg: "from-chart-4/5 to-chart-4/0", icon: Users },
            { label: "After Refunds", value: `$${netRevenue.toLocaleString()}`, color: "text-accent", bg: "from-accent/5 to-accent/0", icon: RefreshCw },
            { label: "Total Profit", value: `$${totalRevenue.toLocaleString()}`, color: "text-chart-2", bg: "from-chart-2/5 to-chart-2/0", icon: Sparkles },
          ].map((card) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border border-border/20 bg-gradient-to-br ${card.bg} backdrop-blur-md p-4 text-center`}>
              <card.icon className={`h-4 w-4 mx-auto mb-1.5 ${card.color} opacity-50`} />
              <p className={`text-lg font-black ${card.color}`}>{card.value}</p>
              <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mt-0.5">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left: Inputs */}
          <div className="xl:col-span-4 space-y-3">
            <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-chart-4/70" /> Simulation Controls
            </h3>

            {/* Traffic Source Dropdown */}
            <Card className="bg-card/40 backdrop-blur-md border-border/20">
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-primary/50" />
                  <span className="text-xs font-medium">Traffic Source</span>
                </div>
                <Select value={trafficSource} onValueChange={setTrafficSource}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trafficSources.map(s => (
                      <SelectItem key={s.value} value={s.value} className="text-xs">
                        {s.label} <span className="text-muted-foreground ml-1">(~{s.avgConv}% avg)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

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

            {/* Run Simulation / Optimize */}
            <Button onClick={handleOptimize} variant="hero" className="w-full gap-2">
              <Rocket className="w-4 h-4" />
              Optimize My Launch
            </Button>
          </div>

          {/* Center: Funnel + Projection */}
          <div className="xl:col-span-4 space-y-4">
            {/* Funnel */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                <Target className="h-3 w-3 text-accent/70" /> Funnel Flow
              </h3>
              <div className="space-y-0">
                {funnelNodes.map((node, i) => (
                  <FunnelNodeBlock key={node.id} node={node} isLast={i === funnelNodes.length - 1} />
                ))}
              </div>
            </div>

            {/* Traffic vs Revenue Table */}
            <Card className="bg-card/40 backdrop-blur-md border-border/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                  <BarChart3 className="h-3 w-3 text-primary/70" /> Profit Forecast
                </h3>
                <div className="space-y-1.5">
                  {projections.map((p) => {
                    const isActive = p.visitors === visitors;
                    return (
                      <motion.div
                        key={p.visitors}
                        whileHover={{ x: 3 }}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                          isActive ? "border-primary/30 bg-primary/5" : "border-border/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground/60 w-16">{p.visitors.toLocaleString()} vis</span>
                          <span className="text-muted-foreground/40">→</span>
                          <span className="font-medium">{p.sales} sales</span>
                        </div>
                        <span className={`font-bold ${isActive ? "text-primary" : "text-foreground/70"}`}>
                          ${p.revenue.toLocaleString()}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Score + Insights + Weak Points */}
          <div className="xl:col-span-4 space-y-4">
            {/* Launch Success Score */}
            <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-border/20">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-chart-2/70" /> Launch Success Score
                </h3>
                <LaunchScoreRing score={launchScore.overall} />
                <div className="space-y-2.5 pt-2">
                  <ScoreBreakdown label="Demand Strength" value={launchScore.demandStrength} />
                  <ScoreBreakdown label="Competition" value={launchScore.competitionScore} />
                  <ScoreBreakdown label="Offer Value" value={launchScore.offerValue} />
                  <ScoreBreakdown label="Traffic Viability" value={launchScore.trafficViability} />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-card/40 backdrop-blur-md border-border/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                  <Brain className="h-3 w-3 text-primary/70" /> AI Insights
                </h3>
                <div className="space-y-2">
                  {insights.map((insight, i) => {
                    const iconMap = {
                      success: <CheckCircle2 className="h-3.5 w-3.5 text-chart-2 shrink-0 mt-0.5" />,
                      warning: <AlertTriangle className="h-3.5 w-3.5 text-chart-4 shrink-0 mt-0.5" />,
                      tip: <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />,
                    };
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted/5"
                      >
                        {iconMap[insight.type]}
                        <p className="text-[11px] text-muted-foreground/80">{insight.text}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
