import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Activity, DollarSign, Users, Eye, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

function AnimatedNum({ value, prefix = "" }: { value: number; prefix?: string }) {
  return <span>{prefix}{value.toLocaleString()}</span>;
}

export default function FunnelSimulation() {
  const [visitors, setVisitors] = useState(1000);
  const [optinRate, setOptinRate] = useState(30);
  const [salesRate, setSalesRate] = useState(3);
  const [price, setPrice] = useState(27);
  const [upsellRate, setUpsellRate] = useState(15);
  const [upsellPrice, setUpsellPrice] = useState(47);

  const leads = Math.round(visitors * (optinRate / 100));
  const sales = Math.round(leads * (salesRate / 100));
  const upsells = Math.round(sales * (upsellRate / 100));
  const feRevenue = sales * price;
  const upsellRevenue = upsells * upsellPrice;
  const totalRevenue = feRevenue + upsellRevenue;

  return (
    <DashboardLayout title="Funnel Simulation">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Funnel Simulation</h1>
          <p className="text-sm text-muted-foreground">Model your launch funnel performance with adjustable conversion rates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            {[
              { label: "Visitors", value: visitors, set: (v: number[]) => setVisitors(v[0]), min: 100, max: 10000, step: 100, icon: Eye },
              { label: "Opt-in Rate", value: optinRate, set: (v: number[]) => setOptinRate(v[0]), min: 5, max: 60, step: 1, icon: Users, suffix: "%" },
              { label: "Sales Conversion", value: salesRate, set: (v: number[]) => setSalesRate(v[0]), min: 1, max: 10, step: 0.5, icon: TrendingUp, suffix: "%" },
              { label: "Front-End Price", value: price, set: (v: number[]) => setPrice(v[0]), min: 7, max: 97, step: 1, icon: DollarSign, prefix: "$" },
              { label: "Upsell Take Rate", value: upsellRate, set: (v: number[]) => setUpsellRate(v[0]), min: 5, max: 40, step: 1, icon: Activity, suffix: "%" },
              { label: "Upsell Price", value: upsellPrice, set: (v: number[]) => setUpsellPrice(v[0]), min: 17, max: 197, step: 1, icon: DollarSign, prefix: "$" },
            ].map((ctrl) => (
              <Card key={ctrl.label} className="bg-card/40 backdrop-blur-md border-border/20">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ctrl.icon className="h-3.5 w-3.5 text-primary/60" />
                      <span className="text-xs font-medium">{ctrl.label}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{ctrl.prefix || ""}{ctrl.value}{ctrl.suffix || ""}</span>
                  </div>
                  <Slider value={[ctrl.value]} onValueChange={ctrl.set} min={ctrl.min} max={ctrl.max} step={ctrl.step} className="w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/20">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest">Funnel Flow</h3>
                {[
                  { label: "Traffic", value: visitors, color: "text-foreground" },
                  { label: "Leads", value: leads, color: "text-primary" },
                  { label: "Front-End Sales", value: sales, color: "text-chart-4" },
                  { label: "Upsell Sales", value: upsells, color: "text-accent" },
                ].map((row, i) => (
                  <motion.div key={row.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/5 border border-border/10">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className={`text-lg font-bold ${row.color}`}><AnimatedNum value={row.value} /></span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/15 backdrop-blur-md">
              <CardContent className="p-6 text-center space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest">Revenue Projection</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-lg font-bold text-primary"><AnimatedNum value={feRevenue} prefix="$" /></p>
                    <p className="text-[9px] text-muted-foreground/40 uppercase">Front-End</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-accent"><AnimatedNum value={upsellRevenue} prefix="$" /></p>
                    <p className="text-[9px] text-muted-foreground/40 uppercase">Upsells</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-chart-2"><AnimatedNum value={totalRevenue} prefix="$" /></p>
                    <p className="text-[9px] text-muted-foreground/40 uppercase">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
