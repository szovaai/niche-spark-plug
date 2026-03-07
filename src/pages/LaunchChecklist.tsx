import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LaunchChecklist = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProjects();
    else setLoading(false);
  }, [user]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("launch_projects")
      .select("id, name, step5_checklist")
      .not("step5_checklist", "is", null)
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const toggleStep = async (projectId: string, stepId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const checklist = project.step5_checklist as any;
    const updated = {
      ...checklist,
      steps: checklist.steps.map((s: any) => s.id === stepId ? { ...s, completed: !s.completed } : s),
    };
    setProjects(p => p.map(x => x.id === projectId ? { ...x, step5_checklist: updated } : x));
    await supabase.from("launch_projects").update({ step5_checklist: updated }).eq("id", projectId);
  };

  return (
    <DashboardLayout title="Launch Checklist">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Launch Checklists</h1>
          <p className="text-muted-foreground text-sm">Track your progress across all projects.</p>
        </div>

        {loading ? (
          <Skeleton className="h-40" />
        ) : projects.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No checklists yet. Generate one from the AI Launch Wizard.</p>
          </CardContent></Card>
        ) : (
          projects.map(p => {
            const checklist = p.step5_checklist as any;
            const steps = checklist?.steps || [];
            const done = steps.filter((s: any) => s.completed).length;
            return (
              <Card key={p.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{p.name}</h3>
                    <span className="text-sm text-muted-foreground">{done}/{steps.length}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} />
                  </div>
                  <div className="space-y-2">
                    {steps.map((step: any, i: number) => (
                      <button key={step.id} onClick={() => toggleStep(p.id, step.id)} className={`flex items-start gap-3 w-full text-left p-2 rounded-lg hover:bg-secondary/50 transition-colors ${step.completed ? "opacity-60" : ""}`}>
                        {step.completed ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />}
                        <div>
                          <p className={`text-sm font-medium ${step.completed ? "line-through" : ""}`}>{step.title}</p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
};

export default LaunchChecklist;
