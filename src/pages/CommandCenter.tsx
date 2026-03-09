import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Rocket, Sparkles, TrendingUp, DollarSign, Users, Eye,
  CheckCircle2, Circle, ArrowRight, Zap, Target, BarChart3,
  Package, FileText, Mail, Share2, ChevronRight, AlertTriangle,
  Lightbulb, Play, Wand2, Globe, ArrowDown, Monitor, Clock,
  Shield, Star, ExternalLink, Activity, Gauge, Bot, RefreshCw
} from "lucide-react";

// --- Types ---
interface ProjectData {
  id: string; name: string; niche: string | null; target_audience: string | null;
  product_type: string | null; topic: string | null; current_step: number; status: string;
  step1_product: any; step2_product_content: any; step2_assets: any;
  step3_funnel: any; step4_marketing: any; step5_checklist: any;
  buyer_avatar: any; created_at: string; updated_at: string;
}

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

// --- Advisor Tips ---
function getAdvisorTips(p: ProjectData) {
  const tips: { text: string; type: "info" | "warning" | "success" }[] = [];
  if (!p.step1_product) {
    tips.push({ text: "Generate your product idea to get started.", type: "warning" });
  } else {
    const prod = p.step1_product as any;
    if (!prod?.salesHooks?.length) tips.push({ text: "Add sales hooks to strengthen positioning.", type: "info" });
    if (!p.step2_product_content) tips.push({ text: "Build your product content next.", type: "info" });
  }
  if (p.step1_product && !p.step3_funnel) tips.push({ text: "Create your sales funnel to start converting.", type: "warning" });
  if (p.step3_funnel && !p.step4_marketing) tips.push({ text: "Generate email & social assets to drive traffic.", type: "info" });
  if (p.step3_funnel && p.step4_marketing) tips.push({ text: "All systems ready. Deploy your launch! 🚀", type: "success" });
  if (p.step1_product && p.step3_funnel) tips.push({ text: "Adding a fast-action bonus can lift conversions 15-25%.", type: "info" });
  return tips.slice(0, 4);
}

// --- Animated Number ---
function AnimatedNumber({ value, prefix = "", suffix = "", className = "" }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    if (diff === 0) return;
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

// --- Status Indicator ---
function StatusDot({ status }: { status: "healthy" | "warning" | "weak" | "inactive" }) {
  const colors = {
    healthy: "bg-chart-2 shadow-[0_0_8px_hsl(var(--chart-2)/0.5)]",
    warning: "bg-chart-4 shadow-[0_0_8px_hsl(var(--chart-4)/0.5)]",
    weak: "bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.5)]",
    inactive: "bg-muted-foreground/30",
  };
  return <div className={`w-2 h-2 rounded-full shrink-0 ${colors[status]}`} />;
}

// --- Glass Card ---
function GlassCard({ children, className = "", hoverGlow = "" }: { children: React.ReactNode; className?: string; hoverGlow?: string }) {
  return (
    <div className={`rounded-xl border border-border/20 bg-card/40 backdrop-blur-md shadow-[0_4px_30px_-10px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:border-border/40 hover:shadow-[0_8px_40px_-10px_hsl(var(--primary)/0.15)] ${hoverGlow} ${className}`}>
      {children}
    </div>
  );
}

// --- Launch Health Gauge ---
function LaunchHealthGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "hsl(var(--chart-2))" : score >= 40 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))";

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted)/0.15)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={score} className="text-2xl font-black text-foreground" />
        <span className="text-[8px] text-muted-foreground/50 uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
}

// --- Funnel Node ---
const FunnelNode = ({ label, conversion, active, highlight }: { label: string; conversion?: string; active: boolean; highlight?: boolean }) => (
  <motion.div
    whileHover={active ? { scale: 1.02, x: 4 } : {}}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all cursor-default ${
      highlight ? "border-primary/30 bg-primary/5 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.2)]" :
      active ? "border-border/20 bg-card/60 backdrop-blur-sm hover:border-primary/20" : "border-border/10 bg-muted/5 opacity-40"
    }`}>
    <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${highlight ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : active ? "bg-primary/60" : "bg-muted-foreground/20"}`} />
    <span className="text-xs font-medium flex-1">{label}</span>
    {conversion && <span className="text-[10px] text-muted-foreground font-mono">{conversion}</span>}
  </motion.div>
);

// --- Deploy Animation ---
const DeploySequence = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "Building funnel pages...",
    "Generating graphics...",
    "Injecting sales copy...",
    "Connecting payment link...",
    "Publishing site...",
  ];

  useEffect(() => {
    if (step < steps.length) {
      const t = setTimeout(() => setStep(s => s + 1), 1200);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onComplete, 1000);
      return () => clearTimeout(t);
    }
  }, [step]);

  const progressPct = (step / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl"
    >
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-card/80 backdrop-blur-md border border-border/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_80px_-20px_hsl(var(--primary)/0.3)] space-y-6">
        <div className="text-center space-y-3">
          <motion.div animate={{ rotate: step >= steps.length ? 0 : 360 }}
            transition={{ duration: 2, repeat: step >= steps.length ? 0 : Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto border border-primary/20">
            <Rocket className="h-7 w-7 text-primary" />
          </motion.div>
          <h2 className="text-lg font-bold">Deploying Launch</h2>
          <Progress value={progressPct} className="h-1" />
        </div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="flex items-center gap-3">
              {i < step ? (
                <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" />
              ) : i === step ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/20 shrink-0" />
              )}
              <span className={`text-sm ${i < step ? "text-chart-2" : i === step ? "text-foreground" : "text-muted-foreground/30"}`}>{s}</span>
            </motion.div>
          ))}
        </div>
        {step >= steps.length && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center pt-2 space-y-2">
            <div className="text-4xl">🚀</div>
            <Badge className="bg-chart-2 text-chart-2-foreground text-sm px-6 py-2 shadow-[0_0_20px_hsl(var(--chart-2)/0.4)]">Launch Live!</Badge>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// --- Keyboard Shortcuts ---
function useKeyboardShortcuts(navigate: (path: string) => void) {
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (pending === "g") {
        setPending(null);
        const map: Record<string, string> = { p: "/products", f: "/funnels", a: "/assets", d: "/dashboard", c: "/command-center", w: "/wizard" };
        if (map[e.key]) { e.preventDefault(); navigate(map[e.key]); }
        return;
      }
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) { setPending("g"); setTimeout(() => setPending(null), 1000); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pending, navigate]);
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

  useKeyboardShortcuts(navigate);

  useEffect(() => {
    if (user) fetchProjects();
    else setLoading(false);
  }, [user, projectId]);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase.from("launch_projects").select("*").order("updated_at", { ascending: false });
      const all = (data || []) as unknown as ProjectData[];
      setAllProjects(all);
      if (projectId) setProject(all.find(p => p.id === projectId) || all[0] || null);
      else if (all.length > 0) setProject(all[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const completedStages = useMemo(() => project ? PIPELINE.filter(s => s.check(project)).length : 0, [project]);
  const progressPct = useMemo(() => Math.round((completedStages / PIPELINE.length) * 100), [completedStages]);
  const advisorTips = useMemo(() => project ? getAdvisorTips(project) : [], [project]);

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

  const projections = useMemo(() => {
    const p = fePrice;
    return {
      conservative: { visitors: 500, sales: Math.round(500 * 0.02), revenue: Math.round(500 * 0.02 * p) },
      moderate: { visitors: 1000, sales: Math.round(1000 * 0.035), revenue: Math.round(1000 * 0.035 * p) },
      optimistic: { visitors: 2000, sales: Math.round(2000 * 0.05), revenue: Math.round(2000 * 0.05 * p) },
    };
  }, [fePrice]);

  // Status indicators
  const statusChecks = useMemo(() => {
    if (!project) return [];
    return [
      { label: "Offer Strength", status: project.step1_product ? (launchScore >= 60 ? "healthy" : "warning") : "inactive" as const },
      { label: "Sales Copy", status: project.step2_product_content ? "healthy" : project.step1_product ? "warning" : "inactive" as const },
      { label: "Funnel Structure", status: project.step3_funnel ? "healthy" : "weak" as const },
      { label: "Traffic Plan", status: project.step4_marketing ? "healthy" : "inactive" as const },
    ];
  }, [project, launchScore]);

  const nextTasks = useMemo(() => {
    if (!project) return [];
    return [
      { label: "Generate product idea", done: !!project.step1_product, step: 1 },
      { label: "Build product content", done: !!project.step2_product_content, step: 2 },
      { label: "Create product graphics", done: !!(project.step2_assets && Object.keys(project.step2_assets).length > 1), step: 3 },
      { label: "Build sales funnel", done: !!project.step3_funnel, step: 4 },
      { label: "Generate marketing assets", done: !!project.step4_marketing, step: 5 },
      { label: "Review & deploy", done: project.status === "deployed", step: 6 },
    ];
  }, [project]);

  const handleDeploy = () => {
    if (progressPct < 60) {
      toast.error("Complete at least 60% of your launch before deploying.");
      return;
    }
    setDeploying(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-4 p-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-32 text-center space-y-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/10">
            <Monitor className="h-10 w-10 text-primary" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold">Launch Command Center</h2>
            <p className="text-sm text-muted-foreground mt-2">Create your first launch project to activate the Command Center.</p>
          </div>
          <Button variant="hero" onClick={() => navigate("/wizard")} className="gap-2">
            <Wand2 className="h-4 w-4" /> Start New Launch
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AnimatePresence>{deploying && <DeploySequence onComplete={() => { setDeploying(false); toast.success("Launch deployed! 🚀"); }} />}</AnimatePresence>

      <div className="max-w-[1400px] mx-auto space-y-5 px-3 sm:px-5 pb-10">
        {/* ═══ Top Control Bar ═══ */}
        <GlassCard className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <motion.div whileHover={{ rotate: 10 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]">
                <Rocket className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <div className="min-w-0">
                {allProjects.length > 1 ? (
                  <select value={project.id}
                    onChange={e => { const p = allProjects.find(x => x.id === e.target.value); if (p) { setProject(p); navigate(`/command-center/${p.id}`, { replace: true }); }}}
                    className="text-base font-bold bg-transparent border-none text-foreground focus:outline-none cursor-pointer max-w-[280px] truncate">
                    {allProjects.map(p => (
                      <option key={p.id} value={p.id} className="bg-card text-foreground">
                        {(p.step1_product as any)?.title || p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <h1 className="text-base font-bold truncate">{productName}</h1>
                )}
                <p className="text-[11px] text-muted-foreground/50">{project.niche || "No niche set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Launch Score with hover breakdown */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/60 backdrop-blur-sm border border-border/20 cursor-pointer hover:border-primary/30 transition-all">
                    <StatusDot status={launchScore >= 70 ? "healthy" : launchScore >= 40 ? "warning" : "weak"} />
                    <span className="text-xs text-muted-foreground">Score</span>
                    <AnimatedNumber value={launchScore} className="text-sm font-bold" />
                    <span className="text-[10px] text-muted-foreground/40">/ 100</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-56 bg-card/90 backdrop-blur-md border-border/30">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Score Breakdown</p>
                    {[
                      { label: "Product", pts: project.step1_product ? 20 : 0, max: 20 },
                      { label: "Content", pts: project.step2_product_content ? 15 : 0, max: 15 },
                      { label: "Assets", pts: project.step2_assets && Object.keys(project.step2_assets).length > 1 ? 15 : 0, max: 15 },
                      { label: "Funnel", pts: project.step3_funnel ? 20 : 0, max: 20 },
                      { label: "Marketing", pts: project.step4_marketing ? 20 : 0, max: 20 },
                      { label: "Checklist", pts: project.step5_checklist ? 10 : 0, max: 10 },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16">{s.label}</span>
                        <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(s.pts / s.max) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{s.pts}/{s.max}</span>
                      </div>
                    ))}
                  </div>
                </HoverCardContent>
              </HoverCard>

              <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${project.id}`)} className="gap-1.5 text-xs h-9">
                <Wand2 className="h-3 w-3" /> Edit
              </Button>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" onClick={handleDeploy} disabled={progressPct < 60}
                  className="gap-1.5 text-xs h-9 bg-chart-2 hover:bg-chart-2/90 text-chart-2-foreground shadow-[0_0_25px_-5px_hsl(var(--chart-2)/0.5)] transition-all hover:shadow-[0_0_40px_-5px_hsl(var(--chart-2)/0.7)]">
                  <Rocket className="h-3.5 w-3.5" /> Deploy Launch
                </Button>
              </motion.div>
            </div>
          </div>
        </GlassCard>

        {/* ═══ Pipeline ═══ */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Launch Pipeline</span>
            <span className="text-[10px] text-muted-foreground/40">{completedStages}/{PIPELINE.length}</span>
          </div>
          <Progress value={progressPct} className="h-1.5 mb-3" />
          <div className="flex items-center gap-0.5">
            {PIPELINE.map((stage, i) => {
              const done = stage.check(project);
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex items-center flex-1 min-w-0">
                  <motion.div whileHover={{ y: -2 }}
                    className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-lg transition-all ${done ? "opacity-100" : "opacity-35"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      done ? "bg-primary text-primary-foreground shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]" : "bg-muted/30 text-muted-foreground"
                    }`}>
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-[9px] font-medium text-center leading-none">{stage.label}</span>
                  </motion.div>
                  {i < PIPELINE.length - 1 && (
                    <div className={`w-4 h-px shrink-0 ${done ? "bg-primary/40" : "bg-border/20"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* ═══ Main 3-Column Layout ═══ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Left 8 cols */}
          <div className="xl:col-span-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product Panel */}
              <GlassCard hoverGlow="hover:shadow-[0_8px_40px_-10px_hsl(var(--primary)/0.15)]">
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                    <Package className="h-3 w-3 text-primary/70" /> Product
                  </div>
                  <h3 className="text-sm font-bold leading-snug line-clamp-2">{productName}</h3>
                  {project.step1_product ? (
                    <>
                      <p className="text-[11px] text-muted-foreground/60 line-clamp-2">
                        {(project.step1_product as any)?.subtitle || (project.step1_product as any)?.outcome || "No description"}
                      </p>
                      <Separator className="opacity-10" />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2.5 rounded-lg bg-muted/8 border border-border/10">
                          <AnimatedNumber value={fePrice} prefix="$" className="text-base font-bold text-primary" />
                          <p className="text-[8px] text-muted-foreground/40 uppercase mt-0.5">Price</p>
                        </div>
                        <div className="text-center p-2.5 rounded-lg bg-muted/8 border border-border/10">
                          <p className="text-base font-bold">{project.product_type?.split(" ")[0] || "—"}</p>
                          <p className="text-[8px] text-muted-foreground/40 uppercase mt-0.5">Type</p>
                        </div>
                        <div className="text-center p-2.5 rounded-lg bg-muted/8 border border-border/10">
                          <p className={`text-base font-bold ${launchScore >= 70 ? "text-chart-2" : launchScore >= 40 ? "text-chart-4" : "text-destructive"}`}>
                            {launchScore >= 70 ? "Strong" : launchScore >= 40 ? "Good" : "Weak"}
                          </p>
                          <p className="text-[8px] text-muted-foreground/40 uppercase mt-0.5">Strength</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <Package className="h-8 w-8 text-muted-foreground/15 mx-auto" />
                      <p className="text-xs text-muted-foreground/40">Not generated yet</p>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${project.id}`)} className="text-[11px] h-7">Generate Product</Button>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Revenue Panel */}
              <GlassCard hoverGlow="hover:shadow-[0_8px_40px_-10px_hsl(var(--chart-2)/0.15)]">
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                    <DollarSign className="h-3 w-3 text-chart-2/70" /> Revenue Forecast
                  </div>
                  {[
                    { label: "Conservative", ...projections.conservative, color: "text-muted-foreground" },
                    { label: "Moderate", ...projections.moderate, color: "text-chart-4" },
                    { label: "Optimistic", ...projections.optimistic, color: "text-chart-2" },
                  ].map(({ label, visitors, sales, revenue, color }) => (
                    <motion.div key={label} whileHover={{ x: 3 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/5 border border-border/10 hover:border-border/20 transition-all cursor-default">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-muted-foreground/40">{label}</span>
                        <div className="flex items-baseline gap-1.5">
                          <AnimatedNumber value={revenue} prefix="$" className={`text-sm font-bold ${color}`} />
                          <span className="text-[9px] text-muted-foreground/30">{sales} sales</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground/25 font-mono">{visitors.toLocaleString()} vis</span>
                    </motion.div>
                  ))}
                  <Separator className="opacity-10" />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground/35">Per sale</span>
                    <AnimatedNumber value={fePrice} prefix="$" className="text-xl font-black text-chart-2" />
                  </div>
                </div>
              </GlassCard>

              {/* Funnel Panel */}
              <GlassCard hoverGlow="hover:shadow-[0_8px_40px_-10px_hsl(var(--accent)/0.12)]">
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-3">
                    <Target className="h-3 w-3 text-accent/70" /> Funnel Map
                  </div>
                  {project.step3_funnel ? (
                    <div className="space-y-1">
                      {[
                        { label: "Traffic Sources", conv: "100%", highlight: false },
                        { label: "Opt-in Page", conv: "25-40%", highlight: false },
                        { label: "Sales Page", conv: "2-5%", highlight: true },
                        { label: "Checkout", conv: "60-80%", highlight: false },
                        { label: "Upsell", conv: "10-20%", highlight: false },
                        { label: "Thank You", conv: "—", highlight: false },
                      ].map((node, i) => (
                        <div key={node.label}>
                          <FunnelNode label={node.label} conversion={node.conv} active highlight={node.highlight} />
                          {i < 5 && <div className="flex justify-center"><div className="w-px h-2 bg-border/15" /></div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <Target className="h-8 w-8 text-muted-foreground/15 mx-auto" />
                      <p className="text-xs text-muted-foreground/40">Funnel not built yet</p>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${project.id}`)} className="text-[11px] h-7">Build Funnel</Button>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Traffic Panel */}
              <GlassCard hoverGlow="hover:shadow-[0_8px_40px_-10px_hsl(var(--chart-4)/0.12)]">
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                    <Eye className="h-3 w-3 text-chart-4/70" /> Traffic Plan
                  </div>
                  {project.step4_marketing ? (
                    <>
                      <div className="space-y-2.5">
                        {[
                          { source: "Email List", icon: Mail, pct: 40 },
                          { source: "Affiliates", icon: Users, pct: 30 },
                          { source: "Social", icon: Share2, pct: 20 },
                          { source: "Organic", icon: Globe, pct: 10 },
                        ].map(({ source, icon: Icon, pct }) => (
                          <motion.div key={source} whileHover={{ x: 3 }}
                            className="flex items-center gap-2.5 cursor-default">
                            <Icon className="h-3 w-3 text-muted-foreground/35 shrink-0" />
                            <span className="text-[11px] flex-1">{source}</span>
                            <div className="w-16 h-1.5 rounded-full bg-muted/15 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="h-full rounded-full bg-primary/50" />
                            </div>
                            <span className="text-[10px] text-muted-foreground/35 w-7 text-right font-mono">{pct}%</span>
                          </motion.div>
                        ))}
                      </div>
                      <Separator className="opacity-10" />
                      <div className="p-3 rounded-lg bg-primary/4 border border-primary/8 text-center">
                        <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Visitors for $1K</p>
                        <AnimatedNumber value={Math.ceil(1000 / (fePrice * 0.035))} className="text-lg font-bold text-primary" />
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <Eye className="h-8 w-8 text-muted-foreground/15 mx-auto" />
                      <p className="text-xs text-muted-foreground/40">Generate marketing assets first</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Status Indicators */}
            <GlassCard className="p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-3">
                <Activity className="h-3 w-3 text-primary/70" /> System Status
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statusChecks.map((check, i) => (
                  <motion.div key={check.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/5 border border-border/10">
                    <StatusDot status={check.status as any} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium truncate">{check.label}</p>
                      <p className="text-[9px] text-muted-foreground/40 capitalize">{check.status === "healthy" ? "Complete" : check.status === "warning" ? "Needs Work" : check.status === "weak" ? "Not Started" : "Pending"}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Task Engine */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                  <Zap className="h-3 w-3 text-chart-4/70" /> Next Actions
                </div>
                <span className="text-[10px] text-muted-foreground/30">{nextTasks.filter(t => t.done).length}/{nextTasks.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {nextTasks.map((task, i) => (
                  <motion.button key={i} whileHover={task.done ? {} : { scale: 1.01, x: 2 }}
                    onClick={() => !task.done && navigate(`/wizard/${project.id}`)}
                    disabled={task.done}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all w-full ${
                      task.done ? "border-chart-2/10 bg-chart-2/3 cursor-default" : "border-border/15 bg-muted/3 hover:bg-muted/10 hover:border-primary/20 cursor-pointer"
                    }`}>
                    {task.done
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-chart-2/70 shrink-0" />
                      : <Circle className="h-3.5 w-3.5 text-muted-foreground/25 shrink-0" />}
                    <span className={`text-[11px] font-medium flex-1 ${task.done ? "line-through text-muted-foreground/35" : "text-foreground/80"}`}>
                      {task.label}
                    </span>
                    {!task.done && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/15" />}
                  </motion.button>
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
                          done ? "bg-primary/15 text-primary shadow-[0_0_10px_-3px_hsl(var(--primary)/0.3)]" : "bg-muted/15 text-muted-foreground"
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

          {/* ═══ Right: AI Advisor + Health ═══ */}
          <div className="xl:col-span-4 space-y-5">
            {/* Launch Health Gauge */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4">
                <Gauge className="h-3 w-3 text-primary/70" /> Launch Health
              </div>
              <LaunchHealthGauge score={launchScore} />
              <div className="mt-4 space-y-2">
                {[
                  { label: "Offer Quality", value: project.step1_product ? 85 : 0 },
                  { label: "Funnel Strength", value: project.step3_funnel ? 78 : 0 },
                  { label: "Traffic Readiness", value: project.step4_marketing ? 70 : 0 },
                  { label: "Copy Power", value: project.step2_product_content ? 82 : 0 },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/50 w-24">{item.label}</span>
                    <div className="flex-1 h-1 rounded-full bg-muted/15 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full bg-primary/60" />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/35 w-7 text-right">{item.value}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* AI Advisor */}
            <GlassCard className="p-5 sticky top-20 border-accent/10">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent/60 uppercase tracking-widest mb-3">
                <Sparkles className="h-3 w-3" /> AI Launch Advisor
              </div>
              <div className="space-y-2">
                {advisorTips.map((tip, i) => {
                  const iconMap = { success: CheckCircle2, warning: AlertTriangle, info: Lightbulb };
                  const colorMap = {
                    success: "bg-chart-2/4 text-chart-2 border-chart-2/10",
                    warning: "bg-chart-4/4 text-chart-4 border-chart-4/10",
                    info: "bg-primary/4 text-primary border-primary/10",
                  };
                  const Icon = iconMap[tip.type];
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8, x: -5 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      whileHover={{ x: 3 }}
                      className={`flex items-start gap-2 p-3 rounded-lg border text-xs leading-relaxed cursor-default ${colorMap[tip.type]}`}>
                      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{tip.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              <Separator className="opacity-10 my-3" />

              {/* Quick Stats */}
              <div className="space-y-2">
                <p className="text-[9px] text-muted-foreground/35 uppercase tracking-widest font-semibold">Quick Stats</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                    <AnimatedNumber value={completedStages} className="text-lg font-bold text-primary" />
                    <p className="text-[8px] text-muted-foreground/35 uppercase mt-0.5">Steps Done</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/5 border border-border/10 text-center">
                    <AnimatedNumber value={progressPct} suffix="%" className="text-lg font-bold text-chart-2" />
                    <p className="text-[8px] text-muted-foreground/35 uppercase mt-0.5">Complete</p>
                  </div>
                </div>
              </div>

              <Separator className="opacity-10 my-3" />

              {/* Projected Revenue */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/4 to-accent/4 border border-primary/8 text-center space-y-1">
                <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Projected Revenue</p>
                <AnimatedNumber value={projections.moderate.revenue} prefix="$" className="text-2xl font-black text-foreground" />
                <p className="text-[10px] text-muted-foreground/30">based on 1,000 visitors</p>
              </div>

              {/* Actions */}
              <div className="space-y-1.5 pt-3">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate(`/wizard/${project.id}`)}>
                  <Wand2 className="h-3 w-3" /> Continue Building
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate("/affiliate-predictor")}>
                  <BarChart3 className="h-3 w-3" /> Predict Affiliate Score
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate("/genome")}>
                  <Star className="h-3 w-3" /> Extract Launch DNA
                </Button>
              </div>

              {/* Keyboard Shortcuts */}
              <Separator className="opacity-10 my-3" />
              <div className="space-y-1">
                <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest font-semibold">Shortcuts</p>
                {[
                  { keys: "G → D", label: "Dashboard" },
                  { keys: "G → C", label: "Command Center" },
                  { keys: "G → W", label: "Wizard" },
                  { keys: "G → F", label: "Funnels" },
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
    </DashboardLayout>
  );
}
