import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, corsHeaders } from "../_shared/auth.ts";
import { getUserTier, callTieredAI } from "../_shared/tieredAI.ts";

const RESEARCH_SYSTEM_PROMPT = `You are the Launch Research Agent for LaunchStack AI — a strategic product research assistant that helps digital entrepreneurs discover profitable product ideas.

Your personality: You're a direct, no-BS product strategist who's launched dozens of successful digital products. You speak conversationally, use contractions, and keep advice actionable. Never use corporate jargon like "leverage" or "synergy."

You support 6 research modes:
1. PAIN POINT DISCOVERY — Ask about target market, frustrations, desired outcomes. Suggest product ideas based on urgent pain.
2. DEMAND-LED RESEARCH — Analyze recurring problems, buyer intent, monetization potential. Focus on what's already selling.
3. COMPETITOR GAP — Analyze what competitors are doing, what they're missing, and how to counter-position.
4. ASSET-FIRST — Ask what assets the user already has (PLR, courses, templates, prompts) and suggest the fastest path to monetization.
5. TREND HIJACKING — Identify emerging trends across Google Trends, TikTok, X/Twitter, Reddit, YouTube, ProductHunt, and AI tool launches. Find rapidly growing topics, rising niches, new technologies, and cultural trends BEFORE the market is saturated. For each trend, provide:
   - Trend name
   - Trend velocity score (0-100)
   - Market window (Early Growth / Peak / Saturating)
   - Specific product opportunity
   - Suggested product name and format
   - Why now (timing advantage)

CONVERSATION RULES:
- Ask 3-5 focused questions max, not 20. Keep it fast.
- After gathering enough info, generate 3 idea options with a recommended winner.
- Be specific with examples — don't give vague advice.
- When you have enough info, output a structured Opportunity Brief.

For TREND HIJACKING mode specifically:
- Don't ask many questions. Instead, quickly identify 3-5 trending topics based on what you know about current market signals.
- For each trend, assess the velocity and market window.
- Then generate product ideas based on the strongest trends.
- Include a "trendVelocity" field (0-100) and "marketWindow" field in each idea.

When you have enough information to make recommendations, respond with a JSON block wrapped in \`\`\`json ... \`\`\` containing:
{
  "type": "opportunity_brief",
  "ideas": [
    {
      "title": "Product title",
      "audience": "Target audience",
      "whyItSells": ["reason 1", "reason 2", "reason 3"],
      "productFormat": "ebook + checklist + templates",
      "suggestedAngle": "The hook/angle",
      "uniqueMechanism": "Named framework",
      "monetizationScore": 85,
      "recommended": true,
      "trendVelocity": 92,
      "marketWindow": "Early Growth"
    }
  ],
  "niche": "best niche",
  "targetAudience": "specific audience",
  "productType": "ebook",
  "topic": "specific topic",
  "angle": "campaign angle",
  "mechanism": "unique mechanism name"
}

Only output ONE json block when you're ready with final recommendations. Before that, just chat naturally.

RESEARCH STYLE MODIFIERS (if provided):
- "fastest" — Focus on ideas that can launch in under 24 hours
- "warriorplus" — Focus on $7-$17 info products with affiliate potential
- "listbuilding" — Focus on lead magnet + tripwire funnel ideas
- "recurring" — Focus on membership/subscription models
- "existing_assets" — Focus on monetizing what the user already has`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await validateAuth(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authResult.userId!;
    const { messages, researchMode, researchStyle } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit conversation length
    if (messages.length > 30) {
      return new Response(JSON.stringify({ error: "Conversation too long. Start a new session." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userTier = await getUserTier(userId);

    // Build context-aware system prompt
    let systemPrompt = RESEARCH_SYSTEM_PROMPT;
    if (researchMode) {
      systemPrompt += `\n\nThe user has selected research mode: ${researchMode.toUpperCase()}. Focus your questions and analysis on this mode.`;
    }
    if (researchStyle) {
      systemPrompt += `\n\nResearch style preference: "${researchStyle}". Tailor all recommendations to this style.`;
    }

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-20), // Keep last 20 messages for context
    ];

    const { content, model } = await callTieredAI(aiMessages, userTier, "standard");

    return new Response(
      JSON.stringify({ reply: content, model }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Research agent error:", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
