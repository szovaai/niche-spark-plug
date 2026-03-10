import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { ArrowDown, Users, UserCheck, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export default function ProfitMap() {
  const [traffic, setTraffic] = useState(3000);
  const [optInRate, setOptInRate] = useState(30);
  const [conversionRate, setConversionRate] = useState(3);
  const [price, setPrice] = useState(27);
  const [upsellPrice, setUpsellPrice] = useState(67);
  const [upsellConversion, setUpsellConversion] = useState(20);

  const calc = useMemo(() => {
    const leads = Math.round(traffic * (optInRate / 100));
    const buyers = Math.round(leads * (conversionRate / 100));
    const frontEnd = buyers * price;
    const upsellBuyers = Math.round(buyers * (upsellConversion / 100));
    const upsellRev = upsellBuyers * upsellPrice;
    return { leads, buyers, frontEnd, upsellBuyers, upsellRev, total: frontEnd + upsellRev };
  }, [traffic, optInRate, conversionRate, price, upsellPrice, upsellConversion]);

  const funnelSteps = [
    { label: "Visitors", value: traffic.toLocaleString(), icon: Users, color: "text-muted-foreground" },
    { label: "Leads", value: calc.leads.toLocaleString(), icon: UserCheck, color: "text-primary" },
    { label: "Buyers", value: calc.buyers.toLocaleString(), icon: ShoppingCart, color: "text-accent" },
    { label: "Revenue", value: `$${calc.total.toLocaleString()}`, icon: DollarSign, color: "text-green-400" },
  ];

  const sliders = [
    { label: "Traffic (visitors)", value: traffic, set: setTraffic, min: 100, max: 50000, step: 100 },
    { label: "Opt-in Rate (%)", value: optInRate, set: setOptInRate, min: 1, max: 80, step: 1 },
    { label: "Conversion Rate (%)", value: conversionRate, set: setConversionRate, min: 0.5, max: 20, step: 0.5 },
    { label: "Product Price ($)", value: price, set: setPrice, min: 5, max: 497, step: 1 },
    { label: "Upsell Price ($)", value: upsellPrice, set: setUpsellPrice, min: 0, max: 497, step: 1 },
    { label: "Upsell Conversion (%)", value: upsellConversion, set: setUpsellConversion, min: 0, max: 50, step: 1 },
  ];

  return (
    <DashboardLayout title="Profit Map">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Visual Funnel Flow */}
        <div className="flex flex-col items-center gap-2">
          {funnelSteps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-full max-w-sm"
            >
              <Card className="bg-card/60 backdrop-blur-xl border-border/20">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                    <span className="text-sm font-medium text-muted-foreground">{step.label}</span>
                  </div>
                  <span className={`text-lg font-bold ${step.color}`}>{step.value}</span>
                </CardContent>
              </Card>
              {i < funnelSteps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Front-End Revenue", value: calc.frontEnd },
            { label: "Upsell Revenue", value: calc.upsellRev },
            { label: "Total Revenue", value: calc.total, highlight: true },
          ].map((card) => (
            <Card key={card.label} className={`bg-card/60 backdrop-blur-xl border-border/20 ${card.highlight ? "ring-1 ring-primary/30" : ""}`}>
              <CardContent className="p-5 text-center">
                <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.highlight ? "text-primary" : "text-foreground"}`}>
                  ${card.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sliders */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Adjust Variables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sliders.map((s) => (
              <div key={s.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
                <Slider
                  value={[s.value]}
                  onValueChange={([v]) => s.set(v)}
                  min={s.min}
                  max={s.max}
                  step={s.step}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
