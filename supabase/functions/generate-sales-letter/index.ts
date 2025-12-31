import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SalesLetterRequest {
  title: string;
  subtitle?: string;
  niche: string;
  targetAudience?: string;
  components: {
    guide: boolean;
    worksheet: boolean;
    checklist: boolean;
    resourceList: boolean;
    templates: boolean;
    quiz: boolean;
  };
  price?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, subtitle, niche, targetAudience, components, price }: SalesLetterRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const activeComponents = Object.entries(components)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => {
        const labels: Record<string, string> = {
          guide: "Complete Step-by-Step Guide",
          worksheet: "Interactive Worksheets",
          checklist: "Action Checklists",
          resourceList: "Curated Resource List",
          templates: "Ready-to-Use Templates",
          quiz: "Self-Assessment Quiz"
        };
        return labels[name] || name;
      });

    const prompt = `Write a compelling sales letter for a digital product on WarriorPlus.

Product: "${title}"
${subtitle ? `Subtitle: "${subtitle}"` : ""}
Niche: ${niche}
Target Audience: ${targetAudience || "Online entrepreneurs and digital marketers"}
Price: $${price || 17}

What's Included:
${activeComponents.map(c => `- ${c}`).join("\n")}

Write a complete sales letter with these sections:
1. ATTENTION-GRABBING HEADLINE (use power words, curiosity, and benefit)
2. OPENING HOOK (address their pain point, 2-3 sentences)
3. AGITATE THE PROBLEM (make them feel the frustration, 1 paragraph)
4. INTRODUCE THE SOLUTION (present the product as the answer)
5. WHAT'S INCLUDED (bullet points with benefits, not just features)
6. WHO THIS IS FOR (3-4 bullet points)
7. WHO THIS IS NOT FOR (2-3 bullet points - creates trust)
8. BONUSES (suggest 2-3 bonus ideas they could add)
9. GUARANTEE (30-day money-back)
10. CALL TO ACTION (urgency, scarcity hints)
11. P.S. SECTION (restate the main benefit)

STYLE REQUIREMENTS:
- Write like a direct response copywriter, not a corporate brochure
- Use short paragraphs (2-3 sentences max)
- Include bullet points for easy scanning
- Add curiosity and intrigue
- Focus on BENEFITS over features
- Use "you" language extensively
- Add urgency without being sleazy
- Sound authentic and helpful

Format the output as clean HTML that can be used directly on a sales page.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const salesLetter = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ salesLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-sales-letter:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
