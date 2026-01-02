import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MessageCircle, Briefcase, BookOpen, ListChecks, ShieldCheck,
  Sparkles, Flame, Crown, Target, Heart
} from "lucide-react";
import type { WritingStyle } from "@/types/toolkit";

interface ContentControlsBarProps {
  humanize: boolean;
  onHumanizeChange: (value: boolean) => void;
  writingStyle: WritingStyle;
  onStyleChange: (value: WritingStyle) => void;
}

const styleOptions: { 
  value: WritingStyle; 
  label: string; 
  icon: React.ElementType;
  description: string;
}[] = [
  { 
    value: "conversational", 
    label: "Conversational", 
    icon: MessageCircle,
    description: "Warm & friendly, like chatting with a friend"
  },
  { 
    value: "professional", 
    label: "Professional", 
    icon: Briefcase,
    description: "Authority & expertise, trusted advisor tone"
  },
  { 
    value: "storytelling", 
    label: "Storytelling", 
    icon: BookOpen,
    description: "Narrative arc, hooks & before/after stories"
  },
  { 
    value: "step-by-step", 
    label: "Step-by-Step", 
    icon: ListChecks,
    description: "Action-first, numbered instructions"
  },
  { 
    value: "fun", 
    label: "Fun & Playful", 
    icon: Sparkles,
    description: "Energetic, uses humor and emojis 🎉"
  },
  { 
    value: "motivational", 
    label: "Motivational", 
    icon: Flame,
    description: "Inspiring, empowering, builds belief"
  },
  { 
    value: "empowering", 
    label: "Empowering", 
    icon: Crown,
    description: "Confidence-building, you-are-capable tone"
  },
  { 
    value: "tactical", 
    label: "Tactical", 
    icon: Target,
    description: "No-nonsense, military precision, action-only"
  },
  { 
    value: "coaching", 
    label: "Coaching", 
    icon: Heart,
    description: "Supportive, asks questions, builds reflection"
  },
];

const ContentControlsBar = ({
  humanize,
  onHumanizeChange,
  writingStyle,
  onStyleChange,
}: ContentControlsBarProps) => {
  const selectedStyle = styleOptions.find((s) => s.value === writingStyle);

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card/30 rounded-xl border border-border/50">
      {/* Humanize Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id="humanize"
          checked={humanize}
          onCheckedChange={onHumanizeChange}
        />
        <Label htmlFor="humanize" className="text-sm text-foreground cursor-pointer">
          Humanize Writing
        </Label>
      </div>

      {/* AI Optimized Badge */}
      <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary border-primary/20">
        <ShieldCheck className="w-3 h-3" />
        AI Detection Optimized
      </Badge>

      {/* Voice Selector */}
      <div className="flex items-center gap-2 ml-auto">
        <Label className="text-sm text-muted-foreground">Voice:</Label>
        <Select value={writingStyle} onValueChange={(v) => onStyleChange(v as WritingStyle)}>
          <SelectTrigger className="w-[180px] h-9 bg-background/50 border-border/50">
            <SelectValue>
              {selectedStyle && (
                <div className="flex items-center gap-2">
                  <selectedStyle.icon className="w-3.5 h-3.5" />
                  <span className="text-sm">{selectedStyle.label}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-[280px]">
            {styleOptions.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                <div className="flex items-start gap-2">
                  <style.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">{style.label}</span>
                    <span className="text-xs text-muted-foreground">{style.description}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ContentControlsBar;