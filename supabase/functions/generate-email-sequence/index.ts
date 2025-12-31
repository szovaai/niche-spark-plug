import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { offerName, targetAudience, keyBenefits, uniqueMechanism, price, salesPageUrl } = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is not configured");

    console.log("Generating 14-day email sequence for:", offerName);

    const prompt = `Generate a complete 14-Day email sequence for "${offerName}" targeting ${targetAudience}. Key benefits: ${keyBenefits.join(", ")}. Unique mechanism: ${uniqueMechanism || "A proven system"}. Price: $${price}.

Return JSON: {"sequenceTheme": "", "narrativeArc": "", "emails": [{"day": 1, "focus": "", "subject": "", "previewText": "", "openingHook": "", "storyAnalogy": "", "lessonTwist": "", "offerBridge": "", "cta": "", "ps": ""}]}`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }] }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse response");

    const emailSequence = JSON.parse(jsonMatch[0]);
    emailSequence.offerName = offerName;
    emailSequence.targetAudience = targetAudience;
    emailSequence.price = price;

    return new Response(JSON.stringify(emailSequence), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
