import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { pickModel, type QualityMode, type UserPreference } from "../_shared/aiRouter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const {
      title = "",
      subtitle = "",
      hook = "",
      description = "",
      chapterAngle = "",
      upsellBridge = "",
      niche = "",
      audience = "",
      qualityMode = "balanced",
      modelPreference = "auto",
    } = body || {};

    const routed = pickModel("salescopy", qualityMode as QualityMode, modelPreference as UserPreference);
    console.log(`[boost-product-copy] Routed to ${routed.model} (mode=${qualityMode}, pref=${modelPreference})`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a direct-response copy chief. Rewrite digital product copy to maximize conversions.
Use power words (Protocol, Blueprint, System, Formula), specific timeframes, concrete numbers, and "even if/without" objection handling. Keep titles punchy (under 80 chars), keep subtitles benefit-driven.`;

    const userPrompt = `Rewrite this product copy for maximum buyer pull. Keep voice direct but encouraging.

NICHE: ${niche}
AUDIENCE: ${audience}

CURRENT:
- Title: ${title}
- Subtitle: ${subtitle}
- Hook: ${hook}
- Description: ${description}
- Chapter Angle: ${chapterAngle}
- Upsell Bridge: ${upsellBridge}

Return improved versions of each field.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: routed.model,
        ...(routed.reasoning ? { reasoning: routed.reasoning } : {}),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_boosted_copy",
            description: "Return rewritten copy fields",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                subtitle: { type: "string" },
                hook: { type: "string" },
                description: { type: "string" },
                chapterAngle: { type: "string" },
                upsellBridge: { type: "string" },
              },
              required: ["title", "subtitle", "hook", "description", "chapterAngle", "upsellBridge"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_boosted_copy" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    if (!args) throw new Error("No tool call in response");
    const parsed = typeof args === "string" ? JSON.parse(args) : args;

    return new Response(JSON.stringify({ success: true, boosted: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("boost-product-copy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
