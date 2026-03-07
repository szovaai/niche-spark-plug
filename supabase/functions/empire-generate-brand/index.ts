import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'niche', type: 'string', required: true, maxLength: 200 },
      { field: 'tone', type: 'string', required: true, maxLength: 200 },
      { field: 'extraWords', type: 'string', maxLength: 500 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { niche, tone, extraWords } = data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Server configuration error");

    const systemPrompt = `You are a modern brand naming expert specializing in digital-first, social media brands.
Create memorable, clean brand names that work well as social handles.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks.`;

    const userPrompt = `Niche: ${niche}
Tone: ${tone}
Extra words or vibes I like: ${extraWords || "none specified"}

Generate 10 short, clean brand names that:
- Are easy to spell
- Feel trustworthy
- Could work as a social-first brand
- Are memorable and unique

For each, suggest 3 Instagram/TikTok handle ideas.

Output as JSON array:
[
  { "name": "BrandName", "handles": ["@brandname", "@brandname.co", "@thebrandname"] }
]`;

    console.log("Generating brands for user:", user.id);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "API credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      throw new Error("Unable to generate brands. Please try again.");
    }

    const data2 = await response.json();
    const content = data2.choices?.[0]?.message?.content;
    
    let brands;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        brands = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse brand suggestions");
    }

    return new Response(JSON.stringify({ brands }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in empire-generate-brand:", error);
    return new Response(JSON.stringify({ error: "Unable to generate brands. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
