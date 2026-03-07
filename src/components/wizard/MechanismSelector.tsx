import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import type { Mechanism } from "@/types/launchWizard";

interface Props {
  mechanisms: Mechanism[];
  selectedMechanism: string;
  onSelect: (mechanism: Mechanism) => void;
}

export default function MechanismSelector({ mechanisms, selectedMechanism, onSelect }: Props) {
  if (!mechanisms?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-accent" />
        <h4 className="font-semibold text-sm">Choose Your Unique Mechanism</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Your unique mechanism is the proprietary framework that makes your product different. It will be woven into all your copy.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {mechanisms.map((mech) => {
          const isSelected = selectedMechanism === mech.name;
          return (
            <Card
              key={mech.name}
              className={`cursor-pointer transition-all hover:border-accent/40 ${
                isSelected ? "border-accent bg-accent/5 ring-1 ring-accent/30" : ""
              }`}
              onClick={() => onSelect(mech)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={isSelected ? "default" : "secondary"} className="text-xs bg-accent/20 text-accent-foreground">
                    Framework
                  </Badge>
                  {isSelected && <Check className="w-4 h-4 text-accent" />}
                </div>
                <p className="text-sm font-bold">{mech.name}</p>
                <p className="text-xs text-primary italic">{mech.tagline}</p>
                <p className="text-xs text-muted-foreground">{mech.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
