import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { generateCacheKey, getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { getUserTier, callTieredAI } from "../_shared/tieredAI.ts";

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
    // Validate authentication
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      return unauthorizedResponse(authError || 'Authentication required', corsHeaders);
    }
    console.log(`Authenticated user: ${user.id}`);

    const input = await req.json();

    // Get user tier for model selection
    const userTier = await getUserTier(user.id);
    console.log(`User tier: ${userTier}`);

    // Generate cache key based on input
    const cacheKey = generateCacheKey('niche-wizard', input);

    // Check cache first
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      console.log(`Returning cached niche recommendations (model: ${cached.model_used})`);
      return new Response(JSON.stringify(cached.response), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
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

    // Use tiered AI - simple task for niche matching
    const { content, model } = await callTieredAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      userTier,
      'simple' // Niche matching is a simpler task
    );

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log("Niche wizard complete, found", result.topRecommendations?.length, "recommendations");

    // Cache the response for 48 hours (niche recommendations don't change often)
    await setCachedResponse(
      cacheKey,
      'niche-wizard',
      JSON.stringify(input),
      result,
      userTier,
      model,
      48 // Cache for 48 hours
    );

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });

  } catch (error) {
    console.error("Niche wizard error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Failed to find niches" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
