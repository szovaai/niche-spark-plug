import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Rocket, Sparkles, TrendingUp, DollarSign, Users, Eye,
  CheckCircle2, Circle, ArrowRight, Zap, Target, BarChart3,
  Package, FileText, Mail, Share2, ChevronRight, AlertTriangle,
  Lightbulb, Play, Wand2, Globe, Monitor, Clock,
  Shield, Star, Activity, Gauge, Bot, RefreshCw,
  Radio, ArrowUpRight, Flame, Brain, ShieldAlert, Navigation,
  Import, Upload
} from "lucide-react";
import LiveMetricsPanel from "@/components/command-center/LiveMetricsPanel";

// --- Types ---
interface ProjectData {
  id: string; name: string; niche: string | null; target_audience: string | null;
  product_type: string | null; topic: string | null; current_step: number; status: string;
  step1_product: any; step2_product_content: any; step2_assets: any;
  step3_funnel: any; step4_marketing: any; step5_checklist: any;
  buyer_avatar: any; created_at: string; updated_at: string;
}

type ScenarioMode = "conservative" | "standard" | "aggressive";

// --- Pipeline ---
const PIPELINE = [
  { key: "idea", label: "Idea", icon: Lightbulb, check: (p: ProjectData) => !!p.niche },
  { key: "product", label: "Product", icon: Package, check: (p: ProjectData) => !!p.step1_product },
  { key: "content", label: "Content", icon: FileText, check: (p: ProjectData) => !!p.step2_product_content },
  { key: "assets", label: "Assets", icon: Sparkles, check: (p: ProjectData) => !!p.step2_assets && Object.keys(p.step2_assets).length > 1 },
  { key: "funnel", label: "Funnel", icon: Target, check: (p: ProjectData) => !!p.step3_funnel },
  { key: "marketing", label: "Promote", icon: Mail, check: (p: ProjectData) => !!p.step4_marketing },
  { key: "deploy", label: "Deploy", icon: Rocket, check: (p: ProjectData) => p.status === "deployed" },
];

// --- Funnel checklist wizard step mapping ---
const FUNNEL_WIZARD_MAP: Record<string, number> = {
  "Offer Created": 1,
  "Headline Written": 1,
  "Sales Page Drafted": 4,
  "Bonus Stack Created": 4,
  "Upsell Created": 4,
  "Checkout Assets Ready": 3,
  "Email Follow-up Ready": 5,
  "Thank You Page Ready": 4,
};

// --- Animated Number ---
function AnimatedNumber({ value, prefix = "", suffix = "", className = "" }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    if (diff === 0) { setDisplay(value); return; }
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value]);
  return <span className={className}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// --- Status Dot ---
function StatusDot({ status }: { status: "healthy" | "warning" | "weak" | "inactive" }) {
  const colors = {
    healthy: "bg-chart-2 shadow-[0_0_8px_hsl(var(--chart-2)/0.5)]",
    warning: "bg-chart-4 shadow-[0_0_8px_hsl(var(--chart-4)/0.5)]",
    weak: "bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.5)]",
    inactive: "bg-muted-foreground/30",
  };
  return <div className={`w-2 h-2 rounded-full shrink-0 ${colors[status]} animate-pulse`} />;
}

// --- Glass Card ---
function GlassCard({ children, className = "", glow = "" }: { children: React.ReactNode; className?: string; glow?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border border-border/20 bg-card/40 backdrop-blur-xl shadow-[0_4px_30px_-10px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:border-border/40 hover:shadow-[0_8px_40px_-10px_hsl(var(--primary)/0.18)] ${glow} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// --- Circular Gauge ---
function CircularGauge({ score, label, size = 120, strokeWidth = 7 }: { score: number; label: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "hsl(var(--chart-2))" : score >= 40 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))";
  const glowColor = score >= 70 ? "var(--chart-2)" : score >= 40 ? "var(--chart-4)" : "var(--destructive)";

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--muted)/0.12)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px hsl(${glowColor}/0.4))` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={score} className="text-3xl font-black text-foreground" />
        <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest mt-0.5">{label}</span>
      </div>
    </div>
  );
}

// --- Deploy Animation ---
const DeploySequence = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const steps = ["Initializing launch sequence...", "Building funnel pages...", "Generating graphics...", "Injecting sales copy...", "Connecting payment link...", "Publishing site..."];
  useEffect(() => {
    if (step < steps.length) {
      const t = setTimeout(() => setStep(s => s + 1), 1100);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onComplete, 1000);
      return () => clearTimeout(t);
    }
  }, [step]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-card/80 backdrop-blur-md border border-border/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_80px_-20px_hsl(var(--primary)/0.3)] space-y-6">
        <div className="text-center space-y-3">
          <motion.div animate={{ rotate: step >= steps.length ? 0 : 360 }}
            transition={{ duration: 2, repeat: step >= steps.length ? 0 : Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto border border-primary/20">
            <Rocket className="h-7 w-7 text-primary" />
          </motion.div>
          <h2 className="text-lg font-bold">Deploying Launch</h2>
          <Progress value={(step / steps.length) * 100} className="h-1" />
        </div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.06 }} className="flex items-center gap-3">
              {i < step ? <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" /> :
               i === step ? <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" /> :
               <Circle className="h-4 w-4 text-muted-foreground/20 shrink-0" />}
              <span className={`text-sm ${i < step ? "text-chart-2" : i === step ? "text-foreground" : "text-muted-foreground/30"}`}>{s}</span>
            </motion.div>
          ))}
        </div>
        {step >= steps.length && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="text-center pt-2 space-y-2">
            <div className="text-4xl">🚀</div>
            <Badge className="bg-chart-2 text-chart-2-foreground text-sm px-6 py-2 shadow-[0_0_20px_hsl(var(--chart-2)/0.4)]">Launch Live!</Badge>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// --- Funnel Readiness Item (with clickable navigation) ---
function FunnelCheckItem({ label, status, delay = 0, onClick }: { label: string; status: "complete" | "in_progress" | "missing"; delay?: number; onClick?: () => void }) {
  const colors = {
    complete: "border-chart-2/15 bg-chart-2/4",
    in_progress: "border-chart-4/15 bg-chart-4/4",
    missing: "border-border/10 bg-muted/3",
  };
  const icons = {
    complete: <CheckCircle2 className="h-3.5 w-3.5 text-chart-2 shrink-0" />,
    in_progress: <div className="h-3.5 w-3.5 rounded-full border-2 border-chart-4 border-t-transparent animate-spin shrink-0" />,
    missing: <Circle className="h-3.5 w-3.5 text-muted-foreground/20 shrink-0" />,
  };
  const isClickable = status !== "complete" && !!onClick;
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      onClick={isClickable ? onClick : undefined}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${colors[status]} ${isClickable ? "cursor-pointer hover:border-primary/30 hover:bg-primary/5 group" : ""}`}>
      {icons[status]}
      <span className={`text-[11px] font-medium ${status === "missing" ? "text-muted-foreground/40" : "text-foreground/80"}`}>{label}</span>
      {isClickable && (
        <ArrowRight className="h-3 w-3 text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
      )}
      {!isClickable && (
        <Badge variant="outline" className={`ml-auto text-[8px] h-4 px-1.5 ${
          status === "complete" ? "border-chart-2/20 text-chart-2" :
          status === "in_progress" ? "border-chart-4/20 text-chart-4" :
          "border-border/15 text-muted-foreground/30"
        }`}>
          {status === "complete" ? "Done" : status === "in_progress" ? "In Progress" : "Missing"}
        </Badge>
      )}
    </motion.div>
  );
}

// --- Main ---
export default function CommandCenter() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [scenario, setScenario] = useState<ScenarioMode>("standard");
  const [agentInsights, setAgentInsights] = useState<Array<{ text: string; type: "success" | "warning" | "info"; agentName?: string }>>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState<any[]>([]);

  // Rotating recommendations
  const [activeActionIdx, setActiveActionIdx] = useState(0);

  // Import modal
  const [importOpen, setImportOpen] = useState(false);
  const [importIdea, setImportIdea] = useState("");
  const [importNiche, setImportNiche] = useState("");
  const [importAudience, setImportAudience] = useState("");
  const [importPrice, setImportPrice] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (user) fetchProjects();
    else setLoading(false);
  }, [user, projectId]);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase.from("launch_projects").select("*").order("updated_at", { ascending: false });
      const all = (data || []) as unknown as ProjectData[];
      setAllProjects(all);
      const active = projectId ? all.find(p => p.id === projectId) || all[0] || null : all[0] || null;
      setProject(active);
      if (active) fetchAgentInsights(active);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAgentInsights = async (proj: ProjectData) => {
    setAgentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-agent-analyze", { body: { project: proj, useAI: false } });
      if (!error && data?.agents) {
        const insights = data.agents.flatMap((a: any) => a.insights.map((ins: any) => ({ ...ins, agentName: a.agentName })))
          .sort((a: any, b: any) => a.priority - b.priority).slice(0, 6);
        setAgentInsights(insights);
      }
    } catch (e) { console.error("Agent analysis failed:", e); }
    finally { setAgentLoading(false); }
  };

  const runAIEnhance = async () => {
    if (!project) return;
    setAgentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-agent-analyze", { body: { project, useAI: true } });
      if (!error && data?.agents) {
        const insights = data.agents.flatMap((a: any) => a.insights.map((ins: any) => ({ ...ins, agentName: a.agentName })))
          .sort((a: any, b: any) => a.priority - b.priority).slice(0, 8);
        setAgentInsights(insights);
        toast.success("AI agents analyzed your launch");
      }
    } catch (e: any) { toast.error("Agent analysis failed"); }
    finally { setAgentLoading(false); }
  };

  // Import Product Idea
  const handleImport = async () => {
    if (!user || !importIdea.trim()) return;
    setImporting(true);
    try {
      const { data, error } = await supabase.from("launch_projects").insert({
        user_id: user.id,
        name: importIdea.slice(0, 80) || "Imported Idea",
        niche: importNiche || null,
        target_audience: importAudience || null,
        step1_product: {
          title: importIdea.slice(0, 80),
          concept: importIdea,
          price: importPrice ? Number(importPrice) : 17,
        },
        current_step: 1,
      }).select().single();
      if (error) throw error;
      toast.success("Product idea imported!");
      setImportOpen(false);
      setImportIdea(""); setImportNiche(""); setImportAudience(""); setImportPrice("");
      navigate(`/command-center/${data.id}`);
    } catch (e: any) {
      toast.error("Failed to import: " + e.message);
    } finally {
      setImporting(false);
    }
  };

  // --- Computed ---
  const completedStages = useMemo(() => project ? PIPELINE.filter(s => s.check(project)).length : 0, [project]);
  const progressPct = useMemo(() => Math.round((completedStages / PIPELINE.length) * 100), [completedStages]);

  const productName = useMemo(() => {
    if (!project) return "Untitled";
    const p1 = project.step1_product as any;
    return p1?.title || p1?.productTitle || project.name || "Untitled";
  }, [project]);

  const launchScore = useMemo(() => {
    if (!project) return 0;
    let s = 0;
    if (project.step1_product) s += 20;
    if (project.step2_product_content) s += 15;
    if (project.step2_assets && Object.keys(project.step2_assets).length > 1) s += 15;
    if (project.step3_funnel) s += 20;
    if (project.step4_marketing) s += 20;
    if (project.step5_checklist) s += 10;
    return s;
  }, [project]);

  const fePrice = useMemo(() => {
    const p1 = project?.step1_product as any;
    return p1?.price || p1?.fePrice || 17;
  }, [project]);

  const scenarioMultipliers = { conservative: { conv: 0.02, visitors: 500 }, standard: { conv: 0.035, visitors: 1000 }, aggressive: { conv: 0.06, visitors: 3000 } };

  // Use live metrics if available, otherwise use scenario assumptions
  const hasLiveData = liveMetrics.length > 0;
  const liveAggregates = useMemo(() => {
    if (!hasLiveData) return null;
    return liveMetrics.reduce((acc, m) => ({
      visitors: acc.visitors + m.visitors,
      sales: acc.sales + m.sales,
      revenue: acc.revenue + Number(m.revenue),
      refunds: acc.refunds + m.refunds,
      upsellRevenue: acc.upsellRevenue + Number(m.upsell_revenue),
    }), { visitors: 0, sales: 0, revenue: 0, refunds: 0, upsellRevenue: 0 });
  }, [liveMetrics, hasLiveData]);

  const projections = useMemo(() => {
    // If we have live data, use real metrics
    if (hasLiveData && liveAggregates) {
      const realConv = liveAggregates.visitors > 0 ? liveAggregates.sales / liveAggregates.visitors : 0;
      const affiliateRate = 0.5;
      const grossRevenue = liveAggregates.revenue;
      const affiliatePayout = Math.round(grossRevenue * affiliateRate);
      const netRevenue = grossRevenue - affiliatePayout - liveAggregates.refunds * fePrice;
      const totalRevenue = Math.round(netRevenue + liveAggregates.upsellRevenue);
      const breakEvenVisitors = realConv > 0 ? Math.ceil(1 / (realConv * fePrice * (1 - affiliateRate))) : 9999;
      return {
        visitors: liveAggregates.visitors, convRate: realConv,
        grossSales: liveAggregates.sales, grossRevenue: Math.round(grossRevenue),
        affiliatePayout, refunds: liveAggregates.refunds * fePrice,
        netRevenue: Math.round(netRevenue), upsellRevenue: Math.round(liveAggregates.upsellRevenue),
        totalRevenue, breakEvenVisitors,
        upsellPrice: fePrice > 20 ? fePrice * 2.2 : 37,
        isLive: true,
      };
    }
    const m = scenarioMultipliers[scenario];
    const affiliateRate = 0.5;
    const refundRate = 0.05;
    const upsellPrice = fePrice > 20 ? fePrice * 2.2 : 37;
    const upsellTakeRate = 0.2;
    const grossSales = Math.round(m.visitors * m.conv);
    const grossRevenue = Math.round(grossSales * fePrice);
    const affiliatePayout = Math.round(grossRevenue * affiliateRate);
    const netAfterAffiliate = grossRevenue - affiliatePayout;
    const refunds = Math.round(netAfterAffiliate * refundRate);
    const netRevenue = netAfterAffiliate - refunds;
    const upsellRevenue = Math.round(grossSales * upsellTakeRate * upsellPrice);
    const totalRevenue = netRevenue + upsellRevenue;
    const breakEvenVisitors = Math.ceil(1 / (m.conv * fePrice * (1 - affiliateRate) * (1 - refundRate)));
    return { visitors: m.visitors, convRate: m.conv, grossSales, grossRevenue, affiliatePayout, refunds, netRevenue, upsellRevenue, totalRevenue, breakEvenVisitors, upsellPrice, isLive: false };
  }, [fePrice, scenario, hasLiveData, liveAggregates]);

  // Demand / competition / scores
  const demandScore = useMemo(() => project?.step1_product ? (launchScore >= 60 ? 88 : 72) : 0, [project, launchScore]);
  const competitionLevel = useMemo(() => launchScore >= 70 ? "Low" : launchScore >= 40 ? "Medium" : "High", [launchScore]);
  const trendVelocity = useMemo(() => project?.step1_product ? (launchScore >= 50 ? 84 : 61) : 0, [project, launchScore]);

  // Funnel readiness items
  const funnelChecklist = useMemo(() => {
    if (!project) return [];
    const p1 = project.step1_product as any;
    const p3 = project.step3_funnel as any;
    const p4 = project.step4_marketing as any;
    return [
      { label: "Offer Created", status: p1 ? "complete" as const : "missing" as const },
      { label: "Headline Written", status: p1?.title ? "complete" as const : "missing" as const },
      { label: "Sales Page Drafted", status: project.step2_product_content ? "complete" as const : (p1 ? "in_progress" as const : "missing" as const) },
      { label: "Bonus Stack Created", status: p3?.bonusStack || p1?.bonuses ? "complete" as const : (p1 ? "in_progress" as const : "missing" as const) },
      { label: "Upsell Created", status: p3?.upsellOffer ? "complete" as const : "missing" as const },
      { label: "Checkout Assets Ready", status: project.step2_assets && Object.keys(project.step2_assets).length > 2 ? "complete" as const : "missing" as const },
      { label: "Email Follow-up Ready", status: p4?.emails ? "complete" as const : "missing" as const },
      { label: "Thank You Page Ready", status: p3 ? "complete" as const : "missing" as const },
    ];
  }, [project]);

  const funnelCompletion = useMemo(() => {
    const done = funnelChecklist.filter(i => i.status === "complete").length;
    return Math.round((done / Math.max(funnelChecklist.length, 1)) * 100);
  }, [funnelChecklist]);

  // Traffic readiness
  const trafficChecklist = useMemo(() => {
    if (!project) return [];
    const p4 = project.step4_marketing as any;
    return [
      { label: "Affiliate Kit Ready", done: !!p4?.affiliateSwipes },
      { label: "Promo Emails Ready", done: !!p4?.emails },
      { label: "Social Content Ready", done: !!p4?.socialPosts },
      { label: "Short-Form Promo Angles", done: !!p4?.tiktokScripts },
      { label: "Keyword Opportunities", done: !!project.niche },
    ];
  }, [project]);

  const trafficScore = useMemo(() => {
    const done = trafficChecklist.filter(i => i.done).length;
    return Math.round((done / Math.max(trafficChecklist.length, 1)) * 100);
  }, [trafficChecklist]);

  // Risks
  const risks = useMemo(() => {
    if (!project) return [];
    const r: { text: string; severity: "high" | "medium" | "low" }[] = [];
    if (!project.step3_funnel) r.push({ text: "No sales funnel built — critical for conversions", severity: "high" });
    if (!project.step4_marketing) r.push({ text: "No marketing assets — traffic plan incomplete", severity: "high" });
    if (project.step1_product && !project.step2_product_content) r.push({ text: "Product idea exists but content not generated", severity: "medium" });
    if (launchScore < 40) r.push({ text: "Launch score is weak — complete more steps", severity: "high" });
    else if (launchScore < 70) r.push({ text: "Adding bonuses could increase perceived value", severity: "medium" });
    const p3 = project.step3_funnel as any;
    if (p3 && !p3.upsellOffer) r.push({ text: "No upsell detected — adding OTO could boost revenue 30%+", severity: "medium" });
    if (!project.step4_marketing) r.push({ text: "Affiliate appeal is unknown — no promo assets", severity: "medium" });
    if (trafficScore < 40) r.push({ text: "Traffic readiness is low — launch may stall", severity: "high" });
    if (r.length === 0) r.push({ text: "No critical risks detected — launch looks solid! 🚀", severity: "low" });
    return r.slice(0, 6);
  }, [project, launchScore, trafficScore]);

  // --- Rotating Next Best Actions ---
  const rotatingActions = useMemo(() => {
    if (!project) return [];
    const actions: { text: string; cta: string; action: () => void }[] = [];

    if (!project.step1_product) {
      actions.push({ text: "Generate your product idea to begin building your launch.", cta: "Generate Product", action: () => navigate("/wizard") });
    }
    if (!project.step2_product_content) {
      actions.push({ text: "Build your product content — the core asset buyers will receive.", cta: "Build Content", action: () => navigate(`/wizard/${project.id}`) });
    }
    if (!project.step3_funnel) {
      actions.push({ text: "Create your sales funnel to start converting visitors into buyers.", cta: "Build Funnel", action: () => navigate(`/wizard/${project.id}`) });
    }
    if (!project.step4_marketing) {
      actions.push({ text: "Generate marketing assets — emails, social posts, and affiliate swipes.", cta: "Generate Marketing", action: () => navigate(`/wizard/${project.id}`) });
    }
    const p3 = project.step3_funnel as any;
    if (p3 && !p3.upsellOffer) {
      actions.push({ text: "Add a 'Done-For-You Bonus Pack' to improve conversions and affiliate appeal.", cta: "Generate Bonus Pack", action: () => navigate(`/wizard/${project.id}`) });
    }

    // Always add these contextual suggestions
    actions.push({ text: "Visualize your funnel flow and find revenue leaks with the Funnel Builder.", cta: "Open Funnel Builder", action: () => navigate("/funnels") });
    actions.push({ text: "Run a launch simulation to predict revenue under different scenarios.", cta: "Run Simulation", action: () => navigate("/funnel-simulation") });
    actions.push({ text: "Check the Opportunity Radar for trending niches and competitor gaps.", cta: "Scan Opportunities", action: () => navigate("/opportunities") });

    if (actions.length === 0) {
      actions.push({ text: "All systems ready. Review and deploy your launch! 🚀", cta: "Deploy Launch", action: () => handleDeploy() });
    }
    return actions;
  }, [project]);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (rotatingActions.length <= 1) return;
    const timer = setInterval(() => {
      setActiveActionIdx(prev => (prev + 1) % rotatingActions.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [rotatingActions.length]);

  const currentAction = rotatingActions[activeActionIdx % Math.max(rotatingActions.length, 1)] || null;

  // Estimated time to launch
  const estimatedTime = useMemo(() => {
    const remaining = PIPELINE.length - completedStages;
    if (remaining <= 0) return "Ready";
    const hours = (remaining * 0.4).toFixed(1);
    return `~${hours} hours`;
  }, [completedStages]);

  const launchConfidence = useMemo(() => {
    if (launchScore >= 80) return "Very High";
    if (launchScore >= 60) return "High";
    if (launchScore >= 40) return "Moderate";
    return "Low";
  }, [launchScore]);

  const handleDeploy = () => {
    if (progressPct < 60) { toast.error("Complete at least 60% before deploying."); return; }
    setDeploying(true);
  };

  // Profit forecast data for chart
  const forecastData = useMemo(() => {
    const conv = scenarioMultipliers[scenario].conv;
    return [100, 500, 1000, 2000, 5000, 10000].map(v => ({
      visitors: v,
      revenue: Math.round(v * conv * fePrice * 0.5 * 0.95),
    }));
  }, [fePrice, scenario]);

  // --- Score Breakdown ---
  const scoreBreakdown = useMemo(() => [
    { label: "Demand Strength", value: demandScore },
    { label: "Competition", value: competitionLevel === "Low" ? 85 : competitionLevel === "Medium" ? 65 : 40 },
    { label: "Offer Value", value: project?.step1_product ? 80 : 0 },
    { label: "Traffic Viability", value: trafficScore },
  ], [demandScore, competitionLevel, project, trafficScore]);

  // --- Loading ---
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-4 p-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
          <div className="grid grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
        </div>
      </DashboardLayout>
    );
  }

  // --- Empty State ---
  if (!project) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-32 text-center space-y-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/10 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.3)]">
            <Monitor className="h-10 w-10 text-primary" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold">Launch Command Center</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Start by choosing a niche or importing an offer idea. LaunchStack will build your mission control dashboard automatically.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/wizard")} className="gap-2 shadow-[0_0_25px_-5px_hsl(var(--primary)/0.4)]">
              <Rocket className="h-4 w-4" /> Start New Launch
            </Button>
            <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" /> Import Product Idea
            </Button>
            <Button variant="outline" onClick={() => navigate("/research-agent")} className="gap-2">
              <Brain className="h-4 w-4" /> Run AI Research
            </Button>
          </div>
        </div>

        {/* Import Modal */}
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Import Product Idea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground/60 uppercase mb-1 block">Product Idea / Description *</label>
                <Textarea placeholder="Describe your product idea, offer concept, or paste an existing description..." value={importIdea} onChange={e => setImportIdea(e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground/60 uppercase mb-1 block">Niche</label>
                  <Input placeholder="e.g. Weight Loss" value={importNiche} onChange={e => setImportNiche(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground/60 uppercase mb-1 block">Target Audience</label>
                  <Input placeholder="e.g. Busy Moms" value={importAudience} onChange={e => setImportAudience(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground/60 uppercase mb-1 block">Price Point ($)</label>
                <Input type="number" placeholder="17" value={importPrice} onChange={e => setImportPrice(e.target.value)} />
              </div>
              <Button onClick={handleImport} disabled={!importIdea.trim() || importing} className="w-full gap-2">
                <Zap className="h-4 w-4" /> {importing ? "Importing..." : "Import & Build"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AnimatePresence>{deploying && <DeploySequence onComplete={() => { setDeploying(false); toast.success("Launch deployed! 🚀"); }} />}</AnimatePresence>

      <div className="max-w-[1440px] mx-auto space-y-5 px-3 sm:px-5 pb-12">
        {/* ═══════════════ HEADER BAR ═══════════════ */}
        <GlassCard className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <motion.div whileHover={{ rotate: 10 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]">
                <Navigation className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {allProjects.length > 1 ? (
                    <select value={project.id}
                      onChange={e => { const p = allProjects.find(x => x.id === e.target.value); if (p) { setProject(p); navigate(`/command-center/${p.id}`, { replace: true }); }}}
                      className="text-base font-bold bg-transparent border-none text-foreground focus:outline-none cursor-pointer max-w-[280px] truncate">
                      {allProjects.map(p => (<option key={p.id} value={p.id} className="bg-card text-foreground">{(p.step1_product as any)?.title || p.name}</option>))}
                    </select>
                  ) : (
                    <h1 className="text-base font-bold truncate">{productName}</h1>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/40">Your AI-powered mission control for building, validating, and launching profitable digital products.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Scenario Mode */}
              <div className="flex items-center bg-card/60 backdrop-blur-sm border border-border/20 rounded-lg p-0.5">
                {(["conservative", "standard", "aggressive"] as ScenarioMode[]).map(mode => (
                  <button key={mode} onClick={() => setScenario(mode)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-semibold capitalize transition-all ${
                      scenario === mode ? "bg-primary text-primary-foreground shadow-[0_0_12px_-3px_hsl(var(--primary)/0.5)]" : "text-muted-foreground/50 hover:text-foreground/70"
                    }`}>
                    {mode}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${project.id}`)} className="gap-1.5 text-xs h-9"><Wand2 className="h-3 w-3" /> Edit</Button>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" onClick={handleDeploy} disabled={progressPct < 60}
                  className="gap-1.5 text-xs h-9 bg-chart-2 hover:bg-chart-2/90 text-chart-2-foreground shadow-[0_0_25px_-5px_hsl(var(--chart-2)/0.5)]">
                  <Rocket className="h-3.5 w-3.5" /> Deploy Launch
                </Button>
              </motion.div>
            </div>
          </div>
        </GlassCard>

        {/* ═══════════════ 4 HERO METRIC CARDS ═══════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Launch Score",
              value: launchScore,
              suffix: "/100",
              sub: launchConfidence + " Confidence",
              icon: Gauge,
              color: launchScore >= 70 ? "text-chart-2" : launchScore >= 40 ? "text-chart-4" : "text-destructive",
              glow: launchScore >= 70 ? "shadow-[0_0_30px_-8px_hsl(var(--chart-2)/0.3)]" : "",
            },
            {
              label: "Projected Revenue",
              value: projections.totalRevenue,
              prefix: "$",
              sub: `${projections.grossSales} sales • ${(projections.convRate * 100).toFixed(1)}% conv`,
              icon: DollarSign,
              color: "text-chart-2",
              glow: "shadow-[0_0_30px_-8px_hsl(var(--chart-2)/0.2)]",
            },
            {
              label: "Funnel Completion",
              value: funnelCompletion,
              suffix: "%",
              sub: `${funnelChecklist.filter(i => i.status === "complete").length}/${funnelChecklist.length} items ready`,
              icon: Target,
              color: funnelCompletion >= 70 ? "text-chart-2" : "text-chart-4",
              glow: "",
            },
            {
              label: "Traffic Readiness",
              value: trafficScore,
              suffix: "%",
              sub: `${trafficChecklist.filter(i => i.done).length}/${trafficChecklist.length} channels active`,
              icon: Activity,
              color: trafficScore >= 60 ? "text-chart-2" : "text-chart-4",
              glow: "",
            },
          ].map((metric, i) => (
            <GlassCard key={metric.label} className={`p-5 ${metric.glow}`}>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-3">
                <metric.icon className="h-3 w-3 text-primary/60" /> {metric.label}
              </div>
              <div className="flex items-baseline gap-1">
                <AnimatedNumber value={metric.value} prefix={metric.prefix} className={`text-3xl font-black ${metric.color}`} />
                {metric.suffix && <span className="text-sm text-muted-foreground/30 font-bold">{metric.suffix}</span>}
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-1">{metric.sub}</p>
            </GlassCard>
          ))}
        </div>

        {/* ═══════════════ PIPELINE ═══════════════ */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Launch Pipeline</span>
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-primary/20 text-primary">{estimatedTime}</Badge>
            </div>
            <span className="text-[10px] text-muted-foreground/40 font-mono">{completedStages}/{PIPELINE.length}</span>
          </div>
          <Progress value={progressPct} className="h-1.5 mb-3" />
          <div className="flex items-center gap-0.5">
            {PIPELINE.map((stage, i) => {
              const done = stage.check(project);
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex items-center flex-1 min-w-0">
                  <motion.div whileHover={{ y: -3 }}
                    className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-lg transition-all ${done ? "opacity-100" : "opacity-30"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      done ? "bg-primary text-primary-foreground shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)]" : "bg-muted/20 text-muted-foreground"
                    }`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className="text-[9px] font-semibold text-center leading-none">{stage.label}</span>
                  </motion.div>
                  {i < PIPELINE.length - 1 && <div className={`w-6 h-px shrink-0 ${done ? "bg-primary/40" : "bg-border/15"}`} />}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* ═══════════════ MAIN GRID — 3 COLUMNS ═══════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* ══ LEFT COLUMN (8 cols) ══ */}
          <div className="xl:col-span-8 space-y-5">

            {/* Row 1: Opportunity Signal + Revenue Projection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Panel 2: Product Opportunity Signal */}
              <GlassCard className="p-5" glow="hover:shadow-[0_8px_40px_-10px_hsl(var(--primary)/0.18)]">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4">
                  <Radio className="h-3 w-3 text-primary/70" /> Opportunity Signal
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <Badge className={`mb-2 text-[10px] ${
                      demandScore >= 80 ? "bg-chart-2/10 text-chart-2 border-chart-2/20" :
                      demandScore >= 50 ? "bg-chart-4/10 text-chart-4 border-chart-4/20" :
                      "bg-muted/10 text-muted-foreground border-border/20"
                    }`}>
                      {demandScore >= 80 ? "🟢 Strong Signal" : demandScore >= 50 ? "🟡 Moderate" : "⚪ Weak"}
                    </Badge>
                    <h3 className="text-sm font-bold mb-1">{project.niche || "No niche set"}</h3>
                    <p className="text-[11px] text-muted-foreground/50">{project.target_audience || "General audience"}</p>
                  </div>
                  <CircularGauge score={demandScore} label="Demand" size={80} strokeWidth={5} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Demand", value: `${demandScore}/100`, color: "text-chart-2" },
                    { label: "Competition", value: competitionLevel, color: competitionLevel === "Low" ? "text-chart-2" : competitionLevel === "Medium" ? "text-chart-4" : "text-destructive" },
                    { label: "Trend Velocity", value: `${trendVelocity}/100`, color: "text-primary" },
                  ].map(item => (
                    <div key={item.label} className="text-center p-2.5 rounded-lg bg-muted/5 border border-border/10">
                      <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-[8px] text-muted-foreground/40 uppercase mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Panel 5: Revenue Projection */}
              <GlassCard className="p-5" glow="hover:shadow-[0_8px_40px_-10px_hsl(var(--chart-2)/0.18)]">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4">
                  <DollarSign className="h-3 w-3 text-chart-2/70" /> Revenue Projection
                  <Badge variant="outline" className="ml-auto text-[8px] h-4 px-1.5 capitalize border-primary/20 text-primary">{scenario}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "Gross Revenue", value: projections.grossRevenue, prefix: "$" },
                    { label: "Affiliate Pay", value: projections.affiliatePayout, prefix: "-$" },
                    { label: "Net Revenue", value: projections.netRevenue, prefix: "$" },
                    { label: "Upsell Revenue", value: projections.upsellRevenue, prefix: "+$" },
                  ].map(item => (
                    <div key={item.label} className="p-2.5 rounded-lg bg-muted/5 border border-border/10">
                      <p className="text-[8px] text-muted-foreground/40 uppercase">{item.label}</p>
                      <AnimatedNumber value={item.value} prefix={item.prefix} className="text-sm font-bold text-foreground" />
                    </div>
                  ))}
                </div>
                <Separator className="opacity-10 my-3" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-muted-foreground/40 uppercase">Total Projected</p>
                    <AnimatedNumber value={projections.totalRevenue} prefix="$" className="text-2xl font-black text-chart-2" />
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground/40 uppercase">Break-Even</p>
                    <AnimatedNumber value={projections.breakEvenVisitors} className="text-lg font-bold text-primary" suffix=" vis" />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Row 2: Funnel Readiness + Traffic Activation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Panel 3: Funnel Readiness — now clickable */}
              <GlassCard className="p-5" glow="hover:shadow-[0_8px_40px_-10px_hsl(var(--accent)/0.15)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                    <Target className="h-3 w-3 text-accent/70" /> Funnel Readiness
                  </div>
                  <span className="text-xs font-bold text-accent">{funnelCompletion}%</span>
                </div>
                <Progress value={funnelCompletion} className="h-1 mb-3" />
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {funnelChecklist.map((item, i) => (
                    <FunnelCheckItem
                      key={item.label}
                      label={item.label}
                      status={item.status}
                      delay={i * 0.05}
                      onClick={item.status !== "complete" ? () => navigate(`/wizard/${project.id}?step=${FUNNEL_WIZARD_MAP[item.label] || 1}`) : undefined}
                    />
                  ))}
                </div>
              </GlassCard>

              {/* Panel 4: Traffic Activation */}
              <GlassCard className="p-5" glow="hover:shadow-[0_8px_40px_-10px_hsl(var(--chart-4)/0.15)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                    <Eye className="h-3 w-3 text-chart-4/70" /> Traffic Activation
                  </div>
                  <span className="text-xs font-bold text-chart-4">{trafficScore}%</span>
                </div>
                <Progress value={trafficScore} className="h-1 mb-3" />
                <div className="space-y-2">
                  {trafficChecklist.map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all ${item.done ? "border-chart-2/15 bg-chart-2/4" : "border-border/10 bg-muted/3"}`}>
                      {item.done ? <CheckCircle2 className="h-3.5 w-3.5 text-chart-2 shrink-0" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground/20 shrink-0" />}
                      <span className={`text-[11px] font-medium ${item.done ? "text-foreground/80" : "text-muted-foreground/40"}`}>{item.label}</span>
                    </motion.div>
                  ))}
                </div>
                <Separator className="opacity-10 my-3" />
                <div className="p-3 rounded-lg bg-primary/4 border border-primary/8 text-center">
                  <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Visitors for $1K Revenue</p>
                  <AnimatedNumber value={Math.ceil(1000 / (fePrice * scenarioMultipliers[scenario].conv * 0.5 * 0.95))} className="text-lg font-bold text-primary" />
                </div>
              </GlassCard>
            </div>

            {/* Panel 6: Risk Radar — animated transitions */}
            <GlassCard className="p-5" glow="hover:shadow-[0_8px_40px_-10px_hsl(var(--destructive)/0.1)]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-3">
                <ShieldAlert className="h-3 w-3 text-destructive/70" /> Risk Radar
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {risks.map((risk, i) => {
                  const colors = {
                    high: "border-destructive/15 bg-destructive/4",
                    medium: "border-chart-4/15 bg-chart-4/4",
                    low: "border-chart-2/15 bg-chart-2/4",
                  };
                  const textColors = { high: "text-destructive", medium: "text-chart-4", low: "text-chart-2" };
                  const badges = { high: "High", medium: "Medium", low: "Low" };
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                      whileHover={{ scale: 1.02, x: 3 }}
                      className={`flex items-start gap-2 p-3 rounded-lg border ${colors[risk.severity]} relative overflow-hidden`}>
                      {/* Pulse glow for high severity */}
                      {risk.severity === "high" && (
                        <motion.div
                          className="absolute inset-0 rounded-lg bg-destructive/5"
                          animate={{ opacity: [0, 0.15, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                      <motion.div
                        animate={risk.severity === "high" ? { rotate: [0, -5, 5, -5, 0] } : {}}
                        transition={{ duration: 0.6, repeat: risk.severity === "high" ? Infinity : 0, repeatDelay: 3 }}>
                        <AlertTriangle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${textColors[risk.severity]}`} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[11px] leading-relaxed ${textColors[risk.severity]}`}>{risk.text}</span>
                      </div>
                      <Badge variant="outline" className={`text-[8px] h-4 px-1.5 shrink-0 ${
                        risk.severity === "high" ? "border-destructive/20 text-destructive" :
                        risk.severity === "medium" ? "border-chart-4/20 text-chart-4" :
                        "border-chart-2/20 text-chart-2"
                      }`}>{badges[risk.severity]}</Badge>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Profit Forecast Table */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-3">
                <BarChart3 className="h-3 w-3 text-chart-2/70" /> Profit Forecast
                <Badge variant="outline" className="ml-2 text-[8px] h-4 px-1.5 capitalize border-primary/20 text-primary">{scenario}</Badge>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {forecastData.map((d, i) => (
                  <motion.div key={d.visitors} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                    <p className="text-[9px] text-muted-foreground/40">{d.visitors.toLocaleString()} vis</p>
                    <AnimatedNumber value={d.revenue} prefix="$" className="text-sm font-bold text-chart-2" />
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* 7-Day Timeline */}
            <GlassCard className="p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-3">
                <Clock className="h-3 w-3 text-primary/70" /> 7-Day Launch Timeline
              </div>
              <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
                {[
                  { day: 1, task: "Product", icon: Package },
                  { day: 2, task: "Content", icon: FileText },
                  { day: 3, task: "Assets", icon: Sparkles },
                  { day: 4, task: "Funnel", icon: Target },
                  { day: 5, task: "Emails", icon: Mail },
                  { day: 6, task: "Soft Launch", icon: Play },
                  { day: 7, task: "Go Live 🚀", icon: Rocket },
                ].map(({ day, task, icon: Icon }, i) => {
                  const done = day <= completedStages;
                  return (
                    <div key={day} className="flex items-center flex-1 min-w-[80px]">
                      <motion.div whileHover={{ y: -3 }}
                        className={`flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-lg transition-all ${done ? "opacity-100" : "opacity-25"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          done ? "bg-primary/15 text-primary shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]" : "bg-muted/15 text-muted-foreground"
                        }`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[9px] font-bold">Day {day}</span>
                        <span className="text-[8px] text-muted-foreground/40 leading-none text-center">{task}</span>
                      </motion.div>
                      {i < 6 && <div className={`w-3 h-px shrink-0 ${done ? "bg-primary/25" : "bg-border/10"}`} />}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* ══ RIGHT COLUMN (4 cols) — Sticky Intelligence ══ */}
          <div className="xl:col-span-4 space-y-5">

            {/* Panel 1: Launch Status Overview */}
            <GlassCard className="p-5 border-primary/10">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4">
                <Gauge className="h-3 w-3 text-primary/70" /> Launch Status
              </div>
              <CircularGauge score={launchScore} label="Health" />
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-muted/5 border border-border/10">
                  <p className="text-[8px] text-muted-foreground/40 uppercase">Stage</p>
                  <p className="text-xs font-bold">{PIPELINE.find((s, i) => !s.check(project))?.label || "Complete"}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/5 border border-border/10">
                  <p className="text-[8px] text-muted-foreground/40 uppercase">ETA</p>
                  <p className="text-xs font-bold">{estimatedTime}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/5 border border-border/10">
                  <p className="text-[8px] text-muted-foreground/40 uppercase">Readiness</p>
                  <p className="text-xs font-bold">{progressPct}%</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/5 border border-border/10">
                  <p className="text-[8px] text-muted-foreground/40 uppercase">Confidence</p>
                  <p className={`text-xs font-bold ${launchScore >= 60 ? "text-chart-2" : "text-chart-4"}`}>{launchConfidence}</p>
                </div>
              </div>
              {/* Score Breakdown */}
              <div className="mt-4 space-y-2">
                {scoreBreakdown.map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/50 w-28">{item.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted/15 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                        className={`h-full rounded-full ${item.value >= 70 ? "bg-chart-2/60" : item.value >= 40 ? "bg-chart-4/60" : "bg-destructive/60"}`} />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/35 w-8 text-right">{item.value}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Panel 7: Rotating Next Best Action */}
            {currentAction && (
              <GlassCard className="p-5 border-accent/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent/60 uppercase tracking-widest">
                    <Brain className="h-3 w-3" /> Next Best Action
                  </div>
                  {/* Dot indicators */}
                  {rotatingActions.length > 1 && (
                    <div className="flex items-center gap-1">
                      {rotatingActions.map((_, i) => (
                        <button key={i} onClick={() => setActiveActionIdx(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeActionIdx % rotatingActions.length ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : "bg-muted-foreground/20"}`} />
                      ))}
                    </div>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeActionIdx % rotatingActions.length}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 mb-3">
                      <p className="text-sm text-foreground/80 leading-relaxed">{currentAction.text}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={currentAction.action} className="flex-1 gap-1.5 text-xs h-9 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]">
                        <Zap className="h-3 w-3" /> {currentAction.cta}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate("/funnels")} className="text-xs h-9 gap-1">
                        <Target className="h-3 w-3" /> Funnel
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </GlassCard>
            )}

            {/* AI Agent Advisor */}
            <GlassCard className="p-5 sticky top-20 border-accent/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent/60 uppercase tracking-widest">
                  <Bot className="h-3 w-3" /> AI Agent Advisor
                </div>
                <Button variant="ghost" size="sm" onClick={runAIEnhance} disabled={agentLoading} className="h-6 px-2 text-[9px]">
                  <RefreshCw className={`h-2.5 w-2.5 mr-1 ${agentLoading ? "animate-spin" : ""}`} />
                  {agentLoading ? "..." : "Enhance"}
                </Button>
              </div>
              <div className="space-y-2">
                {(agentInsights.length > 0 ? agentInsights : [
                  { text: "Generate your product idea to activate AI analysis.", type: "info" as const },
                ]).map((tip, i) => {
                  const iconMap = { success: CheckCircle2, warning: AlertTriangle, info: Lightbulb };
                  const colorMap = {
                    success: "bg-chart-2/4 text-chart-2 border-chart-2/10",
                    warning: "bg-chart-4/4 text-chart-4 border-chart-4/10",
                    info: "bg-primary/4 text-primary border-primary/10",
                  };
                  const Icon = iconMap[tip.type];
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 3 }}
                      className={`flex items-start gap-2 p-3 rounded-lg border text-xs leading-relaxed cursor-default ${colorMap[tip.type]}`}>
                      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <div>
                        {tip.agentName && <span className="text-[8px] opacity-50 block mb-0.5">{tip.agentName}</span>}
                        <span>{tip.text}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <Separator className="opacity-10 my-3" />

              {/* Quick Actions */}
              <div className="space-y-1.5">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate(`/wizard/${project.id}`)}>
                  <Wand2 className="h-3 w-3" /> Continue Building
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate("/funnels")}>
                  <Target className="h-3 w-3" /> Visual Funnel Builder
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate("/funnel-simulation")}>
                  <BarChart3 className="h-3 w-3" /> Launch Simulation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate("/opportunities")}>
                  <Radio className="h-3 w-3" /> Opportunity Radar
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate("/agent-hub")}>
                  <Bot className="h-3 w-3" /> Open Agent Hub
                </Button>
              </div>

              <Separator className="opacity-10 my-3" />

              {/* Projected Revenue */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/4 to-accent/4 border border-primary/8 text-center space-y-1">
                <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Total Projected Revenue</p>
                <AnimatedNumber value={projections.totalRevenue} prefix="$" className="text-2xl font-black text-foreground" />
                <p className="text-[10px] text-muted-foreground/30">{projections.visitors.toLocaleString()} visitors • {scenario} scenario</p>
              </div>

              {/* Shortcuts */}
              <Separator className="opacity-10 my-3" />
              <div className="space-y-1">
                <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest font-semibold">Shortcuts</p>
                {[
                  { keys: "G → D", label: "Dashboard" },
                  { keys: "G → C", label: "Command Center" },
                  { keys: "G → W", label: "Wizard" },
                  { keys: "G → F", label: "Funnel Builder" },
                ].map(s => (
                  <div key={s.keys} className="flex items-center gap-2">
                    <kbd className="text-[9px] font-mono bg-muted/10 border border-border/15 rounded px-1.5 py-0.5 text-muted-foreground/40">{s.keys}</kbd>
                    <span className="text-[9px] text-muted-foreground/30">{s.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Import Modal (accessible from header too) */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Import Product Idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground/60 uppercase mb-1 block">Product Idea / Description *</label>
              <Textarea placeholder="Describe your product idea, offer concept, or paste an existing description..." value={importIdea} onChange={e => setImportIdea(e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground/60 uppercase mb-1 block">Niche</label>
                <Input placeholder="e.g. Weight Loss" value={importNiche} onChange={e => setImportNiche(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground/60 uppercase mb-1 block">Target Audience</label>
                <Input placeholder="e.g. Busy Moms" value={importAudience} onChange={e => setImportAudience(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground/60 uppercase mb-1 block">Price Point ($)</label>
              <Input type="number" placeholder="17" value={importPrice} onChange={e => setImportPrice(e.target.value)} />
            </div>
            <Button onClick={handleImport} disabled={!importIdea.trim() || importing} className="w-full gap-2">
              <Zap className="h-4 w-4" /> {importing ? "Importing..." : "Import & Build"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
