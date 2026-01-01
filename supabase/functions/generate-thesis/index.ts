import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getUserApiKey, makeChatCompletion, type BYOKConfig } from "../_shared/byok.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ImprovementMode = 'generate' | 'improve_clarity' | 'make_specific' | 'simplify';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, niche, targetAudience, components, existingThesis, mode = 'generate' } = await req.json();

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

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === 'generate') {
      // Original generation mode
      systemPrompt = `You are an expert educational product architect and curriculum designer. Your task is to create a compelling, strategic thesis statement that will serve as the "spine" for an entire digital toolkit.

The thesis should:
1. Clearly articulate the CORE TRANSFORMATION the user will experience
2. Define a UNIQUE MECHANISM or framework that makes this approach different
3. Establish a clear PROGRESSION from problem to solution
4. Be specific enough to guide all content creation, yet broad enough to encompass multiple components

Write in a confident, expert tone. Avoid generic platitudes. Be specific about the methodology.

Output ONLY the thesis statement (2-4 sentences). No preamble, no explanation, no quotes.`;

      userPrompt = `Create a powerful thesis statement for this digital toolkit:

TITLE: ${title}
NICHE: ${niche}
TARGET AUDIENCE: ${targetAudience || 'General audience seeking transformation'}
COMPONENTS INCLUDED: ${componentList}

The thesis should capture:
- What unique insight or framework drives this toolkit
- The transformation journey from current state to desired outcome
- Why this specific approach works better than alternatives

Generate a thesis that sounds proprietary and valuable, like it came from a recognized expert in the field.`;
    } else if (mode === 'improve_clarity') {
      // Improve clarity mode
      systemPrompt = `You are an expert editor specializing in making complex ideas crystal clear. Your task is to rewrite a thesis statement to be clearer and more accessible while maintaining its core message and power.

Focus on:
1. Simpler sentence structures
2. More concrete language
3. Removing jargon or unnecessary complexity
4. Making the core promise immediately obvious

Output ONLY the improved thesis (2-4 sentences). No preamble, no explanation.`;

      userPrompt = `Improve the clarity of this thesis statement for a digital toolkit:

CURRENT THESIS:
${existingThesis}

CONTEXT:
- Title: ${title}
- Niche: ${niche}
- Target Audience: ${targetAudience || 'General audience'}

Rewrite to be clearer and more accessible while keeping the core transformation message intact.`;
    } else if (mode === 'make_specific') {
      // Make more specific mode
      systemPrompt = `You are an expert product strategist who specializes in making value propositions more concrete and specific. Your task is to add specific details, numbers, or methodologies to make a thesis statement more tangible and believable.

Focus on:
1. Adding specific outcomes or metrics where appropriate
2. Naming the methodology or framework more precisely
3. Adding concrete steps or phases
4. Making the transformation more vivid and measurable

Output ONLY the improved thesis (2-4 sentences). No preamble, no explanation.`;

      userPrompt = `Make this thesis statement more specific and concrete:

CURRENT THESIS:
${existingThesis}

CONTEXT:
- Title: ${title}
- Niche: ${niche}  
- Target Audience: ${targetAudience || 'General audience'}

Add specific details, frameworks, or outcomes to make it more tangible and compelling.`;
    } else if (mode === 'simplify') {
      // Simplify mode (one problem, one solution)
      systemPrompt = `You are an expert in distilling complex ideas into their simplest, most powerful form. Your task is to simplify a thesis statement to focus on ONE core problem and ONE core solution.

Follow the "One Problem, One Solution" rule:
1. Identify the single most important problem being solved
2. State the single most impactful solution or transformation
3. Remove all secondary concerns or benefits
4. Make it punchy and memorable

Output ONLY the simplified thesis (1-2 sentences max). No preamble, no explanation.`;

      userPrompt = `Simplify this thesis to its ONE problem, ONE solution core:

CURRENT THESIS:
${existingThesis}

CONTEXT:
- Title: ${title}
- Niche: ${niche}
- Target Audience: ${targetAudience || 'General audience'}

Distill to the single most important transformation.`;
    } else {
      throw new Error(`Invalid mode: ${mode}`);
    }

    const provider = byokConfig ? byokConfig.provider : 'deepseek';
    console.log('Processing thesis:', { title, niche, mode, usingBYOK: !!byokConfig, provider });

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

    console.log(`${mode} thesis result:`, thesis.substring(0, 100) + '...');

    return new Response(JSON.stringify({ thesis, provider, mode }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing thesis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
