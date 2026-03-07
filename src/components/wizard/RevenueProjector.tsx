import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp } from "lucide-react";

export default function RevenueProjector() {
  const [price, setPrice] = useState(27);
  const [salesPerDay, setSalesPerDay] = useState(3);

  const daily = price * salesPerDay;
  const monthly = daily * 30;
  const yearly = daily * 365;

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Revenue Projector</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Product Price</label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-8 text-right"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Sales per day</label>
              <span className="text-sm font-semibold">{salesPerDay}</span>
            </div>
            <Slider
              value={[salesPerDay]}
              onValueChange={([v]) => setSalesPerDay(v)}
              min={1}
              max={50}
              step={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-background/60">
            <p className="text-xs text-muted-foreground">Daily</p>
            <p className="text-lg font-bold text-primary">${daily.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/60">
            <p className="text-xs text-muted-foreground">Monthly</p>
            <p className="text-lg font-bold text-accent">${monthly.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/60">
            <p className="text-xs text-muted-foreground">Yearly</p>
            <p className="text-lg font-bold text-green-500">${yearly.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>Just {salesPerDay} sale{salesPerDay > 1 ? "s" : ""}/day = ${yearly.toLocaleString()}/year</span>
        </div>
      </CardContent>
    </Card>
  );
}
