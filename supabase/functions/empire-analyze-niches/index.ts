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
      { field: 'niches', type: 'array', required: true, maxItems: 10 },
      { field: 'interests', type: 'string', required: true, maxLength: 1000 },
      { field: 'problemType', type: 'string', required: true, maxLength: 500 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { niches, interests, problemType } = data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Server configuration error");
    }

    const systemPrompt = `You are a niche strategist for AI-driven digital products in 2026.
Your task is to analyze niches and score them based on profitability, interest fit, and virality potential.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just the raw JSON object.`;

    const userPrompt = `Here are my niche ideas: ${(niches as string[]).join(", ")}

Here's what I enjoy consuming content about: ${interests}

The main type of problem I want to help solve is: ${problemType}

For each niche:
1. Score "High-Paying Audience Potential" from 0-10 (are people already spending money here?)
2. Score "My Interest Fit" from 0-10 based on what I said I enjoy
3. Score "Built-In Virality Potential" from 0-10 for TikTok/IG Reels/YouTube Shorts

Then:
- Recommend the top 3 niches
- Pick ONE final niche you think I should start with as a beginner
- Explain why in simple language

Output as JSON:
{
  "niches": [{ "name": "...", "paying_score": 8, "interest_score": 7, "virality_score": 9, "notes": "..." }],
  "top_three": ["niche1", "niche2", "niche3"],
  "recommended": { "name": "...", "reason": "..." }
}`;

    console.log("Analyzing niches for user:", user.id);
    
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "API credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      throw new Error("Unable to generate analysis. Please try again.");
    }

    const data2 = await response.json();
    const content = data2.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse analysis results");
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in empire-analyze-niches:", error);
    return new Response(JSON.stringify({ error: "Unable to analyze niches. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
