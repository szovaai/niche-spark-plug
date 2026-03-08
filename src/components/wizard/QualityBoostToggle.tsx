import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

interface Props {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

export default function QualityBoostToggle({ enabled, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
      <Sparkles className="w-4 h-4 text-accent shrink-0" />
      <Label htmlFor="quality-boost" className="text-sm font-medium cursor-pointer flex-1">
        Premium Quality Mode
        <span className="block text-xs text-muted-foreground font-normal">
          Case studies, data points, pro tips & enhanced formatting
        </span>
      </Label>
      <Switch id="quality-boost" checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}
