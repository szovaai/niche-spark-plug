import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const user = await validateAuth(req);
    const userTier = await getUserTier(user.id);
    const { category } = await req.json();

    const systemPrompt = `You are a digital product market intelligence engine. Generate 6 trending digital product opportunities that are currently in high demand in the MMO/make-money-online and digital product creator space.

${category && category !== "all" ? `Focus on the "${category}" category.` : "Cover a mix of categories: AI tools, marketing, automation, freelancing, content creation, e-commerce."}

For each opportunity, return a JSON array with objects containing:
- "title": catchy product name (e.g. "AI Local Client System")
- "niche": the niche category
- "description": one-sentence pitch of why this is hot right now
- "demandScore": 1-10
- "competitionScore": 1-10 (lower = less competition = better)
- "monetizationScore": 1-10
- "audienceUrgency": 1-10
- "launchScore": overall 0-100 score
- "suggestedPrice": suggested front-end price in dollars
- "targetAudience": who would buy this
- "mechanism": a unique mechanism name for this product
- "salesPromise": the core transformation promise
- "tags": array of 2-3 short tags

Return ONLY the JSON array. No markdown, no explanation.`;

    const { content, model } = await callTieredAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate trending digital product opportunities for ${new Date().toLocaleDateString()}. Category: ${category || "all"}` },
      ],
      userTier,
      "standard"
    );

    // Parse the JSON from the response
    let opportunities;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      opportunities = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse opportunity data");
    }

    return new Response(JSON.stringify({ opportunities, model }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("opportunity-radar error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
