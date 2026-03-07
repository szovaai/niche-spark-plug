import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Zap, Users, Package } from "lucide-react";
import type { Step1Product } from "@/types/launchWizard";

interface Props {
  product: Step1Product;
  niche?: string;
  targetAudience?: string;
  compact?: boolean;
}

export default function LaunchDNACard({ product, niche, targetAudience, compact }: Props) {
  const items = [
    { icon: Package, label: "Product", value: product.title },
    { icon: Target, label: "Angle", value: product.selectedAngle },
    { icon: Zap, label: "Mechanism", value: product.uniqueMechanism },
    { icon: Users, label: "Audience", value: targetAudience || "General" },
  ].filter(item => item.value);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 flex-wrap">
        <Brain className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-semibold text-primary">Launch DNA</span>
        {items.map((item, i) => (
          <Badge key={i} variant="outline" className="text-xs gap-1">
            <item.icon className="w-3 h-3" />
            {item.value}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-sm">Launch DNA — AI Brain</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <item.icon className="w-3 h-3" />
                {item.label}
              </div>
              <p className="text-sm font-medium truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
