import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { blueprint, personalization } = await req.json();
    if (!blueprint) return new Response(JSON.stringify({ error: "Missing blueprint data" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is not configured");

    console.log("Generating bundle variants for:", blueprint.productName);

    const prompt = `Create THREE product variants for ${blueprint.productName} (${blueprint.productType}, $${blueprint.priceRange.min}-${blueprint.priceRange.max}) targeting ${personalization?.targetAudience || "general audience"}.

Return JSON: {"liteVersion": {"name": "", "description": "", "pageCount": 0, "priceRange": {"min": 0, "max": 0}, "keyFeatures": [], "listingTitle": "", "quickPitch": ""}, "bonusAddOn": {"name": "", "description": "", "format": "", "priceRange": {"min": 0, "max": 0}, "keyFeatures": [], "listingTitle": "", "quickPitch": ""}, "premiumBundle": {"name": "", "description": "", "includedItems": [], "totalValue": 0, "bundlePrice": {"min": 0, "max": 0}, "savingsPercent": 0, "listingTitle": "", "quickPitch": ""}, "bundleStrategy": {"upsellFlow": "", "crossPromotionIdeas": [], "seasonalTip": ""}}`;

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
    const content = data.choices?.[0]?.message?.content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
    const bundleVariants = JSON.parse((jsonMatch[1] || content).trim());

    return new Response(JSON.stringify(bundleVariants), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
