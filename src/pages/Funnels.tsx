import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Globe, FileText, ShoppingCart, ArrowUpRight, Gift, Heart,
  AlertTriangle, ChevronRight, Zap, Target, DollarSign,
  Users, TrendingDown, Sparkles, Eye, Wand2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// --- Types ---
interface FunnelNode {
  id: string;
  label: string;
  icon: any;
  conversionKey: string;
  defaultConversion: number;
  wizardStep: number;
  statusCheck: (p: any) => "ready" | "partial" | "missing";
}

interface FunnelTemplate {
  name: string;
  description: string;
  conversions: Record<string, number>;
}

const FUNNEL_NODES: FunnelNode[] = [
  {
    id: "traffic", label: "Traffic Source", icon: Globe, conversionKey: "traffic",
    defaultConversion: 100, wizardStep: 5,
    statusCheck: (p) => p?.step4_marketing ? "ready" : "missing",
  },
  {
    id: "optin", label: "Opt-in Page", icon: Users, conversionKey: "optin",
    defaultConversion: 40, wizardStep: 4,
    statusCheck: (p) => {
      const f = p?.step3_funnel;
      return f?.optInPage ? "ready" : f ? "partial" : "missing";
    },
  },
  {
    id: "sales", label: "Sales Page", icon: FileText, conversionKey: "sales",
    defaultConversion: 3, wizardStep: 4,
    statusCheck: (p) => {
      const f = p?.step3_funnel;
      return f?.salesPage ? "ready" : f ? "partial" : "missing";
    },
  },
  {
    id: "checkout", label: "Checkout", icon: ShoppingCart, conversionKey: "checkout",
    defaultConversion: 70, wizardStep: 4,
    statusCheck: (p) => {
      const f = p?.step3_funnel;
      return f?.checkoutCopy ? "ready" : "missing";
    },
  },
  {
    id: "upsell", label: "Upsell / OTO", icon: ArrowUpRight, conversionKey: "upsell",
    defaultConversion: 25, wizardStep: 4,
    statusCheck: (p) => {
      const f = p?.step3_funnel;
      return f?.upsellOffer ? "ready" : "missing";
    },
  },
  {
    id: "thankyou", label: "Thank You", icon: Heart, conversionKey: "thankyou",
    defaultConversion: 100, wizardStep: 4,
    statusCheck: (p) => {
      const f = p?.step3_funnel;
      return f?.thankYouPage ? "ready" : "missing";
    },
  },
];

const TEMPLATES: FunnelTemplate[] = [
  {
    name: "Simple Sales Page",
    description: "Direct traffic → sales page → checkout. No opt-in or upsell.",
    conversions: { traffic: 100, optin: 100, sales: 4, checkout: 75, upsell: 0, thankyou: 100 },
  },
  {
    name: "Full IM Funnel",
    description: "Opt-in → Sales → Checkout → OTO → Thank You. Standard WarriorPlus flow.",
    conversions: { traffic: 100, optin: 40, sales: 3, checkout: 70, upsell: 25, thankyou: 100 },
  },
  {
    name: "Webinar Funnel",
    description: "High-ticket: Opt-in → Webinar → Offer → Checkout. Higher conversion per sale.",
    conversions: { traffic: 100, optin: 35, sales: 8, checkout: 80, upsell: 30, thankyou: 100 },
  },
];

// --- Glass Card ---
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className={`rounded-xl border border-border/20 bg-card/40 backdrop-blur-xl shadow-[0_4px_30px_-10px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:border-border/40 hover:shadow-[0_8px_40px_-10px_hsl(var(--primary)/0.18)] ${className}`}>
      {children}
    </motion.div>
  );
}

// --- Main ---
export default function Funnels() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkedProjectId = searchParams.get("project");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [initialVisitors, setInitialVisitors] = useState(1000);
  const [fePrice, setFePrice] = useState(17);
  const [upsellPrice, setUpsellPrice] = useState(37);
  const [liveMetrics, setLiveMetrics] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchProjects();
    else setLoading(false);
  }, [user]);

  const fetchProjects = async () => {
    const { data } = await supabase.from("launch_projects").select("*").order("updated_at", { ascending: false });
    const all = data || [];
    setProjects(all);
    // If linked from Command Center, select that project
    const target = linkedProjectId ? all.find((p: any) => p.id === linkedProjectId) : null;
    const selected = target || all[0] || null;
    if (selected) {
      setActiveProject(selected);
      initConversions(selected);
      fetchLiveMetrics(selected.id);
    }
    setLoading(false);
  };

  const fetchLiveMetrics = async (projId: string) => {
    const { data } = await supabase.from("launch_metrics").select("*").eq("project_id", projId).order("date", { ascending: false }).limit(30) as any;
    const rows = data || [];
    setLiveMetrics(rows);
    // Override conversions with real data if available
    if (rows.length > 0) {
      const totals = rows.reduce((acc: any, m: any) => ({
        visitors: acc.visitors + m.visitors,
        optins: acc.optins + m.optins,
        sales: acc.sales + m.sales,
      }), { visitors: 0, optins: 0, sales: 0 });
      if (totals.visitors > 0 && totals.optins > 0) {
        setConversions(prev => ({ ...prev, optin: Math.round((totals.optins / totals.visitors) * 100) }));
      }
      if (totals.optins > 0 && totals.sales > 0) {
        setConversions(prev => ({ ...prev, sales: Math.round((totals.sales / totals.optins) * 100) }));
      }
    }
  };

  const initConversions = (proj: any) => {
    const c: Record<string, number> = {};
    FUNNEL_NODES.forEach(n => { c[n.conversionKey] = n.defaultConversion; });
    setConversions(c);
    const p1 = proj?.step1_product;
    if (p1?.price || p1?.fePrice) setFePrice(p1.price || p1.fePrice || 17);
  };

  const applyTemplate = (t: FunnelTemplate) => {
    setConversions(t.conversions);
  };

  // Calculate visitors at each node
  const nodeMetrics = useMemo(() => {
    const metrics: { id: string; visitors: number; revenue: number; dropOff: number }[] = [];
    let current = initialVisitors;

    FUNNEL_NODES.forEach((node, i) => {
      const conv = conversions[node.conversionKey] ?? node.defaultConversion;
      const entering = current;
      let leaving: number;
      let revenue = 0;

      if (node.id === "traffic") {
        leaving = entering;
      } else if (node.id === "checkout") {
        leaving = Math.round(entering * (conv / 100));
        revenue = leaving * fePrice;
      } else if (node.id === "upsell") {
        leaving = Math.round(entering * (conv / 100));
        revenue = leaving * upsellPrice;
      } else {
        leaving = Math.round(entering * (conv / 100));
      }

      const dropOff = entering - leaving;
      metrics.push({ id: node.id, visitors: entering, revenue, dropOff: node.id === "traffic" ? 0 : dropOff });
      current = leaving;
    });

    return metrics;
  }, [conversions, initialVisitors, fePrice, upsellPrice]);

  const totalRevenue = useMemo(() => nodeMetrics.reduce((s, m) => s + m.revenue, 0), [nodeMetrics]);
  const totalBuyers = useMemo(() => nodeMetrics.find(m => m.id === "checkout")?.visitors ? Math.round((nodeMetrics.find(m => m.id === "sales")?.visitors || 0) * (conversions.checkout || 70) / 100) : 0, [nodeMetrics, conversions]);

  // Weak point = node with biggest drop-off (excluding traffic and thankyou)
  const weakPoint = useMemo(() => {
    const candidates = nodeMetrics.filter(m => m.id !== "traffic" && m.id !== "thankyou" && m.dropOff > 0);
    if (candidates.length === 0) return null;
    return candidates.reduce((max, c) => c.dropOff > max.dropOff ? c : max, candidates[0]);
  }, [nodeMetrics]);

  if (loading) {
    return (
      <DashboardLayout title="Funnel Builder">
        <div className="max-w-7xl mx-auto p-4 space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!activeProject) {
    return (
      <DashboardLayout title="Funnel Builder">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-32 text-center space-y-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/10 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.3)]">
            <Target className="h-10 w-10 text-primary" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold">Visual Funnel Builder</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Start a launch project to visualize and optimize your funnel flow.
            </p>
          </div>
          <Button onClick={() => navigate("/wizard")} className="gap-2">
            <Zap className="h-4 w-4" /> Start New Launch
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors = { ready: "border-chart-2/30 bg-chart-2/8", partial: "border-chart-4/30 bg-chart-4/8", missing: "border-border/20 bg-muted/5" };
  const statusDots = { ready: "bg-chart-2 shadow-[0_0_8px_hsl(var(--chart-2)/0.5)]", partial: "bg-chart-4 shadow-[0_0_8px_hsl(var(--chart-4)/0.5)]", missing: "bg-muted-foreground/30" };

  return (
    <DashboardLayout title="Funnel Builder">
      <div className="max-w-[1440px] mx-auto space-y-5 px-3 sm:px-5 pb-12">
        {/* Header */}
        <GlassCard className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {projects.length > 1 ? (
                    <select value={activeProject.id}
                      onChange={e => { const p = projects.find((x: any) => x.id === e.target.value); if (p) { setActiveProject(p); initConversions(p); }}}
                      className="text-base font-bold bg-transparent border-none text-foreground focus:outline-none cursor-pointer max-w-[280px] truncate">
                      {projects.map((p: any) => <option key={p.id} value={p.id} className="bg-card text-foreground">{(p.step1_product as any)?.title || p.name}</option>)}
                    </select>
                  ) : (
                    <h1 className="text-base font-bold">{(activeProject.step1_product as any)?.title || activeProject.name}</h1>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/40">
                  Visual funnel flow with conversion simulation
                  {liveMetrics.length > 0 && <Badge className="ml-2 text-[8px] h-4 bg-chart-2/10 text-chart-2 border-chart-2/20">🟢 Live Data Active</Badge>}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${activeProject.id}`)} className="gap-1.5 text-xs h-9">
                <Wand2 className="h-3 w-3" /> Edit in Wizard
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/command-center/${activeProject.id}`)} className="gap-1.5 text-xs h-9">
                <Eye className="h-3 w-3" /> Command Center
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Funnel Templates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map(t => (
            <GlassCard key={t.name} className="p-4 cursor-pointer" >
              <button onClick={() => applyTemplate(t)} className="w-full text-left">
                <h4 className="text-sm font-bold mb-1">{t.name}</h4>
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">{t.description}</p>
              </button>
            </GlassCard>
          ))}
        </div>

        {/* Main Funnel Visualization */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-6">
            <Target className="h-3 w-3 text-primary/70" /> Funnel Flow
          </div>

          {/* Node Flow */}
          <div className="flex items-start gap-0 overflow-x-auto pb-4">
            {FUNNEL_NODES.map((node, i) => {
              const Icon = node.icon;
              const status = node.statusCheck(activeProject);
              const metrics = nodeMetrics.find(m => m.id === node.id);
              const conv = conversions[node.conversionKey] ?? node.defaultConversion;
              const isWeak = weakPoint?.id === node.id;

              return (
                <div key={node.id} className="flex items-start min-w-[140px]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex flex-col items-center w-[140px] p-3 rounded-xl border transition-all ${statusColors[status]} ${isWeak ? "ring-2 ring-destructive/30 shadow-[0_0_20px_-5px_hsl(var(--destructive)/0.3)]" : ""}`}
                  >
                    {/* Status Dot */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className={`w-2 h-2 rounded-full ${statusDots[status]} animate-pulse`} />
                      <span className="text-[8px] uppercase font-bold text-muted-foreground/40">
                        {status === "ready" ? "Ready" : status === "partial" ? "Partial" : "Missing"}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      status === "ready" ? "bg-chart-2/15 text-chart-2" : status === "partial" ? "bg-chart-4/15 text-chart-4" : "bg-muted/15 text-muted-foreground/40"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Label */}
                    <span className="text-xs font-bold text-center mb-2">{node.label}</span>

                    {/* Visitors */}
                    <div className="text-center mb-2">
                      <span className="text-lg font-black text-foreground">{(metrics?.visitors || 0).toLocaleString()}</span>
                      <span className="text-[9px] text-muted-foreground/40 block">visitors</span>
                    </div>

                    {/* Revenue */}
                    {(metrics?.revenue || 0) > 0 && (
                      <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-[10px] mb-2">
                        ${(metrics?.revenue || 0).toLocaleString()}
                      </Badge>
                    )}

                    {/* Drop-off */}
                    {isWeak && (
                      <div className="flex items-center gap-1 text-[9px] text-destructive mb-2">
                        <TrendingDown className="h-3 w-3" />
                        <span>-{metrics?.dropOff.toLocaleString()} lost</span>
                      </div>
                    )}

                    {/* Conversion Slider */}
                    {node.id !== "traffic" && node.id !== "thankyou" && (
                      <div className="w-full mt-1">
                        <div className="flex items-center justify-between text-[8px] text-muted-foreground/40 mb-1">
                          <span>Conv.</span>
                          <span className="font-bold text-foreground/70">{conv}%</span>
                        </div>
                        <Slider
                          value={[conv]}
                          onValueChange={([v]) => setConversions(prev => ({ ...prev, [node.conversionKey]: v }))}
                          min={0} max={100} step={1}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Navigate */}
                    {status !== "ready" && (
                      <Button variant="ghost" size="sm"
                        onClick={() => navigate(`/wizard/${activeProject.id}?step=${node.wizardStep}`)}
                        className="mt-2 text-[9px] h-6 px-2 gap-1 text-primary">
                        Build <ChevronRight className="h-3 w-3" />
                      </Button>
                    )}
                  </motion.div>

                  {/* Connector Arrow */}
                  {i < FUNNEL_NODES.length - 1 && (
                    <div className="flex items-center self-center pt-8 px-1">
                      <div className="w-6 h-px bg-primary/20" />
                      <ChevronRight className="h-3 w-3 text-primary/30 -ml-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Bottom: Controls + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Traffic & Pricing Controls */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4">
              <Globe className="h-3 w-3 text-primary/70" /> Traffic & Pricing
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground/60">Initial Visitors</span>
                  <span className="font-bold">{initialVisitors.toLocaleString()}</span>
                </div>
                <Slider value={[initialVisitors]} onValueChange={([v]) => setInitialVisitors(v)} min={100} max={10000} step={100} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground/60">Front-End Price</span>
                  <span className="font-bold">${fePrice}</span>
                </div>
                <Slider value={[fePrice]} onValueChange={([v]) => setFePrice(v)} min={5} max={97} step={1} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground/60">Upsell Price</span>
                  <span className="font-bold">${upsellPrice}</span>
                </div>
                <Slider value={[upsellPrice]} onValueChange={([v]) => setUpsellPrice(v)} min={7} max={197} step={1} />
              </div>
            </div>
          </GlassCard>

          {/* Weak Point Detector */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4">
              <AlertTriangle className="h-3 w-3 text-destructive/70" /> Weak Point Detector
            </div>
            {weakPoint ? (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/15">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-bold text-destructive">
                      {FUNNEL_NODES.find(n => n.id === weakPoint.id)?.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    This stage loses <span className="font-bold text-destructive">{weakPoint.dropOff.toLocaleString()}</span> visitors — the biggest leak in your funnel.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-[10px] text-muted-foreground/50 uppercase font-semibold mb-1">💡 Fix Suggestion</p>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    {weakPoint.id === "optin" && "Try a stronger lead magnet or simplify the opt-in form to one field."}
                    {weakPoint.id === "sales" && "Improve your headline hook, add urgency, or include more proof/testimonials."}
                    {weakPoint.id === "checkout" && "Add trust badges, reduce form fields, or include a money-back guarantee."}
                    {weakPoint.id === "upsell" && "Make the upsell complement the main offer. Try a 'done-for-you' angle."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 text-chart-2/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground/40">No weak points detected!</p>
              </div>
            )}
          </GlassCard>

          {/* Revenue Summary */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4">
              <DollarSign className="h-3 w-3 text-chart-2/70" /> Revenue Summary
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 text-center">
                <p className="text-[9px] text-muted-foreground/40 uppercase mb-1">Total Projected Revenue</p>
                <p className="text-3xl font-black text-chart-2">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                  <p className="text-[8px] text-muted-foreground/40 uppercase">Buyers</p>
                  <p className="text-lg font-bold">{totalBuyers.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                  <p className="text-[8px] text-muted-foreground/40 uppercase">Conv. Rate</p>
                  <p className="text-lg font-bold">{initialVisitors > 0 ? ((totalBuyers / initialVisitors) * 100).toFixed(2) : 0}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                  <p className="text-[8px] text-muted-foreground/40 uppercase">FE Revenue</p>
                  <p className="text-sm font-bold text-chart-2">${(nodeMetrics.find(m => m.id === "checkout")?.revenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                  <p className="text-[8px] text-muted-foreground/40 uppercase">Upsell Rev</p>
                  <p className="text-sm font-bold text-chart-2">${(nodeMetrics.find(m => m.id === "upsell")?.revenue || 0).toLocaleString()}</p>
                </div>
              </div>
              <Separator className="opacity-10" />
              <div className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                <p className="text-[8px] text-muted-foreground/40 uppercase">Revenue Per Visitor</p>
                <p className="text-lg font-bold text-primary">${initialVisitors > 0 ? (totalRevenue / initialVisitors).toFixed(2) : "0.00"}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
