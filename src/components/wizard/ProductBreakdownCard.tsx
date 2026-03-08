import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package } from "lucide-react";

interface Module {
  module: string;
  title: string;
  description: string;
  value: number;
}

interface Bonus {
  name: string;
  description: string;
  value: number;
}

interface Props {
  modules: Module[];
  bonuses: Bonus[];
  askingPrice?: number;
}

export default function ProductBreakdownCard({ modules, bonuses, askingPrice }: Props) {
  const totalModuleValue = modules.reduce((sum, m) => sum + m.value, 0);
  const totalBonusValue = bonuses.reduce((sum, b) => sum + b.value, 0);
  const totalValue = totalModuleValue + totalBonusValue;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6 space-y-5">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Product Breakdown &amp; Value Stack
        </h3>

        {/* Modules */}
        <div className="space-y-3">
          {modules.map((m, i) => (
            <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] shrink-0">{m.module}</Badge>
                  <span className="font-semibold text-sm">{m.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
              <span className="text-sm font-bold text-muted-foreground shrink-0 ml-3">${m.value}</span>
            </div>
          ))}
        </div>

        {/* Bonuses */}
        {bonuses.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-accent flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Bonuses
            </h4>
            {bonuses.map((b, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-accent/5 border border-accent/10">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Bonus #{i + 1}: {b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </div>
                <span className="text-sm font-bold text-muted-foreground shrink-0 ml-3">${b.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-3xl font-black line-through text-muted-foreground">${totalValue}</p>
          {askingPrice && (
            <>
              <p className="text-sm text-muted-foreground">Today Only</p>
              <p className="text-4xl font-black text-primary">${askingPrice}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
