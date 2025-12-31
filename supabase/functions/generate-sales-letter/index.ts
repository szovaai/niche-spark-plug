import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SalesLetterRequest {
  title: string;
  subtitle?: string;
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
  price?: number;
  authorName?: string;
  keyBenefits?: string[];
  uniqueMechanism?: string;
  bonuses?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      title, 
      subtitle, 
      niche, 
      targetAudience, 
      components, 
      price,
      authorName,
      keyBenefits,
      uniqueMechanism,
      bonuses
    }: SalesLetterRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating AICPBSAWN sales letter for:", title);

    const activeComponents = Object.entries(components)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => {
        const labels: Record<string, string> = {
          guide: "Complete Step-by-Step Guide",
          worksheet: "Interactive Worksheets",
          checklist: "Action Checklists",
          resourceList: "Curated Resource List",
          templates: "Ready-to-Use Templates",
          quiz: "Self-Assessment Quiz"
        };
        return labels[name] || name;
      });

    const prompt = `You are a world-class direct response copywriter. Write a complete sales letter using the AICPBSAWN framework (Attention → Interest → Credibility → Prove → Benefits → Scarcity → Action → Warn → Now).

PRODUCT DETAILS:
- Product: "${title}"
${subtitle ? `- Subtitle: "${subtitle}"` : ""}
- Niche: ${niche}
- Target Audience: ${targetAudience || "Online entrepreneurs and digital marketers"}
- Price: $${price || 17}
${authorName ? `- Author: ${authorName}` : ""}
${uniqueMechanism ? `- Unique Mechanism: ${uniqueMechanism}` : ""}

WHAT'S INCLUDED:
${activeComponents.map(c => `- ${c}`).join("\n")}

${keyBenefits?.length ? `KEY BENEFITS:\n${keyBenefits.map(b => `- ${b}`).join("\n")}` : ""}

${bonuses?.length ? `BONUS ITEMS:\n${bonuses.map(b => `- ${b}`).join("\n")}` : ""}

WRITE THE COMPLETE SALES LETTER WITH THESE EXACT SECTIONS:

## PREHEADLINE
For [target audience] who want [specific outcome they desire]

## HEADLINE
Big, bold promise with a pattern interrupt. Make it impossible to ignore. Use power words and curiosity.

## SUBHEADLINE
"How regular people are quietly [achieving X]... without [pain point 1], [pain point 2], or [pain point 3]"

## STORY (Opening Hook)
Start with a brutally honest question that hits their pain point. Then:
- Pattern-interrupt hook (2-3 sentences)
- Relatable moment they've experienced
- The "aha" twist that changes everything
- Transition to the solution

## ATTENTION (Product Introduction)
Introduce the product as THE solution. Include 5-6 bullet points of what they'll be able to do/achieve.

## INTEREST (Why This Matters Right Now)
Explain why traditional methods fail and why this approach works. One key insight that reframes their situation.

## CREDIBILITY (Why Trust This System)
3-4 bullet points establishing trust:
- Built from proven frameworks
- Designed for completion and results
- Clear participant journey
- Specific methodology mention

## PROVE (Show The Working Pieces)
"Inside, you'll see exactly how to..." with 3-4 specific, tangible outcomes they'll learn.

## BENEFITS (Features → Outcomes)
For EACH component included, write:
📘/🧩/📝/✅/🎯 [Component Name]
- Feature → Specific outcome/benefit
- Feature → Specific outcome/benefit

Each feature must connect to an emotional or practical benefit they care about.

## SCARCITY (Why Decide Today)
Create urgency without being sleazy. Mention:
- Early adopter pricing
- Price will increase
- Bonuses may be removed

## ACTION (Your Next Step)
Clear CTA with price. "Ready to [achieve X]? Click here to get instant access for just $[price]."

## WARN (What Happens If You Wait)
Paint the picture of continued struggle. Every week of delay = more frustration, more missed opportunities. Make inaction feel costly.

## NOW (Why It's The Best Time)
Market timing, momentum building, compounding benefits. Lock in today, start this week, be ready for [future launch/opportunity].

## OFFER SUMMARY
✔ [List each item]
Today's Price: $[price] — one-time. No subscription. No required upsells.
→ [Final CTA button text]

STYLE REQUIREMENTS:
- Write like a direct response copywriter, NOT a corporate brochure
- Use short paragraphs (2-3 sentences MAX)
- Include bullet points for easy scanning
- Use "you" language extensively
- Add curiosity and intrigue throughout
- Focus on BENEFITS over features
- Sound confident but not sleazy
- Add urgency without being pushy
- Include P.S. at the end restating main benefit

FORMAT: Clean HTML that can be used directly on a sales page. Use semantic tags (<h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>). Include section comments like <!-- PREHEADLINE --> for easy editing.`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const salesLetter = data.choices?.[0]?.message?.content || "";

    console.log("Generated sales letter, length:", salesLetter.length);

    return new Response(JSON.stringify({ salesLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-sales-letter:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
