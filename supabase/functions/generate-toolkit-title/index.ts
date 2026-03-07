import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

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
    if (authError || !user) {
      return unauthorizedResponse(authError || 'Authentication required', corsHeaders);
    }

    const { niche, targetAudience, transformation, thesis } = await req.json();

    if (!niche) {
      return new Response(
        JSON.stringify({ error: "Niche is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `Generate 5 catchy, marketable titles for a digital toolkit/guide.

=== CONTEXT ===
- Niche/Topic: ${niche}
- Target Audience: ${targetAudience || "entrepreneurs and professionals"}
- Core Transformation: ${transformation || "helping readers achieve their goals"}
- Thesis/Core Idea: ${thesis || "A practical system for results"}

=== TITLE FORMULA CATEGORIES ===
Generate one title from each of these proven formulas:

1. "The [X] Method/System" - Focus on your signature process
   Example: "The Buyer-Intent Blueprint"

2. "[Number] Days/Steps to [Result]" - Timeline promise
   Example: "7-Day Traffic Flip"

3. "The [Adjective] [Tool/Guide/Kit]" - Framework focus
   Example: "The Silent Closer System"

4. "From [Pain] to [Gain]" - Transformation arc
   Example: "From Ignored to Income"

5. "[Audience]'s Guide to [Result]" - Target-specific
   Example: "The Introvert's Guide to Sales"

=== REQUIREMENTS ===
- Each title should be 3-8 words
- Include a compelling subtitle (10-15 words)
- Make titles memorable, unique, and benefit-focused
- Avoid clichés like "Ultimate" or "Complete"
- Focus on the transformation, not features

=== OUTPUT FORMAT ===
Return ONLY valid JSON in this exact format:
{
  "titles": [
    {
      "category": "method",
      "title": "The Buyer-Intent Blueprint",
      "subtitle": "Turn Facebook Groups Into Your Personal ATM Without Ads or Spam"
    },
    ...4 more titles
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a marketing copywriter who specializes in creating catchy, compelling product titles. Return ONLY valid JSON." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`API error: ${status}`);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content || "";

    // Clean and parse
    let cleanedText = contentText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    console.log(`Generated ${parsed.titles?.length || 0} title options for niche: ${niche}`);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-toolkit-title:", error);
    return new Response(
      JSON.stringify({ error: "Unable to generate title. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});