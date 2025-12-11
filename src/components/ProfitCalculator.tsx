import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, TrendingUp, Calculator, Info, Copy, Check,
  ChevronDown, ChevronUp, Zap, Target, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PLATFORM_FEES, EFFORT_BY_PRODUCT_TYPE } from "@/types/profitCalculator";
import { toast } from "sonner";

interface ProfitCalculatorProps {
  initialPrice?: number;
  initialProductType?: string;
  compact?: boolean;
}

const PRODUCT_TYPES = [
  "Printable Pack",
  "Planner",
  "Canva Template",
  "Notion Template",
  "Spreadsheet",
  "Guide/Ebook",
  "Wall Art Pack",
  "Social Media Kit",
  "Digital Stickers",
];

const ProfitCalculator = ({ 
  initialPrice = 12, 
  initialProductType = "Printable Pack",
  compact = false 
}: ProfitCalculatorProps) => {
  const [price, setPrice] = useState(initialPrice);
  const [platform, setPlatform] = useState<'etsy' | 'gumroad' | 'shopify'>('etsy');
  const [productType, setProductType] = useState(initialProductType);
  const [salesPerMonth, setSalesPerMonth] = useState(25);
  const [isOpen, setIsOpen] = useState(!compact);
  const [copied, setCopied] = useState(false);

  const calculations = useMemo(() => {
    const fees = PLATFORM_FEES[platform];
    
    // Calculate per-sale fees
    let totalFeePerSale = fees.listingFee || 0;
    totalFeePerSale += price * (fees.transactionFeePercent || 0);
    totalFeePerSale += price * (fees.paymentProcessingPercent || 0);
    totalFeePerSale += fees.paymentProcessingFixed || 0;
    
    const netProfitPerSale = price - totalFeePerSale;
    const monthlyRevenue = price * salesPerMonth;
    const monthlyFees = totalFeePerSale * salesPerMonth;
    const monthlyProfit = netProfitPerSale * salesPerMonth;
    
    // Projections at different sales levels
    const projections = [10, 25, 50, 100].map(sales => ({
      sales,
      revenue: price * sales,
      profit: netProfitPerSale * sales,
    }));
    
    // Determine profit potential
    let profitPotential: 'Low' | 'Good' | 'Great' | 'Excellent' = 'Low';
    if (monthlyProfit >= 500) profitPotential = 'Excellent';
    else if (monthlyProfit >= 250) profitPotential = 'Great';
    else if (monthlyProfit >= 100) profitPotential = 'Good';
    
    const effort = EFFORT_BY_PRODUCT_TYPE[productType] || 'Medium';
    
    return {
      feeBreakdown: {
        platformFee: price * (fees.transactionFeePercent || 0),
        transactionFee: fees.listingFee || 0,
        paymentProcessing: price * (fees.paymentProcessingPercent || 0) + (fees.paymentProcessingFixed || 0),
        listingFee: fees.listingFee || 0,
        offsiteAds: 0,
        totalFees: totalFeePerSale,
        netProfit: netProfitPerSale,
      },
      monthlyRevenue,
      monthlyFees,
      monthlyProfit,
      projections,
      profitPotential,
      effort,
    };
  }, [price, platform, productType, salesPerMonth]);

  const copyStrategy = () => {
    const text = `
Profit Strategy for ${productType}
Platform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}
Price: $${price.toFixed(2)}
Net Profit/Sale: $${calculations.feeBreakdown.netProfit.toFixed(2)}
At ${salesPerMonth} sales/month: $${calculations.monthlyProfit.toFixed(2)} profit
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className="space-y-6">
      {/* Price Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Product Price</label>
          <span className="text-xl font-bold text-primary">${price.toFixed(2)}</span>
        </div>
        <Slider
          value={[price]}
          onValueChange={(v) => setPrice(v[0])}
          min={3}
          max={50}
          step={0.5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$3</span>
          <span>$50</span>
        </div>
      </div>

      {/* Platform & Product Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Platform</label>
          <Select value={platform} onValueChange={(v: 'etsy' | 'gumroad' | 'shopify') => setPlatform(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="etsy">Etsy</SelectItem>
              <SelectItem value="gumroad">Gumroad</SelectItem>
              <SelectItem value="shopify">Shopify</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Type</label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sales Estimate */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Monthly Sales Estimate</label>
          <span className="font-semibold">{salesPerMonth} sales</span>
        </div>
        <Slider
          value={[salesPerMonth]}
          onValueChange={(v) => setSalesPerMonth(v[0])}
          min={5}
          max={200}
          step={5}
        />
      </div>

      {/* Results Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-2xl font-bold text-primary">${calculations.feeBreakdown.netProfit.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Net/Sale</div>
        </div>
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
          <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="text-2xl font-bold text-accent">${calculations.monthlyProfit.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Monthly Profit</div>
        </div>
        <div className="p-4 rounded-xl bg-secondary text-center">
          <Target className="w-5 h-5 text-foreground mx-auto mb-1" />
          <div className="text-lg font-bold">{calculations.profitPotential}</div>
          <div className="text-xs text-muted-foreground">Potential</div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          Fee Breakdown (per sale)
        </h4>
        <div className="space-y-2 text-sm">
          {platform === 'etsy' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listing fee</span>
                <span>$0.20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction fee (6.5%)</span>
                <span>${(price * 0.065).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment processing (3% + $0.25)</span>
                <span>${(price * 0.03 + 0.25).toFixed(2)}</span>
              </div>
            </>
          )}
          {platform === 'gumroad' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gumroad fee (10%)</span>
              <span>${(price * 0.10).toFixed(2)}</span>
            </div>
          )}
          {platform === 'shopify' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment processing (2.9% + $0.30)</span>
              <span>${(price * 0.029 + 0.30).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
            <span>Total Fees</span>
            <span className="text-destructive">-${calculations.feeBreakdown.totalFees.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-primary">
            <span>You Keep</span>
            <span>${calculations.feeBreakdown.netProfit.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Monthly Projections */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Monthly Projections
        </h4>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          {calculations.projections.map(p => (
            <div key={p.sales} className="p-2 rounded-lg bg-secondary/50">
              <div className="font-semibold">{p.sales}/mo</div>
              <div className="text-xs text-muted-foreground">${p.revenue}</div>
              <div className="text-xs text-primary font-medium">${p.profit.toFixed(0)} profit</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Tips */}
      <div className="p-4 rounded-xl gradient-ocean border border-primary/20">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Pricing Psychology Tips
        </h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• .97 endings outperform .99 on Etsy by ~8%</li>
          <li>• Odd numbers feel more deliberate and trustworthy</li>
          <li>• Bundle at 2x price shows 50% savings, boosts AOV</li>
          <li>• Add a $3-5 bump offer for 25% attach rate</li>
        </ul>
      </div>

      {/* Effort Rating */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Creation Effort</span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          calculations.effort === 'Low' ? 'bg-ocean-400/20 text-ocean-300' :
          calculations.effort === 'Medium' ? 'bg-accent/20 text-accent' :
          'bg-magenta-400/20 text-magenta-300'
        }`}>
          {calculations.effort}
        </span>
      </div>

      {/* Copy Button */}
      <Button variant="outline" onClick={copyStrategy} className="w-full gap-2">
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy Pricing Strategy"}
      </Button>
    </div>
  );

  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <span className="flex items-center gap-2 font-semibold">
              <Calculator className="w-5 h-5 text-primary" />
              Profit Calculator
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">
          {content}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-card border border-border"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        Profit Calculator
      </h3>
      {content}
    </motion.div>
  );
};

export default ProfitCalculator;
