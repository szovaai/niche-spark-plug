import { createClient } from "npm:@supabase/supabase-js@2";

// Only call after getUser()/validateAuth has verified the caller. Never accept a body user ID.
export function creditTasksForUser(userId: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Credit service is unavailable");
  const admin = createClient(url, key, { auth: { persistSession: false } });
  return {
    async rpc(name: string, args: Record<string, unknown>) {
      if (!["reserve_task_credits", "finalize_task_credits", "release_task_credits"].includes(name)) {
        throw new Error("Unsupported credit operation");
      }
      const result = await admin.rpc(`${name}_for_user`, { ...args, _user_id: userId });
      if (name === "finalize_task_credits" && (result.error || !result.data?.ok)) {
        throw new Error(result.error?.message ?? result.data?.error ?? "Credit finalization failed");
      }
      return result;
    },
  };
}