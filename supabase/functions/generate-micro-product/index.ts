import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { generateCacheKey, getCachedResponse, setCachedResponse } from "../_shared/cache.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildPrompt(productType: string, nicheTopic: string, targetAudience: string, problemStatement: string, config: Record<string, unknown>): string {
  const baseContext = `Niche/Topic: ${nicheTopic}\nTarget Audience: ${targetAudience}\nProblem it solves: ${problemStatement}`;

  const typePrompts: Record<string, string> = {
    ebook: `Act as a digital product creator specializing in mini e-books and guides.
${baseContext}
Number of chapters: ${config.numChapters || 5}
Writing tone: ${config.writingTone || 'conversational'}

Create a complete mini e-book/guide. For each chapter provide a title and 150-200 words of actual content.`,

    checklist: `Act as a digital product creator specializing in actionable checklists.
${baseContext}
Number of items: ${config.numItems || 20}
Group by categories: ${config.groupByCategory ? 'Yes' : 'No'}

Create a complete checklist product. Each item should be specific, actionable, and immediately useful.${config.groupByCategory ? ' Group items into logical categories.' : ''}`,

    habit_tracker: `Act as a digital product creator specializing in habit tracking systems.
${baseContext}
Duration: ${config.duration || 30} days
Habits per day: ${config.habitsPerDay || 5}

Create a complete habit tracker system. Include specific habits tailored to the audience, a daily tracking structure, weekly review prompts, and milestone celebrations.`,

    challenge: `Act as a digital product creator specializing in transformation challenges.
${baseContext}
Number of days: ${config.numDays || 7}
Daily task format: ${config.taskFormat || 'action + reflection'}

Create a complete challenge program. For each day, provide a theme, a main task (actionable and specific), a reflection prompt, and a quick win.`,

    worksheet: `Act as a digital product creator specializing in self-improvement worksheets.
${baseContext}
Number of sections: ${config.numSections || 5}
Exercise style: ${config.exerciseStyle || 'fill-in-the-blank'}

Create a complete worksheet pack. Each section should have a clear objective, 3-5 exercises, and space for reflection.`,

    swipe_file: `Act as a digital product creator specializing in swipe files and template packs.
${baseContext}
Number of templates: ${config.numTemplates || 10}
Format type: ${config.formatType || 'copy-paste ready'}

Create a complete swipe file/template pack. Each template should be ready to use with minimal customization, with a brief explanation of when and how to use it.`,
  };

  const typePrompt = typePrompts[productType] || typePrompts.ebook;

  return `${typePrompt}

You MUST respond with valid JSON only. No markdown, no code blocks, no extra text.

Return this exact JSON structure:
{
  "product_title": "A compelling, sales-optimized title",
  "product_subtitle": "A clear subtitle explaining the value",
  "product_content": <the structured content as an array of objects appropriate to the type>,
  "product_description": "A 3-4 sentence product description ready for Gumroad/Etsy",
  "social_posts": ["post1", "post2", "post3"],
  "email_pitch": "A short sales email (subject line + body) for promoting this product"
}

For product_content, use this structure based on type:
- ebook: [{"chapter_number": 1, "title": "...", "content": "..."}]
- checklist: [{"category": "...", "items": ["item1", "item2"]}] or [{"item": "...", "details": "..."}]
- habit_tracker: {"habits": [{"name": "...", "description": "..."}], "daily_structure": "...", "milestones": [...]}
- challenge: [{"day": 1, "theme": "...", "task": "...", "reflection": "...", "quick_win": "..."}]
- worksheet: [{"section": "...", "objective": "...", "exercises": ["..."]}]
- swipe_file: [{"template_name": "...", "content": "...", "when_to_use": "..."}]

Make everything specific to the niche and audience. No generic filler.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { productType, nicheTopic, targetAudience, problemStatement, config } = await req.json();

    if (!productType || !nicheTopic || !targetAudience || !problemStatement) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache
    const cacheInput = { productType, nicheTopic, targetAudience, problemStatement, config };
    const cacheKey = generateCacheKey("generate-micro-product", cacheInput);
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached.response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userTier = await getUserTier(user.id);
    const prompt = buildPrompt(productType, nicheTopic, targetAudience, problemStatement, config || {});

    const { content, model } = await callTieredAI(
      [{ role: "user", content: prompt }],
      userTier,
      "standard"
    );

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache the result
    await setCachedResponse(
      cacheKey,
      "generate-micro-product",
      JSON.stringify(cacheInput),
      parsed,
      userTier,
      model,
      12
    );

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Rate limits") ? 429 : message.includes("Payment required") ? 402 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
