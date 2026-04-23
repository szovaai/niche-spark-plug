import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AutosaveTable = "empire_projects" | "micro_products" | "toolkits" | "launch_projects";

interface UseAutosaveArgs {
  table: AutosaveTable;
  recordId: string | null | undefined;
  setRecordId?: (id: string) => void;
  userId: string | undefined;
  data: Record<string, any>;
  enabled: boolean;
  delay?: number;
  onSaved?: (id: string) => void;
}

/**
 * Generic 2s-debounced autosave for any user-owned table.
 * - First save = insert + capture id (calls setRecordId).
 * - Subsequent = update where id.
 * - Silently no-ops when disabled or while a save is in flight.
 */
export function useAutosave({
  table,
  recordId,
  setRecordId,
  userId,
  data,
  enabled,
  delay = 2000,
  onSaved,
}: UseAutosaveArgs) {
  const inFlight = useRef(false);
  const lastSerialized = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordIdRef = useRef(recordId);
  recordIdRef.current = recordId;

  useEffect(() => {
    if (!enabled || !userId) return;

    const serialized = JSON.stringify(data);
    if (serialized === lastSerialized.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (inFlight.current) return;
      inFlight.current = true;

      try {
        const currentId = recordIdRef.current;
        if (currentId) {
          const { error } = await supabase
            .from(table as any)
            .update(data as any)
            .eq("id", currentId);
          if (error) throw error;
          onSaved?.(currentId);
        } else {
          const { data: inserted, error } = await supabase
            .from(table as any)
            .insert({ ...data, user_id: userId } as any)
            .select("id")
            .single();
          if (error) throw error;
          const newId = (inserted as any)?.id as string | undefined;
          if (newId) {
            setRecordId?.(newId);
            recordIdRef.current = newId;
            onSaved?.(newId);
          }
        }
        lastSerialized.current = serialized;
      } catch (err: any) {
        console.error(`[useAutosave:${table}]`, err);
        toast.warning("Autosave failed", { description: err?.message?.slice(0, 120) });
      } finally {
        inFlight.current = false;
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, enabled, userId, table, setRecordId, delay, onSaved]);
}
