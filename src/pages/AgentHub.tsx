import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Bot, Radar, Package, Sparkles, PenTool, Mail, Share2,
  Target, BarChart3, Users, Brain, Zap, ArrowRight,
  CheckCircle2, AlertTriangle, Lightbulb, Activity,
  Rocket, RefreshCw, ChevronRight
} from "lucide-react";

interface AgentData {
  agentId: string;
  agentName: string;
  status: "healthy" | "warning" | "weak" | "inactive";
  score: number;
  insights: Array<{ text: string; type: "success" | "warning" | "info"; priority: number }>;
  recommendations: string[];
}

const AGENT_META: Record<string, { icon: any; color: string; description: string }> = {
  "opportunity": { icon: Radar, color: "text-primary", description: "Finds profitable product opportunities and assigns launch scores." },
  "product-architect": { icon: Package, color: "text-chart-2", description: "Designs product structure, modules, and transformation promise." },
  "asset-builder": { icon: Sparkles, color: "text-accent", description: "Generates checklists, scripts, worksheets, and templates." },
  "copy-architect": { icon: PenTool, color: "text-chart-4", description: "Creates high-converting sales copy, headlines, and CTAs." },
  "email-campaign": { icon: Mail, color: "text-primary", description: "Builds launch email sequences with storytelling hooks." },
  "viral-content": { icon: Share2, color: "text-accent", description: "Generates viral hooks, short-form scripts, and social posts." },
  "funnel-architect": { icon: Target, color: "text-chart-2", description: "Optimizes funnel structure, upsells, and checkout flow." },
  "simulation": { icon: BarChart3, color: "text-chart-4", description: "Predicts conversions, revenue, and identifies weak points." },
  "affiliate": { icon: Users, color: "text-primary", description: "Optimizes affiliate commission, EPC, and swipe copy." },
  "learning": { icon: Brain, color: "text-accent", description: "Tracks patterns and recommends optimized launch blueprints." },
};

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: "bg-chart-2 shadow-[0_0_8px_hsl(var(--chart-2)/0.5)]",
    warning: "bg-chart-4 shadow-[0_0_8px_hsl(var(--chart-4)/0.5)]",
    weak: "bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.5)]",
    inactive: "bg-muted-foreground/30",
  };
  return <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[status] || colors.inactive}`} />;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border/20 bg-card/40 backdrop-blur-md shadow-[0_4px_30px_-10px_hsl(var(--primary)/0.08)] transition-all duration-300 hover:border-border/40 ${className}`}>
      {children}
    </div>
  );
}

export default function AgentHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (user) loadLatestProject();
    else setLoading(false);
  }, [user]);

  const loadLatestProject = async () => {
    try {
      const { data } = await supabase
        .from("launch_projects")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setProject(data[0]);
        await runAnalysis(data[0], false);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const runAnalysis = async (proj: any, useAI: boolean) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-agent-analyze", {
        body: { project: proj, useAI },
      });
      if (error) throw error;
      setAgents(data.agents || []);
      if (useAI) toast.success("AI-enhanced analysis complete");
    } catch (e: any) {
      console.error(e);
      toast.error("Analysis failed: " + (e.message || "Unknown error"));
    } finally { setAnalyzing(false); }
  };

  const activeAgents = agents.filter(a => a.status !== "inactive").length;
  const avgScore = agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.score, 0) / agents.length) : 0;
  const allInsights = agents.flatMap(a => a.insights).sort((a, b) => a.priority - b.priority);
  const selectedAgentData = agents.find(a => a.agentId === selectedAgent);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-4 p-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-5 gap-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
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
            <Bot className="h-10 w-10 text-primary" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold">AI Agent Hub</h2>
            <p className="text-sm text-muted-foreground mt-2">Create a launch project to activate your AI team.</p>
          </div>
          <Button onClick={() => navigate("/wizard")} className="gap-2">
            <Rocket className="h-4 w-4" /> Start New Launch
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-5 px-3 sm:px-5 pb-10">
        {/* Header */}
        <GlassCard className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ rotate: 10 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-[0_0_25px_-5px_hsl(var(--primary)/0.4)]">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold">AI Agent Hub</h1>
                <p className="text-xs text-muted-foreground/50">Your AI launch team — 10 specialized agents working together</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-card/60 border border-border/20">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{activeAgents}</p>
                  <p className="text-[8px] text-muted-foreground/40 uppercase">Active</p>
                </div>
                <Separator orientation="vertical" className="h-8 opacity-20" />
                <div className="text-center">
                  <p className="text-lg font-bold text-chart-2">{avgScore}</p>
                  <p className="text-[8px] text-muted-foreground/40 uppercase">Avg Score</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => runAnalysis(project, true)} disabled={analyzing} className="gap-1.5 text-xs">
                <RefreshCw className={`h-3 w-3 ${analyzing ? "animate-spin" : ""}`} />
                {analyzing ? "Analyzing..." : "AI Enhance"}
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Agent Priority Pipeline */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-3">
            <Zap className="h-3 w-3 text-chart-4/70" /> Agent Priority Pipeline
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {agents.map((agent, i) => {
              const meta = AGENT_META[agent.agentId];
              const Icon = meta?.icon || Bot;
              return (
                <div key={agent.agentId} className="flex items-center min-w-[100px]">
                  <motion.button
                    whileHover={{ y: -3 }}
                    onClick={() => setSelectedAgent(selectedAgent === agent.agentId ? null : agent.agentId)}
                    className={`flex flex-col items-center gap-1.5 flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer ${
                      selectedAgent === agent.agentId ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/10"
                    } ${agent.status === "inactive" ? "opacity-30" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      agent.status === "healthy" ? "bg-chart-2/15 text-chart-2" :
                      agent.status === "warning" ? "bg-chart-4/15 text-chart-4" :
                      agent.status === "weak" ? "bg-destructive/15 text-destructive" :
                      "bg-muted/15 text-muted-foreground"
                    }`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[8px] font-medium text-center leading-tight">{agent.agentName.replace(" Agent", "")}</span>
                    <StatusDot status={agent.status} />
                  </motion.button>
                  {i < agents.length - 1 && <div className="w-2 h-px shrink-0 bg-border/15" />}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Agent Grid */}
          <div className="xl:col-span-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent, i) => {
                const meta = AGENT_META[agent.agentId];
                const Icon = meta?.icon || Bot;
                const isExpanded = selectedAgent === agent.agentId;
                return (
                  <motion.div key={agent.agentId}
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    layout>
                    <GlassCard className={`cursor-pointer transition-all ${isExpanded ? "ring-1 ring-primary/30" : ""}`}>
                      <button className="p-4 w-full text-left" onClick={() => setSelectedAgent(isExpanded ? null : agent.agentId)}>
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            agent.status === "healthy" ? "bg-chart-2/10" :
                            agent.status === "warning" ? "bg-chart-4/10" :
                            "bg-muted/10"
                          }`}>
                            <Icon className={`h-4 w-4 ${meta?.color || "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold truncate">{agent.agentName}</h3>
                              <StatusDot status={agent.status} />
                            </div>
                            <p className="text-[10px] text-muted-foreground/50 line-clamp-1">{meta?.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-lg font-bold ${
                              agent.score >= 70 ? "text-chart-2" : agent.score >= 40 ? "text-chart-4" : "text-muted-foreground/30"
                            }`}>{agent.score}</p>
                            <p className="text-[8px] text-muted-foreground/30 uppercase">Score</p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3">
                          <Progress value={agent.score} className="h-1" />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="overflow-hidden">
                            <div className="px-4 pb-4 space-y-3">
                              <Separator className="opacity-10" />
                              {/* Insights */}
                              <div>
                                <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider font-semibold mb-2">Insights</p>
                                <div className="space-y-1.5">
                                  {agent.insights.map((insight, j) => {
                                    const iconMap = { success: CheckCircle2, warning: AlertTriangle, info: Lightbulb };
                                    const colorMap = {
                                      success: "text-chart-2 bg-chart-2/5 border-chart-2/10",
                                      warning: "text-chart-4 bg-chart-4/5 border-chart-4/10",
                                      info: "text-primary bg-primary/5 border-primary/10",
                                    };
                                    const TipIcon = iconMap[insight.type];
                                    return (
                                      <div key={j} className={`flex items-start gap-2 p-2.5 rounded-lg border text-[11px] ${colorMap[insight.type]}`}>
                                        <TipIcon className="h-3 w-3 shrink-0 mt-0.5" />
                                        <span>{insight.text}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              {/* Recommendations */}
                              <div>
                                <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider font-semibold mb-2">Recommendations</p>
                                <div className="space-y-1">
                                  {agent.recommendations.map((rec, j) => (
                                    <div key={j} className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                                      <ChevronRight className="h-2.5 w-2.5 text-primary/40 shrink-0" />
                                      <span>{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Combined Intelligence Feed */}
          <div className="xl:col-span-4 space-y-5">
            <GlassCard className="p-5 sticky top-20">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent/60 uppercase tracking-widest mb-3">
                <Activity className="h-3 w-3" /> Intelligence Feed
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {allInsights.slice(0, 12).map((insight, i) => {
                  const iconMap = { success: CheckCircle2, warning: AlertTriangle, info: Lightbulb };
                  const colorMap = {
                    success: "text-chart-2 bg-chart-2/4 border-chart-2/10",
                    warning: "text-chart-4 bg-chart-4/4 border-chart-4/10",
                    info: "text-primary bg-primary/4 border-primary/10",
                  };
                  const Icon = iconMap[insight.type];
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-2 p-3 rounded-lg border text-xs leading-relaxed ${colorMap[insight.type]}`}>
                      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{insight.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              <Separator className="opacity-10 my-4" />

              {/* Agent Health Overview */}
              <div>
                <p className="text-[9px] text-muted-foreground/35 uppercase tracking-widest font-semibold mb-2">Agent Health</p>
                <div className="space-y-1.5">
                  {agents.map(agent => (
                    <div key={agent.agentId} className="flex items-center gap-2">
                      <StatusDot status={agent.status} />
                      <span className="text-[10px] flex-1 text-muted-foreground/60">{agent.agentName}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/35">{agent.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="opacity-10 my-4" />

              <div className="space-y-1.5">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate("/command-center")}>
                  <Rocket className="h-3 w-3" /> Command Center
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border/15 hover:border-primary/20"
                  onClick={() => navigate("/wizard")}>
                  <Sparkles className="h-3 w-3" /> Launch Wizard
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
