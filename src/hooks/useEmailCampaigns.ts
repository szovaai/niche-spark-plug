import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { EmailCampaign, EmailCampaignType } from "@/types/emailCampaign";

export function useEmailCampaigns(projectId: string | null) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingType, setGeneratingType] = useState<EmailCampaignType | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("project_id", projectId)
      .order("campaign_type", { ascending: true })
      .order("email_number", { ascending: true });
    setCampaigns((data as EmailCampaign[]) ?? []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const generate = useCallback(
    async (campaign_type: EmailCampaignType, repurpose = true) => {
      setGeneratingType(campaign_type);
      try {
        const { error } = await supabase.functions.invoke("generate-email-campaigns", {
          body: { campaign_type, project_id: projectId, repurpose },
        });
        if (error) throw error;
        await refresh();
      } finally {
        setGeneratingType(null);
      }
    },
    [projectId, refresh],
  );

  return { campaigns, loading, generatingType, generate, refresh };
}
