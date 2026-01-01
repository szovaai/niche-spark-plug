import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getUserApiKey, makeChatCompletion, type BYOKConfig } from "../_shared/byok.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, niche, targetAudience, components } = await req.json();

    // Check for BYOK first
    const authHeader = req.headers.get('authorization');
    const byokConfig = await getUserApiKey(authHeader, 'deepseek');
    
    // Fallback to environment variable if no BYOK
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!byokConfig && !DEEPSEEK_API_KEY) {
      throw new Error('No API key configured. Please add your own key in Settings.');
    }

    const componentList = components ? Object.entries(components)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name)
      .join(', ') : 'guide, worksheet, checklist';

    const systemPrompt = `You are an expert educational product architect and curriculum designer. Your task is to create a compelling, strategic thesis statement that will serve as the "spine" for an entire digital toolkit.

The thesis should:
1. Clearly articulate the CORE TRANSFORMATION the user will experience
2. Define a UNIQUE MECHANISM or framework that makes this approach different
3. Establish a clear PROGRESSION from problem to solution
4. Be specific enough to guide all content creation, yet broad enough to encompass multiple components

Write in a confident, expert tone. Avoid generic platitudes. Be specific about the methodology.

Output ONLY the thesis statement (2-4 sentences). No preamble, no explanation, no quotes.`;

    const userPrompt = `Create a powerful thesis statement for this digital toolkit:

TITLE: ${title}
NICHE: ${niche}
TARGET AUDIENCE: ${targetAudience || 'General audience seeking transformation'}
COMPONENTS INCLUDED: ${componentList}

The thesis should capture:
- What unique insight or framework drives this toolkit
- The transformation journey from current state to desired outcome
- Why this specific approach works better than alternatives

Generate a thesis that sounds proprietary and valuable, like it came from a recognized expert in the field.`;

    const provider = byokConfig ? byokConfig.provider : 'deepseek';
    console.log('Generating thesis for:', { title, niche, targetAudience, usingBYOK: !!byokConfig, provider });

    let thesis: string;

    if (byokConfig) {
      // Use BYOK
      const result = await makeChatCompletion(
        byokConfig,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        { temperature: 0.8, maxTokens: 500 }
      );
      thesis = result.content.trim();
    } else {
      // Use default DeepSeek
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'API usage limit reached.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      thesis = data.choices[0]?.message?.content?.trim();
    }

    if (!thesis) {
      throw new Error('No thesis generated');
    }

    console.log('Generated thesis:', thesis.substring(0, 100) + '...');

    return new Response(JSON.stringify({ thesis, provider }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating thesis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
