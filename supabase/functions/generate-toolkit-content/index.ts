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
  guide: `Create an IN-DEPTH, COMPREHENSIVE guide with EXACTLY 12 detailed chapters. This guide MUST be approximately 3,000-4,200 words TOTAL (250-350 words per chapter MINIMUM).

=== MANDATORY 8-PART CHAPTER STRUCTURE (EVERY CHAPTER MUST INCLUDE ALL 8 PARTS) ===

1. OPENING HOOK (2-3 sentences): 
   Start with ONE of these: compelling question, surprising statistic with specific number, or relatable pain point scenario.
   Example: "Did you know that 73% of digital product launches fail in the first 30 days? But here's the thing—most of those failures were completely preventable."

2. CORE CONCEPT (4-6 sentences):
   Main teaching with specific context. Explain the "what" and "why this matters."
   Include at least one specific data point, percentage, or timeframe.
   Example: "Your traffic source determines 80% of your conversion potential. The wrong traffic is like pouring water into a bucket with holes."

3. ACTION STEPS (3-5 numbered items):
   Specific, do-it-TODAY instructions. Each step must include:
   - A clear action verb (Research, Create, Analyze, Set up, Write, Test)
   - A specific tool, method, or resource name where applicable
   - A timeframe or quantity ("spend 15 minutes", "create 3 versions", "research 5 competitors")
   Example: "1. Open SEMrush and enter your top 3 competitor URLs. Note their top 5 traffic sources."

4. REAL-WORLD CASE STUDY (3-4 sentences):
   Named example with SPECIFIC metrics and results.
   Format: "[Name], a [role/situation], was struggling with [problem]. After implementing [specific action], they saw [specific measurable result] within [timeframe]."
   Example: "Jenny, a newbie affiliate marketer, was getting only 12 visitors per day. After applying the Pinterest strategy from Step 3, she saw her traffic jump to 89 visitors daily within just 3 weeks—a 640% increase."

5. PRO TIP BOX (2-3 sentences):
   Insider shortcut, hack, or secret most people miss. 
   Must include a specific tool, technique, or unconventional approach.
   Format: "Pro Tip: [Insider secret]. This works because [reason]. Try [specific action]."
   Example: "Pro Tip: Use Pinterest's 'Trending' section instead of the main search bar. It shows you what's gaining momentum RIGHT NOW, not what was popular last month."

6. COMMON MISTAKE WARNING (2-3 sentences):
   What to avoid, WHY it's a mistake, and how to fix/prevent it.
   Format: "Common Mistake: [What people do wrong]. This backfires because [consequence]. Instead, [correct approach]."
   Example: "Common Mistake: Posting the same content across all platforms. This tanks your engagement because each platform has different algorithms and user expectations. Instead, adapt your core message to fit each platform's native format."

7. KEY TAKEAWAY (1 punchy sentence):
   The single most important lesson from this chapter.
   Make it memorable and quotable.
   Example: "Key Takeaway: The best traffic source isn't the one with the most people—it's the one with the most buyers."

8. TRANSITION (1 sentence):
   Bridge to the next chapter that creates curiosity.
   Example: "Now that you know WHERE to find buyers, let's talk about HOW to make them stop scrolling and click..."

=== CHAPTER PROGRESSION BLUEPRINT ===

Chapter 1: The Big Why + Quick Win (Hook them, show what's possible, give one thing they can do in 10 minutes)
Chapter 2: Mindset & Foundation (Mental shifts needed, common limiting beliefs to overcome)
Chapters 3-4: Core Concepts & Frameworks (The main methodology, key principles)
Chapters 5-7: Implementation Deep-Dive (Step-by-step execution of main strategies)
Chapter 8-9: Advanced Tactics (Next-level techniques, optimization, testing)
Chapter 10-11: Troubleshooting & Common Problems (What to do when things don't work)
Chapter 12: Scaling & Next Steps (How to 10x results, what to do after mastering basics)

=== CONTENT DEPTH REQUIREMENTS ===

- Use SPECIFIC numbers: percentages (73%), dollar amounts ($500), timeframes (within 3 weeks), quantities (5 competitors)
- Reference REAL tools by name: SEMrush, BuzzSumo, Canva, Mailchimp, Google Trends, Trello, AnswerThePublic, Hotjar
- Include "If/Then" branching: "If you're a beginner, start with X. If you're more advanced, jump to Y."
- Add troubleshooting: "If this doesn't work, check that..." or "Common blockers include..."
- Include psychological insights and motivation boosters
- Provide templates, scripts, or fill-in-the-blank frameworks

=== TONE REQUIREMENTS ===

- Conversational and encouraging ("You've got this", "Here's where it gets exciting", "Don't worry—this is easier than it sounds")
- Results-oriented ("By the end of this chapter, you'll have...", "This alone can boost your results by...")
- Actionable ("Right now, open your...", "Your homework: spend 15 minutes on...", "Before you move on, make sure you've...")
- Expert but approachable—like advice from a successful mentor who's been in their shoes

Return as: { "title": "Guide Title", "sections": [{ "heading": "Chapter 1: [Descriptive Title]", "content": "[250-350 word detailed content with ALL 8 PARTS...]" }, ...] }

CRITICAL: Generate EXACTLY 12 substantial chapters. Each chapter MUST include all 8 parts (Hook, Core Concept, Action Steps, Case Study, Pro Tip, Common Mistake, Key Takeaway, Transition). NO SHORTCUTS. Every sentence should teach, inspire, or prompt action.`,
  
  worksheet: `Create 6 INTERACTIVE EXERCISES that directly apply concepts from a comprehensive guide on this topic.

=== EXERCISE STRUCTURE (MANDATORY FOR EACH) ===

1. TITLE: Clear, action-oriented (e.g., "Identify Your Ideal Customer", "Craft Your Unique Selling Proposition", "Map Your Traffic Sources")

2. CONTEXT (2-3 sentences): WHY this exercise matters and what they'll gain from completing it.
   Example: "Your customer avatar is the foundation of everything else. Without crystal clarity on WHO you're serving, your marketing will always feel like shouting into the void."

3. INSTRUCTIONS (3-4 sentences): Clear, specific steps to complete the exercise. Include tips for better results.
   Example: "Think about your single best customer—the one you'd clone if you could. Answer each question as if you're describing that specific person, not a vague demographic. Be specific: 'Sarah, 34, overwhelmed working mom' beats 'women 25-45.'"

4. PROMPTS/FIELDS (5-6 per exercise): Fill-in-the-blank questions that force SPECIFIC, actionable outputs.
   Each prompt should be specific enough that completing it creates immediate value.

=== REQUIRED EXERCISE TYPES ===

Exercise 1: CUSTOMER AVATAR BUILDER
- Demographics (age, location, income, job title)
- Pain points (top 3 frustrations in their own words)
- Desires (what does success look like to them?)
- Where they hang out online (specific platforms, groups, forums)
- What they've already tried that didn't work

Exercise 2: UNIQUE POSITIONING CREATOR
- What makes you different from competitors?
- Your "Only I" factor (what can you offer that others can't?)
- One-sentence positioning statement: "I help [specific person] achieve [specific result] through [your unique method]"
- Your signature framework or methodology name
- The transformation you provide (before → after)

Exercise 3: TRAFFIC SOURCE DISCOVERY
- List 5 places your ideal customers already spend time online
- For each: What type of content performs best there?
- Which 2 sources are you going to focus on first? Why?
- What content can you repurpose across sources?
- What's your 30-day traffic action plan?

Exercise 4: CONTENT PLANNING TEMPLATE
- Your 3 main content pillars/topics
- 10 specific content ideas per pillar
- Your posting schedule (what, where, when)
- Content repurposing strategy
- Lead magnet idea that aligns with your content

Exercise 5: OFFER OPTIMIZATION WORKSHEET
- Main product/offer description (2-3 sentences)
- Top 3 benefits (results-focused, not features)
- Why should they buy NOW? (urgency/scarcity elements)
- What objections might they have? How will you address each?
- Your call-to-action (exact words)

Exercise 6: 30-DAY ACTION PLAN & MILESTONES
- Week 1 goals and daily actions
- Week 2 goals and daily actions
- Week 3 goals and daily actions
- Week 4 goals and daily actions
- How will you know if it's working? (specific metrics to track)

Return as: { "title": "Worksheet Title", "exercises": [{ "title": "...", "instructions": "...", "fields": ["prompt1", "prompt2", "prompt3", "prompt4", "prompt5"] }, ...] }

CRITICAL: Create EXACTLY 6 exercises. Each exercise should directly support the guide content and produce something the reader can immediately use.`,
  
  checklist: `Create a COMPREHENSIVE ACTION CHECKLIST with 25-30 items organized into 4 PHASES.

=== PHASE STRUCTURE ===

PHASE 1: FOUNDATION & SETUP (6-8 items)
Focus: Research, preparation, getting your foundation right
Examples: "Define your ideal customer avatar", "Research 5 competitors", "Set up tracking"

PHASE 2: CONTENT & CREATION (6-8 items)
Focus: Building assets, creating content, developing offers
Examples: "Create your lead magnet", "Write your core sales message", "Design your landing page"

PHASE 3: LAUNCH & IMPLEMENTATION (6-8 items)
Focus: Going live, executing strategies, initial outreach
Examples: "Publish your first 5 pieces of content", "Set up email automation", "Launch your first ad"

PHASE 4: OPTIMIZATION & GROWTH (6-8 items)
Focus: Testing, improving, scaling what works
Examples: "Analyze your first 30 days of data", "A/B test your headline", "Scale winning traffic sources"

=== ITEM REQUIREMENTS ===

Each checklist item MUST:
1. Start with an ACTION VERB (Research, Create, Write, Set up, Analyze, Test, Launch, Optimize, Review, Build)
2. Be SPECIFIC enough to check off definitively (not vague like "improve marketing")
3. Include tool or method references where helpful
4. Be achievable in a single work session

Format each item as: "☐ [Action verb] [specific task] [optional: tool/method reference]"

Examples of GOOD items:
- "☐ Research 5 competitors using SEMrush and note their top traffic sources"
- "☐ Create your customer avatar using the worksheet from Chapter 2"
- "☐ Write 3 variations of your headline for A/B testing"
- "☐ Set up Google Analytics and verify tracking is working"

Examples of BAD items (too vague):
- "☐ Do some research" (not specific)
- "☐ Improve your marketing" (not actionable)
- "☐ Be better at social media" (not measurable)

Return as: { "title": "Checklist Title", "items": ["═══ PHASE 1: FOUNDATION & SETUP ═══", "☐ Task 1", "☐ Task 2", ..., "═══ PHASE 2: CONTENT & CREATION ═══", "☐ Task 3", ...] }

CRITICAL: Create 25-30 total items across 4 phases. Each item should be specific, actionable, and checkable.`,
  
  resourceList: `Create a CURATED RESOURCE LIST with 12-15 essential tools and resources.

=== RESOURCE STRUCTURE (FOR EACH) ===

1. NAME: Tool/resource name
2. DESCRIPTION (3-4 sentences): What it does, WHY it's valuable for this topic, and what makes it stand out. Be specific about features.
3. PRO TIP (1-2 sentences): Insider secret for getting the most out of this tool. Something most users don't know.
4. URL: Realistic placeholder URL (https://toolname.com)
5. CATEGORY TAG: Research, Content Creation, Analytics, Automation, Design, Community, or Learning

=== REQUIRED RESOURCE CATEGORIES ===

RESEARCH TOOLS (3-4 resources):
- Keyword/trend research (Google Trends, BuzzSumo, AnswerThePublic)
- Competitor analysis (SEMrush, SimilarWeb, SpyFu)
- Audience research (SparkToro, Reddit, Facebook Groups)

CONTENT CREATION (3-4 resources):
- Writing assistance (Grammarly, Hemingway, Copy.ai)
- Design tools (Canva, Figma, Lumen5)
- Video/audio (Descript, Loom, Kapwing)

AUTOMATION & PRODUCTIVITY (2-3 resources):
- Email marketing (ConvertKit, Mailchimp, ActiveCampaign)
- Scheduling (Buffer, Hootsuite, Later)
- Project management (Trello, Notion, Asana)

ANALYTICS & OPTIMIZATION (2-3 resources):
- Web analytics (Google Analytics, Hotjar, Mixpanel)
- A/B testing (Google Optimize, Optimizely)
- Conversion tracking

COMMUNITIES & LEARNING (2-3 resources):
- Relevant forums, communities, or groups
- Courses or educational platforms
- Industry blogs or podcasts

=== EXAMPLE FORMAT ===

{
  "name": "BuzzSumo",
  "description": "The ultimate content research tool that shows you what's already working in your niche. Enter any topic or competitor URL and see their most shared content, top-performing headlines, and trending topics. This saves you from guessing what content to create—you can see exactly what resonates with your audience before you write a single word.",
  "proTip": "Use the 'Content Analyzer' feature to find content gaps—topics your competitors haven't covered well that you can dominate.",
  "url": "https://buzzsumo.com",
  "category": "Research"
}

Return as: { "title": "Resource Title", "resources": [{ "name": "...", "description": "...", "proTip": "...", "url": "https://...", "category": "..." }, ...] }

CRITICAL: Include 12-15 high-quality resources across all categories. Each description should be detailed enough that readers understand exactly how the tool helps them.`,
  
  templates: `Create 5 READY-TO-USE TEMPLATES that users can copy, customize, and implement immediately.

=== TEMPLATE REQUIREMENTS ===

Each template MUST:
1. Be complete and ready to use (not just an outline)
2. Include [BRACKETED PLACEHOLDERS] for customization
3. Provide example text that shows the format
4. Be practical and results-oriented

=== REQUIRED TEMPLATE TYPES ===

Template 1: CUSTOMER AVATAR TEMPLATE
Complete fill-in profile including demographics, pain points, desires, objections, and buying triggers.

Template 2: SALES/PITCH MESSAGE TEMPLATE
Attention-grabbing hook, problem agitation, solution introduction, benefits, proof, call-to-action.

Template 3: EMAIL SEQUENCE TEMPLATE (3-5 emails)
Welcome email, value email, story email, offer email, urgency email.

Template 4: CONTENT PLANNING TEMPLATE
Weekly content calendar with topics, platforms, formats, and posting schedule.

Template 5: LAUNCH CHECKLIST TEMPLATE
Day-by-day launch plan with specific tasks, timelines, and milestones.

Return as: { "title": "Templates Title", "templates": [{ "name": "Template Name", "content": "Full template text with [PLACEHOLDERS]..." }] }

CRITICAL: Each template should be substantial enough (200+ words) to be genuinely useful. Include examples within the templates.`,
  
  quiz: `Create a KNOWLEDGE-CHECK QUIZ with 10 multiple choice questions to reinforce key concepts.

=== QUIZ REQUIREMENTS ===

- Questions should test understanding, not just recall
- Cover material from throughout the guide (beginning, middle, end)
- Include a mix of difficulty levels (easy, medium, challenging)
- Make wrong answers plausible (not obviously incorrect)
- Each question should teach something even if they get it wrong

=== QUESTION FORMAT ===

Each question needs:
1. A clear, specific question
2. 4 answer options (A, B, C, D)
3. The correct answer index (0-3)
4. Make sure wrong answers are educational "traps" that reveal common misconceptions

Return as: { "title": "Quiz Title", "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 }, ...] }

CRITICAL: Create EXACTLY 10 questions that genuinely test understanding of the material.`,
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
      writingStyle = "conversational",
      // New: Section-level generation parameters
      sectionId,
      sectionNumber,
      sectionTitle,
      thesis,
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

    const provider = byokConfig ? byokConfig.provider : 'deepseek';

    // === SECTION-LEVEL GENERATION MODE ===
    if (sectionId && sectionNumber && sectionTitle) {
      console.log(`Generating section ${sectionNumber}: "${sectionTitle}" for toolkit "${title}"`);
      
      const sectionPrompt = `Generate Section ${sectionNumber}: "${sectionTitle}" for a guide about "${niche}".

=== CONTEXT ===
- Toolkit Title: "${title}"
- Target Audience: ${targetAudience || "entrepreneurs and professionals"}
- Core Thesis: ${thesis || `This guide helps readers master ${niche} through practical, actionable steps.`}

=== SECTION REQUIREMENTS ===
Generate 350-450 words for this section ONLY. Include:

1. OPENING HOOK (2-3 sentences): Start with a compelling question, surprising statistic, or relatable pain point.

2. CORE TEACHING (4-6 sentences): Main concept with specific context. Explain "what" and "why this matters."

3. ACTION STEPS (3-5 numbered items): Specific, do-it-TODAY instructions with clear action verbs.

4. REAL-WORLD EXAMPLE (3-4 sentences): Named example with specific metrics and results.

5. PRO TIP (2-3 sentences): Insider shortcut or hack most people miss.

6. COMMON MISTAKE WARNING (2-3 sentences): What to avoid and how to fix it.

7. KEY TAKEAWAY (1 sentence): The single most important lesson, memorable and quotable.

8. TRANSITION (1 sentence): Bridge to the next section that creates curiosity.

${styleDirective}

=== OUTPUT FORMAT ===
Return ONLY the section content as plain text (NOT JSON). Write the section directly, ready to be placed in the guide.`;

      const messages = [
        { role: "system", content: `You are an expert content creator writing a section of a comprehensive guide. ${styleDirective}` },
        { role: "user", content: sectionPrompt }
      ];

      let contentText = "";

      if (byokConfig) {
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
              max_tokens: 2000,
              system: `You are an expert content creator. ${styleDirective}`,
              messages: [{ role: 'user', content: sectionPrompt }],
            }),
          });

          if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
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
              max_tokens: 2000,
            }),
          });

          if (!response.ok) {
            throw new Error(`${byokConfig.provider} API error: ${response.status}`);
          }

          const data = await response.json();
          contentText = data.choices?.[0]?.message?.content || "";
        }
      } else {
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
            max_tokens: 2000,
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
          throw new Error(`DeepSeek API error: ${status}`);
        }

        const data = await response.json();
        contentText = data.choices?.[0]?.message?.content || "";
      }

      // Sanitize the output
      const sanitizedContent = contentText
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/[\u2013\u2014\u2015]/g, "-")
        .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/Ø=/g, "")
        .replace(/[ÜÚÝþ]/g, "")
        .trim();

      const wordCount = sanitizedContent.split(/\s+/).filter(Boolean).length;
      console.log(`Generated section ${sectionNumber} with ${wordCount} words`);

      return new Response(
        JSON.stringify({ 
          sectionId,
          content: sanitizedContent,
          wordCount,
          generatedAt: new Date().toISOString() 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === ORIGINAL COMPONENT GENERATION MODE ===
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
              max_tokens: component === 'guide' ? 10000 : (component === 'worksheet' ? 6000 : 4000),
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
              max_tokens: component === 'guide' ? 10000 : (component === 'worksheet' ? 6000 : 4000),
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
            max_tokens: component === 'guide' ? 10000 : (component === 'worksheet' ? 6000 : 4000),
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
        // Clean and sanitize AI output before parsing
        let cleanedText = contentText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        // Sanitize common encoding issues from AI
        cleanedText = cleanedText
          .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
          .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
          .replace(/[\u2013\u2014\u2015]/g, "-")
          .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
          .replace(/â€™/g, "'")
          .replace(/â€œ/g, '"')
          .replace(/â€/g, '"')
          .replace(/â€"/g, "-")
          .replace(/â€¢/g, "•")
          .replace(/Ø=/g, "")
          .replace(/[ÜÚÝþ]/g, "");
        
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
