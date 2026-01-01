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
import { MessageCircle, Briefcase, BookOpen, ListChecks, ShieldCheck } from "lucide-react";
import type { WritingStyle } from "@/types/toolkit";

interface ContentControlsBarProps {
  humanize: boolean;
  onHumanizeChange: (value: boolean) => void;
  writingStyle: WritingStyle;
  onStyleChange: (value: WritingStyle) => void;
}

const styleOptions: { value: WritingStyle; label: string; icon: React.ElementType }[] = [
  { value: "conversational", label: "Conversational", icon: MessageCircle },
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "storytelling", label: "Storytelling", icon: BookOpen },
  { value: "step-by-step", label: "Step-by-Step", icon: ListChecks },
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
          <SelectTrigger className="w-[160px] h-9 bg-background/50 border-border/50">
            <SelectValue>
              {selectedStyle && (
                <div className="flex items-center gap-2">
                  <selectedStyle.icon className="w-3.5 h-3.5" />
                  <span className="text-sm">{selectedStyle.label}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {styleOptions.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                <div className="flex items-center gap-2">
                  <style.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{style.label}</span>
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
