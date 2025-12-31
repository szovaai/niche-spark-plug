import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Available niches to recommend from
const AVAILABLE_NICHES = [
  { id: "1", name: "Self-Improvement Planners", skills: ["design", "organization"], interests: ["wellness", "productivity"], effort: "low" },
  { id: "2", name: "Budget Templates", skills: ["spreadsheets", "organization"], interests: ["business"], effort: "medium" },
  { id: "3", name: "Kids Educational Worksheets", skills: ["design", "teaching"], interests: ["education"], effort: "low" },
  { id: "4", name: "Social Media Templates", skills: ["design", "social"], interests: ["business", "creativity"], effort: "low" },
  { id: "5", name: "Wedding Printables", skills: ["design"], interests: ["lifestyle", "relationships"], effort: "low" },
  { id: "6", name: "Fitness Trackers", skills: ["design", "organization"], interests: ["wellness"], effort: "low" },
  { id: "7", name: "Recipe Cards & Meal Planners", skills: ["design", "organization"], interests: ["lifestyle"], effort: "low" },
  { id: "8", name: "Small Business Templates", skills: ["spreadsheets", "design"], interests: ["business"], effort: "medium" },
  { id: "9", name: "Mental Health Journals", skills: ["writing", "design"], interests: ["wellness", "selfcare"], effort: "medium" },
  { id: "10", name: "Home Organization Printables", skills: ["design", "organization"], interests: ["lifestyle"], effort: "low" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    console.log("Niche wizard input:", input);

    const systemPrompt = `You are a digital product niche advisor. Based on the user's skills, interests, and goals, recommend the best niches for them to start with.

HUMAN TONE: Be encouraging and supportive. Write like a friend giving advice.

Available niches to choose from (you MUST select from these):
${AVAILABLE_NICHES.map(n => `- ID: ${n.id}, Name: ${n.name}, Best for skills: ${n.skills.join(', ')}, Interests: ${n.interests.join(', ')}`).join('\n')}

Return a JSON object with this EXACT structure:
{
  "topRecommendations": [
    {
      "nicheName": "Exact niche name from list",
      "nicheId": "ID from list",
      "matchScore": 85,
      "whyItFits": "Personal explanation why this is perfect for them",
      "quickStart": ["Step 1", "Step 2", "Step 3"],
      "potentialEarnings": "$200-500/mo",
      "timeToFirstSale": "7-14 days",
      "skillsMatch": ["matching skills"],
      "interestsMatch": ["matching interests"]
    }
  ],
  "personalizedInsights": [
    "Insight about their unique combination",
    "Tip based on their experience level",
    "Suggestion for their time availability"
  ],
  "nextSteps": [
    "Specific next action",
    "Second action",
    "Third action"
  ],
  "warningsOrConsiderations": [
    "Any relevant warnings or things to consider"
  ]
}

Provide 3-5 niche recommendations sorted by match score. Be specific and encouraging.`;

    const userPrompt = `Find the perfect niches for this person:

SKILLS: ${input.skills.join(', ')}
INTERESTS: ${input.interests.join(', ')}
GOALS: ${input.goals.join(', ')}
TIME AVAILABLE: ${input.timeAvailable}
BUDGET: ${input.budget}
EXPERIENCE: ${input.experience}

Match them with the best niches and explain why each is a good fit.`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("DeepSeek API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log("Niche wizard complete, found", result.topRecommendations?.length, "recommendations");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Niche wizard error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Failed to find niches" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
