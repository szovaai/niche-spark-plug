import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailSequenceRequest {
  offerName: string;
  targetAudience: string;
  keyBenefits: string[];
  uniqueMechanism?: string;
  price: number;
  salesPageUrl?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { offerName, targetAudience, keyBenefits, uniqueMechanism, price, salesPageUrl }: EmailSequenceRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating 14-day email sequence for:", offerName);

    const prompt = `You are Funnel Architect Pro, an expert email copywriter specializing in story-driven, high-converting email sequences.

Generate a complete 14-Day Daily Connection Sequence designed to sell "${offerName}" through daily storytelling, curiosity hooks, micro-lessons, and open loops.

OFFER DETAILS:
- Product: ${offerName}
- Target Audience: ${targetAudience}
- Key Benefits: ${keyBenefits.join(", ")}
- Unique Mechanism: ${uniqueMechanism || "A proven system that delivers results"}
- Price: $${price}
${salesPageUrl ? `- Sales Page: ${salesPageUrl}` : ""}

SEQUENCE STRUCTURE (follow this EXACTLY):
Day 1: Origin Story - Why this offer exists and connects to the reader's pain
Day 2: Curiosity Loop - Tease the unique mechanism or unexpected discovery
Day 3: Value Lesson - Deliver one "aha" that reframes the reader's situation
Day 4: Proof Snapshot - Share a small win or customer story
Day 5: Humor/Relatability - Add personality and human connection
Day 6: Objection 1 - Address "I don't have time"
Day 7: Objection 2 - Address "I don't have money / I've tried before"
Day 8: Proof Stack - Combine multiple case studies or testimonials
Day 9: Value Bomb - Teach another mini concept or shortcut
Day 10: Transition - Explain "why I made this for you"
Day 11: Offer Reveal - Present the offer stack and full value
Day 12: Urgency 1 - Introduce early deadline or expiring bonus
Day 13: Objection 3 - "Does this really work for me?" story
Day 14: Final Call - Emotional close and final deadline reminder

EMAIL STRUCTURE (each email must have):
- subject: Curiosity or story-driven subject line (under 50 chars)
- previewText: Compelling preview text that creates intrigue (under 90 chars)
- openingHook: 1-2 line pattern interrupt (question, unexpected statement, visual image)
- storyAnalogy: 3-6 line relatable story tied to the reader's desire or pain
- lessonTwist: 2-4 line takeaway that reframes belief or reveals insight
- offerBridge: 2-3 lines connecting the lesson naturally to the product
- cta: Simple call-to-action line
- ps: (optional) Curiosity cue for next email or light urgency reminder

TONE REQUIREMENTS:
- Conversational, personal, entertaining — NOT salesy
- Use pattern interrupts, analogies, short stories
- Include curiosity hooks, emotional contrast, light cliffhangers
- Each email self-contained but part of larger narrative arc
- Alternate between: Story-Driven, Value-Driven, Proof-Driven, Urgency-Driven
- Use "you" language extensively
- Sound like a friend sharing valuable insights, not a marketer pushing products

CRITICAL: Return ONLY valid JSON in this exact format:
{
  "sequenceTheme": "Brief description of the overall narrative theme",
  "narrativeArc": "How the story builds over 14 days",
  "emails": [
    {
      "day": 1,
      "focus": "origin-story",
      "subject": "Subject line here",
      "previewText": "Preview text here",
      "openingHook": "Opening hook here",
      "storyAnalogy": "Story/analogy here",
      "lessonTwist": "Lesson/twist here",
      "offerBridge": "Offer bridge here",
      "cta": "CTA here",
      "ps": "P.S. here (optional)"
    }
  ]
}

Use these exact focus values: origin-story, curiosity-loop, value-lesson, proof-snapshot, humor-relatability, objection-time, objection-money, proof-stack, value-bomb, transition, offer-reveal, urgency, objection-fit, final-call`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
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
    let content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse email sequence response");
    }
    
    const emailSequence = JSON.parse(jsonMatch[0]);
    
    // Add offer details to the response
    emailSequence.offerName = offerName;
    emailSequence.targetAudience = targetAudience;
    emailSequence.price = price;

    console.log("Generated email sequence with", emailSequence.emails?.length, "emails");

    return new Response(JSON.stringify(emailSequence), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-email-sequence:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
