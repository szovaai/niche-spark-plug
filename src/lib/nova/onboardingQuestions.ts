// Client-side mirror of onboarding questions. Server keeps its own copy in
// supabase/functions/_shared/novaPrompts.ts — keep them in sync.

export type OnboardingQuestion = {
  id: string;
  field:
    | "preferred_name"
    | "interests"
    | "experience"
    | "audience"
    | "weekly_hours"
    | "budget_band"
    | "goals"
    | "camera_comfort";
  label: string;
  ask: (name?: string | null) => string;
  hint?: string;
  transform?: (raw: string) => unknown;
};

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "preferred_name",
    field: "preferred_name",
    label: "Your name",
    ask: () =>
      "Welcome. I'm Nova, your AI launch manager. My team and I will research, create, and help launch your digital product — you make the decisions, we do most of the work.\n\nWhat should I call you?",
  },
  {
    id: "interests",
    field: "interests",
    label: "Interests",
    hint: "Comma-separated is fine.",
    ask: (name) =>
      `Great to meet you${name ? `, ${name}` : ""}. What subjects, skills, or industries are you drawn to? Two or three is plenty.`,
    transform: (raw) =>
      raw.split(",").map((s) => s.trim()).filter(Boolean),
  },
  {
    id: "experience",
    field: "experience",
    label: "Experience",
    ask: () =>
      "What experience do you already have in those areas — hobbyist, self-taught, professional, teaching others?",
  },
  {
    id: "audience",
    field: "audience",
    label: "Ideal audience",
    ask: () =>
      "Who would you genuinely enjoy helping? Describe them in one sentence — a beginner, a busy parent, a small-business owner, whatever fits.",
  },
  {
    id: "weekly_hours",
    field: "weekly_hours",
    label: "Time each week",
    ask: () =>
      "Roughly how much time each week can you spend on this — a few hours, evenings, full-time?",
  },
  {
    id: "budget_band",
    field: "budget_band",
    label: "Budget comfort",
    ask: () =>
      "What's your comfort level with spending on tools or ads to launch — bootstrapping (under $50/mo), modest ($50–$200), or serious ($200+)?",
  },
  {
    id: "goals",
    field: "goals",
    label: "Goals",
    ask: () => "Are you after fast income, long-term brand growth, or both?",
  },
  {
    id: "camera_comfort",
    field: "camera_comfort",
    label: "Camera & audience",
    ask: () =>
      "Two last things: are you comfortable appearing on camera, and do you already have any audience, website, or social accounts I should know about?",
  },
];
