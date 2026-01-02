// Universal Toolkit Creator Framework - Section-Specific Prompts
// Each section has a detailed structure that ensures actionable, outcome-focused content

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

// The 8-section Universal Toolkit Framework
export const SECTION_PROMPTS: Record<string, SectionPrompt> = {
  problem: {
    id: "problem",
    number: 1,
    title: "The Problem",
    purpose: "Make the reader say 'This is exactly my problem'",
    description: "Hook the reader emotionally by describing their pain in vivid, relatable terms",
    structure: [
      {
        name: "EMPATHY HOOK",
        sentenceCount: "2-3 sentences",
        description: "Acknowledge their frustration in their words. Show you understand.",
        example: "Most people fail to get results because they treat this like a quick fix instead of a system. They try everything, get nowhere, and wonder what they're doing wrong."
      },
      {
        name: "SURFACE PAIN",
        sentenceCount: "3-4 sentences",
        description: "Describe what failure looks and feels like vividly. Paint the picture of their daily struggle.",
        example: "The daily frustration is real: You spend hours on the wrong activities, wait anxiously for results, and see... nothing. Meanwhile, others seem to effortlessly achieve what you're working so hard for."
      },
      {
        name: "HIDDEN CAUSE REVEAL",
        sentenceCount: "2-3 sentences",
        description: "Expose WHY their current approach fails. The insight that shifts their perspective.",
        example: "Here's what most people miss: The problem isn't effort—it's approach. You're using tactics from 5 years ago in today's environment."
      },
      {
        name: "PROMISE OF CLARITY",
        sentenceCount: "1-2 sentences",
        description: "Hint that a better, simpler system exists. Create hope without being salesy.",
        example: "This section will show you exactly why your current strategy is failing and what needs to change."
      }
    ],
    actionExercise: "Write 3 sentences that describe your audience's daily struggle with [topic]. Use their exact words if possible.",
    reflectionPrompt: "Complete this sentence: 'The truth is, it's not about [what they think the problem is]. It's about [the real problem].'",
    wordTarget: { min: 400, max: 470 },
    plugAndPlayInstructions: [
      "What is your audience trying to do?",
      "Why are they failing?",
      "What emotions do they feel (frustration, confusion, burnout)?",
      "What hidden cause explains those failures?"
    ]
  },

  solution: {
    id: "solution",
    number: 2,
    title: "The Solution Framework",
    purpose: "Introduce your core method or system (signature process)",
    description: "Position your method as THE structured, repeatable solution to the problem in Section 1",
    structure: [
      {
        name: "SYSTEM NAME",
        sentenceCount: "1-2 sentences",
        description: "Introduce your memorable 2-4 word system name. Make it sticky.",
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
        sentenceCount: "3-5 numbered items with explanations",
        description: "Outline the 3-5 key principles or stages of your system.",
        example: "Pillar 1: Signal Detection - Learn to spot buying intent. Pillar 2: Conversation-First Engagement - Build trust before pitching. Pillar 3: Natural Traffic Routing - Guide buyers to your offer seamlessly."
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
    wordTarget: { min: 400, max: 470 },
    plugAndPlayInstructions: [
      "What's your system called? (make it memorable)",
      "How many steps/pillars does it have?",
      "What result does it guarantee if followed correctly?",
      "How is it different from what people have already tried?"
    ]
  },

  foundation: {
    id: "foundation",
    number: 3,
    title: "Building Your Foundation",
    purpose: "Prepare the reader's mindset, tools, and environment for success",
    description: "Help users set up everything they need—both mentally and practically—before execution",
    structure: [
      {
        name: "SUCCESS DEFINITION",
        sentenceCount: "2-3 sentences",
        description: "Clarify what success looks like for this system. Set clear expectations.",
        example: "Before you start, let's define what 'success' means here. You're not trying to go viral or get thousands of followers. You're learning to have 3-5 conversations per week with people who are ready to buy."
      },
      {
        name: "MINDSET SHIFTS",
        sentenceCount: "3-4 sentences with 2-3 specific shifts",
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
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: [
      "What beliefs must the reader release or adopt?",
      "What physical or digital tools are essential?",
      "What checklist items ensure readiness?",
      "What's the minimum viable setup to get started?"
    ]
  },

  discovery: {
    id: "discovery",
    number: 4,
    title: "Discovery & Research",
    purpose: "Teach how to identify opportunities, audiences, or data relevant to the goal",
    description: "Teach users to observe, listen, and learn before they act—discovery prevents wasted effort",
    structure: [
      {
        name: "WHY RESEARCH FIRST",
        sentenceCount: "2-3 sentences",
        description: "Explain why research is the 'shortcut' that saves time and effort.",
        example: "Most people skip this step and pay for it later. 30 minutes of smart research can save you 30 hours of wasted effort. This is where you find the gold."
      },
      {
        name: "DISCOVERY PROCESS",
        sentenceCount: "4-6 steps with specific instructions",
        description: "Step-by-step method to find opportunities.",
        example: "Step 1: Enter 3 relevant groups/communities and observe for 48 hours. Step 2: Note which posts get thoughtful responses (not just likes). Step 3: Identify recurring questions and pain points. Step 4: Document the exact language people use."
      },
      {
        name: "WHAT TO LOOK FOR",
        sentenceCount: "3-4 specific indicators/patterns",
        description: "Concrete signals that indicate opportunity.",
        example: "Look for: 'Has anyone tried...' (research mode), 'I'm struggling with...' (pain point), 'What tool do you use for...' (ready to buy), 'I wish there was...' (unmet need)."
      },
      {
        name: "DISCOVERY WORKSHEET",
        sentenceCount: "A simple template/table structure",
        description: "Give them a structure to capture their research.",
        example: "Create a simple table: Source | Signal/Quote | Category (Ready to Buy / Researching / Just Curious) | Notes"
      }
    ],
    actionExercise: "Find and record 5 'signal-rich' sources in your niche. For each, note what types of opportunities you see.",
    reflectionPrompt: "What did you learn about what your audience truly wants that surprised you?",
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: [
      "Where does your target audience already gather?",
      "What questions or behaviors indicate opportunity?",
      "What data can you track and document?",
      "What patterns separate high-quality from low-quality opportunities?"
    ]
  },

  "execution-1": {
    id: "execution-1",
    number: 5,
    title: "Execution Plan Part 1",
    purpose: "Guide the reader through their first set of real-world actions",
    description: "Turn strategy into movement—give users their first tangible wins",
    structure: [
      {
        name: "READINESS RECAP",
        sentenceCount: "2-3 sentences",
        description: "Confirm what they've prepared and transition to action.",
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
        example: "Opening Script: 'Hey [Name], saw your post about [problem]. Here's what worked for me when I faced the same issue...' Follow-up Script: 'Would it help if I shared a quick resource on this?'"
      },
      {
        name: "FIRST WEEK SCHEDULE",
        sentenceCount: "A daily or weekly breakdown",
        description: "Specific time allocations and activities.",
        example: "Daily commitment: 20-30 minutes. Monday/Wednesday: Research and observe. Tuesday/Thursday: Engage and comment. Friday: DM follow-ups. Weekend: Review and plan."
      },
      {
        name: "WIN TRACKING",
        sentenceCount: "2-3 sentences with metrics to track",
        description: "How to measure first-week success.",
        example: "Track these metrics: Comments made, Conversations started, Responses received. Your goal for Week 1: 15 meaningful comments, 3 conversations started."
      }
    ],
    actionExercise: "Write 3 actions you can complete within the next 7 days that move you closer to your goal. Be specific.",
    reflectionPrompt: "What type of responses led to real conversations? What approach felt most natural?",
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: [
      "What is the reader's first measurable win?",
      "What daily or weekly routine should they follow?",
      "What scripts or templates can they use?",
      "How can they document progress?"
    ]
  },

  "execution-2": {
    id: "execution-2",
    number: 6,
    title: "Execution Plan Part 2",
    purpose: "Deepen implementation and begin optimizing",
    description: "Build on the basics—introduce advanced steps and refine based on feedback",
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
        example: "Advanced Move #1: Create a 'value-first' resource you can share. Advanced Move #2: Develop a follow-up sequence for warm leads. Advanced Move #3: Cross-reference signals across multiple communities."
      },
      {
        name: "DATA INTERPRETATION",
        sentenceCount: "3-4 sentences on what metrics mean",
        description: "Teach them to read their results and adjust.",
        example: "If you're getting comments but no DMs, your value isn't clear enough. If you're getting DMs but no conversions, your offer isn't connecting. If you're getting nothing, you're in the wrong community or using the wrong language."
      },
      {
        name: "SUCCESS INDICATORS",
        sentenceCount: "3-4 specific metrics/milestones",
        description: "How to know they're on track.",
        example: "Week 2 Targets: 5 meaningful conversations, 2 people asking about your offer, 1 resource/lead magnet shared at least 3 times."
      },
      {
        name: "OPTIMIZATION TIP",
        sentenceCount: "2-3 sentences",
        description: "A key insight for continuous improvement.",
        example: "Pro Tip: Keep a 'swipe file' of your best-performing comments and conversations. When something works, document exactly what you said and the context."
      }
    ],
    actionExercise: "Define your top 3 metrics for success and how you'll measure them weekly. What's your target for each?",
    reflectionPrompt: "What's working that you should double down on? What's not working that you should stop or adjust?",
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: [
      "How do users know they're making progress?",
      "What indicators should they track?",
      "How can they optimize based on data?",
      "What advanced techniques unlock better results?"
    ]
  },

  optimization: {
    id: "optimization",
    number: 7,
    title: "Optimization & Testing",
    purpose: "Refine and improve results continuously",
    description: "Turn the process into a system of feedback, learning, and iteration",
    structure: [
      {
        name: "WHY TESTING MATTERS",
        sentenceCount: "2-3 sentences",
        description: "Explain the power of systematic improvement.",
        example: "The difference between good and great results is testing. Small tweaks compound into massive differences over time. This section teaches you to become a scientist of your own success."
      },
      {
        name: "VARIABLES TO TEST",
        sentenceCount: "4-5 specific things to experiment with",
        description: "List what they can change and measure.",
        example: "Test these variables: (1) Time of day you engage, (2) Type of language (formal vs. casual), (3) Length of initial comment, (4) Speed of DM follow-up, (5) Type of value you lead with."
      },
      {
        name: "TESTING FRAMEWORK",
        sentenceCount: "A simple A/B or experiment structure",
        description: "Give them a methodology for testing.",
        example: "The Simple Test Method: Change ONE variable. Run it for 7 days. Measure the difference. Keep what works, discard what doesn't. Repeat."
      },
      {
        name: "TRACKING TABLE",
        sentenceCount: "A template for recording experiments",
        description: "Structure for capturing and comparing results.",
        example: "Testing Log: Variable Changed | What I Tried | Result | Keep or Drop | Lesson Learned"
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
    wordTarget: { min: 450, max: 520 },
    plugAndPlayInstructions: [
      "What are 3-5 variables your readers can test?",
      "How can they capture and compare results easily?",
      "What's the simplest testing methodology?",
      "How do they know when a test is conclusive?"
    ]
  },

  scaling: {
    id: "scaling",
    number: 8,
    title: "Scaling & Sustainability",
    purpose: "Help users grow results long-term and avoid burnout",
    description: "Show how to scale success while maintaining balance and quality",
    structure: [
      {
        name: "WHAT SCALING MEANS",
        sentenceCount: "2-3 sentences",
        description: "Define scaling in context—it's not just 'do more.'",
        example: "Scaling isn't about working harder—it's about working smarter. It means doing more of what works while removing what doesn't. It means systems, not hustle."
      },
      {
        name: "SCALING STRATEGIES",
        sentenceCount: "3-4 specific approaches",
        description: "Methods to multiply results without multiplying effort.",
        example: "Scale Strategy #1: Expand to 3-5 similar communities using the same playbook. Strategy #2: Create templated responses for common situations. Strategy #3: Batch your engagement into focused 30-minute blocks. Strategy #4: Build a referral loop from satisfied customers."
      },
      {
        name: "AUTOMATION & DELEGATION",
        sentenceCount: "2-3 sentences on what can be systematized",
        description: "Identify tasks that can be automated or handed off.",
        example: "What can be automated: Tracking and analytics, follow-up reminders, content scheduling. What requires you: Personal conversations, relationship building, closing."
      },
      {
        name: "SUSTAINABILITY CHECKLIST",
        sentenceCount: "4-5 checkbox items",
        description: "Habits and practices for long-term success.",
        example: "☐ Weekly 15-minute review of metrics. ☐ Monthly strategy adjustment. ☐ Quarterly goal reset. ☐ Daily time boundaries (no more than X hours). ☐ Regular system documentation."
      },
      {
        name: "VISION & MASTERY",
        sentenceCount: "2-3 sentences",
        description: "End with inspiration and the long-term picture.",
        example: "In 90 days, this system will feel effortless. In 6 months, you'll teach it to others. The goal isn't to do this forever—it's to master it so well that it becomes second nature."
      }
    ],
    actionExercise: "Write your 'Success Maintenance Plan'—how you'll keep results growing 90 days from now.",
    reflectionPrompt: "What does success look like in 1 year? What systems will you have in place?",
    wordTarget: { min: 430, max: 500 },
    plugAndPlayInstructions: [
      "What does growth look like in this context?",
      "What tasks can be automated or delegated?",
      "How can the reader sustain momentum?",
      "What's the vision of mastery?"
    ]
  }
};

// Map section IDs to their prompts for the edge function
export const getSectionPromptById = (sectionId: string): SectionPrompt | undefined => {
  return SECTION_PROMPTS[sectionId];
};

// Generate the full prompt for a section
export const generateSectionSystemPrompt = (
  section: SectionPrompt,
  writingStyle: string,
  styleDirective: string
): string => {
  const structureInstructions = section.structure.map((elem, i) => 
    `${i + 1}. ${elem.name} (${elem.sentenceCount}):\n   ${elem.description}\n   ${elem.example ? `Example: "${elem.example}"` : ''}`
  ).join('\n\n');

  return `You are an expert educational content creator writing Section ${section.number}: "${section.title}" of a comprehensive guide.

=== SECTION PURPOSE ===
${section.purpose}

=== MANDATORY STRUCTURE ===
Every section MUST include ALL of these elements:

${structureInstructions}

=== ACTION EXERCISE ===
End the section with this fill-in exercise:
"${section.actionExercise}"

=== REFLECTION PROMPT ===
Include this reflection question:
"${section.reflectionPrompt}"

=== WRITING REQUIREMENTS ===
${styleDirective}

- Word Target: ${section.wordTarget.min}-${section.wordTarget.max} words
- Use specific examples, numbers, and concrete details
- Make every sentence teach, inspire, or prompt action
- Write in second person (you, your)
- Sound like a knowledgeable mentor, not a textbook`;
};

// Generate the user prompt for section generation
export const generateSectionUserPrompt = (
  section: SectionPrompt,
  title: string,
  niche: string,
  targetAudience: string,
  thesis: string
): string => {
  return `Generate Section ${section.number}: "${section.title}" for a guide titled "${title}".

=== CONTEXT ===
- Toolkit Title: "${title}"
- Niche: ${niche}
- Target Audience: ${targetAudience || "entrepreneurs and professionals seeking practical solutions"}
- Core Thesis: ${thesis || `This guide helps readers master ${niche} through a proven, step-by-step system.`}

=== PLUG-AND-PLAY QUESTIONS (use these to shape the content) ===
${section.plugAndPlayInstructions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

=== OUTPUT REQUIREMENTS ===
- Write ${section.wordTarget.min}-${section.wordTarget.max} words
- Include ALL structure elements specified in your instructions
- End with the Action Exercise and Reflection Prompt
- Return ONLY the section content as plain text (NOT JSON)
- Make it immediately actionable for the target audience`;
};

// Get section order for compilation
export const SECTION_ORDER = [
  'problem',
  'solution', 
  'foundation',
  'discovery',
  'execution-1',
  'execution-2',
  'optimization',
  'scaling'
] as const;

export type SectionId = typeof SECTION_ORDER[number];
