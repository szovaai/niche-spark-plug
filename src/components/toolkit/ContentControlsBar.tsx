import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Layers3, Sparkles, DollarSign, Gauge } from "lucide-react";
import type { WritingStyle, ContentDepth, VoiceBlend } from "@/types/toolkit";
import VoiceBlendSelector from "./VoiceBlendSelector";
import {
  QUALITY_MODES,
  previewModel,
  costLabel,
  speedLabel,
  type QualityMode,
} from "@/lib/aiRouting";
import { useAIRoutingPrefs } from "@/hooks/useAIRoutingPrefs";

interface ContentControlsBarProps {
  humanize: boolean;
  onHumanizeChange: (value: boolean) => void;
  writingStyle: WritingStyle;
  onStyleChange: (value: WritingStyle) => void;
  contentDepth?: ContentDepth;
  onDepthChange?: (value: ContentDepth) => void;
  voiceBlend?: VoiceBlend;
  onVoiceBlendChange?: (v: VoiceBlend) => void;
  /** Per-project AI quality override. `null` means inherit user's global default. */
  qualityModeOverride?: QualityMode | null;
  onQualityModeOverrideChange?: (v: QualityMode | null) => void;
}

const DEPTH_OPTIONS: { value: ContentDepth; label: string; desc: string }[] = [
  { value: "quick", label: "Quick", desc: "20–30 page guide · 5 chapters" },
  { value: "standard", label: "Standard", desc: "40–60 page guide · 6 chapters" },
  { value: "premium", label: "Premium", desc: "80–120 page guide · 8 chapters" },
  { value: "authority", label: "Authority", desc: "150+ page guide · 10 chapters" },
];

const ContentControlsBar = ({
  humanize,
  onHumanizeChange,
  writingStyle,
  onStyleChange,
  contentDepth,
  onDepthChange,
  voiceBlend,
  onVoiceBlendChange,
}: ContentControlsBarProps) => {
  // If new voice blend is provided, render the rich selector. Otherwise fall back
  // to the original single-voice control so existing call-sites keep working.
  const useBlend = !!voiceBlend && !!onVoiceBlendChange;

  return (
    <div className="space-y-3 p-4 bg-card/30 rounded-xl border border-border/50">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch id="humanize" checked={humanize} onCheckedChange={onHumanizeChange} />
          <Label htmlFor="humanize" className="text-sm cursor-pointer">Humanize Writing</Label>
        </div>

        <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary border-primary/20">
          <ShieldCheck className="w-3 h-3" />
          AI Detection Optimized
        </Badge>

        {contentDepth && onDepthChange && (
          <div className="flex items-center gap-2 ml-auto">
            <Layers3 className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-sm text-muted-foreground">Depth:</Label>
            <Select value={contentDepth} onValueChange={(v) => onDepthChange(v as ContentDepth)}>
              <SelectTrigger className="w-[200px] h-9 bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTH_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{o.label}</span>
                      <span className="text-xs text-muted-foreground">{o.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {useBlend ? (
        <VoiceBlendSelector value={voiceBlend!} onChange={onVoiceBlendChange!} />
      ) : (
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Voice:</Label>
          <Select value={writingStyle} onValueChange={(v) => onStyleChange(v as WritingStyle)}>
            <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="conversational">Conversational</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="storytelling">Storytelling</SelectItem>
              <SelectItem value="step-by-step">Step-by-Step</SelectItem>
              <SelectItem value="fun">Fun & Playful</SelectItem>
              <SelectItem value="motivational">Motivational</SelectItem>
              <SelectItem value="empowering">Empowering</SelectItem>
              <SelectItem value="tactical">No-Nonsense (Tactical)</SelectItem>
              <SelectItem value="coaching">Friendly Mentor (Coaching)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ContentControlsBar;
