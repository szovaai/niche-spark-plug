import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useCreditBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [reserved, setReserved] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setBalance(null);
      setReserved(0);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("v_credit_balance")
      .select("balance, reserved")
      .eq("user_id", user.id)
      .maybeSingle();
    setBalance(data?.balance ?? 0);
    setReserved(data?.reserved ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balance, reserved, available: (balance ?? 0) - reserved, loading, refresh };
}
