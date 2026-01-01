import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getUserApiKey, getProviderConfig, type BYOKConfig } from "../_shared/byok.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Style-specific directives
const STYLE_DIRECTIVES: Record<string, string> = {
  conversational: `
WRITING STYLE - CONVERSATIONAL:
- Write like you're chatting with a friend over coffee. Keep it warm and approachable.
- Use contractions naturally (you're, it's, don't, we'll).
- Include personality touches: "Here's the thing...", "Pro tip:", "Quick win:", "The secret?".
- Write in second person (you, your) to speak directly to the reader.
- Vary sentence length. Mix short punchy sentences with longer flowing ones.
- Avoid corporate buzzwords (leverage, utilize, synergy, optimize).
- Sound confident but not salesy. Be helpful, not pushy.
- Add encouraging phrases: "You've got this", "Here's where it gets exciting".
`,
  professional: `
WRITING STYLE - PROFESSIONAL:
- Write with authority and expertise. You're the trusted advisor.
- Use clear, precise language. Every word should earn its place.
- Structure content logically with clear transitions between ideas.
- Include data-driven insights and evidence-based recommendations.
- Maintain a formal but not stiff tone. Accessible expertise.
- Use industry terminology appropriately, but explain when needed.
- Focus on actionable outcomes and measurable results.
- Sound like a consultant delivering high-value insights.
`,
  storytelling: `
WRITING STYLE - STORYTELLING:
- Open with hooks that draw readers in. Create curiosity.
- Use the "before and after" narrative arc throughout.
- Include real-world examples, case studies, and analogies.
- Paint pictures with words. Help readers visualize success.
- Build tension before revealing solutions ("But here's what most people miss...").
- Connect emotionally to the reader's pain points and aspirations.
- Use metaphors to explain complex concepts simply.
- End sections with compelling transitions that keep readers engaged.
`,
  "step-by-step": `
WRITING STYLE - STEP-BY-STEP:
- Lead with action. Every section should have clear, numbered steps.
- Use imperative verbs: "Open", "Click", "Write", "Review", "Send".
- Include specific details: exact numbers, timeframes, measurements.
- Add checkpoints: "Before moving on, make sure you've..."
- Anticipate questions and address them inline.
- Use bullet points and numbered lists liberally.
- Include "Quick Reference" boxes for key takeaways.
- Keep explanations concise - focus on what to do, not why (unless critical).
`,
};

// Default humanization (fallback if no style selected)
const DEFAULT_HUMAN_DIRECTIVE = `
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
  guide: `Create an IN-DEPTH, COMPREHENSIVE guide with 10-12 detailed chapters. This guide should be approximately 2,500-3,000 words TOTAL (200-300 words per chapter MINIMUM).

CHAPTER REQUIREMENTS - EACH CHAPTER MUST INCLUDE:
1. Opening Hook (1-2 sentences): Start with a compelling question, surprising statistic, or relatable scenario
2. Core Teaching (4-6 sentences): Main concept explanation with specific examples and data points
3. Step-by-Step Actions (3-5 numbered steps): Specific, actionable steps the reader can implement TODAY
4. Real-World Example (2-3 sentences): Brief case study, "Imagine this..." scenario, or before/after story
5. Pro Tip Box: One insider secret or shortcut most people miss
6. Common Mistake Warning: What to avoid and why
7. Key Takeaway: One sentence summary of the chapter's main lesson
8. Transition: Bridge sentence to the next chapter

CONTENT DEPTH REQUIREMENTS:
- Use SPECIFIC numbers, percentages, timeframes, and metrics (not vague estimates like "a lot" or "soon")
- Include "If/Then" scenarios: "If you're a beginner, do X. If you're more advanced, try Y instead."
- Add troubleshooting guidance: "If this doesn't work, check that..." or "Common blockers include..."
- Reference specific tools, methods, frameworks, or resources by name where appropriate
- Include psychological insights, motivation boosters, and mindset shifts
- Provide templates, scripts, or fill-in-the-blank frameworks where helpful

CONTENT STRUCTURE:
- Chapter 1: Hook them with a compelling "why" and quick win they can achieve today
- Chapters 2-4: Foundation concepts with actionable frameworks
- Chapters 5-8: Core implementation strategies with detailed walkthroughs
- Chapters 9-10: Advanced tactics and optimization techniques
- Chapters 11-12: Scaling, troubleshooting, and next steps

TONE REQUIREMENTS:
- Conversational and encouraging ("You've got this", "Here's where it gets exciting")
- Results-oriented ("By the end of this chapter, you'll be able to...")
- Actionable ("Right now, open your [X] and...", "Your homework: spend 15 minutes on...")
- Expert but approachable - like advice from a successful mentor who's been in their shoes

Return as: { "title": "Guide Title", "sections": [{ "heading": "Chapter 1: [Descriptive Title]", "content": "[200-300 word detailed content following the structure above...]" }, ...] }

CRITICAL: Generate EXACTLY 10-12 substantial chapters. Each chapter should feel like a complete mini-lesson that provides standalone value while building toward mastery. NO FLUFF - every sentence should teach, inspire, or prompt action.`,
  
  worksheet: `Create an interactive worksheet with 4-6 exercises. Each exercise needs a title, clear instructions, and 3-5 fill-in fields/prompts. Return as: { "title": "Worksheet Title", "exercises": [{ "title": "...", "instructions": "...", "fields": ["field1", "field2"] }] }`,
  
  checklist: `Create an actionable checklist organized into 3-4 phases. Each phase should have 5-8 specific, actionable tasks. Start items with action verbs. Return as: { "title": "Checklist Title", "items": ["Phase 1: Setup", "☐ Task 1", "☐ Task 2", "Phase 2: Implementation", "☐ Task 3", ...] }`,
  
  resourceList: `Create a curated resource list with 8-12 resources organized by category. Include tools, websites, books, or services. Each needs a name, description, and optional URL placeholder. Return as: { "title": "Resource Title", "resources": [{ "name": "...", "description": "...", "url": "https://..." }] }`,
  
  templates: `Create 3-5 ready-to-use templates. Each template needs a name and full content that users can copy and customize. Return as: { "title": "Templates Title", "templates": [{ "name": "Template Name", "content": "Full template text..." }] }`,
  
  quiz: `Create a knowledge-check quiz with 8-10 multiple choice questions. Each question needs 4 options and the correct answer index (0-3). Return as: { "title": "Quiz Title", "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 }] }`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      title, 
      niche, 
      targetAudience, 
      components, 
      singleChapter, 
      writingStyle = "conversational" 
    } = await req.json();
    
    // Check for BYOK first
    const authHeader = req.headers.get('authorization');
    const byokConfig = await getUserApiKey(authHeader, 'deepseek');
    
    // Fallback to environment variable if no BYOK
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    
    if (!byokConfig && !DEEPSEEK_API_KEY) {
      throw new Error("No API key configured. Please add your own key in Settings.");
    }

    // Get the appropriate style directive
    const styleDirective = STYLE_DIRECTIVES[writingStyle] || DEFAULT_HUMAN_DIRECTIVE;

    // Determine which components to generate
    let componentsToGenerate: string[] = [];
    
    if (singleChapter) {
      componentsToGenerate = [singleChapter];
    } else {
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

    const provider = byokConfig ? byokConfig.provider : 'deepseek';
    console.log(`Generating toolkit "${title}" with style: ${writingStyle}, components: ${componentsToGenerate.join(", ")}, provider: ${provider}`);

    const content: Record<string, unknown> = {};

    for (const component of componentsToGenerate) {
      const componentPrompt = componentPrompts[component];
      if (!componentPrompt) continue;

      const systemPrompt = `You are an expert content creator for digital products.

${styleDirective}

Context:
- Toolkit Title: "${title}"
- Niche: ${niche}
- Target Audience: ${targetAudience || "entrepreneurs and professionals"}

Your task: ${componentPrompt}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON object.`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate the ${component} content now.` }
      ];

      let contentText = "";

      if (byokConfig) {
        // Use BYOK
        const providerConfig = getProviderConfig(byokConfig.provider);
        
        if (providerConfig.isAnthropic) {
          const response = await fetch(providerConfig.endpoint, {
            method: 'POST',
            headers: {
              'x-api-key': byokConfig.apiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: providerConfig.model,
              max_tokens: component === 'guide' ? 8000 : 4000,
              system: systemPrompt,
              messages: [{ role: 'user', content: `Generate the ${component} content now.` }],
            }),
          });

          if (!response.ok) {
            console.error(`Anthropic API error for ${component}:`, response.status);
            continue;
          }

          const data = await response.json();
          contentText = data.content?.[0]?.text || "";
        } else {
          const response = await fetch(providerConfig.endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${byokConfig.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: providerConfig.model,
              messages,
              temperature: 0.7,
              max_tokens: component === 'guide' ? 8000 : 4000,
            }),
          });

          if (!response.ok) {
            console.error(`${byokConfig.provider} API error for ${component}:`, response.status);
            continue;
          }

          const data = await response.json();
          contentText = data.choices?.[0]?.message?.content || "";
        }
      } else {
        // Use default DeepSeek
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages,
            temperature: 0.7,
            max_tokens: component === 'guide' ? 8000 : 4000,
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
          continue;
        }

        const data = await response.json();
        contentText = data.choices?.[0]?.message?.content || "";
      }
      
      try {
        const cleanedText = contentText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        content[component] = JSON.parse(cleanedText);
        console.log(`Successfully generated ${component}`);
      } catch (parseError) {
        console.error(`Failed to parse ${component} content:`, parseError);
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
