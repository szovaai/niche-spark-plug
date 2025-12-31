import { useState } from "react";
import { DollarSign, TrendingUp, Zap, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ToolkitComponents } from "@/types/toolkit";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PricingSuggesterProps {
  niche: string;
  components: ToolkitComponents;
  onPriceSelected?: (price: number) => void;
}

const PricingSuggester = ({ niche, components, onPriceSelected }: PricingSuggesterProps) => {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  // Calculate component count for value assessment
  const componentCount = Object.values(components).filter(Boolean).length;
  
  // Pricing tiers based on component count
  const getPricingTiers = () => {
    const basePrice = 7;
    const perComponentValue = 5;
    const nicheMultiplier = niche.toLowerCase().includes("ai") || niche.toLowerCase().includes("traffic") ? 1.3 : 1;
    
    const calculatedBase = Math.round((basePrice + (componentCount * perComponentValue)) * nicheMultiplier);
    
    return {
      budget: { 
        price: Math.max(7, calculatedBase - 5), 
        label: "Budget", 
        description: "Quick sales, higher volume",
        color: "text-blue-400"
      },
      value: { 
        price: calculatedBase + 2, 
        label: "Value", 
        description: "Sweet spot for most niches",
        color: "text-green-400"
      },
      premium: { 
        price: calculatedBase + 10, 
        label: "Premium", 
        description: "Higher margins, proven niches",
        color: "text-accent"
      },
    };
  };

  const tiers = getPricingTiers();
  
  const profitEstimates = (price: number) => {
    const warriorPlusFee = 0.10; // 10% marketplace fee
    const paymentFee = 0.05; // ~5% payment processing
    const netPerSale = price * (1 - warriorPlusFee - paymentFee);
    
    return {
      netPerSale: netPerSale.toFixed(2),
      monthly10: (netPerSale * 10).toFixed(0),
      monthly50: (netPerSale * 50).toFixed(0),
      monthly100: (netPerSale * 100).toFixed(0),
    };
  };

  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price);
    onPriceSelected?.(price);
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Suggested Pricing</h3>
            <p className="text-sm text-muted-foreground">Based on your toolkit content</p>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(tiers).map(([key, tier]) => (
            <div
              key={key}
              onClick={() => handlePriceSelect(tier.price)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                selectedPrice === tier.price
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <p className={`text-2xl font-bold ${tier.color}`}>${tier.price}</p>
              <p className="font-medium text-sm mt-1">{tier.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
            </div>
          ))}
        </div>

        {/* Profit Calculator */}
        {selectedPrice && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="font-medium">Profit Projections at ${selectedPrice}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>After WarriorPlus (10%) + payment fees (5%)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">Per Sale</p>
                <p className="font-bold text-green-400">${profitEstimates(selectedPrice).netPerSale}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">10/mo</p>
                <p className="font-bold">${profitEstimates(selectedPrice).monthly10}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">50/mo</p>
                <p className="font-bold">${profitEstimates(selectedPrice).monthly50}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">100/mo</p>
                <p className="font-bold text-accent">${profitEstimates(selectedPrice).monthly100}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
          <Zap className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-accent">Pro Tip</p>
            <p className="text-muted-foreground">
              Digital product buyers expect value. With {componentCount} components, 
              the ${tiers.value.price} "Value" tier hits the sweet spot for conversions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingSuggester;
