import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Tag, FileText, DollarSign, Shield, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingKit } from "@/types/listingKit";
import { toast } from "sonner";

interface ListingKitDisplayProps {
  listingKit: ListingKit | null;
  loading?: boolean;
  onGenerate?: () => void;
}

const ListingKitDisplay = ({ listingKit, loading, onGenerate }: ListingKitDisplayProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-1.5 rounded-md hover:bg-secondary transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );

  if (!listingKit && !loading) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Listing Kit Yet</h3>
        <p className="text-muted-foreground mb-4">
          Generate SEO-optimized titles, tags, and descriptions
        </p>
        {onGenerate && (
          <Button onClick={onGenerate} variant="glow">
            Generate Listing Kit
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
        <h3 className="text-lg font-semibold mb-2">Generating Listing Kit...</h3>
        <p className="text-muted-foreground">Creating SEO-optimized content for your product</p>
      </div>
    );
  }

  if (!listingKit) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Tabs defaultValue="titles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="titles" className="text-xs sm:text-sm">
            <Tag className="w-3 h-3 mr-1" /> Titles
          </TabsTrigger>
          <TabsTrigger value="tags" className="text-xs sm:text-sm">
            <Search className="w-3 h-3 mr-1" /> Tags
          </TabsTrigger>
          <TabsTrigger value="descriptions" className="text-xs sm:text-sm">
            <FileText className="w-3 h-3 mr-1" /> Copy
          </TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs sm:text-sm">
            <DollarSign className="w-3 h-3 mr-1" /> Price
          </TabsTrigger>
          <TabsTrigger value="policies" className="text-xs sm:text-sm">
            <Shield className="w-3 h-3 mr-1" /> Policy
          </TabsTrigger>
        </TabsList>

        {/* Titles Tab */}
        <TabsContent value="titles" className="space-y-4">
          <div className="space-y-3">
            {[
              { label: "Primary Title", key: "primary", value: listingKit.titles.primary },
              { label: "Alternative 1", key: "alt1", value: listingKit.titles.alternative1 },
              { label: "Alternative 2", key: "alt2", value: listingKit.titles.alternative2 },
            ].map((title) => (
              <div key={title.key} className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">{title.label}</p>
                    <p className="font-medium">{title.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {title.value.length} characters
                    </p>
                  </div>
                  <CopyButton text={title.value} field={`title-${title.key}`} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">13 Etsy Tags</p>
              <CopyButton text={listingKit.etsyTags.join(", ")} field="all-tags" />
            </div>
            <div className="flex flex-wrap gap-2">
              {listingKit.etsyTags.map((tag, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => copyToClipboard(tag, `tag-${i}`)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">SEO Keywords</p>
              <CopyButton text={listingKit.seoKeywords.join(", ")} field="seo-keywords" />
            </div>
            <div className="flex flex-wrap gap-2">
              {listingKit.seoKeywords.map((kw, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Descriptions Tab */}
        <TabsContent value="descriptions" className="space-y-4">
          {[
            { label: "Short Description", key: "short", value: listingKit.descriptions.short },
            { label: "Full Description", key: "long", value: listingKit.descriptions.long },
            { label: "Gumroad Copy", key: "gumroad", value: listingKit.descriptions.gumroad },
            { label: "Shopify Copy", key: "shopify", value: listingKit.descriptions.shopify },
          ].map((desc) => (
            <div key={desc.key} className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium">{desc.label}</p>
                <CopyButton text={desc.value} field={`desc-${desc.key}`} />
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{desc.value}</p>
            </div>
          ))}
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Launch Price", value: listingKit.pricingStrategy.launchPrice, color: "text-green-400" },
              { label: "Regular Price", value: listingKit.pricingStrategy.suggestedPrice, color: "text-primary" },
              { label: "Bundle Price", value: listingKit.pricingStrategy.bundlePrice, color: "text-accent" },
            ].map((price) => (
              <div key={price.label} className="p-4 rounded-lg bg-secondary/50 border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">{price.label}</p>
                <p className={`text-2xl font-bold ${price.color}`}>${price.value}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm font-medium mb-2">💡 Pricing Psychology</p>
            <p className="text-sm text-muted-foreground">{listingKit.pricingStrategy.psychology}</p>
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium">Refund Policy</p>
              <CopyButton text={listingKit.policies.refundPolicy} field="refund" />
            </div>
            <p className="text-sm text-muted-foreground">{listingKit.policies.refundPolicy}</p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium">Licensing & Usage Rights</p>
              <CopyButton text={listingKit.policies.licensingText} field="licensing" />
            </div>
            <p className="text-sm text-muted-foreground">{listingKit.policies.licensingText}</p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm font-medium mb-3">FAQ</p>
            <div className="space-y-3">
              {listingKit.policies.faq.map((item, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-sm font-medium">{item.question}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Copy All Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const allContent = `
TITLES:
${listingKit.titles.primary}
${listingKit.titles.alternative1}
${listingKit.titles.alternative2}

ETSY TAGS:
${listingKit.etsyTags.join(", ")}

SHORT DESCRIPTION:
${listingKit.descriptions.short}

FULL DESCRIPTION:
${listingKit.descriptions.long}

PRICING:
Launch: $${listingKit.pricingStrategy.launchPrice}
Regular: $${listingKit.pricingStrategy.suggestedPrice}
Bundle: $${listingKit.pricingStrategy.bundlePrice}
          `.trim();
          copyToClipboard(allContent, "all");
        }}
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy All Listing Content
      </Button>
    </motion.div>
  );
};

export default ListingKitDisplay;
