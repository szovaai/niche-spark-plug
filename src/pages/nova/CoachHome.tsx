import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NovaChat } from "@/components/nova/NovaChat";
import { CreditsBadge } from "@/components/nova/CreditsBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFounderProfile } from "@/hooks/useFounderProfile";
import type { UIMessage } from "ai";

type MsgRow = { message_id: string; role: string; parts: unknown; metadata: unknown; sequence_no: number };

export default function CoachHome() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useFounderProfile();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?next=/coach");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!profile) return;
    if (!profile.onboarding_completed_at) navigate("/onboarding");
  }, [profile, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Global coach conversation: project_id NULL, kind='coach'
      const { data: convs } = await supabase
        .from("nova_conversations")
        .select("id")
        .eq("user_id", user.id)
        .is("project_id", null)
        .eq("kind", "coach")
        .order("created_at", { ascending: true })
        .limit(1);
      let convId = convs?.[0]?.id ?? null;
      if (!convId) {
        const { data: newConv } = await supabase
          .from("nova_conversations")
          .insert({ user_id: user.id, project_id: null, title: "General coaching", kind: "coach" })
          .select("id")
          .single();
        convId = newConv?.id ?? null;
      }
      if (!convId) {
        setLoading(false);
        return;
      }
      setConversationId(convId);
      const { data: msgs } = await supabase
        .from("nova_messages")
        .select("message_id, role, parts, metadata, sequence_no")
        .eq("conversation_id", convId)
        .is("summarized_at", null)
        .order("sequence_no", { ascending: true });
      setInitialMessages(
        (msgs ?? []).map((m: MsgRow) => ({
          id: m.message_id,
          role: m.role as UIMessage["role"],
          parts: (Array.isArray(m.parts) ? m.parts : []) as UIMessage["parts"],
          metadata: (m.metadata ?? {}) as UIMessage["metadata"],
        })),
      );
      setLoading(false);
    })();
  }, [user]);

  if (authLoading || profileLoading || loading || !conversationId) {
    return (
      <DashboardLayout title="Nova">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Nova">
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
          </Button>
          <CreditsBadge />
        </div>
        <Card className="h-[calc(100vh-180px)] overflow-hidden">
          <CardHeader className="border-b border-border/20 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" /> Nova · general coaching
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-49px)] p-0">
            <NovaChat conversationId={conversationId} initialMessages={initialMessages} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
