import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Sparkles, ArrowRight, FolderOpen } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { StageMap, type NovaStage } from "@/components/nova/StageMap";
import { CreditsBadge } from "@/components/nova/CreditsBadge";
import { useAuth } from "@/hooks/useAuth";
import { useFounderProfile } from "@/hooks/useFounderProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Project = {
  id: string;
  project_name: string;
  status: string;
  current_stage: NovaStage;
  progress_pct: number;
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
        .select("id, project_name, status, current_stage, progress_pct, updated_at")
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

  return (
    <DashboardLayout title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" /> Nova · your AI launch manager
            </div>
            <h1 className="text-2xl font-semibold">Good to see you, {greetingName}.</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              An AI launch coach that guides you from idea to launch through measurable
              missions. You make the calls — Nova and her team do the work.
            </p>
          </div>
          <CreditsBadge />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
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
                projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/project/${p.id}`)}
                    className="flex w-full items-center justify-between rounded-md border border-border/30 bg-background/40 px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div>
                      <div className="text-sm font-medium">{p.project_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.current_stage.replace("_", " ")} ·{" "}
                        {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your missions</CardTitle>
            </CardHeader>
            <CardContent>
              <StageMap
                current={(activeProject?.current_stage ?? "founder_profile") as NovaStage}
                complete={activeProject ? ["founder_profile"] : []}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
