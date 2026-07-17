// Incremental founder profile writes.
// Called after every onboarding answer so partial progress is never lost.
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_FIELDS = [
  "preferred_name", "full_name", "bio", "interests", "skills", "experience",
  "goals", "weekly_hours", "budget_band", "audience", "brand_tone",
  "camera_comfort", "has_audience", "public_urls", "research_consent",
] as const;

const BodySchema = z.object({
  updates: z.record(z.string(), z.unknown()),
  onboarding_step: z.number().int().min(0).max(20).optional(),
  complete: z.boolean().optional(),
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json(401, { error: "unauthenticated" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return json(401, { error: "unauthenticated" });
    const userId = userRes.user.id;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json(400, { error: "invalid_body", details: parsed.error.flatten() });

    // Whitelist fields
    const clean: Record<string, unknown> = {};
    for (const k of Object.keys(parsed.data.updates)) {
      if ((ALLOWED_FIELDS as readonly string[]).includes(k)) {
        clean[k] = parsed.data.updates[k];
      }
    }
    if (typeof parsed.data.onboarding_step === "number") {
      clean.onboarding_step = parsed.data.onboarding_step;
    }
    if (parsed.data.complete) {
      clean.onboarding_completed_at = new Date().toISOString();
    }
    clean.user_id = userId;

    const { error } = await supabase
      .from("founder_profiles")
      .upsert(clean, { onConflict: "user_id" });

    if (error) {
      console.error("[onboard-user] upsert error", error);
      return json(500, { error: error.message });
    }

    return json(200, { ok: true });
  } catch (e) {
    console.error("[onboard-user] error", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
