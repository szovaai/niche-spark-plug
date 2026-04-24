import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getUserApiKey, getProviderConfig, type BYOKConfig } from "../_shared/byok.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { pickModel, type QualityMode, type UserPreference } from "../_shared/aiRouter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Style-specific directives for all writing tones
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
  fun: `
WRITING STYLE - FUN & PLAYFUL:
- Keep it light! Use humor, wit, and playful language.
- Emojis are encouraged 🎉 but don't overdo it (max 2-3 per section).
- Include pop culture references when relevant.
- Use exclamation points and enthusiasm!
- Make learning feel like a game, not a chore.
- Add "Fun Fact:" and "Did You Know?" callouts.
- Keep paragraphs short and punchy.
- Sound like that cool friend who makes everything exciting.
- Use phrases like "Let's dive in!", "Here's the fun part:", "Plot twist!".
`,
  motivational: `
WRITING STYLE - MOTIVATIONAL:
- Open with powerful, inspiring statements.
- Use "You CAN" and "You WILL" language consistently.
- Include transformation stories and possibilities.
- Build momentum with each paragraph - energy should increase.
- Add "Believe this:" and "Here's your truth:" callouts.
- Reference their potential and future success.
- Close sections with empowering calls to action.
- Sound like a supportive coach cheering them on.
- Use phrases like "Imagine this...", "Picture yourself...", "You're closer than you think".
`,
  empowering: `
WRITING STYLE - EMPOWERING:
- Focus on building their confidence and capability.
- Use "You already have what it takes" messaging.
- Acknowledge their strengths before teaching new concepts.
- Include "Permission granted:" statements.
- Frame challenges as opportunities for growth.
- Celebrate small wins throughout the content.
- End with "You've got this" reinforcement.
- Sound like a mentor who believes in them completely.
- Use phrases like "Trust yourself", "You're ready", "Own this".
`,
  tactical: `
WRITING STYLE - TACTICAL:
- No fluff. Every sentence earns its place.
- Lead with action verbs: Do. Build. Create. Execute. Deploy.
- Use bullet points and numbered lists heavily.
- Include specific metrics, timelines, and benchmarks.
- Add "Mission:" and "Objective:" headers.
- Keep emotional language minimal.
- Focus on results, not feelings.
- Sound like a military commander giving precise orders.
- Use phrases like "Execute this:", "Your objective:", "Timeline: 48 hours".
`,
  coaching: `
WRITING STYLE - COACHING:
- Ask reflective questions throughout ("What would happen if...?").
- Use "What if..." and "Consider..." prompts.
- Include journaling exercises and pause points.
- Frame content as discovery, not instruction.
- Add "Reflection:" boxes between sections.
- Encourage self-assessment and introspection.
- Sound like a wise mentor guiding their journey.
- Use phrases like "Take a moment to consider...", "Journal prompt:", "What comes up for you when...".
- Validate their feelings before guiding action.
`,
};

// Story-driven directive for narrative flow
const STORY_DRIVEN_DIRECTIVE = `
=== STORY-DRIVEN EXPLANATORY STYLE ===
- Start each section with context: "Here's why this matters..."
- Explain the REASONING behind every action step
- Use phrases like:
  - "The reason this works is..."
  - "What most people get wrong is..."
  - "The insight that changes everything is..."
  - "Picture this scenario..."
  - "Here's the breakthrough moment..."
- Connect each section to the reader's transformation journey
- Include "behind the scenes" explanations
- Write like you're walking them through it in person
- Every instruction should answer "why am I doing this?"
`;

// Detailed action directive for follow-along content
const DETAILED_ACTION_DIRECTIVE = `
=== DETAILED FOLLOW-ALONG STYLE ===
- Break every action into micro-steps
- Use this format: "Step 1: Do [specific action]. Step 2: Now do [next action]. Step 3: You should now see [result]."
- Include checkpoints: "Before moving on, make sure you have..."
- Add timing: "This should take about 5-10 minutes"
- Include visual cues: "Look for the blue button that says..."
- Provide examples: "For example, if your niche is X, you'd write Y"
- End with confirmation: "By the end of this section, you'll have [specific outcome]"
`;

// Default humanization fallback
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
// 5-CHAPTER STORY-DRIVEN FRAMEWORK
// ============================================

interface ChapterSection {
  id: string;
  name: string;
  description: string;
  wordTarget: string;
  example?: string;
}

interface ChapterPromptConfig {
  purpose: string;
  description: string;
  sections: ChapterSection[];
  actionChecklist: string[];
  reflectionPrompt: string;
  yourNextMoves: string;
  wordTarget: { min: number; max: number };
}

const CHAPTER_PROMPTS: Record<string, ChapterPromptConfig> = {
  understanding: {
    purpose: "Set the foundation - explain WHY this works and what makes it different",
    description: "Hook the reader by reframing how they think about the topic. Explain the mechanism, the user mindset, and why this approach is superior.",
    sections: [
      { id: "intro", name: "Opening Hook & Context", description: "Start with the key insight that changes everything. Connect emotionally to their frustration.", wordTarget: "150-200 words" },
      { id: "how-it-works", name: "1.1 How [Topic] Really Works", description: "Deep explanation of the mechanism. Include the KEY INSIGHT most people miss.", wordTarget: "200-250 words" },
      { id: "user-mindset", name: "1.2 The [User] Mindset", description: "What makes this audience unique. Why high-intent? Include specific behaviors.", wordTarget: "150-200 words" },
      { id: "comparison", name: "1.3 Content/Approach Lifespan Comparison", description: "Show WHY this is better than alternatives using comparison.", wordTarget: "100-150 words" }
    ],
    actionChecklist: ["Stop thinking '[old approach]' — start thinking '[new approach]'", "Write down 3 problems your audience actively searches for", "Research 5 competitors succeeding with this approach"],
    reflectionPrompt: "What website, offer, or platform do you want this traffic/results to support?",
    yourNextMoves: "In Chapter 2, we'll set up your [system/account] step-by-step so it's optimized for conversions from day one.",
    wordTarget: { min: 600, max: 800 }
  },
  setup: {
    purpose: "Complete setup with detailed step-by-step instructions and formulas",
    description: "Walk through every setup step with specific instructions, formulas they can copy, and examples.",
    sections: [
      { id: "create-convert", name: "2.1 Create or Convert Your [Account/System]", description: "Step-by-step account creation. List benefits. Exact steps.", wordTarget: "150-200 words" },
      { id: "optimize-profile", name: "2.2 Optimize Your Profile", description: "FORMULAS they can copy. Username guidance, bio formula with example.", wordTarget: "200-250 words" },
      { id: "platform-setup", name: "2.3 [Platform-Specific Setup]", description: "Technical setup needed. Make it impossible to get stuck.", wordTarget: "100-150 words" },
      { id: "strategy-foundation", name: "2.4 [Strategy Component] Foundation", description: "Foundational strategy element with numbers and formulas.", wordTarget: "200-250 words" }
    ],
    actionChecklist: ["Create/convert your account", "Optimize your bio using the formula", "Complete platform-specific setup", "Create at least 5 foundational elements"],
    reflectionPrompt: "Looking at your profile now, would a stranger immediately understand what you offer?",
    yourNextMoves: "In Chapter 3, we'll dive into research and content strategy — the secret sauce that makes everything work.",
    wordTarget: { min: 650, max: 850 }
  },
  strategy: {
    purpose: "Finding opportunities - the research that prevents wasted effort",
    description: "Teach discovery that reveals exactly what content/approach will work.",
    sections: [
      { id: "niche-selection", name: "3.1 Choosing a [Platform]-Friendly Niche", description: "List niches that perform best with 'why' reasoning.", wordTarget: "150-200 words" },
      { id: "keyword-research", name: "3.2 Keyword/Topic Research (Step-by-Step)", description: "Exact process for finding winning keywords. Numbered steps.", wordTarget: "250-300 words" },
      { id: "content-mapping", name: "3.3 Content Mapping", description: "Connect research to content. One keyword → one piece → one destination.", wordTarget: "100-150 words" },
      { id: "content-types", name: "3.4 Content Types That Perform", description: "Specific formats that get results with 'why' for each.", wordTarget: "150-200 words" }
    ],
    actionChecklist: ["Identify your niche category", "Complete keyword research using the process", "Create your mapping document", "List 10 content ideas from research"],
    reflectionPrompt: "What surprised you most about what your audience actually searches for?",
    yourNextMoves: "In Chapter 4, we'll create scroll-stopping content that converts — using everything you just discovered.",
    wordTarget: { min: 650, max: 850 }
  },
  creation: {
    purpose: "The core skill - creating content that stands out and converts",
    description: "Deep dive into creating the main content type with design, copy, branding, and workflow.",
    sections: [
      { id: "design-basics", name: "4.1 [Content Type] Design Basics", description: "Technical specs and fundamental design principles.", wordTarget: "150-200 words" },
      { id: "copy-formula", name: "4.2 Text/Copy Formula", description: "Exact formula for headlines/copy that converts. Show examples.", wordTarget: "200-250 words" },
      { id: "branding", name: "4.3 Branding for Consistency", description: "Create recognizable branding. What to standardize.", wordTarget: "100-150 words" },
      { id: "workflow", name: "4.4 [Tool] Workflow & Batching", description: "Practical workflow with tools, batching, time estimates.", wordTarget: "200-250 words" }
    ],
    actionChecklist: ["Set up design template with correct dimensions", "Write 5 headlines using the copy formula", "Define brand elements", "Create your first batch of 5 pieces today"],
    reflectionPrompt: "Which of your content pieces would YOU click on? What makes it stand out?",
    yourNextMoves: "In Chapter 5, we'll put everything together with a posting system and scaling strategy.",
    wordTarget: { min: 650, max: 850 }
  },
  scaling: {
    purpose: "Putting it all together - the system that runs on autopilot",
    description: "Cover frequency, automation, analytics, and scaling what works.",
    sections: [
      { id: "frequency", name: "5.1 How Often to [Post/Publish]", description: "Optimal frequency with reasoning. Consistency > volume.", wordTarget: "100-150 words" },
      { id: "automation", name: "5.2 Manual vs Automated Scheduling", description: "Compare approaches with specific tools and recommendation.", wordTarget: "150-200 words" },
      { id: "analytics", name: "5.3 Understanding Analytics", description: "Key metrics, what they mean, good numbers, red flags.", wordTarget: "200-250 words" },
      { id: "scaling-whats-working", name: "5.4 Scaling What Works", description: "Identify winners, double down, weekly review process.", wordTarget: "150-200 words" }
    ],
    actionChecklist: ["Set your posting schedule for 30 days", "Choose scheduling approach", "Set up weekly analytics review", "Create 'scale what works' tracking"],
    reflectionPrompt: "Where could this change your business in 90 days?",
    yourNextMoves: "Congratulations! You have a complete, repeatable system. Keep executing, tracking, scaling.",
    wordTarget: { min: 600, max: 800 }
  }
};

// Build chapter prompt for story-driven generation
function buildChapterPrompt(
  chapterId: string,
  chapterNumber: number,
  chapterTitle: string,
  title: string,
  niche: string,
  targetAudience: string,
  thesis: string,
  styleDirective: string,
  storyMode: boolean = true
): string {
  const config = CHAPTER_PROMPTS[chapterId];
  
  if (!config) {
    return `Generate Chapter ${chapterNumber}: "${chapterTitle}" for a guide about "${niche}".
=== CONTEXT ===
- Title: "${title}"
- Audience: ${targetAudience || "entrepreneurs"}
- Thesis: ${thesis || `Master ${niche} through practical steps.`}
Generate 600-800 words with actionable content.
${styleDirective}`;
  }

  const sectionInstructions = config.sections.map((section, i) => 
    `${i + 1}. ${section.name} (${section.wordTarget}):
   ${section.description}
   ${section.example ? `Example: "${section.example}"` : ''}`
  ).join('\n\n');

  const checklistFormatted = config.actionChecklist.map(item => `☐ ${item}`).join('\n');

  const storyDirective = storyMode ? STORY_DRIVEN_DIRECTIVE : '';

  return `Generate CHAPTER ${chapterNumber}: "${chapterTitle}" for a guide titled "${title}".

=== CHAPTER PURPOSE ===
${config.purpose}

=== CHAPTER DESCRIPTION ===
${config.description}

=== CONTEXT ===
- Guide Title: "${title}"
- Niche/Topic: ${niche}
- Target Audience: ${targetAudience || "entrepreneurs seeking practical results"}
- Core Thesis: ${thesis || `This guide helps readers master ${niche} through a proven system.`}

${storyDirective}
${DETAILED_ACTION_DIRECTIVE}
${styleDirective}

=== MANDATORY CHAPTER SECTIONS ===
Include ALL of these sections:

${sectionInstructions}

=== CHAPTER ENDING (REQUIRED) ===
End with:

**ACTION CHECKLIST:**
${checklistFormatted}

**📝 REFLECTION:**
"${config.reflectionPrompt}"

**➡️ YOUR NEXT MOVES:**
${config.yourNextMoves}

=== OUTPUT REQUIREMENTS ===
- Word Target: ${config.wordTarget.min}-${config.wordTarget.max} words
- Use specific examples, numbers, and concrete details for ${niche}
- Include section headers (1.1, 1.2, etc.) for clarity
- Make every sentence teach, inspire, or prompt action
- Sound like a knowledgeable mentor who has been in their shoes

=== OUTPUT FORMAT ===
Return ONLY the chapter content as plain text (NOT JSON). Write directly, ready for the guide.`;
}

// ============================================
// LEGACY 8-SECTION FRAMEWORK (backwards compat)
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
      { name: "EMPATHY HOOK", sentenceCount: "2-3 sentences", description: "Acknowledge their frustration." },
      { name: "SURFACE PAIN", sentenceCount: "3-4 sentences", description: "Describe what failure looks like." },
      { name: "HIDDEN CAUSE REVEAL", sentenceCount: "2-3 sentences", description: "Expose WHY their approach fails." },
      { name: "PROMISE OF CLARITY", sentenceCount: "1-2 sentences", description: "Hint that a better system exists." }
    ],
    actionExercise: "Write 3 sentences describing your audience's daily struggle.",
    reflectionPrompt: "Complete: 'The truth is, it's not about [X]. It's about [Y].'",
    wordTarget: { min: 400, max: 470 }
  },
  solution: {
    purpose: "Introduce your core method or system",
    structure: [
      { name: "SYSTEM NAME", sentenceCount: "1-2 sentences", description: "Introduce memorable system name." },
      { name: "PHILOSOPHY", sentenceCount: "2-3 sentences", description: "Explain WHY it works differently." },
      { name: "PILLARS/STEPS", sentenceCount: "3-5 items", description: "Outline key principles." },
      { name: "TRANSFORMATION", sentenceCount: "2-3 sentences", description: "Paint before → after picture." }
    ],
    actionExercise: "Fill in: 'My [System] helps [audience] go from [pain] to [result].'",
    reflectionPrompt: "What makes your approach fundamentally different?",
    wordTarget: { min: 400, max: 470 }
  },
  foundation: {
    purpose: "Prepare mindset, tools, and environment",
    structure: [
      { name: "SUCCESS DEFINITION", sentenceCount: "2-3 sentences", description: "Clarify what success looks like." },
      { name: "MINDSET SHIFTS", sentenceCount: "3-4 sentences", description: "Address mental barriers." },
      { name: "ESSENTIAL SETUP", sentenceCount: "3-4 items", description: "List tools and preparations." },
      { name: "READINESS CHECKLIST", sentenceCount: "4-6 items", description: "Self-check before moving forward." }
    ],
    actionExercise: "Write your commitment statement.",
    reflectionPrompt: "What mindset shift feels uncomfortable but necessary?",
    wordTarget: { min: 450, max: 520 }
  },
  discovery: {
    purpose: "Teach how to identify opportunities",
    structure: [
      { name: "WHY RESEARCH FIRST", sentenceCount: "2-3 sentences", description: "Explain why research saves time." },
      { name: "DISCOVERY PROCESS", sentenceCount: "4-6 steps", description: "Step-by-step opportunity finding." },
      { name: "WHAT TO LOOK FOR", sentenceCount: "3-4 indicators", description: "Concrete signals of opportunity." },
      { name: "DISCOVERY TEMPLATE", sentenceCount: "A template", description: "Structure to capture research." }
    ],
    actionExercise: "Find 5 'signal-rich' sources in your niche.",
    reflectionPrompt: "What surprised you about what your audience wants?",
    wordTarget: { min: 450, max: 520 }
  },
  "execution-1": {
    purpose: "Guide through first real-world actions",
    structure: [
      { name: "READINESS RECAP", sentenceCount: "2-3 sentences", description: "Confirm what they've prepared." },
      { name: "FIRST ACTIONS", sentenceCount: "3-5 steps", description: "Clear first steps for TODAY." },
      { name: "SCRIPTS/TEMPLATES", sentenceCount: "2-3 examples", description: "Ready-to-use language." },
      { name: "FIRST WEEK SCHEDULE", sentenceCount: "Daily breakdown", description: "Specific time allocations." },
      { name: "WIN TRACKING", sentenceCount: "2-3 sentences", description: "Measure first-week success." }
    ],
    actionExercise: "Write 3 actions for the next 7 days.",
    reflectionPrompt: "What responses led to real conversations?",
    wordTarget: { min: 450, max: 520 }
  },
  "execution-2": {
    purpose: "Deepen implementation and optimize",
    structure: [
      { name: "PROGRESS CHECK", sentenceCount: "2-3 sentences", description: "Acknowledge progress." },
      { name: "ADVANCED TACTICS", sentenceCount: "3-4 techniques", description: "Next-level actions." },
      { name: "DATA INTERPRETATION", sentenceCount: "3-4 sentences", description: "How to read results." },
      { name: "SUCCESS INDICATORS", sentenceCount: "3-4 metrics", description: "How to know you're on track." },
      { name: "OPTIMIZATION TIP", sentenceCount: "2-3 sentences", description: "Key improvement insight." }
    ],
    actionExercise: "Define your top 3 metrics and targets.",
    reflectionPrompt: "What's working to double down on?",
    wordTarget: { min: 450, max: 520 }
  },
  optimization: {
    purpose: "Refine and improve through testing",
    structure: [
      { name: "WHY TESTING MATTERS", sentenceCount: "2-3 sentences", description: "Systematic improvement power." },
      { name: "VARIABLES TO TEST", sentenceCount: "4-5 items", description: "What to experiment with." },
      { name: "TESTING FRAMEWORK", sentenceCount: "Simple structure", description: "Testing methodology." },
      { name: "TRACKING TABLE", sentenceCount: "Template", description: "Recording experiments." },
      { name: "ITERATION MINDSET", sentenceCount: "2-3 sentences", description: "Continuous improvement." }
    ],
    actionExercise: "Run one micro-test this week.",
    reflectionPrompt: "What assumption should you test?",
    wordTarget: { min: 450, max: 520 }
  },
  scaling: {
    purpose: "Grow results long-term without burnout",
    structure: [
      { name: "WHAT SCALING MEANS", sentenceCount: "2-3 sentences", description: "Define scaling in context." },
      { name: "SCALING STRATEGIES", sentenceCount: "3-4 approaches", description: "Multiply without more effort." },
      { name: "AUTOMATION", sentenceCount: "2-3 sentences", description: "What can be systematized." },
      { name: "SUSTAINABILITY", sentenceCount: "4-5 items", description: "Long-term success habits." },
      { name: "VISION & MASTERY", sentenceCount: "2-3 sentences", description: "Inspiration and long-term picture." }
    ],
    actionExercise: "Write your 90-day Success Maintenance Plan.",
    reflectionPrompt: "What does success look like in 1 year?",
    wordTarget: { min: 430, max: 500 }
  }
};

// Build legacy section prompt
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
    return `Generate Section ${sectionNumber}: "${sectionTitle}" for a guide about "${niche}".
=== CONTEXT ===
- Title: "${title}"
- Audience: ${targetAudience || "entrepreneurs"}
- Thesis: ${thesis || `Master ${niche} through practical steps.`}
Generate 400-470 words.
${styleDirective}`;
  }

  const structureInstructions = config.structure.map((elem, i) => 
    `${i + 1}. ${elem.name} (${elem.sentenceCount}): ${elem.description}`
  ).join('\n');

  return `Generate Section ${sectionNumber}: "${sectionTitle}" for "${title}".

=== PURPOSE ===
${config.purpose}

=== CONTEXT ===
- Niche: ${niche}
- Audience: ${targetAudience || "entrepreneurs"}
- Thesis: ${thesis || `Master ${niche} through a proven system.`}

=== STRUCTURE ===
${structureInstructions}

=== ENDING ===
📝 ACTION: "${config.actionExercise}"
🧠 REFLECTION: "${config.reflectionPrompt}"

${styleDirective}

Word Target: ${config.wordTarget.min}-${config.wordTarget.max} words.
Return ONLY plain text content.`;
}

// Component prompts
const componentPrompts: Record<string, string> = {
  guide: `Create a COMPREHENSIVE 5-CHAPTER GUIDE following the story-driven "Pin to Win" playbook style.

=== MANDATORY 5-CHAPTER STRUCTURE ===

CHAPTER 1: Understanding [Topic] as a [System/Platform] (600-800 words)
- Opening hook explaining the key insight that changes everything
- 1.1 How [Topic] Really Works (mechanism, discovery channels, KEY INSIGHT)
- 1.2 The [User] Mindset (what makes them unique, high-intent signals)
- 1.3 Comparison (why this approach beats alternatives)
- Action Checklist, Reflection, Your Next Moves

CHAPTER 2: Setting Up a High-Converting [System] (650-850 words)
- 2.1 Create/Convert Your Account (step-by-step with benefits)
- 2.2 Optimize Your Profile (FORMULAS they can copy, examples)
- 2.3 Platform-Specific Setup (technical setup, impossible to get stuck)
- 2.4 Strategy Foundation (foundational elements with numbers)
- Action Checklist, Reflection, Your Next Moves

CHAPTER 3: Research & Content Strategy (650-850 words)
- 3.1 Choosing a [Platform]-Friendly Niche (what works, why)
- 3.2 Keyword/Topic Research Step-by-Step (numbered process)
- 3.3 Content Mapping (keyword → content → destination)
- 3.4 Content Types That Perform (specific formats, why each works)
- Action Checklist, Reflection, Your Next Moves

CHAPTER 4: Creating [High-Converting Content] (650-850 words)
- 4.1 Design Basics (specs, principles, measurements)
- 4.2 Copy/Text Formula (exact formula, multiple examples)
- 4.3 Branding for Consistency (what to standardize)
- 4.4 Workflow & Batching (tools, time estimates, efficiency)
- Action Checklist, Reflection, Your Next Moves

CHAPTER 5: Posting, Analytics & Scaling (600-800 words)
- 5.1 Posting Frequency (optimal schedule, consistency > volume)
- 5.2 Manual vs Automated (tools comparison, recommendation)
- 5.3 Understanding Analytics (key metrics, what they mean)
- 5.4 Scaling What Works (identify winners, double down)
- Action Checklist, Final Reflection, Congratulations

=== WRITING STYLE ===
- Story-driven: Explain WHY behind every step
- Detailed follow-along: Break actions into micro-steps
- Include timing: "This takes about 5-10 minutes"
- Add checkpoints: "Before moving on, make sure..."
- Use comparison tables where helpful
- End each chapter with clear bridge to next

Total: 3,200-4,300 words across all 5 chapters.

Return as: { "title": "Guide Title", "sections": [{ "heading": "Chapter 1: [Title]", "content": "[full chapter...]" }, ...] }`,
  
  worksheet: `Create 5 INTERACTIVE EXERCISES matching the 5-chapter guide structure.

Exercise 1: UNDERSTANDING AUDIT
- Assess current approach vs. new approach
- Identify 3 problems your audience searches for
- Document competitors succeeding with this approach

Exercise 2: SETUP CHECKLIST & PROFILE OPTIMIZER
- Account creation/conversion steps
- Bio formula fill-in template
- Foundational elements planner

Exercise 3: RESEARCH & MAPPING TEMPLATE
- Keyword research tracking table
- Content mapping worksheet (keyword → content → URL)
- Content ideas generator

Exercise 4: CONTENT CREATION PLANNER
- Design specs quick reference
- Headline formula practice (write 10)
- Brand elements documentation

Exercise 5: SCALING STRATEGY BUILDER
- Posting schedule commitment
- Analytics tracking dashboard
- Weekly review template

Each exercise: Title, 2-3 sentence context, clear instructions, 5-6 fill-in prompts.

Return as: { "title": "Worksheet Title", "exercises": [{ "title": "...", "instructions": "...", "fields": ["prompt1", ...] }, ...] }`,
  
  checklist: `Create 25-30 ACTIONABLE ITEMS organized into 5 PHASES matching guide chapters.

PHASE 1: UNDERSTANDING & MINDSET (5-6 items)
Match: Chapter 1 - Foundation concepts

PHASE 2: SETUP & OPTIMIZATION (6-8 items)
Match: Chapter 2 - Account setup, profile, foundation

PHASE 3: RESEARCH & STRATEGY (5-6 items)
Match: Chapter 3 - Keywords, content mapping

PHASE 4: CREATION & PRODUCTION (5-6 items)
Match: Chapter 4 - Design, copy, workflow

PHASE 5: LAUNCH & SCALING (5-6 items)
Match: Chapter 5 - Posting, analytics, scaling

Each item: ACTION VERB first, specific enough to check off.

Return as: { "title": "Checklist Title", "items": ["═══ PHASE 1: UNDERSTANDING ═══", "☐ Task 1", ...] }`,
  
  resourceList: `Create 12-15 CURATED RESOURCES organized by chapter theme.

RESEARCH TOOLS (3-4): Finding keywords, analyzing competitors
SETUP & OPTIMIZATION (2-3): Profile tools, platform features
CONTENT CREATION (3-4): Design, writing, templates
SCHEDULING & AUTOMATION (2-3): Posting, management
ANALYTICS & SCALING (2-3): Tracking, optimization

Each: Name, 3-4 sentence description with WHY valuable, Pro Tip, URL.

Return as: { "title": "Resource Title", "resources": [{ "name": "...", "description": "...", "url": "..." }, ...] }`,
  
  templates: `Create 5 READY-TO-USE TEMPLATES matching the 5-chapter workflow.

Template 1: AUDIENCE AVATAR (Understanding)
Demographics, pain points, desires, where they hang out

Template 2: PROFILE OPTIMIZATION (Setup)
Bio formula, board/category descriptions, link structure

Template 3: CONTENT CALENDAR (Strategy)
Weekly planning grid with keyword assignments

Template 4: HEADLINE SWIPE FILE (Creation)
20+ headline formulas with examples

Template 5: WEEKLY REVIEW DASHBOARD (Scaling)
Metrics tracker, what worked, optimization notes

Each: 200+ words, [BRACKETED PLACEHOLDERS], example filled-in.

Return as: { "title": "Templates Title", "templates": [{ "name": "...", "content": "..." }] }`,
  
  quiz: `Create 10 KNOWLEDGE-CHECK questions covering all 5 chapters.

Questions 1-2: Understanding chapter concepts
Questions 3-4: Setup and optimization
Questions 5-6: Research and strategy
Questions 7-8: Content creation
Questions 9-10: Scaling and analytics

Mix difficulty. Make wrong answers plausible learning traps.

Return as: { "title": "Quiz Title", "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 }, ...] }`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      // Section/Chapter generation parameters
      sectionId,
      sectionNumber,
      sectionTitle,
      thesis,
      // New story mode flag
      storyMode = true,
      // New chapter-based generation
      chapterId,
      chapterNumber,
      chapterTitle,
      // AI smart routing
      qualityMode = "balanced",
      modelPreference = "auto",
    } = await req.json();
    
    const authHeader = req.headers.get('authorization');
    const byokConfig = await getUserApiKey(authHeader, 'deepseek');
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    
    let provider: "lovable" | "deepseek" | "byok" = "lovable";
    let apiKey = LOVABLE_API_KEY;
    let apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    let model = "google/gemini-2.5-flash";

    if (byokConfig) {
      provider = "byok";
      apiKey = byokConfig.apiKey;
      const providerConfig = getProviderConfig(byokConfig.provider);
      apiUrl = providerConfig.endpoint;
      model = providerConfig.model;
      console.log(`Using BYOK with provider: ${byokConfig.provider}`);
    } else if (!LOVABLE_API_KEY && DEEPSEEK_API_KEY) {
      provider = "deepseek";
      apiKey = DEEPSEEK_API_KEY;
      apiUrl = "https://api.deepseek.com/chat/completions";
      model = "deepseek-chat";
      console.log("Using DeepSeek API");
    } else if (LOVABLE_API_KEY) {
      // Smart routing: longform task. Override default model with the routed pick.
      const routed = pickModel("longform", qualityMode as QualityMode, modelPreference as UserPreference);
      model = routed.model;
      console.log(`[generate-toolkit-content] Routed to ${model} (mode=${qualityMode}, pref=${modelPreference})`);
    } else {
      throw new Error("No API key configured");
    }

    const styleDirective = STYLE_DIRECTIVES[writingStyle] || DEFAULT_HUMAN_DIRECTIVE;
    
    // Chapter-based generation (new 5-chapter framework)
    if (chapterId && chapterNumber && chapterTitle) {
      console.log(`Generating chapter ${chapterNumber}: ${chapterTitle} for ${niche}`);
      
      const chapterPrompt = buildChapterPrompt(
        chapterId,
        chapterNumber,
        chapterTitle,
        title,
        niche,
        targetAudience,
        thesis,
        styleDirective,
        storyMode
      );

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are an expert guide writer creating premium, story-driven digital guide chapters. Write engaging, actionable content that reads like a mentor walking someone through the process step-by-step." },
            { role: "user", content: chapterPrompt }
          ],
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "API credits exhausted. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        throw new Error(`API error: ${status}`);
      }

      const data = await response.json();
      const chapterContent = data.choices?.[0]?.message?.content || "";

      console.log(`Generated chapter ${chapterNumber}, length: ${chapterContent.length} chars`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          chapterContent,
          chapterId,
          chapterNumber,
          chapterTitle
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Legacy section-based generation
    if (sectionId && sectionNumber && sectionTitle) {
      console.log(`Generating section ${sectionNumber}: ${sectionTitle}`);
      
      const sectionPrompt = buildSectionPrompt(
        sectionId,
        sectionNumber,
        sectionTitle,
        title,
        niche,
        targetAudience,
        thesis,
        styleDirective
      );

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are an expert content writer creating premium digital guide sections. Write engaging, actionable content." },
            { role: "user", content: sectionPrompt }
          ],
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        throw new Error(`API error: ${status}`);
      }

      const data = await response.json();
      const sectionContent = data.choices?.[0]?.message?.content || "";

      return new Response(
        JSON.stringify({ success: true, sectionContent, sectionId, sectionNumber, sectionTitle }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Component generation (guide, worksheet, etc.)
    if (!components || !Array.isArray(components)) {
      return new Response(
        JSON.stringify({ error: "components array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Record<string, unknown> = {};

    for (const component of components) {
      const componentPrompt = componentPrompts[component];
      if (!componentPrompt) continue;

      console.log(`Generating ${component}...`);

      const fullPrompt = `Create content for a toolkit titled "${title}" about "${niche}".
Target audience: ${targetAudience || "entrepreneurs"}.
${thesis ? `Core thesis: ${thesis}` : ""}

${styleDirective}

${componentPrompt}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are an expert content creator. Return ONLY valid JSON." },
            { role: "user", content: fullPrompt }
          ],
          max_tokens: 10000,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        console.error(`Error generating ${component}: ${status}`);
        results[component] = createFallbackContent(component, title, niche);
        continue;
      }

      const data = await response.json();
      const contentText = data.choices?.[0]?.message?.content || "";

      try {
        let cleanedText = contentText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        const parsed = JSON.parse(cleanedText);
        results[component] = parsed;
        console.log(`Successfully generated ${component}`);
      } catch (parseError) {
        console.error(`Parse error for ${component}:`, parseError);
        results[component] = createFallbackContent(component, title, niche);
      }
    }

    return new Response(
      JSON.stringify({ success: true, content: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to generate toolkit content. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function createFallbackContent(component: string, title: string, niche: string): unknown {
  const fallbacks: Record<string, unknown> = {
    guide: {
      title: title || "Your Complete Guide",
      sections: [
        { heading: "Chapter 1: Understanding the Fundamentals", content: `This chapter introduces the core concepts of ${niche}...` },
        { heading: "Chapter 2: Setting Up for Success", content: "Step-by-step setup instructions..." },
        { heading: "Chapter 3: Research & Strategy", content: "How to find opportunities..." },
        { heading: "Chapter 4: Creation & Production", content: "Creating high-quality content..." },
        { heading: "Chapter 5: Scaling & Optimization", content: "Growing your results..." }
      ]
    },
    worksheet: {
      title: `${title} Worksheet`,
      exercises: [
        { title: "Exercise 1: Foundation", instructions: "Complete this exercise...", fields: ["Field 1", "Field 2"] }
      ]
    },
    checklist: {
      title: `${title} Checklist`,
      items: ["☐ Complete setup", "☐ Research phase", "☐ Create content", "☐ Launch"]
    },
    resourceList: {
      title: `${title} Resources`,
      resources: [{ name: "Resource 1", description: "A helpful resource...", url: "https://example.com" }]
    },
    templates: {
      title: `${title} Templates`,
      templates: [{ name: "Template 1", content: "Template content..." }]
    },
    quiz: {
      title: `${title} Quiz`,
      questions: [{ question: "Sample question?", options: ["A", "B", "C", "D"], correctIndex: 0 }]
    }
  };
  return fallbacks[component] || {};
}
