import { Check } from "lucide-react";
import { SalesLetterStyle, SalesLetterStyleOption } from "@/types/toolkit";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SalesLetterStyleSelectorProps {
  selectedStyle: SalesLetterStyle;
  onStyleChange: (style: SalesLetterStyle) => void;
  disabled?: boolean;
}

const STYLE_OPTIONS: SalesLetterStyleOption[] = [
  {
    id: 'neutral',
    name: 'Neutral / Balanced',
    description: 'Clear, calm, professional tone. Logical structure with no hype or exaggeration. Platform-friendly and universally appealing.',
    bestFor: ['First-time users', 'WarriorPlus front-ends', 'Broad audiences', 'Compliance-sensitive platforms'],
    icon: '⚖️',
  },
  {
    id: 'direct-response',
    name: 'Classic Direct Response',
    description: 'Confident, authoritative tone with clear problem-solution framing. Logic-based persuasion with direct calls to action.',
    bestFor: ['Cold traffic', 'Info products', 'WarriorPlus vendors', 'Clarity-focused buyers'],
    icon: '🎯',
  },
  {
    id: 'story-selling',
    name: 'Funnel-Driven Story Selling',
    description: 'Relatable personal or situational story with a clear turning point. Emotional engagement first, then logic. Softer, guided CTA.',
    bestFor: ['Beginners', 'Lead magnets', 'Front-end offers', 'Relationship-driven funnels'],
    icon: '📖',
  },
  {
    id: 'aggressive',
    name: 'Aggressive Authority',
    description: 'Strong opening hooks and pattern interrupts. Confident, decisive language with short, punchy sentences. Clear authority presence.',
    bestFor: ['Experienced marketers', 'OTOs and upgrades', 'Directness-responsive audiences', 'Competitive niches'],
    icon: '🔥',
  },
  {
    id: 'conversational',
    name: 'Conversational / Modern',
    description: 'Friendly, approachable tone like a 1-to-1 conversation. Plain language with reduced sales pressure. Emphasis on trust and simplicity.',
    bestFor: ['Social traffic', 'Facebook Groups', 'Email warm-ups', 'Skeptical audiences'],
    icon: '💬',
  },
];

const SalesLetterStyleSelector = ({
  selectedStyle,
  onStyleChange,
  disabled = false,
}: SalesLetterStyleSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Sales Letter Style</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a persuasion style. Your offer stays the same — only the delivery changes.
        </p>
      </div>

      <div className="grid gap-3">
        {STYLE_OPTIONS.map((option) => {
          const isSelected = selectedStyle === option.id;
          const isRecommended = option.id === 'neutral';

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onStyleChange(option.id)}
              className={`relative flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Selection indicator */}
              <div
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.name}</span>
                  {isRecommended && (
                    <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {option.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {option.bestFor.slice(0, 3).map((use, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SalesLetterStyleSelector;
