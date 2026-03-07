import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Download, ChevronDown, ChevronUp } from "lucide-react";

type Scenario = "conservative" | "optimistic" | "bestCase";

const SCENARIO_DEFAULTS: Record<Scenario, { oto1Conv: number; oto2Conv: number; emailGrowth: number }> = {
  conservative: { oto1Conv: 10, oto2Conv: 5, emailGrowth: 100 },
  optimistic: { oto1Conv: 25, oto2Conv: 12, emailGrowth: 300 },
  bestCase: { oto1Conv: 40, oto2Conv: 20, emailGrowth: 500 },
};

export default function RevenueProjector() {
  const [price, setPrice] = useState(27);
  const [salesPerDay, setSalesPerDay] = useState(3);
  const [scenario, setScenario] = useState<Scenario>("optimistic");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // OTO / Upsell
  const [oto1Price, setOto1Price] = useState(97);
  const [oto1Conv, setOto1Conv] = useState(SCENARIO_DEFAULTS[scenario].oto1Conv);
  const [oto2Price, setOto2Price] = useState(197);
  const [oto2Conv, setOto2Conv] = useState(SCENARIO_DEFAULTS[scenario].oto2Conv);

  // Email
  const [emailListGrowth, setEmailListGrowth] = useState(SCENARIO_DEFAULTS[scenario].emailGrowth);
  const [emailProductPrice, setEmailProductPrice] = useState(47);
  const [emailConvRate, setEmailConvRate] = useState(3);

  const handleScenario = (s: Scenario) => {
    setScenario(s);
    setOto1Conv(SCENARIO_DEFAULTS[s].oto1Conv);
    setOto2Conv(SCENARIO_DEFAULTS[s].oto2Conv);
    setEmailListGrowth(SCENARIO_DEFAULTS[s].emailGrowth);
  };

  // Calculations
  const dailyFE = price * salesPerDay;
  const dailyOTO1 = (salesPerDay * (oto1Conv / 100)) * oto1Price;
  const dailyOTO2 = (salesPerDay * (oto2Conv / 100)) * oto2Price;
  const dailyTotal = dailyFE + dailyOTO1 + dailyOTO2;
  const monthlyFrontEnd = dailyTotal * 30;

  const monthlyEmailRevenue = (emailListGrowth * (emailConvRate / 100)) * emailProductPrice;
  const monthlyTotal = monthlyFrontEnd + monthlyEmailRevenue;
  const yearlyTotal = monthlyTotal * 12;

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Revenue Projection", 20, 25);
    doc.setFontSize(11);
    doc.text(`Scenario: ${scenario}`, 20, 38);
    doc.text(`Front-End Price: $${price} × ${salesPerDay} sales/day`, 20, 50);
    doc.text(`OTO1: $${oto1Price} @ ${oto1Conv}% = $${dailyOTO1.toFixed(0)}/day`, 20, 60);
    doc.text(`OTO2: $${oto2Price} @ ${oto2Conv}% = $${dailyOTO2.toFixed(0)}/day`, 20, 70);
    doc.text(`Email List Growth: ${emailListGrowth}/mo @ ${emailConvRate}% × $${emailProductPrice}`, 20, 80);
    doc.setFontSize(14);
    doc.text(`Daily: $${dailyTotal.toLocaleString()}`, 20, 100);
    doc.text(`Monthly: $${monthlyTotal.toLocaleString()}`, 20, 112);
    doc.text(`Yearly: $${yearlyTotal.toLocaleString()}`, 20, 124);
    doc.save("revenue-projection.pdf");
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Revenue Projector</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={exportPDF} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> PDF
          </Button>
        </div>

        {/* Scenario Tabs */}
        <Tabs value={scenario} onValueChange={(v) => handleScenario(v as Scenario)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="conservative" className="text-xs">Conservative</TabsTrigger>
            <TabsTrigger value="optimistic" className="text-xs">Optimistic</TabsTrigger>
            <TabsTrigger value="bestCase" className="text-xs">Best Case</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Front-End */}
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
            <Slider value={[salesPerDay]} onValueChange={([v]) => setSalesPerDay(v)} min={1} max={50} step={1} />
          </div>
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showAdvanced ? "Hide" : "Show"} OTO & Email Layers
        </button>

        {showAdvanced && (
          <div className="space-y-4 p-3 rounded-lg bg-background/40 border border-border/50">
            {/* OTO1 */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">OTO 1 (Upsell)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Price</label>
                  <Input type="number" value={oto1Price} onChange={(e) => setOto1Price(parseInt(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Conv %</label>
                  <Input type="number" value={oto1Conv} onChange={(e) => setOto1Conv(Math.min(100, parseInt(e.target.value) || 0))} className="h-8 text-sm" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">= ${dailyOTO1.toFixed(0)}/day</p>
            </div>

            {/* OTO2 */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">OTO 2 (Premium)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Price</label>
                  <Input type="number" value={oto2Price} onChange={(e) => setOto2Price(parseInt(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Conv %</label>
                  <Input type="number" value={oto2Conv} onChange={(e) => setOto2Conv(Math.min(100, parseInt(e.target.value) || 0))} className="h-8 text-sm" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">= ${dailyOTO2.toFixed(0)}/day</p>
            </div>

            {/* Email List */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Email List Revenue</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">New subs/mo</label>
                  <Input type="number" value={emailListGrowth} onChange={(e) => setEmailListGrowth(parseInt(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Conv %</label>
                  <Input type="number" value={emailConvRate} onChange={(e) => setEmailConvRate(Math.min(100, parseInt(e.target.value) || 0))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Product $</label>
                  <Input type="number" value={emailProductPrice} onChange={(e) => setEmailProductPrice(parseInt(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">= ${monthlyEmailRevenue.toFixed(0)}/month</p>
            </div>
          </div>
        )}

        {/* Revenue Cascade */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Front-End Sales</span>
            <span>${dailyFE.toLocaleString()}/day</span>
          </div>
          {showAdvanced && (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>+ OTO Revenue</span>
                <span>${(dailyOTO1 + dailyOTO2).toFixed(0)}/day</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>+ Email Revenue</span>
                <span>${monthlyEmailRevenue.toFixed(0)}/mo</span>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-background/60">
            <p className="text-xs text-muted-foreground">Daily</p>
            <p className="text-lg font-bold text-primary">${dailyTotal.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/60">
            <p className="text-xs text-muted-foreground">Monthly</p>
            <p className="text-lg font-bold text-accent">${monthlyTotal.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/60">
            <p className="text-xs text-muted-foreground">Yearly</p>
            <p className="text-lg font-bold text-green-500">${yearlyTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>Just {salesPerDay} sale{salesPerDay > 1 ? "s" : ""}/day = ${yearlyTotal.toLocaleString()}/year</span>
        </div>
      </CardContent>
    </Card>
  );
}
