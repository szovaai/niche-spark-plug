import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getUserApiKey, getProviderConfig, type BYOKConfig } from "../_shared/byok.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

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

// ============================================
// UNIVERSAL TOOLKIT SECTION PROMPTS (8 Sections)
// ============================================

interface SectionStructureElement {
  name: string;
  sentenceCount: string;
  description: string;
  example?: string;
}

interface SectionPromptConfig {
  purpose: string;
  structure: SectionStructureElement[];
  actionExercise: string;
  reflectionPrompt: string;
  wordTarget: { min: number; max: number };
}

const SECTION_PROMPTS: Record<string, SectionPromptConfig> = {
  problem: {
    purpose: "Make the reader say 'This is exactly my problem'",
    structure: [
      {
        name: "EMPATHY HOOK",
        sentenceCount: "2-3 sentences",
        description: "Acknowledge their frustration in their words. Show you understand their daily struggle.",
        example: "Most people fail to get results because they treat this like a quick fix instead of a system. They try everything, get nowhere, and wonder what they're doing wrong."
      },
      {
        name: "SURFACE PAIN",
        sentenceCount: "3-4 sentences",
        description: "Describe what failure looks and feels like vividly. Paint the picture of their daily struggle with specific, relatable scenarios.",
        example: "The daily frustration is real: You spend hours on the wrong activities, wait anxiously for results, and see... nothing. Meanwhile, others seem to effortlessly achieve what you're working so hard for."
      },
      {
        name: "HIDDEN CAUSE REVEAL",
        sentenceCount: "2-3 sentences",
        description: "Expose WHY their current approach fails. This is the insight that shifts their perspective.",
        example: "Here's what most people miss: The problem isn't effort—it's approach. You're using tactics from 5 years ago in today's environment."
      },
      {
        name: "PROMISE OF CLARITY",
        sentenceCount: "1-2 sentences",
        description: "Hint that a better, simpler system exists. Create hope without being salesy.",
        example: "This guide will show you exactly why your current strategy is failing and what needs to change."
      }
    ],
    actionExercise: "Write 3 sentences that describe your audience's daily struggle with [this topic]. Use their exact words if possible.",
    reflectionPrompt: "Complete this sentence: 'The truth is, it's not about [what they think the problem is]. It's about [the real problem].'",
    wordTarget: { min: 400, max: 470 }
  },

  solution: {
    purpose: "Introduce your core method or system (your signature process)",
    structure: [
      {
        name: "SYSTEM NAME INTRODUCTION",
        sentenceCount: "1-2 sentences",
        description: "Introduce a memorable 2-4 word system name. Make it sticky and unique.",
        example: "The Buyer-Intent System is built on a single principle: focus on intent, not attention."
      },
      {
        name: "PHILOSOPHY",
        sentenceCount: "2-3 sentences",
        description: "Explain WHY your system works differently. The core insight that makes it effective.",
        example: "Most approaches focus on volume—more posts, more content, more visibility. This system focuses on quality signals. Instead of trying to be seen by everyone, you learn to recognize and engage with people who are already looking to buy."
      },
      {
        name: "PILLARS/STEPS",
        sentenceCount: "3-5 numbered items with 1-2 sentence explanations each",
        description: "Outline the 3-5 key principles or stages of your system.",
        example: "Pillar 1: Signal Detection - Learn to spot buying intent in conversations. Pillar 2: Conversation-First Engagement - Build trust before pitching. Pillar 3: Natural Traffic Routing - Guide buyers to your offer seamlessly."
      },
      {
        name: "TRANSFORMATION STATEMENT",
        sentenceCount: "2-3 sentences",
        description: "Paint the before → after picture. What changes when they follow the system?",
        example: "Follow these steps, and you'll go from chasing random traffic to cultivating real buyers. You'll spend less time posting and more time closing."
      }
    ],
    actionExercise: "Fill in: 'My [System Name] helps [audience] go from [painful state] to [desired result] by focusing on [key principle].'",
    reflectionPrompt: "What makes your approach fundamentally different from what they've already tried?",
    wordTarget: { min: 400, max: 470 }
  },

  foundation: {
    purpose: "Prepare the reader's mindset, tools, and environment for success",
    structure: [
      {
        name: "SUCCESS DEFINITION",
        sentenceCount: "2-3 sentences",
        description: "Clarify what success looks like for this system. Set clear, realistic expectations.",
        example: "Before you start, let's define what 'success' means here. You're not trying to go viral or get thousands of followers. You're learning to have 3-5 quality conversations per week with people who are ready to buy."
      },
      {
        name: "MINDSET SHIFTS",
        sentenceCount: "3-4 sentences listing 2-3 specific shifts",
        description: "Address the mental barriers. What beliefs need to change?",
        example: "Shift #1: From 'I need more traffic' to 'I need better conversations.' Shift #2: From 'Posting = Results' to 'Connection = Results.' These shifts will feel uncomfortable at first, but they're essential."
      },
      {
        name: "ESSENTIAL SETUP",
        sentenceCount: "3-4 items with brief explanations",
        description: "List the physical or digital tools and preparations needed.",
        example: "You'll need: (1) A clear offer that solves one specific problem, (2) A short bio that signals credibility, (3) A simple tracking system (spreadsheet or Notion), (4) 30 minutes per day dedicated to this process."
      },
      {
        name: "READINESS CHECKLIST",
        sentenceCount: "4-6 checkbox items",
        description: "A quick self-check before moving forward.",
        example: "☐ I know the exact problem my offer solves. ☐ My profile reflects my expertise. ☐ I've identified 5-10 quality groups/communities. ☐ I have a commitment to 30 days of consistent action."
      }
    ],
    actionExercise: "Write your commitment statement: 'I will use this system to achieve [specific result] by [date]. I commit to [daily action] for [timeframe].'",
    reflectionPrompt: "What's one mindset shift you need to make that feels uncomfortable but necessary?",
    wordTarget: { min: 450, max: 520 }
  },

  discovery: {
    purpose: "Teach how to identify opportunities, audiences, or data relevant to the goal",
    structure: [
      {
        name: "WHY RESEARCH FIRST",
        sentenceCount: "2-3 sentences",
        description: "Explain why research is the 'shortcut' that saves time and effort.",
        example: "Most people skip this step and pay for it later. 30 minutes of smart research can save you 30 hours of wasted effort. This is where you find the gold."
      },
      {
        name: "DISCOVERY PROCESS",
        sentenceCount: "4-6 numbered steps with specific instructions",
        description: "Step-by-step method to find opportunities.",
        example: "Step 1: Enter 3 relevant groups/communities and observe for 48 hours. Step 2: Note which posts get thoughtful responses. Step 3: Identify recurring questions and pain points. Step 4: Document the exact language people use."
      },
      {
        name: "WHAT TO LOOK FOR",
        sentenceCount: "3-4 specific indicators/patterns",
        description: "Concrete signals that indicate opportunity.",
        example: "Look for: 'Has anyone tried...' (research mode), 'I'm struggling with...' (pain point), 'What tool do you use for...' (ready to buy), 'I wish there was...' (unmet need)."
      },
      {
        name: "DISCOVERY TEMPLATE",
        sentenceCount: "A simple template/table structure",
        description: "Give them a structure to capture their research.",
        example: "Create a simple table: Source | Signal/Quote | Category (Ready to Buy / Researching / Curious) | Notes"
      }
    ],
    actionExercise: "Find and record 5 'signal-rich' sources in your niche. For each, note what types of opportunities you see.",
    reflectionPrompt: "What did you learn about what your audience truly wants that surprised you?",
    wordTarget: { min: 450, max: 520 }
  },

  "execution-1": {
    purpose: "Guide the reader through their first set of real-world actions",
    structure: [
      {
        name: "READINESS RECAP",
        sentenceCount: "2-3 sentences",
        description: "Confirm what they've prepared and transition to action mode.",
        example: "You've done the research. You understand the signals. Now it's time to take action. This section gives you your first week of specific steps."
      },
      {
        name: "FIRST ACTIONS",
        sentenceCount: "3-5 numbered steps with specific details",
        description: "Clear, specific first steps they can do TODAY.",
        example: "Day 1: Choose one community to focus on. Day 2-3: Comment meaningfully on 5 signal posts. Day 4-5: Start one private conversation. Day 6-7: Track and review your results."
      },
      {
        name: "SCRIPTS/TEMPLATES",
        sentenceCount: "2-3 example scripts or templates",
        description: "Ready-to-use language they can copy and adapt.",
        example: "Opening Script: 'Hey [Name], saw your post about [problem]. Here's what worked for me when I faced the same issue...' Follow-up: 'Would it help if I shared a quick resource on this?'"
      },
      {
        name: "FIRST WEEK SCHEDULE",
        sentenceCount: "A daily or weekly breakdown",
        description: "Specific time allocations and activities.",
        example: "Daily: 20-30 minutes. Mon/Wed: Research. Tue/Thu: Engage. Fri: Follow-ups. Weekend: Review."
      },
      {
        name: "WIN TRACKING",
        sentenceCount: "2-3 sentences with metrics",
        description: "How to measure first-week success.",
        example: "Track: Comments made, Conversations started, Responses received. Week 1 Goal: 15 comments, 3 conversations."
      }
    ],
    actionExercise: "Write 3 actions you can complete within the next 7 days that move you closer to your goal. Be specific.",
    reflectionPrompt: "What type of responses led to real conversations? What approach felt most natural?",
    wordTarget: { min: 450, max: 520 }
  },

  "execution-2": {
    purpose: "Deepen implementation and begin optimizing what works",
    structure: [
      {
        name: "PROGRESS CHECK",
        sentenceCount: "2-3 sentences",
        description: "Acknowledge their progress and transition to next level.",
        example: "You've completed your first week. You've had conversations. Now it's time to optimize and scale what's working."
      },
      {
        name: "ADVANCED TACTICS",
        sentenceCount: "3-4 specific advanced techniques",
        description: "Next-level actions that build on the basics.",
        example: "Advanced Move #1: Create a 'value-first' resource you can share. #2: Develop a follow-up sequence. #3: Cross-reference signals across multiple communities."
      },
      {
        name: "DATA INTERPRETATION",
        sentenceCount: "3-4 sentences on what metrics mean",
        description: "Teach them to read their results and adjust.",
        example: "If you're getting comments but no DMs, your value isn't clear. If DMs but no conversions, your offer isn't connecting. If nothing, wrong community or language."
      },
      {
        name: "SUCCESS INDICATORS",
        sentenceCount: "3-4 specific metrics/milestones",
        description: "How to know they're on track.",
        example: "Week 2 Targets: 5 meaningful conversations, 2 people asking about your offer, 1 resource shared at least 3 times."
      },
      {
        name: "OPTIMIZATION TIP",
        sentenceCount: "2-3 sentences",
        description: "A key insight for continuous improvement.",
        example: "Pro Tip: Keep a 'swipe file' of your best comments and conversations. When something works, document exactly what you said."
      }
    ],
    actionExercise: "Define your top 3 metrics for success and how you'll measure them weekly. What's your target for each?",
    reflectionPrompt: "What's working that you should double down on? What's not working that you should stop?",
    wordTarget: { min: 450, max: 520 }
  },

  optimization: {
    purpose: "Refine and improve results through systematic testing",
    structure: [
      {
        name: "WHY TESTING MATTERS",
        sentenceCount: "2-3 sentences",
        description: "Explain the power of systematic improvement.",
        example: "The difference between good and great is testing. Small tweaks compound into massive differences over time. This section teaches you to become a scientist of your own success."
      },
      {
        name: "VARIABLES TO TEST",
        sentenceCount: "4-5 specific things to experiment with",
        description: "List what they can change and measure.",
        example: "Test: (1) Time of day, (2) Language style (formal vs casual), (3) Length of comments, (4) Speed of follow-up, (5) Type of value offered."
      },
      {
        name: "TESTING FRAMEWORK",
        sentenceCount: "A simple A/B or experiment structure",
        description: "Give them a methodology for testing.",
        example: "Simple Test Method: Change ONE variable. Run for 7 days. Measure difference. Keep what works. Repeat."
      },
      {
        name: "TRACKING TABLE",
        sentenceCount: "A template for recording experiments",
        description: "Structure for capturing and comparing results.",
        example: "Testing Log: Variable | What I Tried | Result | Keep or Drop | Lesson"
      },
      {
        name: "ITERATION MINDSET",
        sentenceCount: "2-3 sentences",
        description: "Encourage continuous improvement thinking.",
        example: "There's no 'perfect' approach—only 'better than yesterday.' Each test teaches you something. Failed experiments are data, not defeats."
      }
    ],
    actionExercise: "Run one micro-test this week. Note what you changed, what improved, and what stayed the same.",
    reflectionPrompt: "What assumption have you been making that you should test? What would happen if the opposite were true?",
    wordTarget: { min: 450, max: 520 }
  },

  scaling: {
    purpose: "Help users grow results long-term without burnout",
    structure: [
      {
        name: "WHAT SCALING MEANS",
        sentenceCount: "2-3 sentences",
        description: "Define scaling in context—it's not just 'do more.'",
        example: "Scaling isn't about working harder—it's about working smarter. More of what works, less of what doesn't. Systems, not hustle."
      },
      {
        name: "SCALING STRATEGIES",
        sentenceCount: "3-4 specific approaches",
        description: "Methods to multiply results without multiplying effort.",
        example: "#1: Expand to 3-5 similar communities. #2: Create templated responses. #3: Batch engagement into 30-minute blocks. #4: Build referral loops."
      },
      {
        name: "AUTOMATION & DELEGATION",
        sentenceCount: "2-3 sentences on what can be systematized",
        description: "Identify tasks that can be automated or handed off.",
        example: "Automate: Tracking, reminders, scheduling. Keep personal: Conversations, relationship building, closing."
      },
      {
        name: "SUSTAINABILITY CHECKLIST",
        sentenceCount: "4-5 checkbox items",
        description: "Habits and practices for long-term success.",
        example: "☐ Weekly 15-min review. ☐ Monthly strategy adjustment. ☐ Quarterly goal reset. ☐ Daily time boundaries. ☐ Regular documentation."
      },
      {
        name: "VISION & MASTERY",
        sentenceCount: "2-3 sentences",
        description: "End with inspiration and the long-term picture.",
        example: "In 90 days, this system will feel effortless. In 6 months, you'll teach it to others. Master it so well that it becomes second nature."
      }
    ],
    actionExercise: "Write your 'Success Maintenance Plan'—how you'll keep results growing 90 days from now.",
    reflectionPrompt: "What does success look like in 1 year? What systems will you have in place?",
    wordTarget: { min: 430, max: 500 }
  }
};

// Build the section-specific prompt
function buildSectionPrompt(
  sectionId: string,
  sectionNumber: number,
  sectionTitle: string,
  title: string,
  niche: string,
  targetAudience: string,
  thesis: string,
  styleDirective: string
): string {
  const config = SECTION_PROMPTS[sectionId];
  
  if (!config) {
    // Fallback for unknown sections
    return `Generate Section ${sectionNumber}: "${sectionTitle}" for a guide about "${niche}".
    
=== CONTEXT ===
- Toolkit Title: "${title}"
- Target Audience: ${targetAudience || "entrepreneurs and professionals"}
- Core Thesis: ${thesis || `This guide helps readers master ${niche} through practical steps.`}

Generate 400-470 words with actionable content.
${styleDirective}`;
  }

  const structureInstructions = config.structure.map((elem, i) => 
    `${i + 1}. ${elem.name} (${elem.sentenceCount}):
   ${elem.description}
   ${elem.example ? `Example: "${elem.example}"` : ''}`
  ).join('\n\n');

  return `Generate Section ${sectionNumber}: "${sectionTitle}" for a guide titled "${title}".

=== SECTION PURPOSE ===
${config.purpose}

=== CONTEXT ===
- Toolkit Title: "${title}"
- Niche: ${niche}
- Target Audience: ${targetAudience || "entrepreneurs and professionals seeking practical solutions"}
- Core Thesis: ${thesis || `This guide helps readers master ${niche} through a proven, step-by-step system.`}

=== MANDATORY STRUCTURE ===
You MUST include ALL of these elements in this exact order:

${structureInstructions}

=== ENDING REQUIREMENTS ===
End the section with BOTH of these:

📝 ACTION EXERCISE:
"${config.actionExercise}"

🧠 REFLECTION:
"${config.reflectionPrompt}"

=== WRITING REQUIREMENTS ===
${styleDirective}

- Word Target: ${config.wordTarget.min}-${config.wordTarget.max} words
- Use specific examples, numbers, and concrete details relevant to ${niche}
- Make every sentence teach, inspire, or prompt action
- Write in second person (you, your) 
- Sound like a knowledgeable mentor who has been in their shoes
- Include formatting: use headers, bullet points, and numbered lists where appropriate

=== OUTPUT FORMAT ===
Return ONLY the section content as plain text (NOT JSON). Write the section directly, ready to be placed in the guide.`;
}

// Component prompts (worksheet, checklist, etc.)
const componentPrompts: Record<string, string> = {
  guide: `Create an IN-DEPTH, COMPREHENSIVE guide with EXACTLY 12 detailed chapters. This guide MUST be approximately 3,000-4,200 words TOTAL (250-350 words per chapter MINIMUM).

=== MANDATORY 8-PART CHAPTER STRUCTURE (EVERY CHAPTER MUST INCLUDE ALL 8 PARTS) ===

1. OPENING HOOK (2-3 sentences): 
   Start with ONE of these: compelling question, surprising statistic with specific number, or relatable pain point scenario.

2. CORE CONCEPT (4-6 sentences):
   Main teaching with specific context. Explain the "what" and "why this matters."

3. ACTION STEPS (3-5 numbered items):
   Specific, do-it-TODAY instructions with clear action verbs and timeframes.

4. REAL-WORLD CASE STUDY (3-4 sentences):
   Named example with SPECIFIC metrics and results.

5. PRO TIP BOX (2-3 sentences):
   Insider shortcut or hack most people miss.

6. COMMON MISTAKE WARNING (2-3 sentences):
   What to avoid, WHY it's a mistake, and how to fix it.

7. KEY TAKEAWAY (1 punchy sentence):
   The single most important lesson, memorable and quotable.

8. TRANSITION (1 sentence):
   Bridge to the next chapter that creates curiosity.

Return as: { "title": "Guide Title", "sections": [{ "heading": "Chapter 1: [Title]", "content": "[content...]" }, ...] }`,
  
  worksheet: `Create 6 INTERACTIVE EXERCISES that directly apply concepts from the guide.

=== REQUIRED EXERCISE TYPES ===

Exercise 1: PROBLEM DEFINITION WORKSHEET
- Define the core problem you're solving
- Identify your audience's pain points in their words
- Map the hidden causes behind surface-level symptoms

Exercise 2: SOLUTION FRAMEWORK BUILDER  
- Name your signature system/method
- Outline your 3-5 key pillars or steps
- Write your transformation statement (before → after)

Exercise 3: DISCOVERY & RESEARCH TRACKER
- List 5 places your audience gathers
- Document signals/patterns you observe
- Categorize opportunities (Ready to Buy / Researching / Curious)

Exercise 4: EXECUTION ACTION PLAN
- Week 1 daily action items
- Scripts/templates for key interactions
- Metrics to track each day

Exercise 5: OPTIMIZATION LOG
- Variables to test this week
- Results tracking table
- Lessons learned documentation

Exercise 6: SCALING & 90-DAY VISION
- What to automate vs. keep personal
- Weekly/monthly review schedule
- Long-term success definition

Each exercise needs: Title, 2-3 sentence context, clear instructions, 5-6 specific fill-in prompts.

Return as: { "title": "Worksheet Title", "exercises": [{ "title": "...", "instructions": "...", "fields": ["prompt1", "prompt2", ...] }, ...] }`,
  
  checklist: `Create a COMPREHENSIVE ACTION CHECKLIST with 25-30 items organized into 4 PHASES matching the guide structure.

=== PHASE STRUCTURE ===

PHASE 1: FOUNDATION & SETUP (6-8 items)
Focus: Mindset shifts, tool setup, initial preparation
Match: Sections 1-3 of the guide (Problem, Solution, Foundation)

PHASE 2: DISCOVERY & RESEARCH (6-8 items)  
Focus: Finding opportunities, documenting signals, audience research
Match: Section 4 of the guide (Discovery & Research)

PHASE 3: EXECUTION & IMPLEMENTATION (6-8 items)
Focus: Taking action, using scripts, tracking first results
Match: Sections 5-6 of the guide (Execution Parts 1 & 2)

PHASE 4: OPTIMIZATION & SCALING (6-8 items)
Focus: Testing, improving, systematizing, long-term growth
Match: Sections 7-8 of the guide (Optimization & Scaling)

Each item: Start with ACTION VERB, be specific enough to check off definitively.

Return as: { "title": "Checklist Title", "items": ["═══ PHASE 1: FOUNDATION & SETUP ═══", "☐ Task 1", ...] }`,
  
  resourceList: `Create a CURATED RESOURCE LIST with 12-15 essential tools organized into 5 categories.

=== REQUIRED CATEGORIES ===

RESEARCH TOOLS (3-4 resources):
Tools for finding opportunities, analyzing audiences, tracking trends

CONTENT CREATION (3-4 resources):
Writing, design, video, and production tools

AUTOMATION & PRODUCTIVITY (2-3 resources):
Scheduling, project management, workflow automation

ANALYTICS & OPTIMIZATION (2-3 resources):
Tracking, testing, and performance measurement

COMMUNITIES & LEARNING (2-3 resources):
Forums, courses, industry resources for continued growth

Each resource needs: Name, 3-4 sentence description of WHY it's valuable, Pro Tip for getting more out of it, URL, Category tag.

Return as: { "title": "Resource Title", "resources": [{ "name": "...", "description": "...", "url": "https://..." }, ...] }`,
  
  templates: `Create 5 READY-TO-USE TEMPLATES that users can copy and customize immediately.

=== REQUIRED TEMPLATE TYPES ===

Template 1: AUDIENCE AVATAR TEMPLATE
Complete profile: demographics, pain points, desires, objections, where they hang out, what they've tried

Template 2: OUTREACH/ENGAGEMENT MESSAGE TEMPLATE
Attention hook, problem acknowledgment, value offer, soft call-to-action. Include 3 variations.

Template 3: EMAIL SEQUENCE TEMPLATE (5 emails)
- Email 1: Welcome & quick win
- Email 2: Story & connection
- Email 3: Value & teaching
- Email 4: Offer introduction
- Email 5: Urgency & final call

Template 4: WEEKLY CONTENT/ACTION PLANNER
Day-by-day breakdown with specific tasks, time allocations, and focus areas

Template 5: RESULTS TRACKING TEMPLATE
Weekly metrics dashboard, progress log, adjustment notes, milestone tracker

Each template: 200+ words, include [BRACKETED PLACEHOLDERS], show example filled-in text.

Return as: { "title": "Templates Title", "templates": [{ "name": "Template Name", "content": "Full template text..." }] }`,
  
  quiz: `Create a KNOWLEDGE-CHECK QUIZ with 10 multiple choice questions covering all 8 sections of the guide.

Questions should:
- Test understanding, not just recall
- Cover material from all sections (Problem through Scaling)
- Include mix of difficulty levels
- Make wrong answers plausible learning traps
- Teach something even when answered wrong

Return as: { "title": "Quiz Title", "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 }, ...] }`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      return unauthorizedResponse(authError || 'Authentication required', corsHeaders);
    }
    console.log(`Authenticated user: ${user.id}`);

    const {
      title, 
      niche, 
      targetAudience, 
      components, 
      singleChapter, 
      writingStyle = "conversational",
      // Section-level generation parameters
      sectionId,
      sectionNumber,
      sectionTitle,
      thesis,
    } = await req.json();
    
    // Check for BYOK first
    const authHeader = req.headers.get('authorization');
    const byokConfig = await getUserApiKey(authHeader, 'deepseek');
    
    // Use Lovable AI Gateway as primary, fallback to DeepSeek
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    
    if (!byokConfig && !LOVABLE_API_KEY && !DEEPSEEK_API_KEY) {
      throw new Error("No API key configured. Please add your own key in Settings.");
    }

    // Get the appropriate style directive
    const styleDirective = STYLE_DIRECTIVES[writingStyle] || DEFAULT_HUMAN_DIRECTIVE;

    const provider = byokConfig ? byokConfig.provider : (LOVABLE_API_KEY ? 'lovable' : 'deepseek');

    // === SECTION-LEVEL GENERATION MODE ===
    if (sectionId && sectionNumber && sectionTitle) {
      console.log(`Generating section ${sectionNumber}: "${sectionTitle}" for toolkit "${title}" using ${provider}`);
      
      // Use the enhanced section-specific prompt
      const sectionPrompt = buildSectionPrompt(
        sectionId,
        sectionNumber,
        sectionTitle,
        title,
        niche,
        targetAudience || "entrepreneurs and professionals",
        thesis || `This guide helps readers master ${niche} through practical, actionable steps.`,
        styleDirective
      );

      const messages = [
        { 
          role: "system", 
          content: `You are an expert educational content creator. You write outcome-focused guides that deliver real results when followed step by step. Your content is specific, actionable, and includes concrete examples. ${styleDirective}` 
        },
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
              max_tokens: 2500,
              system: `You are an expert educational content creator. ${styleDirective}`,
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
              max_tokens: 2500,
            }),
          });

          if (!response.ok) {
            throw new Error(`${byokConfig.provider} API error: ${response.status}`);
          }

          const data = await response.json();
          contentText = data.choices?.[0]?.message?.content || "";
        }
      } else if (LOVABLE_API_KEY) {
        // Use Lovable AI Gateway (preferred)
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages,
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
              JSON.stringify({ error: "API credits exhausted. Please add credits to continue." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw new Error(`Lovable AI error: ${status}`);
        }

        const data = await response.json();
        contentText = data.choices?.[0]?.message?.content || "";
      } else {
        // Fallback to DeepSeek
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
            max_tokens: 2500,
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
      console.log(`Generated section ${sectionNumber} with ${wordCount} words using ${provider}`);

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
${thesis ? `- Core Thesis: ${thesis}` : ''}

Your task: ${componentPrompt}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON object.`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate the ${component} content now.` }
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
      } else if (LOVABLE_API_KEY) {
        // Use Lovable AI Gateway
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages,
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
              JSON.stringify({ error: "API credits exhausted. Please add credits to continue." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          console.error(`Lovable AI error for ${component}:`, status);
          continue;
        }

        const data = await response.json();
        contentText = data.choices?.[0]?.message?.content || "";
      } else {
        // Fallback to DeepSeek
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
        
        // Sanitize common encoding issues
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
