import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, BookOpen, BarChart3, Sparkles, MessageSquare } from "lucide-react";

export type WritingVoice = "mentor" | "authority" | "data-driven" | "storyteller" | "no-nonsense";

interface VoiceToneSelectorProps {
  value: WritingVoice;
  onChange: (v: WritingVoice) => void;
  disabled?: boolean;
}

const VOICES: { key: WritingVoice; label: string; icon: typeof Mic; description: string; example: string }[] = [
  {
    key: "mentor",
    label: "Friendly Mentor",
    icon: MessageSquare,
    description: "Warm, encouraging, like a coach talking to a friend",
    example: '"Here\'s the cool part — you don\'t need any experience to pull this off."',
  },
  {
    key: "authority",
    label: "Authority Expert",
    icon: BookOpen,
    description: "Confident, credible, backed by experience",
    example: '"After 12 years in this space, I can tell you: this is the fastest path."',
  },
  {
    key: "data-driven",
    label: "Data-Driven",
    icon: BarChart3,
    description: "Numbers-first, research-backed, analytical",
    example: '"Studies show 73% of beginners who use this method see results in 14 days."',
  },
  {
    key: "storyteller",
    label: "Storyteller",
    icon: Sparkles,
    description: "Narrative-driven, emotional, transformation-focused",
    example: '"Sarah was stuck at $0 for 6 months. Then she discovered one thing..."',
  },
  {
    key: "no-nonsense",
    label: "No-Nonsense",
    icon: Mic,
    description: "Direct, blunt, zero fluff — action-only",
    example: '"Skip the theory. Open your laptop. Do exactly this. Right now."',
  },
];

export default function VoiceToneSelector({ value, onChange, disabled }: VoiceToneSelectorProps) {
  return (
    <Card className="border-accent/20">
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="font-semibold text-sm flex items-center gap-2">
            <Mic className="w-4 h-4 text-accent" />
            Writing Voice
          </p>
          <p className="text-xs text-muted-foreground">Choose the personality and tone for your content</p>
        </div>
        <RadioGroup
          value={value}
          onValueChange={(v) => onChange(v as WritingVoice)}
          className="grid gap-2"
          disabled={disabled}
        >
          {VOICES.map((voice) => (
            <Label
              key={voice.key}
              htmlFor={`voice-${voice.key}`}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                value === voice.key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <RadioGroupItem value={voice.key} id={`voice-${voice.key}`} className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <voice.icon className="w-3.5 h-3.5 text-accent" />
                  <span className="text-sm font-medium">{voice.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{voice.description}</p>
                <p className="text-xs italic text-muted-foreground/70 mt-1">{voice.example}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export function getVoicePromptDirective(voice: WritingVoice): string {
  switch (voice) {
    case "mentor":
      return `WRITING VOICE: Friendly Mentor — Write like a warm, encouraging coach. Use "you" constantly. Add phrases like "Here's the cool part", "Quick win incoming", "This is where it gets good". Be conversational and supportive. Use contractions.`;
    case "authority":
      return `WRITING VOICE: Authority Expert — Write with confident expertise. Reference years of experience. Use phrases like "In my experience", "What most people miss is", "The data is clear". Be assertive but not arrogant. Back claims with specifics.`;
    case "data-driven":
      return `WRITING VOICE: Data-Driven — Lead with numbers, statistics, and research. Every major claim needs a number attached. Use phrases like "Studies show", "The data reveals", "73% of users report". Be precise and analytical while remaining readable.`;
    case "storyteller":
      return `WRITING VOICE: Storyteller — Open every section with a mini-story. Use names, specific situations, emotional details. Paint before/after pictures vividly. Use phrases like "Picture this", "Imagine waking up to", "That's exactly what happened to". Create emotional momentum.`;
    case "no-nonsense":
      return `WRITING VOICE: No-Nonsense — Be ultra-direct. Short sentences only. No filler, no stories unless they prove a point in 2 sentences. Use commands: "Do this.", "Stop doing that.", "Open your laptop right now." Every paragraph must contain an action or a result. Cut all warm-up intros.`;
    default:
      return "";
  }
}
