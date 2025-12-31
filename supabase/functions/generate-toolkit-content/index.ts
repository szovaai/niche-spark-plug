import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentRequest {
  title: string;
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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, niche, targetAudience, components }: ContentRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const humanToneDirective = `
You are an expert digital product creator. Write in a natural, conversational tone that sounds like a real person - not robotic or AI-generated.

WRITING STYLE RULES:
- Use contractions naturally (you're, it's, don't, won't)
- Vary sentence length - mix short punchy sentences with longer ones
- Add personality touches like "Here's the thing...", "Pro tip:", "The truth is..."
- Write in second person (you, your)
- AVOID corporate buzzwords (leverage, utilize, synergy, optimize)
- Sound like a helpful friend who's an expert, not a corporate manual
- Be confident but not salesy
- Use specific examples, not vague generalities
`;

    const activeComponents = Object.entries(components)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name);

    const prompt = `${humanToneDirective}

Create content for a digital toolkit called "${title}" in the ${niche} niche.
Target audience: ${targetAudience || "Online entrepreneurs and digital marketers"}

Generate content for these components: ${activeComponents.join(", ")}

Return a JSON object with this structure:
{
  "guide": {
    "title": "Main guide title",
    "sections": [
      {"heading": "Section heading", "content": "2-3 paragraphs of actionable content"}
    ]
  },
  "worksheet": {
    "title": "Worksheet title",
    "exercises": [
      {"title": "Exercise name", "instructions": "What to do", "fields": ["Field 1", "Field 2"]}
    ]
  },
  "checklist": {
    "title": "Checklist title",
    "items": ["Action item 1", "Action item 2", "..."]
  },
  "resourceList": {
    "title": "Resource list title",
    "resources": [
      {"name": "Resource name", "description": "What it does and why it's useful"}
    ]
  },
  "templates": {
    "title": "Templates title",
    "templates": [
      {"name": "Template name", "content": "The actual template text they can copy-paste"}
    ]
  },
  "quiz": {
    "title": "Quiz title",
    "questions": [
      {"question": "Question text?", "options": ["A", "B", "C", "D"], "correctIndex": 0}
    ]
  }
}

IMPORTANT: Only include the components that were requested. Make content practical, actionable, and valuable.
The guide should have 5-7 sections. Worksheets should have 3-5 exercises. Checklists should have 10-15 items.
Return ONLY valid JSON, no markdown code blocks.`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON from the response
    let content;
    try {
      // Remove any markdown code blocks if present
      const cleanedText = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      content = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse content:", parseError);
      // Return a fallback structure
      content = {
        guide: {
          title: title,
          sections: [
            { heading: "Introduction", content: `Welcome to ${title}. This guide will help you master ${niche}.` },
            { heading: "Getting Started", content: "Let's begin with the fundamentals..." }
          ]
        }
      };
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-toolkit-content:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
