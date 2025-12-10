import { motion } from "framer-motion";
import { 
  FileText, DollarSign, Lightbulb, Target, Palette, 
  Type, Users, Sparkles, Copy, Check, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductBlueprint, ProductType } from "@/types/niche";
import { useState } from "react";
import { toast } from "sonner";

interface BlueprintDisplayProps {
  blueprint: ProductBlueprint;
  onRegenerate: () => void;
  loading?: boolean;
}

const BlueprintDisplay = ({ blueprint, onRegenerate, loading }: BlueprintDisplayProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pages: true,
    style: true,
    marketing: false,
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* AI Summary */}
      <div className="p-4 rounded-xl gradient-ocean border border-primary/20">
        <p className="text-sm leading-relaxed">{blueprint.aiSummary}</p>
      </div>

      {/* Product Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name & Type */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="w-4 h-4" />
            Product
          </div>
          <p className="text-lg font-semibold">{blueprint.productName}</p>
          <span className="inline-block text-xs px-2 py-1 bg-secondary rounded">
            {blueprint.productType}
          </span>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            Suggested Price
          </div>
          <p className="text-2xl font-bold gradient-text">
            ${blueprint.priceRange.min} – ${blueprint.priceRange.max}
          </p>
        </div>
      </div>

      {/* Buyer Persona */}
      <div className="p-4 bg-secondary/50 rounded-xl">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Users className="w-4 h-4" />
          Target Buyer
        </div>
        <p className="text-sm">{blueprint.buyerPersona}</p>
      </div>

      {/* Title Ideas */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Target className="w-4 h-4" />
          Title Ideas
        </div>
        <ul className="space-y-2">
          {blueprint.titleIdeas.map((title, i) => (
            <li 
              key={i} 
              className="p-3 bg-secondary/50 rounded-lg text-sm flex items-center justify-between group cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => copyToClipboard(title, `title-${i}`)}
            >
              <span>{title}</span>
              {copiedField === `title-${i}` ? (
                <Check className="w-4 h-4 text-ocean-300" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Page Breakdown Section */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("pages")}
          className="w-full p-4 bg-card flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium">
            <FileText className="w-4 h-4 text-primary" />
            Page-by-Page Breakdown ({blueprint.pages.length} pages)
          </div>
          {expandedSections.pages ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.pages && (
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {blueprint.pages.map((page) => (
              <div key={page.pageNumber} className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                    {page.pageNumber}
                  </span>
                  <span className="font-medium text-sm">{page.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{page.description}</p>
                <div className="p-2 bg-card rounded text-xs">
                  <span className="text-primary font-medium">Content idea:</span> {page.contentSuggestion}
                </div>
                {page.layoutNotes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">📐 {page.layoutNotes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Style Guide Section */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("style")}
          className="w-full p-4 bg-card flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium">
            <Palette className="w-4 h-4 text-accent" />
            Style Guide
          </div>
          {expandedSections.style ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.style && (
          <div className="p-4 space-y-4">
            {/* Colors */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Color Palette</p>
              <div className="flex gap-3">
                {[
                  { label: "Primary", color: blueprint.styleGuide.primaryColor },
                  { label: "Secondary", color: blueprint.styleGuide.secondaryColor },
                  { label: "Accent", color: blueprint.styleGuide.accentColor },
                ].map((c) => (
                  <div key={c.label} className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border border-border mb-1 cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: c.color }}
                      onClick={() => copyToClipboard(c.color, c.label)}
                    />
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="text-xs font-mono">{c.color}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Typography</p>
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{blueprint.styleGuide.fontPrimary}</span>
                <span className="text-muted-foreground">+</span>
                <span className="text-sm">{blueprint.styleGuide.fontSecondary}</span>
              </div>
            </div>

            {/* Aesthetic */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Aesthetic</p>
              <p className="text-sm">{blueprint.styleGuide.aesthetic}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {blueprint.styleGuide.moodKeywords.map((keyword) => (
                  <span key={keyword} className="text-xs px-2 py-1 bg-secondary rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Marketing Copy Section */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("marketing")}
          className="w-full p-4 bg-card flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium">
            <Lightbulb className="w-4 h-4 text-ocean-300" />
            Marketing Copy
          </div>
          {expandedSections.marketing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.marketing && (
          <div className="p-4 space-y-4">
            {/* Short Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Short Description</p>
                <button
                  onClick={() => copyToClipboard(blueprint.marketingCopy.shortDescription, "short")}
                  className="text-xs text-primary hover:underline"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm p-3 bg-secondary/50 rounded-lg">{blueprint.marketingCopy.shortDescription}</p>
            </div>

            {/* Bullet Points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Listing Bullets</p>
                <button
                  onClick={() => copyToClipboard(blueprint.marketingCopy.bulletPoints.join("\n• "), "bullets")}
                  className="text-xs text-primary hover:underline"
                >
                  Copy All
                </button>
              </div>
              <ul className="space-y-1">
                {blueprint.marketingCopy.bulletPoints.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Full Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Full Description</p>
                <button
                  onClick={() => copyToClipboard(blueprint.marketingCopy.fullDescription, "full")}
                  className="text-xs text-primary hover:underline"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm p-3 bg-secondary/50 rounded-lg whitespace-pre-wrap">{blueprint.marketingCopy.fullDescription}</p>
            </div>

            {/* SEO Tags */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">SEO Tags (13 for Etsy)</p>
              <div className="flex flex-wrap gap-2">
                {blueprint.marketingCopy.seoTags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="text-xs px-2 py-1 bg-secondary rounded cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => copyToClipboard(tag, `tag-${i}`)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unique Angles */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          How to Stand Out
        </div>
        <ul className="space-y-2">
          {blueprint.uniqueAngles.map((angle, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary">•</span>
              {angle}
            </li>
          ))}
        </ul>
      </div>

      {/* Regenerate Button */}
      <div className="pt-4 border-t border-border">
        <Button variant="outline" onClick={onRegenerate} disabled={loading} className="w-full">
          <Sparkles className="w-4 h-4" />
          Regenerate Blueprint
        </Button>
      </div>
    </motion.div>
  );
};

export default BlueprintDisplay;
