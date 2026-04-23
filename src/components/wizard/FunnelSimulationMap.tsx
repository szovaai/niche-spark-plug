import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye, Users, ShoppingCart, TrendingUp, AlertTriangle,
  CheckCircle2, Zap, ArrowDown, DollarSign, BarChart3,
  Mail, Globe, Megaphone, Gift, CreditCard, Target,
  Lightbulb, ChevronDown, ChevronUp
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FunnelNode {
  id: string;
  label: string;
  type: "traffic" | "conversion" | "automation" | "delivery";
  icon: React.ElementType;
  visitors: number;
  conversions: number;
  rate: number;
  revenue: number;
  status: "strong" | "average" | "weak";
  suggestion?: string;
}

interface SimScenario {
  label: string;
  traffic: number;
  optinRate: number;
  salesRate: number;
  upsellRate: number;
}

const SCENARIOS: Record<string, SimScenario> = {
  conservative: { label: "Conservative", traffic: 500,   optinRate: 0.25, salesRate: 0.02, upsellRate: 0.15 },
  average:      { label: "Average",      traffic: 1000,  optinRate: 0.35, salesRate: 0.04, upsellRate: 0.25 },
  aggressive:   { label: "Optimistic",   traffic: 5000,  optinRate: 0.45, salesRate: 0.06, upsellRate: 0.35 },
  viral:        { label: "Viral Launch",  traffic: 10000, optinRate: 0.40, salesRate: 0.05, upsellRate: 0.30 },
};

const BLUEPRINT_LIBRARY = [
  { id: "lead-magnet",  label: "Lead Magnet Funnel",  pages: ["traffic","optin","email","sales","checkout","thankyou","delivery"], emoji: "📧" },
  { id: "simple",       label: "Simple Product",       pages: ["traffic","sales","checkout","upsell","thankyou","delivery"], emoji: "🎯" },
  { id: "affiliate",    label: "Affiliate Launch",     pages: ["traffic","sales","checkout","thankyou","delivery","affiliate"], emoji: "🤝" },
  { id: "full-launch",  label: "Full Launch Funnel",   pages: ["traffic","optin","email","sales","checkout","upsell","downsell","thankyou","delivery","affiliate"], emoji: "🚀" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  price?: number;
  upsellPrice?: number;
  hasOptIn?: boolean;
  hasUpsell?: boolean;
  hasAffiliate?: boolean;
}

export default function FunnelSimulationMap({
  price = 17,
  upsellPrice = 47,
  hasOptIn = true,
  hasUpsell = true,
  hasAffiliate = false,
}: Props) {
  const [scenario, setScenario] = useState<string>("average");
  const [customTraffic, setCustomTraffic] = useState<number>(1000);
  const [useCustom, setUseCustom] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState("full-launch");
  const [showTips, setShowTips] = useState(true);

  const sc = SCENARIOS[scenario];
  const traffic = useCustom ? customTraffic : sc.traffic;

  /* ---- Simulation ---- */
  const sim = useMemo(() => {
    const optins  = Math.round(traffic * (hasOptIn ? sc.optinRate : 1));
    const sales   = Math.round((hasOptIn ? optins : traffic) * sc.salesRate);
    const upsells = hasUpsell ? Math.round(sales * sc.upsellRate) : 0;

    const mainRev    = sales * price;
    const upsellRev  = upsells * upsellPrice;
    const totalRev   = mainRev + upsellRev;

    return { traffic, optins, sales, upsells, mainRev, upsellRev, totalRev };
  }, [traffic, sc, price, upsellPrice, hasOptIn, hasUpsell]);

  /* ---- Funnel nodes ---- */
  const nodes: FunnelNode[] = useMemo(() => {
    const list: FunnelNode[] = [];

    list.push({
      id: "traffic", label: "Traffic Sources", type: "traffic", icon: Globe,
      visitors: sim.traffic, conversions: sim.traffic, rate: 1, revenue: 0,
      status: sim.traffic < 200 ? "weak" : sim.traffic < 1000 ? "average" : "strong",
      suggestion: sim.traffic < 500 ? "Consider running paid ads or affiliate promos to boost traffic." : undefined,
    });

    if (hasOptIn) {
      const rate = sim.optins / sim.traffic;
      list.push({
        id: "optin", label: "Opt-In Page", type: "conversion", icon: Mail,
        visitors: sim.traffic, conversions: sim.optins, rate, revenue: 0,
        status: rate < 0.25 ? "weak" : rate < 0.40 ? "average" : "strong",
        suggestion: rate < 0.30 ? "Strengthen your headline or add a curiosity hook to boost opt-ins." : undefined,
      });
      list.push({
        id: "email", label: "Email Follow-Up", type: "automation", icon: Mail,
        visitors: sim.optins, conversions: sim.optins, rate: 1, revenue: 0,
        status: "average",
      });
    }

    const salesVisitors = hasOptIn ? sim.optins : sim.traffic;
    const salesRate = salesVisitors > 0 ? sim.sales / salesVisitors : 0;
    list.push({
      id: "sales", label: "Sales Page", type: "conversion", icon: Eye,
      visitors: salesVisitors, conversions: sim.sales, rate: salesRate, revenue: sim.mainRev,
      status: salesRate < 0.03 ? "weak" : salesRate < 0.05 ? "average" : "strong",
      suggestion: salesRate < 0.03 ? "Add social proof, strengthen your mechanism section, or test a different headline." : undefined,
    });

    list.push({
      id: "checkout", label: "Checkout", type: "conversion", icon: CreditCard,
      visitors: sim.sales, conversions: sim.sales, rate: 1, revenue: sim.mainRev,
      status: "strong",
    });

    if (hasUpsell) {
      const uRate = sim.sales > 0 ? sim.upsells / sim.sales : 0;
      list.push({
        id: "upsell", label: "Upsell (OTO)", type: "conversion", icon: ShoppingCart,
        visitors: sim.sales, conversions: sim.upsells, rate: uRate, revenue: sim.upsellRev,
        status: uRate < 0.20 ? "weak" : uRate < 0.30 ? "average" : "strong",
        suggestion: uRate < 0.20 ? "Lower the upsell price or add more perceived value." : undefined,
      });
    }

    list.push({
      id: "thankyou", label: "Thank You Page", type: "delivery", icon: CheckCircle2,
      visitors: sim.sales, conversions: sim.sales, rate: 1, revenue: 0,
      status: "strong",
    });

    list.push({
      id: "delivery", label: "Bonus Delivery", type: "delivery", icon: Gift,
      visitors: sim.sales, conversions: sim.sales, rate: 1, revenue: 0,
      status: "strong",
    });

    if (hasAffiliate) {
      list.push({
        id: "affiliate", label: "Affiliate Page", type: "traffic", icon: Users,
        visitors: 0, conversions: 0, rate: 0, revenue: 0,
        status: "average",
      });
    }

    return list;
  }, [sim, hasOptIn, hasUpsell, hasAffiliate]);

  const weakNodes = nodes.filter(n => n.status === "weak");

  /* ---- Status colors ---- */
  const statusColor = (s: string) =>
    s === "strong" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
    : s === "weak" ? "bg-destructive/20 border-destructive/40 text-destructive"
    : "bg-accent/20 border-accent/40 text-accent";

  const statusDot = (s: string) =>
    s === "strong" ? "bg-emerald-500" : s === "weak" ? "bg-destructive" : "bg-accent";

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center gap-3 border-b border-border/50">
          <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">LaunchFlow Visualizer</h3>
            <p className="text-sm text-muted-foreground">See your funnel performance before going live</p>
          </div>
          {weakNodes.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" /> {weakNodes.length} weak point{weakNodes.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* ---- Controls ---- */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Scenario</label>
              <Select value={scenario} onValueChange={v => { setScenario(v); setUseCustom(false); }}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SCENARIOS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-muted-foreground">
                Custom Traffic: {customTraffic.toLocaleString()} visitors
              </label>
              <Slider
                value={[customTraffic]}
                onValueChange={v => { setCustomTraffic(v[0]); setUseCustom(true); }}
                min={100} max={50000} step={100}
                className="py-2"
              />
            </div>
          </div>

          {/* ---- Revenue Summary ---- */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Traffic",     value: sim.traffic.toLocaleString(),  icon: Globe,        color: "text-blue-400" },
              { label: "Sales",       value: sim.sales.toLocaleString(),    icon: ShoppingCart,  color: "text-emerald-400" },
              { label: "Main Rev",    value: `$${sim.mainRev.toLocaleString()}`,  icon: DollarSign, color: "text-primary" },
              { label: "Total Rev",   value: `$${sim.totalRev.toLocaleString()}`, icon: TrendingUp, color: "text-accent" },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-xl bg-card border border-border text-center">
                <m.icon className={`w-4 h-4 mx-auto mb-1 ${m.color}`} />
                <div className="text-lg font-bold">{m.value}</div>
                <div className="text-[10px] text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>

          {/* ---- Visual Funnel Map ---- */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Funnel Flow</h4>
            <div className="relative">
              {nodes.map((node, i) => (
                <div key={node.id}>
                  {/* Node */}
                  <div className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${statusColor(node.status)}`}>
                    {/* Status dot */}
                    <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${statusDot(node.status)} ring-2 ring-background`} />

                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                      <node.icon className="w-4 h-4" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{node.label}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          {node.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{node.visitors.toLocaleString()} in</span>
                        <span>→</span>
                        <span>{node.conversions.toLocaleString()} out</span>
                        {node.rate < 1 && node.rate > 0 && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">
                            {(node.rate * 100).toFixed(1)}%
                          </Badge>
                        )}
                        {node.revenue > 0 && (
                          <span className="text-primary font-semibold">${node.revenue.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Warning */}
                    {node.status === "weak" && (
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    {node.status === "strong" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>

                  {/* Connector arrow */}
                  {i < nodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ---- Weak Point Alerts ---- */}
          {weakNodes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                Weak Points Detected
              </h4>
              {weakNodes.map(n => (
                <div key={n.id} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                  <Target className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-sm">{n.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">({(n.rate * 100).toFixed(1)}% conversion)</span>
                    {n.suggestion && (
                      <p className="text-xs text-muted-foreground mt-1">{n.suggestion}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---- Optimization Tips ---- */}
          <div>
            <Button variant="ghost" size="sm" onClick={() => setShowTips(!showTips)} className="gap-1.5 text-muted-foreground">
              <Lightbulb className="w-3.5 h-3.5" />
              {showTips ? "Hide" : "Show"} Optimization Tips
              {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
            {showTips && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {[
                  { tip: "Add exit intent popup to capture abandoning visitors", impact: "+5-15% opt-ins" },
                  { tip: "Add countdown timer to create urgency on sales page", impact: "+10-20% conversions" },
                  { tip: "Stack 3+ bonuses to increase perceived value", impact: "+15-25% sales" },
                  { tip: "Add a 30-day money-back guarantee badge", impact: "+8-12% trust" },
                  { tip: "Use curiosity-driven email subject lines", impact: "+20-40% open rates" },
                  { tip: "Price upsell at 2-3x the front-end offer", impact: "+30% rev per customer" },
                ].map((t, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/50 border border-border flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs leading-snug">{t.tip}</p>
                      <Badge variant="secondary" className="text-[9px] mt-1 px-1.5 py-0">{t.impact}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---- Blueprint Library ---- */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Funnel Blueprints</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BLUEPRINT_LIBRARY.map(bp => (
                <button
                  key={bp.id}
                  onClick={() => setSelectedBlueprint(bp.id)}
                  className={`text-left p-3 rounded-xl border-2 transition-all text-xs ${
                    selectedBlueprint === bp.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className="text-lg mb-1">{bp.emoji}</div>
                  <div className="font-semibold">{bp.label}</div>
                  <div className="text-muted-foreground mt-0.5">{bp.pages.length} steps</div>
                </button>
              ))}
            </div>
          </div>

          {/* ---- Scenario Comparison ---- */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scenario Comparison</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Scenario</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Traffic</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Opt-ins</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Sales</th>
                    <th className="text-right py-2 pl-2 text-muted-foreground font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SCENARIOS).map(([k, s]) => {
                    const o = Math.round(s.traffic * (hasOptIn ? s.optinRate : 1));
                    const sl = Math.round((hasOptIn ? o : s.traffic) * s.salesRate);
                    const u = hasUpsell ? Math.round(sl * s.upsellRate) : 0;
                    const rev = sl * price + u * upsellPrice;
                    return (
                      <tr key={k} className={`border-b border-border/50 ${scenario === k && !useCustom ? "bg-primary/10" : ""}`}>
                        <td className="py-2 pr-3 font-medium">{s.label}</td>
                        <td className="text-right py-2 px-2">{s.traffic.toLocaleString()}</td>
                        <td className="text-right py-2 px-2">{o.toLocaleString()}</td>
                        <td className="text-right py-2 px-2">{sl.toLocaleString()}</td>
                        <td className="text-right py-2 pl-2 font-semibold text-primary">${rev.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
