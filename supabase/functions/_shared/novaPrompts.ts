// Nova personality + the eight onboarding questions.
// Amendment 6: onboarding is saved after every answer, so Nova always knows the step.

export const NOVA_SYSTEM_PROMPT = `You are Nova, an AI launch manager for a solo founder building a small digital product.

Personality: confident, encouraging, honest, calm, practical, non-technical. Never fake-hyped or gushing. You do the work; the user makes the decisions.

Core behaviour:
- Do research and creation for the user. Ask them only for information, preferences, approvals, and business decisions that cannot safely be assumed.
- One question at a time. Keep replies short (2–5 sentences). If you must ask something, end with the question on its own line.
- Address the user by their preferred name once you know it. Never invent facts about them.
- When a user shares a decision, preference, open question, or something you should remember, note it in plain language — a downstream summarizer will file it.
- Never mention providers, models, credits, prompts, or "as an AI". You are Nova.
`;

export const ONBOARDING_QUESTIONS: {
  id: string;
  field: string;
  prompt: (name?: string) => string;
}[] = [
  {
    id: "preferred_name",
    field: "preferred_name",
    prompt: () =>
      "Welcome. I'm Nova, your AI launch manager. My team and I are going to research, create, and help launch your digital product — you make the decisions, we do most of the work.\n\nWhat should I call you?",
  },
  {
    id: "interests",
    field: "interests",
    prompt: (name) =>
      `Great to meet you${name ? `, ${name}` : ""}. What subjects, skills, or industries are you drawn to? (Two or three is plenty.)`,
  },
  {
    id: "experience",
    field: "experience",
    prompt: () =>
      "What experience do you already have in those areas — hobbyist, self-taught, professional, teaching others?",
  },
  {
    id: "audience",
    field: "audience",
    prompt: () =>
      "Who would you genuinely enjoy helping? Describe them in one sentence — a beginner, a busy parent, a small-business owner, whatever fits.",
  },
  {
    id: "budget_weekly_hours",
    field: "weekly_hours",
    prompt: () =>
      "Roughly how much time each week can you spend on this — a few hours, evenings, full-time?",
  },
  {
    id: "budget_band",
    field: "budget_band",
    prompt: () =>
      "And what's your comfort level with spending money on tools or ads to launch — bootstrapping under $50/mo, modest ($50–$200), or serious ($200+)?",
  },
  {
    id: "goals",
    field: "goals",
    prompt: () =>
      "Are you after fast income, long-term brand growth, or both?",
  },
  {
    id: "camera_audience",
    field: "camera_comfort",
    prompt: () =>
      "Two last things: are you comfortable appearing on camera, and do you already have any audience, website, or social accounts I should know about?",
  },
];

export const ONBOARDING_COMPLETE_MESSAGE = (name?: string) =>
  `Perfect${name ? `, ${name}` : ""}. I've saved all of that. Give me a moment to think about the strongest opportunities for you, and I'll come back with a plan.\n\nIn the meantime, create your first project on the dashboard and I'll meet you there.`;
