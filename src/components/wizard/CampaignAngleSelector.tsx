import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Target, TrendingUp } from "lucide-react";
import type { CampaignAngle } from "@/types/launchWizard";

interface Props {
  angles: CampaignAngle[];
  selectedAngle: string;
  onSelect: (name: string) => void;
  angleScores?: { angle: string; predictedConversion: string; reasoning: string }[];
}

export default function CampaignAngleSelector({ angles, selectedAngle, onSelect, angleScores }: Props) {
  if (!angles?.length) return null;

  const getScoreBadge = (angleName: string) => {
    if (!angleScores) return null;
    const score = angleScores.find(s => s.angle === angleName);
    if (!score) return null;
    const variant = score.predictedConversion === "High" ? "default" : "secondary";
    return (
      <Badge variant={variant} className="text-[10px] gap-0.5">
        <TrendingUp className="w-2.5 h-2.5" />
        {score.predictedConversion}
      </Badge>
    );
  };

  // Find recommended angle
  const recommendedAngle = angleScores?.find(s => s.predictedConversion === "High")?.angle;

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
          const isRecommended = recommendedAngle === angle.name && !selectedAngle;
          return (
            <Card
              key={angle.name}
              className={`cursor-pointer transition-all hover:border-primary/40 ${
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : ""
              } ${isRecommended ? "ring-1 ring-green-500/30" : ""}`}
              onClick={() => onSelect(angle.name)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                      {angle.name}
                    </Badge>
                    {isRecommended && <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-600">Recommended</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    {getScoreBadge(angle.name)}
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
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
