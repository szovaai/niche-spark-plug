import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, DollarSign, Zap, Crown, Copy, Check, 
  ChevronDown, ChevronUp, Lightbulb, ArrowRight, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BundleVariants } from "@/types/bundle";
import { toast } from "sonner";

interface BundleDisplayProps {
  bundles: BundleVariants;
  originalProductName: string;
}

const BundleDisplay = ({ bundles, originalProductName }: BundleDisplayProps) => {
  const [expandedStrategy, setExpandedStrategy] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-1.5 hover:bg-secondary rounded transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-3.5 h-3.5 text-ocean-300" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Bundle Overview */}
      <div className="p-4 rounded-xl gradient-ocean border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-primary" />
          <span className="font-semibold">Bundle Strategy for "{originalProductName}"</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Turn one product into a complete product line. Here's your Lite version (tripwire), 
          Bonus add-on (upsell), and Premium Bundle (complete package).
        </p>
      </div>

      {/* Three Product Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Lite Version Card */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="p-4 bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ocean-400/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-ocean-300" />
              </div>
              <div>
                <p className="font-semibold text-sm">Lite Version</p>
                <p className="text-xs text-muted-foreground">Entry-level tripwire</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-ocean-300">
                ${bundles.liteVersion.priceRange.min}-${bundles.liteVersion.priceRange.max}
              </p>
              <p className="text-xs text-muted-foreground">{bundles.liteVersion.pageCount} pages</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{bundles.liteVersion.name}</p>
                <CopyButton text={bundles.liteVersion.name} field="lite-name" />
              </div>
              <p className="text-sm text-muted-foreground">{bundles.liteVersion.description}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Key Features:</p>
              <ul className="space-y-1">
                {bundles.liteVersion.keyFeatures.map((feature, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <span className="text-ocean-300">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Listing Title:</p>
                <CopyButton text={bundles.liteVersion.listingTitle} field="lite-title" />
              </div>
              <p className="text-sm p-2 bg-secondary/50 rounded">{bundles.liteVersion.listingTitle}</p>
            </div>
            <div className="p-2 bg-ocean-400/10 rounded-lg">
              <p className="text-xs text-ocean-300 font-medium">💡 Quick Pitch:</p>
              <p className="text-xs">{bundles.liteVersion.quickPitch}</p>
            </div>
          </div>
        </div>

        {/* Bonus Add-On Card */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="p-4 bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Gift className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm">Bonus Add-On</p>
                <p className="text-xs text-muted-foreground">Upsell companion</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-accent">
                ${bundles.bonusAddOn.priceRange.min}-${bundles.bonusAddOn.priceRange.max}
              </p>
              <p className="text-xs text-muted-foreground">{bundles.bonusAddOn.format}</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{bundles.bonusAddOn.name}</p>
                <CopyButton text={bundles.bonusAddOn.name} field="bonus-name" />
              </div>
              <p className="text-sm text-muted-foreground">{bundles.bonusAddOn.description}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Key Features:</p>
              <ul className="space-y-1">
                {bundles.bonusAddOn.keyFeatures.map((feature, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <span className="text-accent">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Listing Title:</p>
                <CopyButton text={bundles.bonusAddOn.listingTitle} field="bonus-title" />
              </div>
              <p className="text-sm p-2 bg-secondary/50 rounded">{bundles.bonusAddOn.listingTitle}</p>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg">
              <p className="text-xs text-accent font-medium">💡 Quick Pitch:</p>
              <p className="text-xs">{bundles.bonusAddOn.quickPitch}</p>
            </div>
          </div>
        </div>

        {/* Premium Bundle Card */}
        <div className="border-2 border-primary/50 rounded-xl overflow-hidden bg-card relative">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
            Best Value
          </div>
          <div className="p-4 bg-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Premium Bundle</p>
                <p className="text-xs text-muted-foreground">Complete package</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold gradient-text">
                ${bundles.premiumBundle.bundlePrice.min}-${bundles.premiumBundle.bundlePrice.max}
              </p>
              <p className="text-xs text-muted-foreground line-through">${bundles.premiumBundle.totalValue} value</p>
              <p className="text-xs text-primary font-medium">Save {bundles.premiumBundle.savingsPercent}%</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{bundles.premiumBundle.name}</p>
                <CopyButton text={bundles.premiumBundle.name} field="premium-name" />
              </div>
              <p className="text-sm text-muted-foreground">{bundles.premiumBundle.description}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">What's Included:</p>
              <ul className="space-y-1">
                {bundles.premiumBundle.includedItems.map((item, i) => (
                  <li key={i} className="text-xs flex items-center gap-2 p-1.5 bg-secondary/30 rounded">
                    <Check className="w-3 h-3 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Listing Title:</p>
                <CopyButton text={bundles.premiumBundle.listingTitle} field="premium-title" />
              </div>
              <p className="text-sm p-2 bg-secondary/50 rounded">{bundles.premiumBundle.listingTitle}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <p className="text-xs text-primary font-medium">💡 Quick Pitch:</p>
              <p className="text-xs">{bundles.premiumBundle.quickPitch}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Section */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedStrategy(!expandedStrategy)}
          className="w-full p-4 bg-card flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium">
            <Lightbulb className="w-4 h-4 text-primary" />
            Bundle Sales Strategy
          </div>
          {expandedStrategy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedStrategy && (
          <div className="p-4 space-y-4">
            {/* Upsell Flow */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Upsell Flow:</p>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  {bundles.bundleStrategy.upsellFlow}
                </div>
              </div>
            </div>

            {/* Cross-Promotion Ideas */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Cross-Promotion Ideas:</p>
              <ul className="space-y-2">
                {bundles.bundleStrategy.crossPromotionIdeas.map((idea, i) => (
                  <li key={i} className="text-sm flex items-start gap-2 p-2 bg-secondary/30 rounded">
                    <span className="text-primary font-medium">{i + 1}.</span>
                    {idea}
                  </li>
                ))}
              </ul>
            </div>

            {/* Seasonal Tip */}
            {bundles.bundleStrategy.seasonalTip && (
              <div className="p-3 bg-ocean-400/10 rounded-lg">
                <p className="text-xs text-ocean-300 font-medium mb-1">📅 Seasonal Tip:</p>
                <p className="text-sm">{bundles.bundleStrategy.seasonalTip}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Revenue Calculator */}
      <div className="p-4 bg-secondary/30 rounded-xl">
        <p className="text-sm font-medium mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Potential Revenue (per month)
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">10 sales each</p>
            <p className="font-bold text-sm">
              ${(bundles.liteVersion.priceRange.min * 10) + 
                (bundles.bonusAddOn.priceRange.min * 10) + 
                (bundles.premiumBundle.bundlePrice.min * 10)}+
            </p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">25 sales each</p>
            <p className="font-bold text-sm gradient-text">
              ${(bundles.liteVersion.priceRange.min * 25) + 
                (bundles.bonusAddOn.priceRange.min * 25) + 
                (bundles.premiumBundle.bundlePrice.min * 25)}+
            </p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">50 sales each</p>
            <p className="font-bold text-sm">
              ${(bundles.liteVersion.priceRange.min * 50) + 
                (bundles.bonusAddOn.priceRange.min * 50) + 
                (bundles.premiumBundle.bundlePrice.min * 50)}+
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BundleDisplay;
