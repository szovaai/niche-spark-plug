import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'scrapedContent', type: 'string', required: false, maxLength: 50000 },
      { field: 'url', type: 'string', maxLength: 2000 },
      { field: 'productName', type: 'string', maxLength: 500 },
      { field: 'niche', type: 'string', maxLength: 500 },
      { field: 'launchStyle', type: 'string', maxLength: 1000 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { scrapedContent, url, productName, niche, launchStyle } = data;

    const userTier = await getUserTier(user.id);

    let contextBlock = "";
    if (scrapedContent) {
      contextBlock = `Scraped Sales Page Content (from ${url || "unknown URL"}):\n${(scrapedContent as string).slice(0, 10000)}`;
    } else if (productName) {
      contextBlock = `Product Name: ${productName}\nNiche: ${niche || "not specified"}\nLaunch Style: ${launchStyle || "not specified"}`;
    } else if (launchStyle) {
      contextBlock = `Launch Style to Analyze: ${launchStyle}\nNiche: ${niche || "general digital products"}`;
    } else if (niche) {
      contextBlock = `Niche Pattern to Analyze: ${niche}`;
    }

    const prompt = `You are an elite launch strategist and competitive intelligence analyst. Your job is to extract STRATEGIC PATTERNS from launches — NOT copy any content.

CRITICAL RULES:
- Extract strategy and mechanics only
- Do NOT copy headlines, bonus names, brand names, or marketing copy
- Generate ORIGINAL recommendations based on observed patterns
- Think like a Dan Kennedy / Russell Brunson level strategist

CONTEXT:
${contextBlock}

Analyze and extract the complete launch intelligence using the extract_launch_intelligence tool.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "extract_launch_intelligence",
            description: "Extract the complete strategic launch intelligence breakdown",
            parameters: {
              type: "object",
              properties: {
                offerDNA: {
                  type: "object",
                  properties: {
                    offerType: { type: "string", description: "Type of offer (e.g., Low-ticket digital, High-ticket course)" },
                    audience: { type: "string", description: "Target buyer persona" },
                    corePromiseStyle: { type: "string", description: "The style of promise being made" },
                    marketPositioning: { type: "string", description: "How it's positioned in the market" },
                    strengthScore: { type: "number", description: "Offer strength 1-100" }
                  },
                  required: ["offerType", "audience", "corePromiseStyle", "marketPositioning", "strengthScore"]
                },
                promisePattern: {
                  type: "object",
                  properties: {
                    promiseType: { type: "string", description: "What type of promise (speed, transformation, income, skill)" },
                    formula: { type: "string", description: "The formula pattern, e.g. 'Get [result] in [timeframe] without [pain]'" },
                    timeframeAngle: { type: "string", description: "How time is used in the promise" },
                    simplicityAngle: { type: "string", description: "How simplicity/ease is communicated" }
                  },
                  required: ["promiseType", "formula", "timeframeAngle", "simplicityAngle"]
                },
                funnelStructure: {
                  type: "object",
                  properties: {
                    trafficSource: { type: "string", description: "Likely traffic sources" },
                    funnelSteps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          step: { type: "string" },
                          purpose: { type: "string" }
                        },
                        required: ["step", "purpose"]
                      }
                    },
                    urgencyPlacement: { type: "string", description: "Where urgency is used" },
                    bonusPlacement: { type: "string", description: "Where bonuses are introduced" }
                  },
                  required: ["trafficSource", "funnelSteps", "urgencyPlacement", "bonusPlacement"]
                },
                pricingStack: {
                  type: "object",
                  properties: {
                    frontEnd: { type: "string", description: "Front-end price and logic" },
                    orderBump: { type: "string", description: "Order bump if applicable" },
                    upsells: {
                      type: "array",
                      items: { type: "string" }
                    },
                    monetizationPath: { type: "string", description: "Overall monetization strategy" },
                    suggestedUserPricing: { type: "string", description: "Suggested pricing for user's version" }
                  },
                  required: ["frontEnd", "monetizationPath", "suggestedUserPricing"]
                },
                bonusStackPattern: {
                  type: "object",
                  properties: {
                    pattern: { type: "string", description: "The pattern of bonuses used" },
                    bonusTypes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Types of bonuses (e.g., templates, swipe files, checklists)"
                    },
                    perceivedValueStrategy: { type: "string", description: "How perceived value is increased" },
                    suggestedUserBonuses: {
                      type: "array",
                      items: { type: "string" },
                      description: "Original bonus ideas for the user"
                    }
                  },
                  required: ["pattern", "bonusTypes", "perceivedValueStrategy", "suggestedUserBonuses"]
                },
                conversionTriggers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      trigger: { type: "string", description: "Name of the trigger" },
                      description: { type: "string", description: "How it's used" },
                      strength: { type: "string", enum: ["strong", "moderate", "weak"] }
                    },
                    required: ["trigger", "description", "strength"]
                  }
                },
                opportunityGaps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      gap: { type: "string", description: "The weakness or missed opportunity" },
                      improvement: { type: "string", description: "How the user can capitalize" },
                      impact: { type: "string", enum: ["high", "medium", "low"] }
                    },
                    required: ["gap", "improvement", "impact"]
                  }
                },
                uniqueRebuild: {
                  type: "object",
                  properties: {
                    productConcept: { type: "string", description: "Original product concept" },
                    uniqueMechanism: { type: "string", description: "A unique mechanism name" },
                    differentiatedPromise: { type: "string", description: "How the promise differs" },
                    suggestedPricing: { type: "string", description: "Pricing recommendation" },
                    funnelOutline: { type: "string", description: "Brief funnel outline" },
                    bonusStack: { type: "array", items: { type: "string" } },
                    launchChecklist: { type: "array", items: { type: "string" } },
                    suggestedNiche: { type: "string" },
                    suggestedAudience: { type: "string" },
                    suggestedTopic: { type: "string" }
                  },
                  required: ["productConcept", "uniqueMechanism", "differentiatedPromise", "suggestedPricing", "funnelOutline", "bonusStack", "launchChecklist", "suggestedNiche", "suggestedAudience", "suggestedTopic"]
                }
              },
              required: ["offerDNA", "promisePattern", "funnelStructure", "pricingStack", "bonusStackPattern", "conversionTriggers", "opportunityGaps", "uniqueRebuild"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_launch_intelligence" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to analyze launch. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
