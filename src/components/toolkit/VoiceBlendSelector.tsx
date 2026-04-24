import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { WritingStyle, BlendRatio, VoiceBlend } from "@/types/toolkit";
import { Layers } from "lucide-react";

const VOICE_OPTIONS: { value: WritingStyle; label: string; essence: string }[] = [
  { value: "tactical", label: "No-Nonsense", essence: "direct, action-focused, zero-fluff" },
  { value: "coaching", label: "Friendly Mentor", essence: "encouraging, supportive, reflective" },
  { value: "conversational", label: "Conversational", essence: "warm, friendly, coffee-chat" },
  { value: "professional", label: "Professional", essence: "authoritative, expert advisor" },
  { value: "storytelling", label: "Storytelling", essence: "narrative, before/after, hooks" },
  { value: "step-by-step", label: "Step-by-Step", essence: "numbered, instructional" },
  { value: "fun", label: "Fun & Playful", essence: "energetic, humorous" },
  { value: "motivational", label: "Motivational", essence: "inspiring, belief-building" },
  { value: "empowering", label: "Empowering", essence: "confidence-building" },
];

const RATIOS: BlendRatio[] = ["70/30", "60/40", "50/50"];

const labelOf = (v?: WritingStyle | null) =>
  VOICE_OPTIONS.find(o => o.value === v)?.label || "—";

interface Props {
  value: VoiceBlend;
  onChange: (v: VoiceBlend) => void;
}

export default function VoiceBlendSelector({ value, onChange }: Props) {
  const [primaryPct, secondaryPct] = value.ratio.split("/").map(Number);
  const primaryLabel = labelOf(value.primary);
  const secondaryLabel = labelOf(value.secondary);

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card/30">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        <Label className="text-sm font-semibold">Writing Voice Blend</Label>
        <Badge variant="secondary" className="ml-auto text-xs">Up to 2 voices</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Primary Voice</Label>
          <Select value={value.primary} onValueChange={(v) => onChange({ ...value, primary: v as WritingStyle })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} disabled={o.value === value.secondary}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Secondary Voice (optional)</Label>
          <Select
            value={value.secondary || "none"}
            onValueChange={(v) => onChange({ ...value, secondary: v === "none" ? null : (v as WritingStyle) })}
          >
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (single voice)</SelectItem>
              {VOICE_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} disabled={o.value === value.primary}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {value.secondary && (
        <>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Blend Ratio</Label>
            <div className="flex gap-2">
              {RATIOS.map(r => (
                <Button
                  key={r}
                  type="button"
                  variant={value.ratio === r ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChange({ ...value, ratio: r })}
                  className="flex-1"
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-3">
            Write in {primaryPct}% {primaryLabel}, {secondaryPct}% {secondaryLabel}.
          </p>
        </>
      )}
    </div>
  );
}
