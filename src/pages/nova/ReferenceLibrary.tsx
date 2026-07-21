import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookMarked, Loader2, Mail, FileText, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBlueprint } from "@/hooks/useBlueprint";
import { formatDistanceToNow } from "date-fns";

type Task = {
  id: string;
  task_name: string;
  assigned_agent: string | null;
  output_json: Record<string, unknown> | null;
  completed_at: string | null;
};
type EmailCampaign = { id: string; campaign_type: string; status: string; updated_at: string };

const AGENT_LABEL: Record<string, string> = {
  opportunity_engine: "Opportunity research",
  validation_engine: "Problem validation",
  product_concept_engine: "Product concepts",
  product_outline: "Product outline",
  product_section: "Product section",
  offer_architect: "Offer architecture",
  launch_engine: "Launch plan",
  improve_engine: "Retro",
};

export default function ReferenceLibrary() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { blueprint } = useBlueprint(projectId);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emails, setEmails] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || !projectId) return;
    (async () => {
      const [{ data: t }, { data: e }] = await Promise.all([
        supabase
          .from("nova_tasks")
          .select("id, task_name, assigned_agent, output_json, completed_at")
          .eq("project_id", projectId)
          .eq("status", "completed")
          .order("completed_at", { ascending: false }),
        supabase
          .from("email_campaigns")
          .select("id, campaign_type, status, updated_at")
          .eq("project_id", projectId)
          .order("updated_at", { ascending: false }),
      ]);
      setTasks((t ?? []) as Task[]);
      setEmails((e ?? []) as EmailCampaign[]);
      setLoading(false);
    })();
  }, [user, projectId]);

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Reference Library">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const grouped = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    const k = t.assigned_agent ?? t.task_name;
    (acc[k] ||= []).push(t);
    return acc;
  }, {});

  return (
    <DashboardLayout title="Reference Library">
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${projectId}`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to missions
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookMarked className="h-3.5 w-3.5 text-primary" />
            Everything Nova has generated for this project
          </div>
        </div>

        {blueprint && (
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" /> Business Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-xs md:grid-cols-2">
              {[
                ["Business", blueprint.business_name],
                ["Niche", blueprint.niche],
                ["Audience", blueprint.target_audience],
                ["Problem", blueprint.customer_problem],
                ["Product", blueprint.product_concept],
                ["Promise", blueprint.product_promise],
                ["Offer", blueprint.offer_summary],
                ["Price", blueprint.price != null ? `$${blueprint.price}` : null],
              ]
                .filter(([, v]) => !!v)
                .map(([k, v]) => (
                  <div key={k as string} className="rounded-md border border-border/30 bg-background/40 p-2">
                    <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
                    <div className="text-foreground/80">{v as string}</div>
                  </div>
                ))}
              <div className="md:col-span-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/project/${projectId}/blueprint`)}>
                  Open full Blueprint
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {emails.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" /> Email Engine campaigns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {emails.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-md border border-border/30 bg-background/40 px-3 py-2 text-xs"
                >
                  <span className="capitalize">{e.campaign_type.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {e.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(e.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => navigate(`/project/${projectId}/launch-assets`)}>
                Open Launch Assets
              </Button>
            </CardContent>
          </Card>
        )}

        {Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Nothing filed yet. As you complete missions, everything Nova generates lands here.
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([agent, items]) => (
            <Card key={agent}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  {AGENT_LABEL[agent] ?? agent.replace(/_/g, " ")}
                  <Badge variant="outline" className="text-[10px]">
                    {items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {items.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-md border border-border/30 bg-background/40 px-3 py-2 text-xs"
                  >
                    <span className="truncate">
                      {(t.output_json?.headline as string) ||
                        (t.output_json?.headline_offer as string) ||
                        (t.output_json?.verdict as string) ||
                        t.task_name}
                    </span>
                    <span className="text-muted-foreground">
                      {t.completed_at
                        ? formatDistanceToNow(new Date(t.completed_at), { addSuffix: true })
                        : ""}
                    </span>
                  </div>
                ))}
                {items.length > 5 && (
                  <div className="pt-1 text-center text-[11px] text-muted-foreground">
                    + {items.length - 5} more
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
