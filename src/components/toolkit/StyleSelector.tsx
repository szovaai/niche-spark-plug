import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageCircle, Briefcase, BookOpen, ListChecks } from "lucide-react";
import type { WritingStyle } from "@/types/toolkit";

interface StyleSelectorProps {
  value: WritingStyle;
  onChange: (value: WritingStyle) => void;
}

const styleOptions: { value: WritingStyle; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: "conversational",
    label: "Conversational",
    description: "Friendly and casual, like talking to a friend",
    icon: MessageCircle,
  },
  {
    value: "professional",
    label: "Professional",
    description: "Expert-level, authoritative, business-focused",
    icon: Briefcase,
  },
  {
    value: "storytelling",
    label: "Storytelling",
    description: "Narrative-based with examples and anecdotes",
    icon: BookOpen,
  },
  {
    value: "step-by-step",
    label: "Step-by-Step",
    description: "Highly practical, action-oriented instructions",
    icon: ListChecks,
  },
];

const StyleSelector = ({ value, onChange }: StyleSelectorProps) => {
  const selectedStyle = styleOptions.find(s => s.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="writingStyle">
        Writing Style <span className="text-red-500">*</span>
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as WritingStyle)}>
        <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
          <SelectValue placeholder="Select a writing style">
            {selectedStyle && (
              <div className="flex items-center gap-2">
                <selectedStyle.icon className="w-4 h-4 text-muted-foreground" />
                <span>{selectedStyle.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700 z-50">
          {styleOptions.map((style) => (
            <SelectItem key={style.value} value={style.value}>
              <div className="flex items-center gap-2">
                <style.icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{style.label}</p>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StyleSelector;
