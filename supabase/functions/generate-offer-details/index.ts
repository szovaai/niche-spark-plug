import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OfferDetailsRequest {
  title: string;
  niche: string;
  targetAudience?: string;
  thesis?: string;
  components: Record<string, boolean>;
  guideSections?: { heading: string; content?: string }[];
  content?: Record<string, unknown>;
}

interface OfferDetails {
  whatProductIs: string;
  whoItsFor: string;
  mainProblem: string;
  desiredOutcome: string;
  bonusesIncluded: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      title,
      niche,
      targetAudience,
      thesis,
      components,
      guideSections,
      content,
    }: OfferDetailsRequest = await req.json();

    console.log("Generating offer details for:", title, niche);

    // Build component list
    const enabledComponents = Object.entries(components || {})
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

    // Build chapter titles from guide sections or content
    const chapterTitles: string[] = [];
    if (guideSections?.length) {
      chapterTitles.push(...guideSections.map(s => s.heading));
    } else if (content) {
      // Try to extract titles from content
      const guide = content.guide as { sections?: { heading: string }[] } | undefined;
      if (guide?.sections) {
        chapterTitles.push(...guide.sections.map(s => s.heading));
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert direct-response copywriter for WarriorPlus-style digital product offers. Your job is to generate concise, accurate offer details for a sales letter based STRICTLY on the toolkit data provided. 

RULES:
- Do NOT invent features not present in the input
- Avoid hype, fake stats, and over-promising
- Keep each field 1-3 sentences max
- Must align with the thesis/core framework if provided
- Focus on "one problem → one solution" messaging
- If something is missing, infer conservatively from category and components
- Write in a confident but grounded tone`;

    const userPrompt = `Generate offer details for this toolkit:

TOOLKIT TITLE: ${title}
CATEGORY/NICHE: ${niche}
TARGET AUDIENCE: ${targetAudience || "Not specified - infer from niche"}
CORE THESIS/FRAMEWORK: ${thesis || "Not specified - infer from title and niche"}
COMPONENTS INCLUDED: ${enabledComponents.join(", ") || "Guide only"}
${chapterTitles.length > 0 ? `CHAPTER/SECTION TITLES: ${chapterTitles.join(", ")}` : ""}

Return a JSON object with EXACTLY these 5 fields:
{
  "whatProductIs": "1-2 sentences describing what this toolkit is and does",
  "whoItsFor": "Who this is perfect for (be specific to the niche)",
  "mainProblem": "The main pain point or problem this solves",
  "desiredOutcome": "The transformation or result they'll achieve",
  "bonusesIncluded": "List of included components with brief benefits for each"
}

Return ONLY valid JSON, no markdown or explanation.`;

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content returned from AI");
    }

    console.log("AI response:", aiContent);

    // Parse JSON response
    let offerDetails: OfferDetails;
    try {
      // Clean up markdown code blocks if present
      const cleanedContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      offerDetails = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", aiContent);
      // Fallback: generate basic offer details
      offerDetails = {
        whatProductIs: `A comprehensive ${niche} toolkit called "${title}" that gives you everything you need to succeed.`,
        whoItsFor: targetAudience || `Anyone looking to master ${niche} and get real results.`,
        mainProblem: `Most ${niche} information is scattered, outdated, or too complicated to implement.`,
        desiredOutcome: `A clear, actionable path to ${niche} success with templates and checklists you can use immediately.`,
        bonusesIncluded: enabledComponents.length > 0 
          ? `Includes: ${enabledComponents.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ")}`
          : "Complete guide with actionable steps",
      };
    }

    // Validate required fields
    const requiredFields: (keyof OfferDetails)[] = ["whatProductIs", "whoItsFor", "mainProblem", "desiredOutcome", "bonusesIncluded"];
    for (const field of requiredFields) {
      if (!offerDetails[field]) {
        offerDetails[field] = "Not specified";
      }
    }

    console.log("Generated offer details:", offerDetails);

    return new Response(JSON.stringify({ offerDetails }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating offer details:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate offer details" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
