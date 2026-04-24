import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { QualityMode, UserPreference } from "@/lib/aiRouting";

export interface AIRoutingPrefs {
  qualityMode: QualityMode;
  modelPreference: UserPreference;
}

const DEFAULTS: AIRoutingPrefs = {
  qualityMode: "balanced",
  modelPreference: "auto",
};

/**
 * Loads the user's global AI routing preferences from `profiles`.
 * Returns defaults until loaded; never throws.
 */
export function useAIRoutingPrefs(): AIRoutingPrefs & { loaded: boolean } {
  const [prefs, setPrefs] = useState<AIRoutingPrefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (!cancelled) setLoaded(true); return; }
        const { data } = await supabase
          .from("profiles")
          .select("ai_quality_mode, ai_model_preference")
          .eq("id", user.id)
          .maybeSingle();
        if (!cancelled && data) {
          setPrefs({
            qualityMode: (data.ai_quality_mode as QualityMode) || DEFAULTS.qualityMode,
            modelPreference: (data.ai_model_preference as UserPreference) || DEFAULTS.modelPreference,
          });
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { ...prefs, loaded };
}

/**
 * Resolve effective routing for an edge-function call: per-project override beats global.
 */
export function resolveRouting(
  global: AIRoutingPrefs,
  override?: QualityMode | null,
): AIRoutingPrefs {
  return {
    qualityMode: override || global.qualityMode,
    modelPreference: global.modelPreference,
  };
}
