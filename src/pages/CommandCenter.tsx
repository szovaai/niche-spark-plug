import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Lightbulb, Play, ExternalLink, Wand2, ShoppingCart, Globe,
  ArrowDown
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

// --- Progress Pipeline ---
const PIPELINE_STAGES = [
  { key: "idea", label: "Idea", icon: Lightbulb, check: (p: ProjectData) => !!p.niche },
  { key: "product", label: "Product", icon: Package, check: (p: ProjectData) => !!p.step1_product },
  { key: "content", label: "Content", icon: FileText, check: (p: ProjectData) => !!p.step2_product_content },
  { key: "assets", label: "Assets", icon: Sparkles, check: (p: ProjectData) => !!p.step2_assets && Object.keys(p.step2_assets).length > 1 },
  { key: "funnel", label: "Funnel", icon: Target, check: (p: ProjectData) => !!p.step3_funnel },
  { key: "marketing", label: "Marketing", icon: Mail, check: (p: ProjectData) => !!p.step4_marketing },
  { key: "deploy", label: "Deploy", icon: Rocket, check: (p: ProjectData) => p.status === "deployed" },
];

// --- Helper to derive advisor tips ---
function getAdvisorTips(p: ProjectData): { text: string; type: "info" | "warning" | "success" }[] {
  const tips: { text: string; type: "info" | "warning" | "success" }[] = [];

  if (!p.step1_product) {
    tips.push({ text: "Start by generating your product idea in the Launch Wizard.", type: "warning" });
  } else {
    const product = p.step1_product as any;
    if (!product?.salesHooks?.length) {
      tips.push({ text: "Add sales hooks to strengthen your offer positioning.", type: "info" });
    }
  }

  if (!p.step3_funnel) {
    tips.push({ text: "Build your sales funnel to start converting traffic.", type: "warning" });
  } else {
    tips.push({ text: "Your funnel is ready. Consider adding an upsell to increase AOV.", type: "info" });
  }

  if (!p.step4_marketing) {
    tips.push({ text: "Generate email sequences and social posts to drive launch traffic.", type: "warning" });
  } else {
    tips.push({ text: "Marketing assets ready. You're close to launching!", type: "success" });
  }

  if (p.step3_funnel && p.step4_marketing && p.step2_assets) {
    tips.push({ text: "All systems go. Hit Deploy to go live! 🚀", type: "success" });
  }

  return tips.slice(0, 4);
}

// --- Funnel Node ---
const FunnelNode = ({ label, conversion, active }: { label: string; conversion?: string; active: boolean }) => (
  <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
    active ? "border-primary/40 bg-primary/5" : "border-border/30 bg-muted/20 opacity-60"
  }`}>
    <span className="text-[11px] font-medium text-foreground">{label}</span>
    {conversion && <span className="text-[10px] text-muted-foreground">{conversion}</span>}
  </div>
);

// --- Main Component ---
export default function CommandCenter() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProjects();
    else setLoading(false);
  }, [user, projectId]);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase
        .from("launch_projects")
        .select("*")
        .order("updated_at", { ascending: false });
      const all = (data || []) as unknown as ProjectData[];
      setAllProjects(all);

      if (projectId) {
        setProject(all.find(p => p.id === projectId) || all[0] || null);
      } else if (all.length > 0) {
        setProject(all[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Derived data
  const completedStages = useMemo(() => {
    if (!project) return 0;
    return PIPELINE_STAGES.filter(s => s.check(project)).length;
  }, [project]);

  const progressPct = useMemo(() => Math.round((completedStages / PIPELINE_STAGES.length) * 100), [completedStages]);

  const advisorTips = useMemo(() => project ? getAdvisorTips(project) : [], [project]);

  const productName = useMemo(() => {
    if (!project) return "Untitled Product";
    const p1 = project.step1_product as any;
    return p1?.title || p1?.productTitle || project.name || "Untitled Product";
  }, [project]);

  const launchScore = useMemo(() => {
    if (!project) return 0;
    let score = 0;
    if (project.step1_product) score += 20;
    if (project.step2_product_content) score += 15;
    if (project.step2_assets && Object.keys(project.step2_assets).length > 1) score += 15;
    if (project.step3_funnel) score += 20;
    if (project.step4_marketing) score += 20;
    if (project.step5_checklist) score += 10;
    return score;
  }, [project]);

  const fePrice = useMemo(() => {
    const p1 = project?.step1_product as any;
    return p1?.price || p1?.fePrice || 17;
  }, [project]);

  // Revenue projections (simplified rules-based)
  const projections = useMemo(() => {
    const price = fePrice;
    const convLow = 0.02, convMid = 0.035, convHigh = 0.05;
    const trafficLow = 500, trafficMid = 1000, trafficHigh = 2000;
    return {
      conservative: { visitors: trafficLow, sales: Math.round(trafficLow * convLow), revenue: Math.round(trafficLow * convLow * price) },
      moderate: { visitors: trafficMid, sales: Math.round(trafficMid * convMid), revenue: Math.round(trafficMid * convMid * price) },
      optimistic: { visitors: trafficHigh, sales: Math.round(trafficHigh * convHigh), revenue: Math.round(trafficHigh * convHigh * price) },
    };
  }, [fePrice]);

  const hasFunnel = !!project?.step3_funnel;

  // Task engine
  const nextTasks = useMemo(() => {
    if (!project) return [];
    const tasks: { label: string; done: boolean; action: () => void }[] = [];
    tasks.push({ label: "Generate product idea", done: !!project.step1_product, action: () => navigate(`/wizard/${project.id}`) });
    tasks.push({ label: "Build product content", done: !!project.step2_product_content, action: () => navigate(`/wizard/${project.id}`) });
    tasks.push({ label: "Create product graphics", done: !!(project.step2_assets && Object.keys(project.step2_assets).length > 1), action: () => navigate(`/wizard/${project.id}`) });
    tasks.push({ label: "Build sales funnel", done: !!project.step3_funnel, action: () => navigate(`/wizard/${project.id}`) });
    tasks.push({ label: "Generate marketing assets", done: !!project.step4_marketing, action: () => navigate(`/wizard/${project.id}`) });
    tasks.push({ label: "Deploy your launch", done: project.status === "deployed", action: () => navigate(`/wizard/${project.id}`) });
    return tasks;
  }, [project, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 p-2">
          <Skeleton className="h-12 w-72" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">No Launch Projects Yet</h2>
          <p className="text-muted-foreground max-w-md">Create your first launch project to unlock the Command Center.</p>
          <Button variant="hero" size="lg" onClick={() => navigate("/wizard")} className="gap-2">
            <Wand2 className="h-5 w-5" /> Start New Launch
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Command Center</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {allProjects.length > 1 && (
                  <select
                    value={project.id}
                    onChange={e => {
                      const p = allProjects.find(p => p.id === e.target.value);
                      if (p) { setProject(p); navigate(`/command-center/${p.id}`, { replace: true }); }
                    }}
                    className="text-sm bg-transparent border-none text-muted-foreground focus:outline-none cursor-pointer"
                  >
                    {allProjects.map(p => (
                      <option key={p.id} value={p.id} className="bg-card text-foreground">
                        {(p.step1_product as any)?.title || p.name}
                      </option>
                    ))}
                  </select>
                )}
                {allProjects.length <= 1 && (
                  <span className="text-sm text-muted-foreground">{productName}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${project.id}`)} className="gap-1.5">
              <Wand2 className="h-3.5 w-3.5" /> Edit in Wizard
            </Button>
            <Button
              variant="hero"
              size="sm"
              disabled={progressPct < 60}
              className="gap-1.5"
              onClick={() => { toast.success("Deploy flow coming soon!"); }}
            >
              <Rocket className="h-3.5 w-3.5" /> Deploy Launch
            </Button>
          </div>
        </div>

        {/* ─── Launch Pipeline ─── */}
        <Card className="overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Launch Progress</span>
              <Badge variant={progressPct >= 80 ? "default" : "secondary"} className="text-[10px]">
                {completedStages}/{PIPELINE_STAGES.length} Complete
              </Badge>
            </div>
            <Progress value={progressPct} className="h-2 mb-4" />
            <div className="flex items-center justify-between gap-1">
              {PIPELINE_STAGES.map((stage, i) => {
                const done = stage.check(project);
                const Icon = stage.icon;
                return (
                  <div key={stage.key} className="flex items-center gap-1 flex-1">
                    <motion.div
                      initial={false}
                      animate={{ scale: done ? 1 : 0.95, opacity: done ? 1 : 0.5 }}
                      className={`flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-lg transition-colors ${
                        done ? "bg-primary/10" : "bg-muted/20"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-[10px] font-medium">{stage.label}</span>
                    </motion.div>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <ChevronRight className={`h-3 w-3 shrink-0 ${done ? "text-primary" : "text-muted-foreground/30"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ─── Main Grid: 4 Panels ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Product Panel */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" /> Product
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <h3 className="text-sm font-bold leading-tight line-clamp-2">{productName}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Launch Score</span>
                <div className="flex-1">
                  <Progress value={launchScore} className="h-1.5" />
                </div>
                <span className={`text-xs font-bold ${launchScore >= 70 ? "text-chart-2" : launchScore >= 40 ? "text-chart-4" : "text-destructive"}`}>
                  {launchScore}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold text-primary">${fePrice}</p>
                  <p className="text-[9px] text-muted-foreground">FE Price</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold text-foreground">{project.product_type || "—"}</p>
                  <p className="text-[9px] text-muted-foreground">Type</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2">
                {project.niche ? `Niche: ${project.niche}` : "Niche not set"}
                {project.target_audience ? ` • ${project.target_audience}` : ""}
              </p>
            </CardContent>
          </Card>

          {/* Funnel Panel */}
          <Card className="border-accent/20">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-accent" /> Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {hasFunnel ? (
                <div className="flex flex-col items-center gap-1.5">
                  {[
                    { label: "Traffic", conv: "100%" },
                    { label: "Opt-in", conv: "25-40%" },
                    { label: "Sales Page", conv: "2-5%" },
                    { label: "Checkout", conv: "60-80%" },
                    { label: "Upsell", conv: "10-20%" },
                    { label: "Thank You", conv: "—" },
                  ].map((node, i) => (
                    <div key={node.label} className="w-full">
                      <FunnelNode label={node.label} conversion={node.conv} active={true} />
                      {i < 5 && <div className="flex justify-center"><ArrowDown className="h-3 w-3 text-muted-foreground/40 my-0.5" /></div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <Target className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Funnel not built yet</p>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/wizard/${project.id}`)} className="text-xs">
                    Build Funnel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Traffic Panel */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-chart-4" /> Traffic Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {project.step4_marketing ? (
                <>
                  <div className="space-y-2">
                    {[
                      { source: "Email List", icon: Mail, pct: 40 },
                      { source: "Affiliates", icon: Users, pct: 30 },
                      { source: "Social Media", icon: Share2, pct: 20 },
                      { source: "Organic", icon: Globe, pct: 10 },
                    ].map(({ source, icon: Icon, pct }) => (
                      <div key={source} className="flex items-center gap-2">
                        <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-[11px] flex-1">{source}</span>
                        <Progress value={pct} className="h-1 w-16" />
                        <span className="text-[10px] text-muted-foreground w-6 text-right">{pct}%</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="p-2 rounded-lg bg-primary/5 text-center">
                    <p className="text-[10px] text-muted-foreground">Visitors needed for $1,000</p>
                    <p className="text-lg font-bold text-primary">{Math.ceil(1000 / (fePrice * 0.035)).toLocaleString()}</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <Eye className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Generate marketing assets to unlock traffic planning</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Panel */}
          <Card className="border-chart-2/20">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-chart-2" /> Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {[
                { label: "Conservative", data: projections.conservative, color: "text-muted-foreground" },
                { label: "Moderate", data: projections.moderate, color: "text-chart-4" },
                { label: "Optimistic", data: projections.optimistic, color: "text-chart-2" },
              ].map(({ label, data, color }) => (
                <div key={label} className="p-2 rounded-lg bg-muted/20 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>${data.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>{data.visitors.toLocaleString()} visitors</span>
                    <span>{data.sales} sales</span>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="text-center pt-1">
                <p className="text-[10px] text-muted-foreground">Per sale earnings</p>
                <p className="text-xl font-black text-chart-2">${fePrice}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Bottom: AI Advisor + Task Engine ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* AI Launch Advisor */}
          <Card className="lg:col-span-1 border-accent/20">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> AI Launch Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {advisorTips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                    tip.type === "success" ? "bg-chart-2/5 text-chart-2" :
                    tip.type === "warning" ? "bg-chart-4/5 text-chart-4" :
                    "bg-primary/5 text-primary"
                  }`}
                >
                  {tip.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" /> :
                   tip.type === "warning" ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> :
                   <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                  <span className="leading-relaxed">{tip.text}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Launch Task Engine */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-chart-4" /> Launch Tasks
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {nextTasks.filter(t => t.done).length}/{nextTasks.length} done
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nextTasks.map((task, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={task.action}
                    disabled={task.done}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors w-full ${
                      task.done
                        ? "border-chart-2/20 bg-chart-2/5 opacity-70"
                        : "border-border/40 bg-muted/10 hover:bg-muted/30 hover:border-primary/30"
                    }`}
                  >
                    {task.done
                      ? <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" />
                      : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className={`text-xs font-medium flex-1 ${task.done ? "line-through text-muted-foreground" : ""}`}>
                      {task.label}
                    </span>
                    {!task.done && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Launch Timeline ─── */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-primary" /> 7-Day Launch Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {[
                { day: 1, task: "Finalize Product", icon: Package },
                { day: 2, task: "Build Assets", icon: Sparkles },
                { day: 3, task: "Create Funnel", icon: Target },
                { day: 4, task: "Write Emails", icon: Mail },
                { day: 5, task: "Social Posts", icon: Share2 },
                { day: 6, task: "Soft Launch", icon: Play },
                { day: 7, task: "Full Launch 🚀", icon: Rocket },
              ].map(({ day, task, icon: Icon }, i) => {
                const dayDone = day <= completedStages;
                return (
                  <div key={day} className="flex items-center gap-1 flex-1 min-w-[100px]">
                    <div className={`flex flex-col items-center gap-1.5 flex-1 py-3 px-2 rounded-lg border ${
                      dayDone ? "border-primary/30 bg-primary/5" : "border-border/20 bg-muted/10"
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        dayDone ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold">Day {day}</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">{task}</p>
                      </div>
                    </div>
                    {i < 6 && <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
