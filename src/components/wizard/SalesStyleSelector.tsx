import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Zap, FileText, Video, Layout } from "lucide-react";
import type { SalesStyle } from "@/types/launchWizard";

interface Props {
  value: SalesStyle;
  onChange: (v: SalesStyle) => void;
  disabled?: boolean;
}

const STYLES: { value: SalesStyle; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "warriorplus", label: "High-Converting Sales Style", desc: "Urgency, scarcity, pattern interrupts, value stacking", icon: Zap },
  { value: "longform", label: "Long-Form Copy", desc: "Classic Dan Kennedy letter — story-driven, fascinations", icon: FileText },
  { value: "vsl", label: "VSL Script", desc: "Teleprompter-ready video sales letter with timing cues", icon: Video },
  { value: "short", label: "Short Landing Page", desc: "Hero + mechanism + stack + CTA — no fluff", icon: Layout },
];

export default function SalesStyleSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Sales Page Style</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as SalesStyle)} className="grid grid-cols-1 sm:grid-cols-2 gap-3" disabled={disabled}>
        {STYLES.map(s => {
          const Icon = s.icon;
          const isSelected = value === s.value;
          return (
            <label
              key={s.value}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            >
              <RadioGroupItem value={s.value} className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-sm">{s.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
