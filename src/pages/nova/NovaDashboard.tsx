import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Sparkles, ArrowRight, MessageCircle, Rocket, FolderOpen } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { CreditsBadge } from "@/components/nova/CreditsBadge";
import { useAuth } from "@/hooks/useAuth";
import { useFounderProfile } from "@/hooks/useFounderProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { MISSION_BY_ID } from "@/lib/missions";
import type { MissionId } from "@/components/nova/StageMap";

type Project = {
  id: string;
  project_name: string;
  status: string;
  current_mission_id: string | null;
  current_stage: string;
  overall_progress_pct: number;
  readiness_pct: number;
  updated_at: string;
};

export default function NovaDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useFounderProfile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?next=/dashboard");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!profile) return;
    if (!profile.onboarding_completed_at) navigate("/onboarding");
  }, [profile, navigate]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("business_projects")
        .select("id, project_name, status, current_mission_id, current_stage, overall_progress_pct, readiness_pct, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      setProjects((data ?? []) as Project[]);
      setLoading(false);
    })();
  }, [user]);

  const createProject = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-project", {
        body: { project_name: name },
      });
      if (error) throw error;
      const projectId = (data as { project?: { id?: string } })?.project?.id;
      if (!projectId) throw new Error("No project id returned");
      setDialogOpen(false);
      setNewName("");
      navigate(`/project/${projectId}`);
    } catch (e) {
      toast.error("Couldn't create the project. Try again.");
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || profileLoading || loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const greetingName = profile?.preferred_name ?? "there";
  const activeProject = projects.find((p) => p.status === "active") ?? projects[0];
  const activeMissionId = (activeProject?.current_mission_id ?? "m0") as MissionId;
  const activeMission = MISSION_BY_ID[activeMissionId] ?? MISSION_BY_ID["m0"];

  return (
    <DashboardLayout title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" /> Nova · your AI launch coach
            </div>
            <h1 className="text-2xl font-semibold">Build Your Business One Mission at a Time</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Good to see you, {greetingName}. Project Zero guides you from opportunity research to a
              completed product, working funnel, and launch plan. Continue your current mission or ask
              Nova for help.
            </p>
          </div>
          <CreditsBadge />
        </div>

        {activeProject ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-primary/30 bg-primary/[0.03]">
              <CardHeader>
                <div className="text-[10px] uppercase tracking-wide text-primary">
                  {activeMission.phase} · Mission {activeMission.id.slice(1)}
                </div>
                <CardTitle className="text-xl">{activeMission.label}</CardTitle>
                <p className="text-sm text-muted-foreground">{activeMission.headline}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Progress value={activeProject.overall_progress_pct} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{activeProject.overall_progress_pct}%</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => navigate(`/project/${activeProject.id}/m/${activeMissionId}`)}
                  >
                    Continue mission <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/project/${activeProject.id}`)}
                  >
                    <MessageCircle className="mr-1 h-4 w-4" /> Talk to your coach
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Launch readiness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Rocket className="h-4 w-4 text-primary" />
                  <Progress value={activeProject.readiness_pct} className="h-1.5 flex-1" />
                  <span className="text-xs">{activeProject.readiness_pct}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Readiness tracks blueprint, product, offer, funnel, payments, and traffic.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/project/${activeProject.id}`)}
                >
                  Open mission ladder
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Your projects</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" /> New project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Name your next product</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. First Digital Product Launch Kit"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void createProject();
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can rename or add more projects any time.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={createProject} disabled={creating || !newName.trim()}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/40 p-8 text-center">
                <FolderOpen className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No projects yet. Create one and Nova will meet you there.
                </p>
              </div>
            ) : (
              projects.map((p) => {
                const mId = (p.current_mission_id ?? "m0") as MissionId;
                const mDef = MISSION_BY_ID[mId] ?? MISSION_BY_ID["m0"];
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/project/${p.id}`)}
                    className="flex w-full items-center justify-between rounded-md border border-border/30 bg-background/40 px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{p.project_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {mDef.label} · {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <Progress value={p.overall_progress_pct} className="h-1" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
