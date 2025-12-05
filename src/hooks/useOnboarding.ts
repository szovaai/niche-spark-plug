import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkOnboarding = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (data && !data.onboarding_completed) {
        setShowOnboarding(true);
      }
      setIsLoading(false);
    };

    checkOnboarding();
  }, [user]);

  const completeOnboarding = async (preferences: { platform: string; interests: string[] }) => {
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        preferred_platform: preferences.platform,
        product_interests: preferences.interests,
      })
      .eq("id", user.id);

    setShowOnboarding(false);
  };

  const skipOnboarding = async () => {
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
    skipOnboarding,
  };
}
