import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type FounderProfile = {
  user_id: string;
  preferred_name: string | null;
  full_name: string | null;
  interests: string[] | null;
  skills: string[] | null;
  experience: string | null;
  goals: string | null;
  weekly_hours: string | null;
  budget_band: string | null;
  audience: string | null;
  brand_tone: string | null;
  camera_comfort: string | null;
  has_audience: string | null;
  public_urls: Record<string, unknown> | null;
  research_consent: boolean | null;
  onboarding_step: number | null;
  onboarding_completed_at: string | null;
};

export function useFounderProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FounderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("founder_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile((data as FounderProfile) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveAnswer = useCallback(
    async (updates: Partial<FounderProfile>, opts?: { step?: number; complete?: boolean }) => {
      const { data, error } = await supabase.functions.invoke("onboard-user", {
        body: {
          updates,
          onboarding_step: opts?.step,
          complete: opts?.complete,
        },
      });
      if (error) throw error;
      await refresh();
      return data;
    },
    [refresh],
  );

  return { profile, loading, refresh, saveAnswer };
}
