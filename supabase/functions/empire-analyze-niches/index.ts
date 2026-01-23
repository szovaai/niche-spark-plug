import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niches, interests, problemType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a niche strategist for AI-driven digital products in 2026.
Your task is to analyze niches and score them based on profitability, interest fit, and virality potential.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just the raw JSON object.`;

    const userPrompt = `Here are my niche ideas: ${niches.join(", ")}

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

    console.log("Calling Lovable AI for niche analysis...");
    
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      throw new Error("Failed to parse AI response");
    }

    console.log("Niche analysis complete:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in empire-analyze-niches:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
