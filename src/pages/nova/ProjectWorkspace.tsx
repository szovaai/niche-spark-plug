import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NovaChat } from "@/components/nova/NovaChat";
import { StageMap, type NovaStage } from "@/components/nova/StageMap";
import { CreditsBadge } from "@/components/nova/CreditsBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { UIMessage } from "ai";
import { toast } from "sonner";

type Project = {
  id: string;
  project_name: string;
  current_stage: NovaStage;
  progress_pct: number;
  user_id: string;
};

type ConvRow = { id: string; project_id: string | null };
type MsgRow = {
  message_id: string;
  role: string;
  parts: unknown;
  metadata: unknown;
  sequence_no: number;
};

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || !projectId) return;
    (async () => {
      const { data: proj, error } = await supabase
        .from("business_projects")
        .select("id, project_name, current_stage, progress_pct, user_id")
        .eq("id", projectId)
        .maybeSingle();
      if (error || !proj) {
        toast.error("Project not found.");
        navigate("/dashboard");
        return;
      }
      setProject(proj as Project);

      // Find or create default conversation for this project
      const { data: convs } = await supabase
        .from("nova_conversations")
        .select("id, project_id")
        .eq("project_id", projectId)
        .eq("kind", "coach")
        .order("created_at", { ascending: true })
        .limit(1);
      let conv: ConvRow | null = (convs?.[0] as ConvRow) ?? null;
      if (!conv) {
        const { data: newConv } = await supabase
          .from("nova_conversations")
          .insert({
            user_id: user.id,
            project_id: projectId,
            title: proj.project_name,
            kind: "coach",
          })
          .select("id, project_id")
          .single();
        conv = newConv as ConvRow;
      }
      setConversationId(conv.id);

      // Load unsummarized messages (audit trail preserved server-side)
      const { data: msgs } = await supabase
        .from("nova_messages")
        .select("message_id, role, parts, metadata, sequence_no")
        .eq("conversation_id", conv.id)
        .is("summarized_at", null)
        .order("sequence_no", { ascending: true });

      const uiMessages: UIMessage[] = (msgs ?? []).map((m: MsgRow) => ({
        id: m.message_id,
        role: m.role as UIMessage["role"],
        parts: (Array.isArray(m.parts) ? m.parts : []) as UIMessage["parts"],
        metadata: (m.metadata ?? {}) as UIMessage["metadata"],
      }));
      setInitialMessages(uiMessages);
      setLoading(false);
    })();
  }, [user, projectId, navigate]);

  if (authLoading || loading || !project || !conversationId) {
    return (
      <DashboardLayout title="Project">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={project.project_name}>
      <div className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
            </Button>
            <CreditsBadge />
          </div>
          <Card className="h-[calc(100vh-220px)] overflow-hidden">
            <CardHeader className="border-b border-border/20 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" /> Talk to Nova
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-49px)] p-0">
              <NovaChat
                conversationId={conversationId}
                projectId={project.id}
                initialMessages={initialMessages}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Launch map</CardTitle>
            </CardHeader>
            <CardContent>
              <StageMap current={project.current_stage} complete={["founder_profile"]} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Your decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Nova is warming up your Opportunity Research. Once she surfaces three
                niches, you'll pick the one that fits.
              </p>
              <p className="text-xs">Coming next: Opportunity Engine (Phase 2).</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
