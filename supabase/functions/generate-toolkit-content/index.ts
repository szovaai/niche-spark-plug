import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HUMAN_TONE_DIRECTIVE = `
CRITICAL WRITING STYLE:
- Write like a real person, not a robot. Use contractions naturally (you're, it's, don't).
- Vary sentence length. Mix short punchy sentences with longer flowing ones.
- Add personality touches like "Here's the thing...", "Pro tip:", "Quick win:".
- Write in second person (you, your) to speak directly to the reader.
- Avoid corporate buzzwords (leverage, utilize, synergy, optimize).
- Sound confident but not salesy. Be helpful, not pushy.
- Include actionable steps, not just theory.
`;

const componentPrompts: Record<string, string> = {
  guide: `Create a comprehensive guide with 4-6 sections. Each section needs a heading and detailed content (200-400 words per section). Include practical examples and action steps. Return as: { "title": "Guide Title", "sections": [{ "heading": "...", "content": "..." }] }`,
  
  worksheet: `Create an interactive worksheet with 4-6 exercises. Each exercise needs a title, clear instructions, and 3-5 fill-in fields/prompts. Return as: { "title": "Worksheet Title", "exercises": [{ "title": "...", "instructions": "...", "fields": ["field1", "field2"] }] }`,
  
  checklist: `Create an actionable checklist with 15-25 items. Each item should be a specific, actionable task (not vague). Start with action verbs. Return as: { "title": "Checklist Title", "items": ["Task 1", "Task 2", ...] }`,
  
  resourceList: `Create a curated resource list with 8-12 resources. Include tools, websites, books, or services. Each needs a name, description, and optional URL placeholder. Return as: { "title": "Resource Title", "resources": [{ "name": "...", "description": "...", "url": "https://..." }] }`,
  
  templates: `Create 3-5 ready-to-use templates. Each template needs a name and full content that users can copy and customize. Return as: { "title": "Templates Title", "templates": [{ "name": "Template Name", "content": "Full template text..." }] }`,
  
  quiz: `Create a knowledge-check quiz with 8-10 multiple choice questions. Each question needs 4 options and the correct answer index (0-3). Return as: { "title": "Quiz Title", "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 }] }`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, niche, targetAudience, components, singleChapter, humanize = true } = await req.json();
    
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    // Determine which components to generate
    let componentsToGenerate: string[] = [];
    
    if (singleChapter) {
      // Generate only one specific chapter
      componentsToGenerate = [singleChapter];
    } else {
      // Generate all enabled components
      componentsToGenerate = Object.entries(components || {})
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);
    }

    if (componentsToGenerate.length === 0) {
      return new Response(
        JSON.stringify({ error: "No components selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating toolkit content for "${title}" - components: ${componentsToGenerate.join(", ")}`);

    const content: Record<string, unknown> = {};

    // Generate each component
    for (const component of componentsToGenerate) {
      const componentPrompt = componentPrompts[component];
      if (!componentPrompt) continue;

      const systemPrompt = `You are an expert content creator for digital products. ${humanize ? HUMAN_TONE_DIRECTIVE : ""}
      
Context:
- Toolkit Title: "${title}"
- Niche: ${niche}
- Target Audience: ${targetAudience || "entrepreneurs and professionals"}

Your task: ${componentPrompt}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON object.`;

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
            { role: "user", content: `Generate the ${component} content now.` }
          ],
          temperature: 0.7,
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
            JSON.stringify({ error: "API credits exhausted. Please check your DeepSeek balance." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.error(`DeepSeek API error for ${component}:`, status);
        continue; // Skip this component but continue with others
      }

      const data = await response.json();
      const contentText = data.choices?.[0]?.message?.content || "";
      
      try {
        // Clean the response and parse JSON
        const cleanedText = contentText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        content[component] = JSON.parse(cleanedText);
        console.log(`Successfully generated ${component}`);
      } catch (parseError) {
        console.error(`Failed to parse ${component} content:`, parseError);
        // Create a fallback structure
        content[component] = createFallbackContent(component, title);
      }
    }

    return new Response(
      JSON.stringify({ content, generatedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-toolkit-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function createFallbackContent(component: string, title: string): unknown {
  switch (component) {
    case "guide":
      return { title: `${title} Guide`, sections: [{ heading: "Getting Started", content: "Content generation failed. Please regenerate." }] };
    case "worksheet":
      return { title: `${title} Worksheet`, exercises: [{ title: "Exercise 1", instructions: "Content generation failed. Please regenerate.", fields: ["Field 1"] }] };
    case "checklist":
      return { title: `${title} Checklist`, items: ["Item 1 - Please regenerate content"] };
    case "resourceList":
      return { title: `${title} Resources`, resources: [{ name: "Resource 1", description: "Content generation failed. Please regenerate." }] };
    case "templates":
      return { title: `${title} Templates`, templates: [{ name: "Template 1", content: "Content generation failed. Please regenerate." }] };
    case "quiz":
      return { title: `${title} Quiz`, questions: [{ question: "Sample question - please regenerate", options: ["A", "B", "C", "D"], correctIndex: 0 }] };
    default:
      return {};
  }
}
