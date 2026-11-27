import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight, CheckCircle2, Clock, Loader2, XCircle, PlayCircle, ShieldCheck,
  DollarSign, ShoppingCart, Users, Mail, Bot, Package, Globe, Megaphone, Gauge, Check, X,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MISSION_BY_ID } from "@/lib/missions";
import { HQ_STAGES, nextBestAction, stageIndexFromProgress } from "@/lib/businessHQ";
import { toast } from "sonner";

// New tables may not be in generated types yet.
const db = supabase as any;

type Approval = { id: string; category: string; title: string; summary: string | null; requested_by: string; link_path: string | null; created_at: string };
type Task = { id: string; task_name: string; status: string; assigned_agent: string | null; created_at: string; completed_at: string | null };

export default function BusinessHQ() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?next=/hq");
  }, [authLoading, user, navigate]);

  const hq = useQuery({
    queryKey: ["hq", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = user!.id;
      const [proj, tasks, approvals, toolkits, emails] = await Promise.all([
        db.from("business_projects").select("id, project_name, current_mission_id, overall_progress_pct").eq("user_id", uid).order("updated_at", { ascending: false }).limit(1),
        db.from("nova_tasks").select("id, task_name, status, assigned_agent, created_at, completed_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(50),
        db.from("approval_requests").select("id, category, title, summary, requested_by, link_path, created_at").eq("user_id", uid).eq("status", "pending").order("created_at", { ascending: false }),
        db.from("toolkits").select("id", { count: "exact", head: true }).eq("user_id", uid),
        db.from("email_campaigns").select("id", { count: "exact", head: true }).eq("user_id", uid),
      ]);
      if (proj.error) throw proj.error;
      return {
        project: proj.data?.[0] ?? null,
        tasks: (tasks.data ?? []) as Task[],
        approvals: (approvals.error ? [] : approvals.data ?? []) as Approval[],
        productCount: toolkits.count ?? 0,
        emailCount: emails.count ?? 0,
      };
    },
  });

  const decide = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await db.from("approval_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.status === "approved" ? "Approved" : "Rejected");
      qc.invalidateQueries({ queryKey: ["hq"] });
    },
    onError: () => toast.error("Couldn't save your decision. Try again."),
  });

  if (authLoading || hq.isLoading) {
    return <DashboardLayout title="Business HQ"><div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></DashboardLayout>;
  }
  if (hq.isError) {
    return (
      <DashboardLayout title="Business HQ">
        <div className="max-w-xl mx-auto py-24 text-center space-y-4">
          <p className="text-muted-foreground">We couldn't load your HQ right now.</p>
          <Button onClick={() => hq.refetch()}>Try again</Button>
        </div>
      </DashboardLayout>
    );
  }

  const { project, tasks, approvals, productCount, emailCount } = hq.data!;
  const progress = project?.overall_progress_pct ?? 0;
  const stageIdx = stageIndexFromProgress(progress);
  const running = tasks.filter((t) => ["running", "in_progress", "processing"].includes(t.status));
  const done = tasks.filter((t) => ["completed", "complete", "done"].includes(t.status));
  const failed = tasks.filter((t) => ["failed", "error"].includes(t.status));
  const upcoming = tasks.filter((t) => ["pending", "queued"].includes(t.status));
  const mission = project?.current_mission_id ? (MISSION_BY_ID as any)[project.current_mission_id] : null;
  const action = nextBestAction({
    hasProject: !!project, projectId: project?.id, pendingApprovals: approvals.length, failedTasks: failed.length,
    currentMissionId: project?.current_mission_id, currentMissionLabel: mission?.label,
  });
  const firstName = (user?.email ?? "").split("@")[0];

  return (
    <DashboardLayout title="Business HQ">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Welcome */}
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-primary">Business HQ</p>
          <h2 className="text-3xl md:text-4xl font-bold">Welcome to your Empire.</h2>
          <p className="text-muted-foreground max-w-2xl">
            {project
              ? `Hi ${firstName} — ${project.project_name} is in the ${HQ_STAGES[stageIdx]} stage. Here's what matters today.`
              : `Hi ${firstName} — let's find the right business for you. I'll guide every step.`}
          </p>
        </section>

        {/* Next best action */}
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary mb-1">Your next step</p>
              <h3 className="text-xl font-semibold">{action.label}</h3>
              <p className="text-sm text-muted-foreground">{action.detail}</p>
            </div>
            {action.href.startsWith("#") ? (
              <Button size="lg" asChild><a href={action.href}>Review now <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
            ) : (
              <Button size="lg" asChild><Link to={action.href}>Go <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            )}
          </CardContent>
        </Card>

        {/* Launch progress */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Launch progress · {progress}%</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progress} />
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {HQ_STAGES.map((s, i) => (
                <div key={s} className={`rounded-md border px-2 py-2 text-center text-sm ${i < stageIdx ? "border-primary/40 text-primary" : i === stageIdx && project ? "border-primary bg-primary/10 font-semibold" : "text-muted-foreground"}`}>
                  {i < stageIdx && <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />}{s}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <section>
          <h3 className="font-semibold mb-3">Business performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric icon={DollarSign} label="Revenue" empty="Connect payments to track" />
            <Metric icon={ShoppingCart} label="Orders" empty="No sales yet" />
            <Metric icon={Users} label="Website visitors" empty="Publish a site to track" />
            <Metric icon={Gauge} label="Conversion rate" empty="Needs visitors + sales" />
            <Metric icon={Mail} label="Email campaigns" value={emailCount} />
            <Metric icon={Users} label="Leads" empty="Lead capture coming soon" />
            <Metric icon={Package} label="Products created" value={productCount} />
            <Metric icon={Bot} label="AI tasks completed" value={done.length} />
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Approval center */}
          <Card id="approvals">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base">Approval center</CardTitle>
              <Badge variant={approvals.length ? "default" : "secondary"}>{approvals.length} waiting</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {approvals.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting for you. When your AI team finishes products, branding, websites, marketing or emails, they'll appear here for your OK.</p>}
              {approvals.map((a) => (
                <div key={a.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{a.category}</Badge>
                    <span className="text-xs text-muted-foreground">from {a.requested_by} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="font-medium">{a.title}</p>
                  {a.summary && <p className="text-sm text-muted-foreground">{a.summary}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" disabled={decide.isPending} onClick={() => decide.mutate({ id: a.id, status: "approved" })}><Check className="h-4 w-4 mr-1" />Approve</Button>
                    <Button size="sm" variant="outline" disabled={decide.isPending} onClick={() => decide.mutate({ id: a.id, status: "rejected" })}><X className="h-4 w-4 mr-1" />Reject</Button>
                    {a.link_path && <Button size="sm" variant="ghost" asChild><Link to={a.link_path}>Open</Link></Button>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI team */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">AI team activity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <Stat icon={PlayCircle} n={running.length} label="Running" />
                <Stat icon={Clock} n={upcoming.length} label="Upcoming" />
                <Stat icon={CheckCircle2} n={done.length} label="Done" />
                <Stat icon={XCircle} n={failed.length} label="Failed" />
              </div>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your AI team hasn't started yet. Start a mission and their work shows up here.</p>
              ) : (
                <ul className="space-y-1.5">
                  {tasks.slice(0, 6).map((t) => (
                    <li key={t.id} className="flex justify-between text-sm gap-2">
                      <span className="truncate">{t.task_name}</span>
                      <span className="text-muted-foreground capitalize shrink-0">{t.status.replace("_", " ")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Business health</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <Health icon={Package} label="Product readiness" ok={productCount > 0} okText="Product created" offText="No product yet" />
            <Health icon={Globe} label="Website" ok={false} offText="Not published" />
            <Health icon={DollarSign} label="Payments" ok={false} offText="Not connected" />
            <Health icon={Megaphone} label="Marketing" ok={emailCount > 0} okText="Campaigns ready" offText="No campaigns yet" />
            <Health icon={Bot} label="AI team" ok={failed.length === 0} okText="Available" offText={`${failed.length} failed task(s)`} />
            <Health icon={ShieldCheck} label="Approvals" ok={approvals.length === 0} okText="All clear" offText={`${approvals.length} waiting`} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Metric({ icon: Icon, label, value, empty }: { icon: any; label: string; value?: number; empty?: string }) {
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
      {value !== undefined ? <p className="text-2xl font-bold mt-1">{value}</p> : <p className="text-sm text-muted-foreground mt-2">{empty}</p>}
    </CardContent></Card>
  );
}
function Stat({ icon: Icon, n, label }: { icon: any; n: number; label: string }) {
  return <div className="rounded-md border p-2"><Icon className="h-4 w-4 mx-auto mb-1 text-primary" /><p className="font-bold">{n}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}
function Health({ icon: Icon, label, ok, okText, offText }: { icon: any; label: string; ok: boolean; okText?: string; offText: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border p-3">
      <span className={`mt-1 h-2 w-2 rounded-full ${ok ? "bg-primary" : "bg-muted-foreground/50"}`} />
      <div><p className="font-medium flex items-center gap-1"><Icon className="h-3.5 w-3.5" />{label}</p><p className="text-muted-foreground">{ok ? okText : offText}</p></div>
    </div>
  );
}
