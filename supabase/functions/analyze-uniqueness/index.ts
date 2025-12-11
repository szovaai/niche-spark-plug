import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, contentType, nicheContext } = await req.json();

    if (!content || content.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Content must be at least 50 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert content analyst specializing in digital product uniqueness assessment. Your job is to analyze content and determine how unique and differentiated it is compared to typical market patterns.

ANALYSIS CRITERIA:
1. Language Patterns - Check for overused phrases, clichés, generic descriptions
2. Structure Originality - Assess if the structure follows common templates or is innovative
3. Value Proposition - Evaluate if the benefits/features are unique or generic
4. Voice & Tone - Determine if the writing has a distinctive personality
5. Specificity - Check if content is vague/generic or specific/targeted

SCORING GUIDELINES:
- 0-30: Low uniqueness - Very generic, uses common templates, no differentiation
- 31-50: Moderate - Some original elements but mostly follows patterns
- 51-70: Good - Notable unique elements, reasonable differentiation
- 71-85: Very Good - Strong originality, clear differentiation
- 86-100: Excellent - Highly unique, innovative approach, strong voice

Return your analysis as JSON with this exact structure:
{
  "uniquenessScore": <number 0-100>,
  "rating": "<Low|Moderate|Good|Excellent>",
  "overallAssessment": "<2-3 sentence summary>",
  "patternMatches": [
    {
      "pattern": "<identified common pattern>",
      "frequency": "<common|moderate|rare>",
      "suggestion": "<how to make it more unique>"
    }
  ],
  "strengths": ["<unique element 1>", "<unique element 2>"],
  "weaknesses": ["<generic aspect 1>", "<generic aspect 2>"],
  "improvementSuggestions": ["<specific actionable tip 1>", "<specific actionable tip 2>"],
  "differentiationTips": ["<market differentiation tip 1>", "<market differentiation tip 2>"]
}`;

    const userPrompt = `Analyze this ${contentType.replace('_', ' ')} content for uniqueness:

${nicheContext ? `Niche/Context: ${nicheContext}\n\n` : ''}CONTENT TO ANALYZE:
"""
${content}
"""

Provide a comprehensive uniqueness analysis with actionable insights for improving differentiation.`;

    console.log('Analyzing content uniqueness...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please check your account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response
    let result;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response');
    }

    console.log('Uniqueness analysis complete. Score:', result.uniquenessScore);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in analyze-uniqueness:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze content';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
