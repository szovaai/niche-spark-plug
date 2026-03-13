import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, ShoppingBag, Store } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlatformExportProps {
  product: {
    title?: string;
    subtitle?: string;
    description?: string;
    bullets?: string[];
    price?: number;
    niche?: string;
    targetAudience?: string;
  };
}

export default function PlatformExport({ product }: PlatformExportProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const gumroadListing = {
    name: product.title || "My Digital Product",
    description: [
      product.description || "",
      "",
      "What's Inside:",
      ...(product.bullets || []).map((b) => `✅ ${b}`),
      "",
      `Perfect for: ${product.targetAudience || "digital creators"}`,
    ].join("\n"),
    price: product.price || 17,
    tags: (product.niche || "").split(/[,\s]+/).filter(Boolean).slice(0, 5),
  };

  const stanStoreListing = {
    name: product.title || "My Digital Product",
    description: [
      `🔥 ${product.subtitle || "Transform your results today"}`,
      "",
      product.description || "",
      "",
      "Here's what you'll get:",
      ...(product.bullets || []).map((b) => `→ ${b}`),
    ].join("\n"),
    price: product.price || 17,
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => copyText(text, label)}
        >
          <Copy className="w-3 h-3" />
          {copied === label ? "Copied!" : "Copy"}
        </Button>
      </TooltipTrigger>
      <TooltipContent><p className="text-xs">Copy {label.toLowerCase()} to clipboard</p></TooltipContent>
    </Tooltip>
  );

  return (
    <Card className="border-accent/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-accent" />
          <h4 className="font-semibold text-sm">Export to Marketplace</h4>
          <Badge variant="secondary" className="text-[10px]">One-Click</Badge>
        </div>

        <Tabs defaultValue="gumroad" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="gumroad" className="text-xs gap-1.5">
              <Store className="w-3 h-3" /> Gumroad
            </TabsTrigger>
            <TabsTrigger value="stanstore" className="text-xs gap-1.5">
              <ShoppingBag className="w-3 h-3" /> Stan Store
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gumroad" className="space-y-3 mt-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Product Name</span>
                <CopyButton text={gumroadListing.name} label="Name" />
              </div>
              <div className="p-2 rounded bg-secondary/50 text-sm font-medium">{gumroadListing.name}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Description</span>
                <CopyButton text={gumroadListing.description} label="Description" />
              </div>
              <pre className="p-2 rounded bg-secondary/50 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{gumroadListing.description}</pre>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Price: <strong>${gumroadListing.price}</strong></span>
              <div className="flex gap-1">
                {gumroadListing.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={() => {
                copyText(
                  `Product Name: ${gumroadListing.name}\n\nDescription:\n${gumroadListing.description}\n\nPrice: $${gumroadListing.price}\nTags: ${gumroadListing.tags.join(", ")}`,
                  "Full Listing"
                );
              }}
            >
              <Copy className="w-3 h-3" /> Copy Full Listing
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-xs text-muted-foreground"
                  onClick={() => window.open("https://app.gumroad.com/products/new", "_blank")}
                >
                  <ExternalLink className="w-3 h-3" /> Open Gumroad → New Product
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Opens Gumroad so you can paste your listing</p></TooltipContent>
            </Tooltip>
          </TabsContent>

          <TabsContent value="stanstore" className="space-y-3 mt-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Product Name</span>
                <CopyButton text={stanStoreListing.name} label="Name" />
              </div>
              <div className="p-2 rounded bg-secondary/50 text-sm font-medium">{stanStoreListing.name}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Description</span>
                <CopyButton text={stanStoreListing.description} label="Description" />
              </div>
              <pre className="p-2 rounded bg-secondary/50 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{stanStoreListing.description}</pre>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Price: <strong>${stanStoreListing.price}</strong></span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={() => {
                copyText(
                  `Product Name: ${stanStoreListing.name}\n\nDescription:\n${stanStoreListing.description}\n\nPrice: $${stanStoreListing.price}`,
                  "Full Listing"
                );
              }}
            >
              <Copy className="w-3 h-3" /> Copy Full Listing
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-xs text-muted-foreground"
                  onClick={() => window.open("https://stan.store", "_blank")}
                >
                  <ExternalLink className="w-3 h-3" /> Open Stan Store
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Opens Stan Store so you can paste your listing</p></TooltipContent>
            </Tooltip>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
