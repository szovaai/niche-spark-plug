import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateAuth } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await validateAuth(req);
    if (auth.error || !auth.user) {
      return new Response(JSON.stringify({ error: auth.error || "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const cacheKey = `goldmines:${today}`;
    const { data: cached } = await sb
      .from("ai_cache")
      .select("response")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify({ goldmines: cached.response, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tier = await getUserTier(auth.user.id);
    const { content, model } = await callTieredAI(
      [
        {
          role: "system",
          content: `You surface today's hottest buyer pains across health, money, relationships, pets, confidence, and side-hustle niches. Return JSON array of 8 objects: {title, niche, score (70-99), trend ("🔥 Hot" | "⚡ Rising" | "💎 Evergreen")}. ONLY JSON.`,
        },
        { role: "user", content: `Today is ${today}. Give me 8 buyer goldmines.` },
      ],
      tier,
      "fast"
    );

    let goldmines: any[] = [];
    try {
      goldmines = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    } catch {
      goldmines = [];
    }

    await sb.from("ai_cache").insert({
      cache_key: cacheKey,
      input_hash: today,
      function_name: "buyer-goldmines-daily",
      response: goldmines,
      model_used: model,
      user_tier: tier,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    return new Response(JSON.stringify({ goldmines, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("buyer-goldmines-daily error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
