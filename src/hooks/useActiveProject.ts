import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// The user's most recently updated business workspace.
export function useActiveProject() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["active-project", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_projects").select("id, project_name")
        .eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}
