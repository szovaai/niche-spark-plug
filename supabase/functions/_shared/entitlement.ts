import { getUserTier } from "./tieredAI.ts";

// Server-side Pro gate. Returns a 403 Response for non-Pro users, or null when allowed.
export async function requirePro(userId: string, corsHeaders: Record<string, string>): Promise<Response | null> {
  const tier = await getUserTier(userId);
  if (tier === "pro") return null;
  return new Response(
    JSON.stringify({ error: "This feature requires a Pro plan.", code: "pro_required" }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
