import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Target } from "lucide-react";
import type { CampaignAngle } from "@/types/launchWizard";

interface Props {
  angles: CampaignAngle[];
  selectedAngle: string;
  onSelect: (name: string) => void;
}

export default function CampaignAngleSelector({ angles, selectedAngle, onSelect }: Props) {
  if (!angles?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-sm">Choose Your Campaign Angle</h4>
      </div>
      <p className="text-xs text-muted-foreground">This angle will be used consistently across your funnel, emails, and ads.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {angles.map((angle) => {
          const isSelected = selectedAngle === angle.name;
          return (
            <Card
              key={angle.name}
              className={`cursor-pointer transition-all hover:border-primary/40 ${
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : ""
              }`}
              onClick={() => onSelect(angle.name)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                    {angle.name}
                  </Badge>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-sm font-medium">{angle.hook}</p>
                <p className="text-xs text-muted-foreground">{angle.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
