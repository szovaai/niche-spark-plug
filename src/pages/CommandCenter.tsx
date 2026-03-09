import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Rocket, Sparkles, TrendingUp, DollarSign, Users, Eye,
  CheckCircle2, Circle, ArrowRight, Zap, Target, BarChart3,
  Package, FileText, Mail, Share2, ChevronRight, AlertTriangle,
  Lightbulb, Play, Wand2, Globe, ArrowDown, Monitor, Clock,
  Shield, Star, ExternalLink
} from "lucide-react";

// --- Types ---
interface ProjectData {
  id: string;
  name: string;
  niche: string | null;
  target_audience: string | null;
  product_type: string | null;
  topic: string | null;
  current_step: number;
  status: string;
  step1_product: any;
  step2_product_content: any;
  step2_assets: any;
  step3_funnel: any;
  step4_marketing: any;
  step5_checklist: any;
  buyer_avatar: any;
  created_at: string;
  updated_at: string;
}

// --- Pipeline Stages ---
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
function getAdvisorTips(p: ProjectData): { text: string; type: "info" | "warning" | "success" }[] {
  const tips: { text: string; type: "info" | "warning" | "success" }[] = [];
  if (!p.step1_product) {
    tips.push({ text: "Generate your product idea to get started.", type: "warning" });
  } else {
    const prod = p.step1_product as any;
    if (!prod?.salesHooks?.length) tips.push({ text: "Add sales hooks to strengthen positioning.", type: "info" });
    if (!p.step2_product_content) tips.push({ text: "Build your product content next.", type: "info" });
  }
  if (p.step1_product && !p.step3_funnel) {
    tips.push({ text: "Create your sales funnel to start converting.", type: "warning" });
  }
  if (p.step3_funnel && !p.step4_marketing) {
    tips.push({ text: "Generate email & social assets to drive traffic.", type: "info" });
  }
  if (p.step3_funnel && p.step4_marketing) {
    tips.push({ text: "All systems ready. Deploy your launch! 🚀", type: "success" });
  }
  if (p.step1_product && p.step3_funnel) {
    tips.push({ text: "Adding a fast-action bonus can lift conversions 15-25%.", type: "info" });
  }
  return tips.slice(0, 4);
}

// --- Funnel Node ---
const FunnelNode = ({ label, conversion, active, highlight }: { label: string; conversion?: string; active: boolean; highlight?: boolean }) => (
  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
    highlight ? "border-primary/40 bg-primary/8 shadow-[0_0_12px_-3px_hsl(var(--primary)/0.2)]" :
    active ? "border-border/40 bg-card/80" : "border-border/20 bg-muted/10 opacity-50"
  }`}>
    <div className={`w-2 h-2 rounded-full shrink-0 ${active ? "bg-primary" : "bg-muted-foreground/30"}`} />
    <span className="text-xs font-medium flex-1">{label}</span>
    {conversion && <span className="text-[10px] text-muted-foreground font-mono">{conversion}</span>}
  </div>
);

// --- Deploy Animation ---
const DeploySequence = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "Building funnel pages...",
    "Generating graphics...",
    "Injecting sales copy...",
    "Connecting payment link...",
    "Deploying website...",
  ];

  useEffect(() => {
    if (step < steps.length) {
      const t = setTimeout(() => setStep(s => s + 1), 1200);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Rocket className="h-10 w-10 text-primary mx-auto" />
          <h2 className="text-lg font-bold">Deploying Launch</h2>
        </div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3">
              {i < step ? (
                <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" />
              ) : i === step ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              )}
              <span className={`text-sm ${i <= step ? "text-foreground" : "text-muted-foreground/40"}`}>{s}</span>
            </motion.div>
          ))}
        </div>
        {step >= steps.length && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center pt-2">
            <Badge className="bg-chart-2 text-chart-2-foreground text-sm px-4 py-1.5">🚀 Launch Live!</Badge>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// --- Main ---
export default function CommandCenter() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

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
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Monitor className="h-8 w-8 text-primary" />
          </div>
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

      <div className="max-w-[1400px] mx-auto space-y-4 px-2 sm:px-4 pb-8">
        {/* ═══ Top Bar: Project + Score + Deploy ═══ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center shrink-0">
              <Rocket className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              {allProjects.length > 1 ? (
                <select
                  value={project.id}
                  onChange={e => {
                    const p = allProjects.find(x => x.id === e.target.value);
                    if (p) { setProject(p); navigate(`/command-center/${p.id}`, { replace: true }); }
                  }}
                  className="text-base font-bold bg-transparent border-none text-foreground focus:outline-none cursor-pointer max-w-[280px] truncate"
                >
                  {allProjects.map(p => (
                    <option key={p.id} value={p.id} className="bg-card text-foreground">
                      {(p.step1_product as any)?.title || p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <h1 className="text-base font-bold truncate">{productName}</h1>
              )}
              <p className="text-[11px] text-muted-foreground/60">{project.niche || "No niche set"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Launch Score */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border/40">
              <div className={`w-2 h-2 rounded-full ${launchScore >= 70 ? "bg-chart-2" : launchScore >= 40 ? "bg-chart-4" : "bg-destructive"}`} />
              <span className="text-xs text-muted-foreground">Score</span>
              <span className="text-sm font-bold">{launchScore}</span>
              <span className="text-[10px] text-muted-foreground/50">/ 100</span>
            </div>

            <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${project.id}`)} className="gap-1.5 text-xs h-8">
              <Wand2 className="h-3 w-3" /> Edit
            </Button>
            <Button
              size="sm"
              onClick={handleDeploy}
              disabled={progressPct < 60}
              className="gap-1.5 text-xs h-8 bg-chart-2 hover:bg-chart-2/90 text-chart-2-foreground shadow-[0_0_20px_-5px_hsl(var(--chart-2)/0.4)] transition-shadow hover:shadow-[0_0_30px_-5px_hsl(var(--chart-2)/0.6)]"
            >
              <Rocket className="h-3 w-3" /> Deploy Launch
            </Button>
          </div>
        </div>

        {/* ═══ Pipeline ═══ */}
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Launch Pipeline</span>
              <span className="text-[10px] text-muted-foreground/40">{completedStages}/{PIPELINE.length}</span>
            </div>
            <Progress value={progressPct} className="h-1 mb-3" />
            <div className="flex items-center gap-0.5">
              {PIPELINE.map((stage, i) => {
                const done = stage.check(project);
                const Icon = stage.icon;
                return (
                  <div key={stage.key} className="flex items-center flex-1 min-w-0">
                    <div className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-md transition-all ${
                      done ? "opacity-100" : "opacity-40"
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        done ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
                      }`}>
                        {done ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                      </div>
                      <span className="text-[9px] font-medium text-center leading-none">{stage.label}</span>
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <div className={`w-3 h-px shrink-0 ${done ? "bg-primary/40" : "bg-border/30"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ═══ Main 3-Column: Panels + AI Advisor ═══ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Left 8 cols: 4 panels */}
          <div className="xl:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Panel */}
              <Card className="bg-card/60 border-border/30 hover:border-primary/20 transition-colors">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Package className="h-3 w-3 text-primary/70" /> Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <h3 className="text-sm font-bold leading-snug line-clamp-2">{productName}</h3>
                  {project.step1_product && (
                    <>
                      <p className="text-[11px] text-muted-foreground/70 line-clamp-2">
                        {(project.step1_product as any)?.subtitle || (project.step1_product as any)?.outcome || "No description"}
                      </p>
                      <Separator className="opacity-20" />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded-md bg-muted/15">
                          <p className="text-base font-bold text-primary">${fePrice}</p>
                          <p className="text-[8px] text-muted-foreground/50 uppercase">Price</p>
                        </div>
                        <div className="text-center p-2 rounded-md bg-muted/15">
                          <p className="text-base font-bold">{project.product_type?.split(" ")[0] || "—"}</p>
                          <p className="text-[8px] text-muted-foreground/50 uppercase">Type</p>
                        </div>
                        <div className="text-center p-2 rounded-md bg-muted/15">
                          <p className={`text-base font-bold ${launchScore >= 70 ? "text-chart-2" : launchScore >= 40 ? "text-chart-4" : "text-destructive"}`}>
                            {launchScore >= 70 ? "Strong" : launchScore >= 40 ? "Good" : "Weak"}
                          </p>
                          <p className="text-[8px] text-muted-foreground/50 uppercase">Strength</p>
                        </div>
                      </div>
                    </>
                  )}
                  {!project.step1_product && (
                    <div className="py-6 text-center space-y-2">
                      <Package className="h-8 w-8 text-muted-foreground/20 mx-auto" />
                      <p className="text-xs text-muted-foreground/50">Not generated yet</p>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${project.id}`)} className="text-[11px] h-7">
                        Generate Product
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Panel */}
              <Card className="bg-card/60 border-border/30 hover:border-chart-2/20 transition-colors">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3 text-chart-2/70" /> Revenue Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {[
                    { label: "Conservative", ...projections.conservative, color: "text-muted-foreground" },
                    { label: "Moderate", ...projections.moderate, color: "text-chart-4" },
                    { label: "Optimistic", ...projections.optimistic, color: "text-chart-2" },
                  ].map(({ label, visitors, sales, revenue, color }) => (
                    <div key={label} className="flex items-center gap-3 p-2 rounded-md bg-muted/10">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-muted-foreground/50">{label}</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-sm font-bold ${color}`}>${revenue.toLocaleString()}</span>
                          <span className="text-[9px] text-muted-foreground/40">{sales} sales</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground/30 font-mono">{visitors.toLocaleString()} vis</span>
                    </div>
                  ))}
                  <Separator className="opacity-15" />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground/40">Per sale</span>
                    <span className="text-lg font-black text-chart-2">${fePrice}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Funnel Panel */}
              <Card className="bg-card/60 border-border/30 hover:border-accent/20 transition-colors">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Target className="h-3 w-3 text-accent/70" /> Funnel Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
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
                          {i < 5 && <div className="flex justify-center"><div className="w-px h-2 bg-border/20" /></div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <Target className="h-8 w-8 text-muted-foreground/20 mx-auto" />
                      <p className="text-xs text-muted-foreground/50">Funnel not built yet</p>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${project.id}`)} className="text-[11px] h-7">
                        Build Funnel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Traffic Panel */}
              <Card className="bg-card/60 border-border/30 hover:border-chart-4/20 transition-colors">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Eye className="h-3 w-3 text-chart-4/70" /> Traffic Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {project.step4_marketing ? (
                    <>
                      <div className="space-y-2.5">
                        {[
                          { source: "Email List", icon: Mail, pct: 40 },
                          { source: "Affiliates", icon: Users, pct: 30 },
                          { source: "Social", icon: Share2, pct: 20 },
                          { source: "Organic", icon: Globe, pct: 10 },
                        ].map(({ source, icon: Icon, pct }) => (
                          <div key={source} className="flex items-center gap-2.5">
                            <Icon className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                            <span className="text-[11px] flex-1">{source}</span>
                            <div className="w-16 h-1 rounded-full bg-muted/20 overflow-hidden">
                              <div className="h-full rounded-full bg-primary/50" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground/40 w-7 text-right font-mono">{pct}%</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="opacity-15" />
                      <div className="p-2.5 rounded-md bg-primary/5 text-center">
                        <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Visitors for $1K</p>
                        <p className="text-lg font-bold text-primary">{Math.ceil(1000 / (fePrice * 0.035)).toLocaleString()}</p>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <Eye className="h-8 w-8 text-muted-foreground/20 mx-auto" />
                      <p className="text-xs text-muted-foreground/50">Generate marketing assets first</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Task Engine */}
            <Card className="bg-card/60 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-chart-4/70" /> Next Actions
                  </CardTitle>
                  <span className="text-[10px] text-muted-foreground/30">{nextTasks.filter(t => t.done).length}/{nextTasks.length}</span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {nextTasks.map((task, i) => (
                    <motion.button
                      key={i}
                      whileHover={task.done ? {} : { scale: 1.01 }}
                      onClick={() => !task.done && navigate(`/wizard/${project.id}`)}
                      disabled={task.done}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all w-full ${
                        task.done
                          ? "border-chart-2/10 bg-chart-2/3 cursor-default"
                          : "border-border/30 bg-muted/5 hover:bg-muted/15 hover:border-primary/20 cursor-pointer"
                      }`}
                    >
                      {task.done
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-chart-2/70 shrink-0" />
                        : <Circle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />}
                      <span className={`text-[11px] font-medium flex-1 ${task.done ? "line-through text-muted-foreground/40" : "text-foreground/80"}`}>
                        {task.label}
                      </span>
                      {!task.done && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/20" />}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 7-Day Timeline */}
            <Card className="bg-card/60 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-primary/70" /> 7-Day Launch Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
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
                        <div className={`flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-md transition-all ${
                          done ? "opacity-100" : "opacity-30"
                        }`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            done ? "bg-primary/20 text-primary" : "bg-muted/20 text-muted-foreground"
                          }`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <span className="text-[9px] font-bold">Day {day}</span>
                          <span className="text-[8px] text-muted-foreground/50 leading-none text-center">{task}</span>
                        </div>
                        {i < 6 && <div className={`w-2 h-px shrink-0 ${done ? "bg-primary/30" : "bg-border/15"}`} />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ═══ Right: AI Advisor ═══ */}
          <div className="xl:col-span-4 space-y-4">
            <Card className="bg-card/60 border-accent/15 sticky top-20">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-[10px] font-semibold text-accent/60 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> AI Launch Advisor
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {advisorTips.map((tip, i) => {
                  const iconMap = { success: CheckCircle2, warning: AlertTriangle, info: Lightbulb };
                  const colorMap = {
                    success: "bg-chart-2/5 text-chart-2 border-chart-2/10",
                    warning: "bg-chart-4/5 text-chart-4 border-chart-4/10",
                    info: "bg-primary/5 text-primary border-primary/10",
                  };
                  const Icon = iconMap[tip.type];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className={`flex items-start gap-2 p-3 rounded-lg border text-xs leading-relaxed ${colorMap[tip.type]}`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{tip.text}</span>
                    </motion.div>
                  );
                })}

                <Separator className="opacity-15 my-2" />

                {/* Quick Stats */}
                <div className="space-y-2">
                  <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-semibold">Quick Stats</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-md bg-muted/10 text-center">
                      <p className="text-lg font-bold text-primary">{completedStages}</p>
                      <p className="text-[8px] text-muted-foreground/40 uppercase">Steps Done</p>
                    </div>
                    <div className="p-2.5 rounded-md bg-muted/10 text-center">
                      <p className="text-lg font-bold text-chart-2">{progressPct}%</p>
                      <p className="text-[8px] text-muted-foreground/40 uppercase">Complete</p>
                    </div>
                  </div>
                </div>

                <Separator className="opacity-15 my-2" />

                {/* Estimated Launch Revenue */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 text-center space-y-1">
                  <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Projected Launch Revenue</p>
                  <p className="text-2xl font-black text-foreground">${projections.moderate.revenue.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground/40">based on 1,000 visitors</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-1.5 pt-1">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8"
                    onClick={() => navigate(`/wizard/${project.id}`)}>
                    <Wand2 className="h-3 w-3" /> Continue Building
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8"
                    onClick={() => navigate("/affiliate-predictor")}>
                    <BarChart3 className="h-3 w-3" /> Predict Affiliate Score
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8"
                    onClick={() => navigate("/genome")}>
                    <Star className="h-3 w-3" /> Extract Launch DNA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
