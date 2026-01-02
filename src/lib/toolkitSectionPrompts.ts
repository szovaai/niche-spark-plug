// Story-Driven Toolkit Creator Framework - Chapter-Based Prompts
// Each chapter follows a narrative, action-oriented structure like "Pin to Win" style guides

export interface ChapterPrompt {
  id: string;
  number: number;
  title: string;
  purpose: string;
  description: string;
  sections: ChapterSection[];
  actionChecklist: string[];
  reflectionPrompt: string;
  yourNextMoves: string;
  wordTarget: { min: number; max: number };
  contextQuestions: string[];
}

export interface ChapterSection {
  id: string;
  name: string;
  description: string;
  wordTarget: string;
  example?: string;
}

// The 5-Chapter Story-Driven Framework (like Pinterest Playbook)
export const CHAPTER_PROMPTS: Record<string, ChapterPrompt> = {
  understanding: {
    id: "understanding",
    number: 1,
    title: "Understanding [Topic] as a [System/Platform]",
    purpose: "Set the foundation - explain WHY this works and what makes it different",
    description: "Hook the reader by reframing how they think about the topic. Explain the mechanism, the user mindset, and why this approach is superior to alternatives.",
    sections: [
      {
        id: "intro",
        name: "Opening Hook & Context",
        description: "Start with the key insight that changes everything. Explain WHY this guide exists and what transformation awaits. Connect emotionally to their frustration.",
        wordTarget: "150-200 words",
        example: "Pinterest is not social media — it's a visual search engine. That single distinction changes everything about how you approach it."
      },
      {
        id: "how-it-works",
        name: "1.1 How [Topic] Really Works",
        description: "Deep explanation of the mechanism. Break down the 3-4 main discovery/success channels. Include the KEY INSIGHT that most people miss.",
        wordTarget: "200-250 words",
        example: "Pinterest content is discovered through: Search bar keywords (like Google, but visual), Related pin suggestions (the algorithm at work), Home feed relevance (personalized discovery). Key Insight: Pinterest rewards consistency + relevance, not followers."
      },
      {
        id: "user-mindset",
        name: "1.2 The [User/Customer] Mindset",
        description: "Explain what makes this audience unique. Why are they high-intent? What are they looking for? Include specific behaviors that signal opportunity.",
        wordTarget: "150-200 words",
        example: "Users come to Pinterest to: Plan (weddings, meals, projects), Research (products, solutions, ideas), Buy (they're 3x more likely to purchase). This means high-intent traffic."
      },
      {
        id: "comparison",
        name: "1.3 Content Lifespan Comparison",
        description: "Show WHY this approach is better. Compare to alternatives using a table or list. Make the case for long-term value.",
        wordTarget: "100-150 words",
        example: "Instagram post: 24-48 hours. TikTok video: 3-7 days. Pinterest pin: 3-24 months. That's why Pinterest is a traffic goldmine."
      }
    ],
    actionChecklist: [
      "Stop thinking '[old approach]' — start thinking '[new approach]'",
      "Write down 3 problems your audience actively searches for",
      "Research 5 competitors who are succeeding with this approach"
    ],
    reflectionPrompt: "What website, offer, or platform do you want this traffic/results to support?",
    yourNextMoves: "In Chapter 2, we'll set up your [system/account] step-by-step so it's optimized for conversions from day one.",
    wordTarget: { min: 600, max: 800 },
    contextQuestions: [
      "What is the main mechanism/platform you're teaching?",
      "What makes your audience different from casual users?",
      "What common misconception are you correcting?"
    ]
  },

  setup: {
    id: "setup",
    number: 2,
    title: "Setting Up a High-Converting [System/Account]",
    purpose: "Complete setup with detailed step-by-step instructions and formulas",
    description: "Walk readers through every setup step with specific instructions, formulas they can copy, and examples. Leave nothing to guesswork.",
    sections: [
      {
        id: "create-convert",
        name: "2.1 Create or Convert Your [Account/System]",
        description: "Step-by-step account creation or conversion. List specific benefits of this approach (analytics, features, credibility). Include exact steps.",
        wordTarget: "150-200 words",
        example: "Step 1: Go to [platform]. Step 2: Click 'Create Business Account' or 'Convert to Business'. Step 3: You'll unlock: Analytics, Rich Features, Website claiming."
      },
      {
        id: "optimize-profile",
        name: "2.2 Optimize Your Profile",
        description: "Give them FORMULAS they can copy. Include username guidance, bio formula with example, and credibility signals.",
        wordTarget: "200-250 words",
        example: "Username: Clear + niche-specific. Bio Formula: Who you help + what result + keywords. Example: 'Helping new bloggers drive traffic with Pinterest marketing.'"
      },
      {
        id: "platform-setup",
        name: "2.3 [Platform-Specific Setup Step]",
        description: "Whatever technical setup is needed - website claiming, linking, verification, tool connection, etc. Make it impossible to get stuck.",
        wordTarget: "100-150 words",
        example: "Claim your website: Settings → Claim → Enter URL → Add HTML tag or file. This builds trust and unlocks analytics."
      },
      {
        id: "strategy-foundation",
        name: "2.4 [Strategy Component] - Your Foundation",
        description: "The foundational strategy element (boards, categories, folders, etc.). Include numbers (create 10-15 of X), formula for naming/describing, and examples.",
        wordTarget: "200-250 words",
        example: "Create 10-15 boards: One core niche board, Supporting sub-topic boards. Board Description Formula: Topic + keywords + benefit."
      }
    ],
    actionChecklist: [
      "Create/convert your account to [business/professional] type",
      "Optimize your bio using the formula provided",
      "Complete [platform-specific setup] step",
      "Create at least 5 [foundational elements] with keyword-rich descriptions"
    ],
    reflectionPrompt: "Looking at your profile now, would a stranger immediately understand what you offer and who you help?",
    yourNextMoves: "In Chapter 3, we'll dive into keyword research and content strategy — the secret sauce that makes everything else work.",
    wordTarget: { min: 650, max: 850 },
    contextQuestions: [
      "What account type or setup is required?",
      "What profile elements need optimization?",
      "What's the foundational structure they need to create?"
    ]
  },

  strategy: {
    id: "strategy",
    number: 3,
    title: "[Research/Discovery] Strategy & Content Planning",
    purpose: "Finding opportunities - the research that prevents wasted effort",
    description: "Teach the discovery process that reveals exactly what content/approach will work. Include step-by-step research methods, what to look for, and how to organize findings.",
    sections: [
      {
        id: "niche-selection",
        name: "3.1 Choosing a [Platform]-Friendly Niche",
        description: "List the niches/topics that perform best. Be specific about why. Include 'best for' and 'avoid' guidance.",
        wordTarget: "150-200 words",
        example: "Best niches: Blogging, Business, Health & wellness, DIY, Finance, Recipes. Why? These have active searchers with purchase intent."
      },
      {
        id: "keyword-research",
        name: "3.2 [Platform] Keyword Research (Step-by-Step)",
        description: "The exact process for finding winning keywords/topics. Number each step. Include where to look, what to note, and how to organize.",
        wordTarget: "250-300 words",
        example: "Step 1: Use [platform] search bar autocomplete. Step 2: Scan bolded keywords in results. Step 3: Check top-ranking content. Step 4: Document patterns in a spreadsheet."
      },
      {
        id: "content-mapping",
        name: "3.3 Content Mapping",
        description: "Show how to connect research to content creation. One keyword → one piece of content → one destination. Keep it simple and actionable.",
        wordTarget: "100-150 words",
        example: "Match: One keyword → one pin → one URL. Create a master list with columns: Keyword | Content Idea | Target URL | Priority"
      },
      {
        id: "content-types",
        name: "3.4 Content Types That Perform",
        description: "List the specific content formats that get results. Include why each works and when to use it.",
        wordTarget: "150-200 words",
        example: "Top performers: Tutorials (show how), Lists (promise quantity), Before & after (show transformation), Guides (establish authority)."
      }
    ],
    actionChecklist: [
      "Identify which niche category your topic falls into",
      "Complete keyword research using the step-by-step process",
      "Create your keyword-to-content mapping document",
      "List 10 content ideas based on your research"
    ],
    reflectionPrompt: "What surprised you most about what your audience is actually searching for vs. what you assumed they wanted?",
    yourNextMoves: "In Chapter 4, we'll create scroll-stopping content that gets clicks and converts — using everything you just discovered.",
    wordTarget: { min: 650, max: 850 },
    contextQuestions: [
      "What niches/topics work best for this approach?",
      "How do users research on this platform?",
      "What content formats perform best?"
    ]
  },

  creation: {
    id: "creation",
    number: 4,
    title: "Creating [Scroll-Stopping/High-Converting] [Content Type]",
    purpose: "The core skill - creating content that stands out and converts",
    description: "Deep dive into creating the main content type. Cover design basics, copy formulas, branding, and workflow. Make them confident they can do this.",
    sections: [
      {
        id: "design-basics",
        name: "4.1 [Content Type] Design Basics",
        description: "Technical specs (dimensions, format) and fundamental design principles. Include specific measurements and must-haves.",
        wordTarget: "150-200 words",
        example: "Pin Design Basics: Vertical (1000×1500 or 1000×1800), Bold text overlay, High contrast colors, Brand fonts consistently."
      },
      {
        id: "copy-formula",
        name: "4.2 Text/Copy Formula",
        description: "The exact formula for writing headlines/copy that converts. Break it down into components. Show multiple examples.",
        wordTarget: "200-250 words",
        example: "Text Overlay Formula: Hook + curiosity + benefit. Examples: '10 Pinterest Tips That Tripled My Blog Traffic', '5-Minute Morning Routine for Busy Moms', 'The $0 Tool That Doubled My Sales'."
      },
      {
        id: "branding",
        name: "4.3 Branding for Consistency",
        description: "How to create recognizable, consistent branding. Include what elements to standardize and why consistency matters.",
        wordTarget: "100-150 words",
        example: "Use the same: Fonts (1-2 max), Colors (3-5 brand colors), Logo or URL placement. Consistency = recognition = trust = clicks."
      },
      {
        id: "workflow",
        name: "4.4 [Tool] Workflow & Batching",
        description: "Practical workflow for creating content efficiently. Include tool recommendations, batching strategy, and time estimates.",
        wordTarget: "200-250 words",
        example: "Canva Workflow: Create 3-5 pin designs per URL. Test different headlines. Save templates for reuse. Batch create weekly (1-2 hours = 20 pins)."
      }
    ],
    actionChecklist: [
      "Set up your design template with correct dimensions",
      "Write 5 headlines using the copy formula",
      "Define your brand elements (fonts, colors, logo placement)",
      "Create your first batch of 5 [content pieces] today"
    ],
    reflectionPrompt: "Which of your content pieces would YOU click on if you saw it while scrolling? What makes it stand out?",
    yourNextMoves: "In Chapter 5, we'll put everything together with a posting system, automation, and scaling strategy that runs on autopilot.",
    wordTarget: { min: 650, max: 850 },
    contextQuestions: [
      "What are the technical specs for this content type?",
      "What copy/text formula works best?",
      "What tools do beginners use for creation?"
    ]
  },

  scaling: {
    id: "scaling",
    number: 5,
    title: "Posting, Automation, Analytics & Scaling",
    purpose: "Putting it all together - the system that runs on autopilot",
    description: "Cover posting frequency, automation tools, analytics interpretation, and how to scale what works. End with the complete system they now have.",
    sections: [
      {
        id: "frequency",
        name: "5.1 How Often to [Post/Publish]",
        description: "Optimal frequency with reasoning. Include the key insight that consistency > volume. Give specific numbers.",
        wordTarget: "100-150 words",
        example: "Post 1-3 pins per day. Consistency matters more than volume. Better to post 1 pin daily for 30 days than 30 pins once."
      },
      {
        id: "automation",
        name: "5.2 Manual vs Automated [Posting/Scheduling]",
        description: "Compare approaches. List specific tools with brief pros/cons. Make a recommendation for beginners.",
        wordTarget: "150-200 words",
        example: "Manual: Built-in scheduler (free, simple). Automated: Tailwind, Later (optional, saves time). Start manual, automate when ready."
      },
      {
        id: "analytics",
        name: "5.3 Understanding Analytics",
        description: "The key metrics to track and what they mean. Include what good numbers look like and red flags to watch for.",
        wordTarget: "200-250 words",
        example: "Track: Outbound clicks (most important = people going to your site), Saves (algorithm loves these), Impressions (reach indicator). Focus on clicks — everything else is vanity."
      },
      {
        id: "scaling-whats-working",
        name: "5.4 Scaling What Works",
        description: "How to identify winners and double down. Include the weekly review process and optimization loop.",
        wordTarget: "150-200 words",
        example: "Weekly CEO Check-In: What pin brought the most clicks? What topic got most saves? Double down on: Top pins, Top keywords, Top content types."
      }
    ],
    actionChecklist: [
      "Set your posting schedule and commit to it for 30 days",
      "Choose your scheduling approach (manual or automated)",
      "Set up weekly analytics review (15 minutes, same day each week)",
      "Create your 'scale what works' tracking system"
    ],
    reflectionPrompt: "Where could this traffic/results change your business in 90 days? What becomes possible when this system is running?",
    yourNextMoves: "Congratulations! You now have a complete, repeatable system. Keep executing, keep tracking, keep scaling what works.",
    wordTarget: { min: 600, max: 800 },
    contextQuestions: [
      "What's the optimal posting/publishing frequency?",
      "What automation tools are available?",
      "What are the key metrics to track?"
    ]
  }
};

// Chapter order for generation
export const CHAPTER_ORDER = [
  "understanding",
  "setup",
  "strategy",
  "creation",
  "scaling"
] as const;

export type ChapterId = typeof CHAPTER_ORDER[number];

// Get chapter prompt by ID
export const getChapterPromptById = (chapterId: string): ChapterPrompt | undefined => {
  return CHAPTER_PROMPTS[chapterId];
};

// Generate the full system prompt for chapter generation
export const generateChapterSystemPrompt = (
  chapter: ChapterPrompt,
  writingStyle: string,
  styleDirective: string,
  storyMode: boolean = true
): string => {
  const storyModeDirective = storyMode ? `
=== STORY-DRIVEN WRITING ===
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
` : '';

  const detailedActionDirective = `
=== DETAILED FOLLOW-ALONG STYLE ===
- Break every action into micro-steps
- Use this format: "Step 1: Do [specific action]. Step 2: Now do [next action]. Step 3: You should now see [result]."
- Include checkpoints: "Before moving on, make sure you have..."
- Add timing: "This should take about 5-10 minutes"
- Include visual cues: "Look for the blue button that says..."
- Provide examples: "For example, if your niche is X, you'd write Y"
- End with confirmation: "By the end of this section, you'll have [specific outcome]"
`;

  return `You are an expert guide writer creating a premium, story-driven digital guide chapter.

=== CHAPTER PURPOSE ===
${chapter.purpose}

=== CHAPTER DESCRIPTION ===
${chapter.description}

${storyModeDirective}
${detailedActionDirective}
${styleDirective}

=== OUTPUT REQUIREMENTS ===
- Write ${chapter.wordTarget.min}-${chapter.wordTarget.max} words
- Use specific examples, numbers, and concrete details
- Include all required sections with proper headers (1.1, 1.2, etc.)
- End with ACTION CHECKLIST, REFLECTION PROMPT, and YOUR NEXT MOVES
- Make content scannable with bullets, numbered lists, and bold key points
- Sound like a knowledgeable mentor who has been in their shoes
`;
};

// Generate the user prompt for chapter generation
export const generateChapterUserPrompt = (
  chapter: ChapterPrompt,
  title: string,
  niche: string,
  targetAudience: string,
  thesis: string
): string => {
  const sectionInstructions = chapter.sections.map((section, index) => 
    `${index + 1}. ${section.name} (${section.wordTarget}):
   ${section.description}
   ${section.example ? `Example approach: "${section.example}"` : ''}`
  ).join('\n\n');

  const checklistFormatted = chapter.actionChecklist.map(item => `☐ ${item}`).join('\n');

  return `Generate CHAPTER ${chapter.number}: "${chapter.title.replace('[Topic]', niche).replace('[System/Platform]', niche)}" for a guide titled "${title}".

=== CONTEXT ===
- Guide Title: "${title}"
- Niche/Topic: ${niche}
- Target Audience: ${targetAudience || "entrepreneurs and professionals seeking practical results"}
- Core Thesis: ${thesis || `This guide helps readers master ${niche} through a proven, step-by-step system.`}

=== MANDATORY CHAPTER STRUCTURE ===
You MUST include ALL of these sections:

${sectionInstructions}

=== ENDING (REQUIRED) ===
End the chapter with:

**ACTION CHECKLIST:**
${checklistFormatted}

**📝 REFLECTION:**
"${chapter.reflectionPrompt}"

**➡️ YOUR NEXT MOVES:**
${chapter.yourNextMoves}

=== OUTPUT FORMAT ===
Return ONLY the chapter content as plain text, ready to be placed in the guide. Do NOT return JSON.
Include section headers formatted as bold or with "1.1", "1.2" numbering for clarity.`;
};

// =========================================
// LEGACY SUPPORT - 8 Section Framework
// =========================================

export interface SectionPrompt {
  id: string;
  number: number;
  title: string;
  purpose: string;
  description: string;
  structure: SectionStructureElement[];
  actionExercise: string;
  reflectionPrompt: string;
  wordTarget: { min: number; max: number };
  plugAndPlayInstructions: string[];
}

export interface SectionStructureElement {
  name: string;
  sentenceCount: string;
  description: string;
  example?: string;
}

// Legacy 8-section prompts (kept for backward compatibility)
export const SECTION_PROMPTS: Record<string, SectionPrompt> = {
  problem: {
    id: "problem",
    number: 1,
    title: "The Problem",
    purpose: "Make the reader say 'This is exactly my problem'",
    description: "Hook the reader emotionally by describing their pain in vivid, relatable terms",
    structure: [
      { name: "EMPATHY HOOK", sentenceCount: "2-3 sentences", description: "Acknowledge their frustration in their words." },
      { name: "SURFACE PAIN", sentenceCount: "3-4 sentences", description: "Describe what failure looks and feels like vividly." },
      { name: "HIDDEN CAUSE REVEAL", sentenceCount: "2-3 sentences", description: "Expose WHY their current approach fails." },
      { name: "PROMISE OF CLARITY", sentenceCount: "1-2 sentences", description: "Hint that a better system exists." }
    ],
    actionExercise: "Write 3 sentences that describe your audience's daily struggle with [topic].",
    reflectionPrompt: "Complete this sentence: 'The truth is, it's not about [what they think]. It's about [the real problem].'",
    wordTarget: { min: 400, max: 470 },
    plugAndPlayInstructions: ["What is your audience trying to do?", "Why are they failing?", "What emotions do they feel?"]
  },
  solution: {
    id: "solution",
    number: 2,
    title: "The Solution Framework",
    purpose: "Introduce your core method or system",
    description: "Position your method as THE structured, repeatable solution",
    structure: [
      { name: "SYSTEM NAME", sentenceCount: "1-2 sentences", description: "Introduce your memorable system name." },
      { name: "PHILOSOPHY", sentenceCount: "2-3 sentences", description: "Explain WHY your system works differently." },
      { name: "PILLARS/STEPS", sentenceCount: "3-5 numbered items", description: "Outline the key principles." },
      { name: "TRANSFORMATION STATEMENT", sentenceCount: "2-3 sentences", description: "Paint the before → after picture." }
    ],
    actionExercise: "Fill in: 'My [System Name] helps [audience] go from [pain] to [result] by focusing on [principle].'",
    reflectionPrompt: "What makes your approach fundamentally different?",
    wordTarget: { min: 400, max: 470 },
    plugAndPlayInstructions: ["What's your system called?", "How many steps does it have?", "What result does it guarantee?"]
  },
  foundation: {
    id: "foundation",
    number: 3,
    title: "Building Your Foundation",
    purpose: "Prepare the reader's mindset, tools, and environment",
    description: "Help users set up everything they need before execution",
    structure: [
      { name: "SUCCESS DEFINITION", sentenceCount: "2-3 sentences", description: "Clarify what success looks like." },
      { name: "MINDSET SHIFTS", sentenceCount: "3-4 sentences", description: "Address mental barriers." },
      { name: "ESSENTIAL SETUP", sentenceCount: "3-4 items", description: "List tools and preparations." },
      { name: "READINESS CHECKLIST", sentenceCount: "4-6 checkbox items", description: "Quick self-check before moving forward." }
    ],
    actionExercise: "Write your commitment statement.",
    reflectionPrompt: "What mindset shift feels uncomfortable but necessary?",
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: ["What beliefs must they release?", "What tools are essential?", "What's the minimum setup?"]
  },
  discovery: {
    id: "discovery",
    number: 4,
    title: "Discovery & Research",
    purpose: "Teach how to identify opportunities",
    description: "Teach users to observe and learn before they act",
    structure: [
      { name: "WHY RESEARCH FIRST", sentenceCount: "2-3 sentences", description: "Explain why research saves time." },
      { name: "DISCOVERY PROCESS", sentenceCount: "4-6 steps", description: "Step-by-step method to find opportunities." },
      { name: "WHAT TO LOOK FOR", sentenceCount: "3-4 indicators", description: "Concrete signals that indicate opportunity." },
      { name: "DISCOVERY WORKSHEET", sentenceCount: "A template", description: "Structure to capture research." }
    ],
    actionExercise: "Find and record 5 'signal-rich' sources in your niche.",
    reflectionPrompt: "What surprised you about what your audience truly wants?",
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: ["Where does your audience gather?", "What behaviors indicate opportunity?", "What patterns matter?"]
  },
  "execution-1": {
    id: "execution-1",
    number: 5,
    title: "Execution Plan Part 1",
    purpose: "Guide through first real-world actions",
    description: "Turn strategy into movement with tangible wins",
    structure: [
      { name: "READINESS RECAP", sentenceCount: "2-3 sentences", description: "Confirm what they've prepared." },
      { name: "FIRST ACTIONS", sentenceCount: "3-5 steps", description: "Clear first steps for TODAY." },
      { name: "SCRIPTS/TEMPLATES", sentenceCount: "2-3 examples", description: "Ready-to-use language." },
      { name: "FIRST WEEK SCHEDULE", sentenceCount: "Daily breakdown", description: "Specific time allocations." },
      { name: "WIN TRACKING", sentenceCount: "2-3 sentences", description: "How to measure first-week success." }
    ],
    actionExercise: "Write 3 actions for the next 7 days.",
    reflectionPrompt: "What type of responses led to real conversations?",
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: ["What's their first win?", "What routine should they follow?", "What scripts can they use?"]
  },
  "execution-2": {
    id: "execution-2",
    number: 6,
    title: "Execution Plan Part 2",
    purpose: "Deepen implementation and optimize",
    description: "Build on basics with advanced steps",
    structure: [
      { name: "PROGRESS CHECK", sentenceCount: "2-3 sentences", description: "Acknowledge progress." },
      { name: "ADVANCED TACTICS", sentenceCount: "3-4 techniques", description: "Next-level actions." },
      { name: "DATA INTERPRETATION", sentenceCount: "3-4 sentences", description: "How to read results." },
      { name: "SUCCESS INDICATORS", sentenceCount: "3-4 metrics", description: "How to know they're on track." },
      { name: "OPTIMIZATION TIP", sentenceCount: "2-3 sentences", description: "Key insight for improvement." }
    ],
    actionExercise: "Define your top 3 metrics and targets.",
    reflectionPrompt: "What's working to double down on? What should you stop?",
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: ["How do they know they're progressing?", "What indicators matter?", "What advanced techniques help?"]
  },
  optimization: {
    id: "optimization",
    number: 7,
    title: "Optimization & Testing",
    purpose: "Refine and improve continuously",
    description: "Turn the process into a feedback loop",
    structure: [
      { name: "WHY TESTING MATTERS", sentenceCount: "2-3 sentences", description: "Explain systematic improvement." },
      { name: "VARIABLES TO TEST", sentenceCount: "4-5 items", description: "What to experiment with." },
      { name: "TESTING FRAMEWORK", sentenceCount: "Simple A/B structure", description: "Methodology for testing." },
      { name: "TRACKING TABLE", sentenceCount: "Template", description: "Recording experiments." },
      { name: "ITERATION MINDSET", sentenceCount: "2-3 sentences", description: "Continuous improvement thinking." }
    ],
    actionExercise: "Run one micro-test this week.",
    reflectionPrompt: "What assumption should you test? What if the opposite were true?",
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: ["What 3-5 variables can they test?", "How do they compare results?", "What's the simplest test method?"]
  },
  scaling: {
    id: "scaling",
    number: 8,
    title: "Scaling & Sustainability",
    purpose: "Grow results long-term without burnout",
    description: "Scale success while maintaining balance",
    structure: [
      { name: "WHAT SCALING MEANS", sentenceCount: "2-3 sentences", description: "Define scaling in context." },
      { name: "SCALING STRATEGIES", sentenceCount: "3-4 approaches", description: "Multiply results without multiplying effort." },
      { name: "AUTOMATION & DELEGATION", sentenceCount: "2-3 sentences", description: "What can be systematized." },
      { name: "SUSTAINABILITY CHECKLIST", sentenceCount: "4-5 checkbox items", description: "Long-term success habits." },
      { name: "VISION & MASTERY", sentenceCount: "2-3 sentences", description: "Inspiration and long-term picture." }
    ],
    actionExercise: "Write your 'Success Maintenance Plan' for 90 days from now.",
    reflectionPrompt: "What does success look like in 1 year? What systems will you have?",
    wordTarget: { min: 430, max: 500 },
    plugAndPlayInstructions: ["How do they multiply results?", "What should they automate vs. keep personal?", "What does mastery look like?"]
  }
};

export const SECTION_ORDER = [
  "problem",
  "solution",
  "foundation",
  "discovery",
  "execution-1",
  "execution-2",
  "optimization",
  "scaling"
] as const;

export type SectionId = typeof SECTION_ORDER[number];

export const getSectionPromptById = (sectionId: string): SectionPrompt | undefined => {
  return SECTION_PROMPTS[sectionId];
};

export const generateSectionSystemPrompt = (
  section: SectionPrompt,
  writingStyle: string,
  styleDirective: string
): string => {
  return `You are creating Section ${section.number}: "${section.title}" for a comprehensive digital toolkit guide.

=== SECTION PURPOSE ===
${section.purpose}

=== SECTION DESCRIPTION ===
${section.description}

${styleDirective}

=== MANDATORY STRUCTURE ===
${section.structure.map((elem, i) => 
  `${i + 1}. ${elem.name} (${elem.sentenceCount}): ${elem.description}`
).join('\n')}

=== OUTPUT REQUIREMENTS ===
- Word count: ${section.wordTarget.min}-${section.wordTarget.max} words
- End with ACTION EXERCISE and REFLECTION PROMPT
- Use specific examples and concrete details
- Make content actionable and scannable
`;
};

export const generateSectionUserPrompt = (
  section: SectionPrompt,
  title: string,
  niche: string,
  targetAudience: string,
  thesis: string
): string => {
  return `Generate Section ${section.number}: "${section.title}" for guide titled "${title}".

=== CONTEXT ===
- Niche: ${niche}
- Target Audience: ${targetAudience}
- Core Thesis: ${thesis}

=== PLUG & PLAY CONTEXT ===
${section.plugAndPlayInstructions.map(q => `- ${q}`).join('\n')}

=== ENDING ===
📝 ACTION EXERCISE: "${section.actionExercise}"
🧠 REFLECTION: "${section.reflectionPrompt}"

Return ONLY the section content as plain text.`;
};
