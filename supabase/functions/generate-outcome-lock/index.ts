import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return new Response(JSON.stringify({ error: authError || "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { productBrief } = await req.json();
    if (!productBrief) {
      return new Response(JSON.stringify({ error: "productBrief is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { title, subtitle, concept, uniqueMechanism, painPoints } = productBrief;

    const prompt = `You are a digital product strategist.

Based on this product idea, generate the Outcome Lock for a digital product launch.

Product Title: ${title || "Untitled"}
Product Subtitle: ${subtitle || ""}
Product Concept: ${concept || ""}
Unique Mechanism: ${uniqueMechanism || ""}
Pain Points: ${(painPoints || []).join(", ")}

Generate all 9 fields. Keep responses concise, clear, and written for marketing use.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a digital product launch strategist. Generate precise, actionable outcome lock fields." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "set_outcome_lock",
              description: "Set all 9 Outcome Lock fields for a digital product launch.",
              parameters: {
                type: "object",
                properties: {
                  audience: { type: "string", description: "Target audience - who specifically benefits" },
                  painPoint: { type: "string", description: "Core pain point they struggle with" },
                  promisedResult: { type: "string", description: "Main transformation or outcome promised" },
                  realisticTimeframe: { type: "string", description: "How quickly they can achieve progress" },
                  quickWin: { type: "string", description: "What they accomplish in 30-60 minutes" },
                  shortTermWin: { type: "string", description: "Meaningful progress within 24 hours" },
                  coreResultWindow: { type: "string", description: "Results within 3-7 days" },
                  finalTransformation: { type: "string", description: "Before and after state description" },
                  refundConditions: { type: "string", description: "Fair refund-safe promise that builds trust" },
                },
                required: ["audience", "painPoint", "promisedResult", "realisticTimeframe", "quickWin", "shortTermWin", "coreResultWindow", "finalTransformation", "refundConditions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "set_outcome_lock" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const outcomeLock = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ outcomeLock }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-outcome-lock error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
