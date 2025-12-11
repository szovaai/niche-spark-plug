import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, TrendingUp, Calculator, Info, 
  ChevronDown, ChevronUp, Copy, Check, Zap
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface PricingOptimizerProps {
  priceRange: { min: number; max: number };
  productType: string;
}

const PLATFORM_FEES = {
  etsy: {
    listingFee: 0.20,
    transactionFee: 0.065,
    paymentProcessing: 0.03,
    paymentFixed: 0.25,
    offsiteAds: 0.15,
  },
  gumroad: {
    transactionFee: 0.10,
    paymentFixed: 0,
  },
};

const PricingOptimizer = ({ priceRange, productType }: PricingOptimizerProps) => {
  const [expanded, setExpanded] = useState(true);
  const [targetPrice, setTargetPrice] = useState(
    Math.round((priceRange.min + priceRange.max) / 2)
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Calculate Etsy fees and profit
  const calculateEtsyProfit = (price: number) => {
    const fees = PLATFORM_FEES.etsy;
    const transactionFee = price * fees.transactionFee;
    const paymentFee = price * fees.paymentProcessing + fees.paymentFixed;
    const totalFees = fees.listingFee + transactionFee + paymentFee;
    return {
      listingFee: fees.listingFee,
      transactionFee,
      paymentFee,
      totalFees,
      netProfit: price - totalFees,
      profitMargin: ((price - totalFees) / price * 100).toFixed(1),
    };
  };

  const etsyCalc = calculateEtsyProfit(targetPrice);

  // Price tier suggestions
  const priceTiers = {
    entry: Math.max(3, Math.floor(priceRange.min * 0.7)),
    sweetSpot: Math.round((priceRange.min + priceRange.max) / 2),
    premium: Math.ceil(priceRange.max * 1.2),
  };

  // Monthly projections
  const projections = [10, 25, 50, 100].map(sales => ({
    sales,
    revenue: targetPrice * sales,
    profit: etsyCalc.netProfit * sales,
  }));

  const pricingStrategy = `
💰 Pricing Strategy for ${productType}

Entry Price: $${priceTiers.entry}.97 (tripwire/testing)
Sweet Spot: $${priceTiers.sweetSpot}.97 (optimal conversion)
Premium: $${priceTiers.premium}.97 (high-value positioning)

At $${targetPrice}:
- Net profit per sale: $${etsyCalc.netProfit.toFixed(2)}
- 25 sales/month = $${(etsyCalc.netProfit * 25).toFixed(2)} profit
- 50 sales/month = $${(etsyCalc.netProfit * 50).toFixed(2)} profit
`.trim();

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 bg-card flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2 font-medium">
          <DollarSign className="w-4 h-4 text-green-400" />
          Pricing Optimizer
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 space-y-6"
        >
          {/* Price Tiers */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Recommended Price Tiers
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div 
                className="p-3 bg-secondary/50 rounded-lg text-center cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => setTargetPrice(priceTiers.entry)}
              >
                <p className="text-xs text-muted-foreground mb-1">Entry</p>
                <p className="text-lg font-bold text-yellow-400">${priceTiers.entry}.97</p>
                <p className="text-xs text-muted-foreground">Tripwire</p>
              </div>
              <div 
                className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-center cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setTargetPrice(priceTiers.sweetSpot)}
              >
                <p className="text-xs text-muted-foreground mb-1">Sweet Spot</p>
                <p className="text-lg font-bold text-primary">${priceTiers.sweetSpot}.97</p>
                <p className="text-xs text-primary">Best Value</p>
              </div>
              <div 
                className="p-3 bg-secondary/50 rounded-lg text-center cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => setTargetPrice(priceTiers.premium)}
              >
                <p className="text-xs text-muted-foreground mb-1">Premium</p>
                <p className="text-lg font-bold text-accent">${priceTiers.premium}.97</p>
                <p className="text-xs text-muted-foreground">High Value</p>
              </div>
            </div>
          </div>

          {/* Price Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Adjust Target Price</span>
              <span className="text-lg font-bold">${targetPrice}</span>
            </div>
            <Slider
              value={[targetPrice]}
              onValueChange={(v) => setTargetPrice(v[0])}
              min={3}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          {/* Fee Breakdown */}
          <div className="p-4 bg-secondary/30 rounded-lg">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              Etsy Fee Breakdown (at ${targetPrice})
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listing fee</span>
                <span>-${etsyCalc.listingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction fee (6.5%)</span>
                <span>-${etsyCalc.transactionFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment processing (3% + $0.25)</span>
                <span>-${etsyCalc.paymentFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-medium">
                <span>Net Profit</span>
                <span className="text-green-400">${etsyCalc.netProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Profit Margin</span>
                <span>{etsyCalc.profitMargin}%</span>
              </div>
            </div>
          </div>

          {/* Monthly Projections */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Monthly Profit Projections
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {projections.map((p) => (
                <div key={p.sales} className="p-2 bg-secondary/30 rounded text-center">
                  <p className="text-xs text-muted-foreground">{p.sales} sales/mo</p>
                  <p className="font-bold text-green-400">${p.profit.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Psychology Tips */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Pricing Psychology Tips
            </h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• .97 endings outperform .99 on Etsy by ~8%</li>
              <li>• Odd numbers ($17, $23) feel more deliberate than round numbers</li>
              <li>• Bundle at 1.8x single price for perceived value</li>
              <li>• Add $3-5 bump offer for 25% attach rate</li>
            </ul>
          </div>

          {/* Copy Strategy Button */}
          <button
            onClick={() => copyToClipboard(pricingStrategy, "strategy")}
            className="w-full p-3 bg-secondary/50 hover:bg-secondary rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          >
            {copiedField === "strategy" ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Pricing Strategy
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PricingOptimizer;
