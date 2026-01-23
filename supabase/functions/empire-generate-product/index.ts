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
    const { niche, problemDescription, type } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt, userPrompt;

    if (type === "schema") {
      const { productName, productPromise } = await req.json();
      systemPrompt = `You are a systems designer and user manual writer.
Create practical, easy-to-use Google Sheets systems with clear documentation.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Product name: ${productName}
Product description: ${productPromise}

Design a Google Sheets-based system for this product:
1. List each sheet/tab name and describe its purpose
2. For each tab, list column names and what data goes in each
3. Write a friendly manual in simple language that explains how a beginner should use and customize the system

Output as JSON:
{
  "tabs": [
    { 
      "name": "Tab Name", 
      "purpose": "What this tab does",
      "columns": [
        { "name": "Column A", "description": "What goes here" }
      ]
    }
  ],
  "manual_text": "# How to Use Your System\\n\\nStep 1: ..."
}`;
    } else {
      systemPrompt = `You are a digital product expert who builds viral, high-converting products.
Focus on products that are easy to create but feel extremely valuable.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `I want to create a digital product pack that I can build once and sell forever.
My niche is: ${niche}
The main problem I want to solve is: ${problemDescription}

Your task:
1. Suggest 1 digital product pack that is easy and fast to create, even for a beginner
2. The pack must include multiple elements so it feels extremely valuable
3. Explain why people in this niche would urgently want to buy it
4. Break down exactly what's inside the pack
5. Give a step-by-step plan to create it using AI tools
6. Suggest a high-converting product name and best price range

Output as JSON:
{
  "product_name": "...",
  "product_promise": "What transformation does this deliver?",
  "urgency_reason": "Why would someone buy this NOW?",
  "elements": ["Element 1", "Element 2", "Element 3"],
  "build_steps": ["Step 1: ...", "Step 2: ..."],
  "price_range": "$17-$27"
}`;
    }

    console.log("Calling Lovable AI for product pack...");
    
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in empire-generate-product:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
