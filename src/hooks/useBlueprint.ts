import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Blueprint = {
  id?: string;
  project_id: string;
  business_name: string | null;
  niche: string | null;
  target_audience: string | null;
  customer_problem: string | null;
  desired_outcome: string | null;
  product_concept: string | null;
  product_promise: string | null;
  offer_summary: string | null;
  price: number | null;
  order_bump: string | null;
  upsell: string | null;
  downsell: string | null;
  funnel_platform: string | null;
  payment_provider: string | null;
  traffic_source: string | null;
  brand_voice: string | null;
  launch_date: string | null;
  revenue_goal: number | null;
  status: string;
};

const EMPTY = (projectId: string): Blueprint => ({
  project_id: projectId,
  business_name: null,
  niche: null,
  target_audience: null,
  customer_problem: null,
  desired_outcome: null,
  product_concept: null,
  product_promise: null,
  offer_summary: null,
  price: null,
  order_bump: null,
  upsell: null,
  downsell: null,
  funnel_platform: null,
  payment_provider: null,
  traffic_source: null,
  brand_voice: null,
  launch_date: null,
  revenue_goal: null,
  status: "draft",
});

export function useBlueprint(projectId: string | undefined) {
  const { user } = useAuth();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) return;
    (async () => {
      const { data } = await supabase
        .from("business_blueprints")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      setBlueprint((data as Blueprint | null) ?? EMPTY(projectId));
      setLoading(false);
    })();
  }, [user, projectId]);

  const save = useCallback(
    async (patch: Partial<Blueprint>) => {
      if (!user || !projectId) return;
      const next = { ...(blueprint ?? EMPTY(projectId)), ...patch, project_id: projectId, user_id: user.id };
      setBlueprint(next as Blueprint);
      await supabase
        .from("business_blueprints")
        .upsert(next as never, { onConflict: "project_id" });
    },
    [blueprint, user, projectId],
  );

  const filledCount = blueprint
    ? Object.entries(blueprint).filter(
        ([k, v]) => !["id", "project_id", "status"].includes(k) && v !== null && v !== "",
      ).length
    : 0;

  return { blueprint, loading, save, filledCount };
}
