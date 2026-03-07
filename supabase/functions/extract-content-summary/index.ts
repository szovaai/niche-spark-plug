import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentSummaryRequest {
  content: {
    guide?: {
      title?: string;
      sections?: { heading: string; content: string }[];
    };
    worksheet?: {
      title?: string;
      exercises?: { title: string; instructions: string }[];
    };
    checklist?: {
      title?: string;
      items?: string[];
    };
    resourceList?: {
      title?: string;
      resources?: { name: string; description: string }[];
    };
    templates?: {
      title?: string;
      templates?: { name: string; content: string }[];
    };
    quiz?: {
      title?: string;
      questions?: { question: string; options: string[] }[];
    };
  };
  title: string;
  niche: string;
  targetAudience?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, title, niche, targetAudience } = await req.json() as ContentSummaryRequest;
    
    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!deepseekApiKey) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    // Build content overview for the AI to analyze
    let contentOverview = "";
    
    if (content.guide?.sections) {
      contentOverview += "=== GUIDE CONTENT ===\n";
      content.guide.sections.forEach((section, i) => {
        contentOverview += `\nChapter ${i + 1}: ${section.heading}\n`;
        // Include first 500 chars of each section to keep prompt manageable
        contentOverview += section.content.substring(0, 500) + (section.content.length > 500 ? "..." : "") + "\n";
      });
    }
    
    if (content.worksheet?.exercises) {
      contentOverview += "\n=== WORKSHEET EXERCISES ===\n";
      content.worksheet.exercises.forEach(exercise => {
        contentOverview += `- ${exercise.title}: ${exercise.instructions.substring(0, 200)}\n`;
      });
    }
    
    if (content.checklist?.items) {
      contentOverview += "\n=== CHECKLIST ITEMS ===\n";
      content.checklist.items.slice(0, 10).forEach(item => {
        contentOverview += `- ${item}\n`;
      });
    }
    
    if (content.templates?.templates) {
      contentOverview += "\n=== TEMPLATES ===\n";
      content.templates.templates.forEach(template => {
        contentOverview += `- ${template.name}\n`;
      });
    }

    const prompt = `You are an expert marketing analyst. Analyze this digital toolkit content and extract key marketing elements that will be used to create sales copy and email sequences.

PRODUCT: "${title}"
NICHE: ${niche}
TARGET AUDIENCE: ${targetAudience || "online entrepreneurs and digital product creators"}

${contentOverview}

Extract the following elements in JSON format:

{
  "mainTransformation": "A single compelling sentence describing the ultimate transformation/outcome. Start with 'After using this toolkit, you will...'",
  "chapterThemes": [
    {
      "chapter": "Chapter title",
      "theme": "Core theme in 5-10 words",
      "keyTakeaway": "The main actionable insight from this chapter"
    }
  ],
  "uniqueMechanisms": ["Named methods, systems, or frameworks mentioned in the content - these should be quotable names like 'The 5-Minute Framework' or 'The Value Ladder System'"],
  "specificBenefits": ["Tangible skills or outcomes the reader will gain - be specific, not generic"],
  "painPointsAddressed": ["Specific problems/frustrations this toolkit solves"],
  "quotableInsights": ["Memorable phrases or principles that could be highlighted in marketing"],
  "tableOfContents": ["Chapter/section titles in order"]
}

IMPORTANT:
- Extract REAL elements from the content, don't make up generic benefits
- If the content mentions specific methods or frameworks, use those exact names
- Be specific and concrete - avoid vague marketing speak
- If you can't find enough content for a field, make reasonable inferences based on the niche and title

Return ONLY valid JSON, no additional text.`;

    console.log("Extracting content summary for:", title);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deepseekApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a marketing analyst who extracts key selling points from educational content. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const summaryText = data.choices?.[0]?.message?.content;

    if (!summaryText) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let summary;
    try {
      // Remove any markdown code blocks if present
      const cleanedText = summaryText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      summary = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", summaryText);
      // Return a fallback summary based on the content
      summary = {
        mainTransformation: `After using this toolkit, you will have a complete system for mastering ${niche}.`,
        chapterThemes: content.guide?.sections?.map((s, i) => ({
          chapter: s.heading,
          theme: `Key insights on ${s.heading.toLowerCase()}`,
          keyTakeaway: `Actionable strategies for ${s.heading.toLowerCase()}`
        })) || [],
        uniqueMechanisms: [`The ${title} System`],
        specificBenefits: [
          `Complete understanding of ${niche}`,
          "Step-by-step implementation guide",
          "Ready-to-use templates and tools"
        ],
        painPointsAddressed: [
          `Feeling overwhelmed by ${niche}`,
          "Not knowing where to start",
          "Lack of a proven system"
        ],
        quotableInsights: [`"Master ${niche} with a proven system"`],
        tableOfContents: content.guide?.sections?.map(s => s.heading) || [title]
      };
    }

    console.log("Content summary extracted successfully");

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error extracting content summary:", error);
    return new Response(
      JSON.stringify({ error: "Unable to extract content summary. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
