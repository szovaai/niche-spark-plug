import { ShoppingBag, Swords, Globe, Workflow, Code, Check, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LaunchPlatform, PlatformInfo } from "@/types/launch";
import { PLATFORM_INFO } from "@/data/launchSteps";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  ShoppingBag,
  Swords,
  Globe,
  Workflow,
  Code,
};

interface PlatformSelectorProps {
  selectedPlatform: LaunchPlatform | null;
  onSelect: (platform: LaunchPlatform) => void;
}

export const PlatformSelector = ({ selectedPlatform, onSelect }: PlatformSelectorProps) => {
  const platforms = Object.values(PLATFORM_INFO);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Step 1: Choose Your Platform</h2>
          <p className="text-sm text-muted-foreground">
            Pick where you want to sell your toolkit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const Icon = iconMap[platform.icon] || ShoppingBag;
          const isSelected = selectedPlatform === platform.id;

          return (
            <Card
              key={platform.id}
              className={cn(
                "relative p-4 cursor-pointer transition-all hover:border-primary/50",
                isSelected && "border-primary bg-primary/5 ring-2 ring-primary/20"
              )}
              onClick={() => onSelect(platform.id)}
            >
              {platform.recommended && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Recommended
                </Badge>
              )}

              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{platform.name}</h3>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {platform.tagline}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-3">
                {platform.description}
              </p>

              <div className="mt-3 space-y-1">
                {platform.pros.slice(0, 2).map((pro, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-green-400">
                    <Check className="w-3 h-3" />
                    {pro}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
