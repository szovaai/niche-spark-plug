import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface SavedNiche {
  id: string;
  niche_id: string;
  niche_name: string;
  alert_enabled: boolean;
  created_at: string;
}

export function useSavedNiches() {
  const { user, role } = useAuth();
  const [savedNiches, setSavedNiches] = useState<SavedNiche[]>([]);
  const [loading, setLoading] = useState(true);

  const maxSaves = role === "pro" ? Infinity : 3;

  useEffect(() => {
    if (user) {
      fetchSavedNiches();
    } else {
      setSavedNiches([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSavedNiches = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_niches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved niches:", error);
    } else {
      setSavedNiches(data || []);
    }
    setLoading(false);
  };

  const isNicheSaved = (nicheId: string) => {
    return savedNiches.some((n) => n.niche_id === nicheId);
  };

  const saveNiche = async (nicheId: string, nicheName: string) => {
    if (!user) {
      toast.error("Please sign in to save niches");
      return false;
    }

    if (savedNiches.length >= maxSaves && role === "free") {
      toast.error("Free accounts can save up to 3 niches. Upgrade to Pro for unlimited saves!");
      return false;
    }

    const { error } = await supabase.from("saved_niches").insert({
      user_id: user.id,
      niche_id: nicheId,
      niche_name: nicheName,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("This niche is already saved");
      } else {
        toast.error("Failed to save niche");
        console.error(error);
      }
      return false;
    }

    toast.success("Niche saved!");
    await fetchSavedNiches();
    return true;
  };

  const unsaveNiche = async (nicheId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from("saved_niches")
      .delete()
      .eq("user_id", user.id)
      .eq("niche_id", nicheId);

    if (error) {
      toast.error("Failed to remove niche");
      console.error(error);
      return false;
    }

    toast.success("Niche removed");
    await fetchSavedNiches();
    return true;
  };

  const toggleAlert = async (nicheId: string, enabled: boolean) => {
    if (!user) return false;

    const { error } = await supabase
      .from("saved_niches")
      .update({ alert_enabled: enabled })
      .eq("user_id", user.id)
      .eq("niche_id", nicheId);

    if (error) {
      toast.error("Failed to update alert");
      console.error(error);
      return false;
    }

    toast.success(enabled ? "Alert enabled" : "Alert disabled");
    await fetchSavedNiches();
    return true;
  };

  return {
    savedNiches,
    loading,
    isNicheSaved,
    saveNiche,
    unsaveNiche,
    toggleAlert,
    maxSaves,
    canSaveMore: role === "pro" || savedNiches.length < maxSaves,
  };
}