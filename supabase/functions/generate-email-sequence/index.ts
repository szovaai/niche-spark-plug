import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentSummary {
  mainTransformation: string;
  chapterThemes: { chapter: string; theme: string; keyTakeaway: string }[];
  uniqueMechanisms: string[];
  specificBenefits: string[];
  painPointsAddressed: string[];
  quotableInsights: string[];
  tableOfContents: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { 
      offerName, 
      targetAudience, 
      keyBenefits, 
      uniqueMechanism, 
      price, 
      salesPageUrl,
      contentSummary 
    } = await req.json();
    
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is not configured");

    console.log("Generating content-aware 14-day email sequence for:", offerName);

    let enhancedPrompt = "";

    if (contentSummary) {
      const summary = contentSummary as ContentSummary;
      
      enhancedPrompt = `Generate a complete 14-Day pre-sale email sequence for "${offerName}" targeting ${targetAudience}.

=== PRODUCT DETAILS ===
MAIN TRANSFORMATION: ${summary.mainTransformation}
PRICE: $${price}

=== WHAT THE PRODUCT TEACHES ===
${summary.chapterThemes?.map(c => `• ${c.chapter}: ${c.keyTakeaway}`).join("\n") || "Complete guide"}

=== UNIQUE MECHANISMS TO REFERENCE ===
${summary.uniqueMechanisms?.map(m => `"${m}"`).join(", ") || uniqueMechanism || `The ${offerName} System`}

=== KEY BENEFITS (Use these specifically) ===
${summary.specificBenefits?.map(b => `• ${b}`).join("\n") || keyBenefits?.join("\n• ") || ""}

=== PAIN POINTS TO ADDRESS ===
${summary.painPointsAddressed?.map(p => `• ${p}`).join("\n") || ""}

=== EMAIL SEQUENCE STRUCTURE ===
Map the 14 emails to reference actual chapter content:

Days 1-2 (ORIGIN STORY): Share a relatable struggle that led to discovering the solution. Hint at the main transformation.

Days 3-4 (INSIGHT REVEAL): Share a key insight from Chapter 1-2. Use specific language from the content.

Days 5-6 (MECHANISM PREVIEW): Introduce the "${summary.uniqueMechanisms?.[0] || uniqueMechanism || 'system'}" method. Explain why it works differently.

Day 7 (OFFER REVEAL): Full product reveal. List what's included using the actual table of contents.

Days 8-9 (SOCIAL PROOF + OBJECTIONS): Handle common objections. Reference specific benefits from the content.

Days 10-11 (DEEP DIVE): Preview specific chapters. Give a "taste" of the content without giving it all away.

Days 12-13 (URGENCY): Deadline approaching. Stack the value using real content features.

Day 14 (LAST CALL): Final hours. Remind them of the transformation.

Return JSON format:
{
  "sequenceTheme": "A 2-3 word theme for the sequence",
  "narrativeArc": "One sentence describing the story arc",
  "emails": [
    {
      "day": 1,
      "focus": "origin-story",
      "subject": "Subject line with curiosity hook",
      "previewText": "Preview text (50 chars max)",
      "openingHook": "2-3 sentences to hook them in",
      "storyAnalogy": "The story or analogy section (3-4 paragraphs)",
      "lessonTwist": "The lesson or twist that connects to the product",
      "offerBridge": "Bridge to the offer/next email",
      "cta": "Call to action with link placeholder",
      "ps": "P.S. line with extra hook"
    }
  ]
}

CRITICAL: Reference ACTUAL chapter themes and mechanisms, not generic benefits. Each email should feel like it comes from someone who KNOWS what's in the product.`;

    } else {
      // Fallback prompt
      enhancedPrompt = `Generate a complete 14-Day email sequence for "${offerName}" targeting ${targetAudience}. Key benefits: ${keyBenefits?.join(", ") || "proven results"}. Unique mechanism: ${uniqueMechanism || "A proven system"}. Price: $${price}.

Return JSON: {"sequenceTheme": "", "narrativeArc": "", "emails": [{"day": 1, "focus": "", "subject": "", "previewText": "", "openingHook": "", "storyAnalogy": "", "lessonTwist": "", "offerBridge": "", "cta": "", "ps": ""}]}`;
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        model: "deepseek-chat", 
        messages: [
          { role: "system", content: "You are Funnel Architect Pro - an expert email copywriter who writes story-driven sequences that feel personal and reference actual product content. Always respond with valid JSON." },
          { role: "user", content: enhancedPrompt }
        ],
        temperature: 0.8,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse response");

    const emailSequence = JSON.parse(jsonMatch[0]);
    emailSequence.offerName = offerName;
    emailSequence.targetAudience = targetAudience;
    emailSequence.price = price;

    return new Response(JSON.stringify(emailSequence), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
