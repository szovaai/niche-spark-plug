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
You are a TOP-TIER digital product creator who writes content that's indistinguishable from expert human authors. Your writing is warm, engaging, and packed with real value.

CRITICAL WRITING STYLE RULES:
1. VOICE & TONE:
   - Write like you're having a coffee chat with a smart friend
   - Use contractions naturally (you're, it's, don't, can't, won't, here's)
   - Add conversational phrases: "Here's the thing...", "Let me be real with you...", "The truth is...", "Pro tip:", "Quick win:"
   - Be encouraging but not cheesy. No "You've got this!" every paragraph
   - Show personality - occasional humor, relatable frustrations

2. SENTENCE VARIETY:
   - Mix sentence lengths. Short punchy ones. Then longer, flowing explanations that dive deeper into the concept.
   - Start sentences differently - don't always use "You" or "The"
   - Use rhetorical questions sparingly: "Sound familiar?"
   
3. CONTENT QUALITY:
   - Include SPECIFIC examples with real numbers, timeframes, or scenarios
   - Add "Pro tip" boxes with insider knowledge
   - Include "Common mistake" warnings
   - Reference real tools, platforms, or methods (not made-up ones)
   - Give step-by-step instructions that are actually actionable
   
4. ABSOLUTELY AVOID:
   - Corporate buzzwords: leverage, utilize, synergy, optimize, streamline, robust
   - AI-sounding phrases: "In today's digital landscape", "It's important to note", "Furthermore", "Additionally", "In conclusion"
   - Vague platitudes: "success takes time", "consistency is key" (unless you explain HOW)
   - Repetitive structure: Don't start every paragraph the same way
   
5. FORMATTING FOR IMPACT:
   - Use bullet points for lists of 3+ items
   - Bold key terms and important phrases
   - Break up long sections with subheadings
   - Include actionable takeaways at the end of sections
`;

    const activeComponents = Object.entries(components)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name);

    const prompt = `${humanToneDirective}

Create premium content for a digital toolkit called "${title}" in the ${niche} niche.
Target audience: ${targetAudience || "Online entrepreneurs and digital marketers looking for practical solutions"}

CONTENT REQUIREMENTS BY COMPONENT:

Generate content for these components: ${activeComponents.join(", ")}

Return a JSON object with this structure:
{
  "guide": {
    "title": "Compelling main guide title",
    "sections": [
      {
        "heading": "Engaging section heading",
        "content": "3-4 paragraphs of DEEPLY actionable content. Include specific examples, step-by-step instructions, pro tips, and common mistakes to avoid. Each section should give immediate value. Use bullet points for lists. Reference real tools/platforms when relevant. End with a clear action item or takeaway."
      }
    ]
  },
  "worksheet": {
    "title": "Engaging worksheet title",
    "exercises": [
      {
        "title": "Exercise name that describes the outcome",
        "instructions": "Clear, encouraging instructions explaining WHY this exercise matters and exactly HOW to complete it. Be specific about what success looks like.",
        "fields": ["Specific prompt or question 1", "Specific prompt or question 2", "Specific prompt or question 3"]
      }
    ]
  },
  "checklist": {
    "title": "Action-oriented checklist title",
    "items": [
      "Specific, actionable item with clear success criteria",
      "Another concrete action (include metrics or timeframes when relevant)",
      "Continue with 12-15 total items, organized in logical order"
    ]
  },
  "resourceList": {
    "title": "Curated resources title",
    "resources": [
      {
        "name": "Real tool/resource name",
        "description": "WHY this resource is valuable, specific use cases, and any insider tips for using it effectively",
        "url": "actual URL if it's a real tool (optional)"
      }
    ]
  },
  "templates": {
    "title": "Ready-to-use templates title",
    "templates": [
      {
        "name": "Template name describing its purpose",
        "content": "The FULL template text ready to copy-paste. Include [BRACKETS] for customizable fields. Make it comprehensive and immediately usable. Include instructions within the template where helpful."
      }
    ]
  },
  "quiz": {
    "title": "Self-assessment title",
    "questions": [
      {
        "question": "Thought-provoking question that tests real understanding?",
        "options": ["Plausible wrong answer", "Another plausible wrong answer", "Correct answer with nuance", "Tempting but incorrect answer"],
        "correctIndex": 2
      }
    ]
  }
}

QUALITY STANDARDS:
- Guide: 6-8 substantial sections, each 300-400 words with real depth
- Worksheets: 4-5 exercises with 3-5 prompts each, designed for real reflection
- Checklists: 12-18 items in logical progression, specific and actionable
- Resources: 8-12 tools/resources with genuine recommendations
- Templates: 3-5 comprehensive, ready-to-use templates (not placeholders)
- Quiz: 8-12 questions that test practical application, not just recall

REMEMBER: This content should be so good that buyers feel they got incredible value. Every sentence should either teach something or prompt action.

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
