import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Store, Sparkles, Loader2, Check, ChevronRight, 
  Copy, ExternalLink, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmpireProject, GumroadListing, VisualPrompts, ProductPack } from "@/types/empire";

interface Step4GumroadLaunchProps {
  project: Partial<EmpireProject>;
  onUpdate: (updates: Partial<EmpireProject>) => void;
  onNext: () => void;
}

export const Step4GumroadLaunch = ({ project, onUpdate, onNext }: Step4GumroadLaunchProps) => {
  const { toast } = useToast();
  const [loadingListing, setLoadingListing] = useState(false);
  const [loadingVisuals, setLoadingVisuals] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [brandColor, setBrandColor] = useState("");

  const productBrief = project.step3_product_brief as ProductPack | null;
  const listing = project.step4_listing_copy as GumroadListing | null;
  const visuals = project.step4_visual_prompts as VisualPrompts | null;
  const domains = project.step4_domain_ideas as string[] | null;

  const handleGenerateListing = async () => {
    if (!productBrief) {
      toast({
        title: "Generate a product first",
        description: "Go back to Step 3 and create your product concept.",
        variant: "destructive",
      });
      return;
    }

    setLoadingListing(true);
    try {
      const productDescription = `${productBrief.product_name}: ${productBrief.product_promise}. Includes: ${productBrief.elements.join(", ")}. Price range: ${productBrief.price_range}`;
      
      const { data, error } = await supabase.functions.invoke("empire-generate-gumroad", {
        body: { productDescription },
      });

      if (error) throw error;

      onUpdate({ step4_listing_copy: data });
      toast({ title: "Listing copy generated!" });
    } catch (error: any) {
      console.error("Listing generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingListing(false);
    }
  };

  const handleGenerateVisuals = async () => {
    if (!productBrief) return;

    setLoadingVisuals(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-gumroad", {
        body: { 
          type: "visuals",
          brandName: project.step2_selected_brand,
          productName: productBrief.product_name,
          color: brandColor || "neutral",
        },
      });

      if (error) throw error;

      onUpdate({ step4_visual_prompts: data });
      toast({ title: "Visual prompts generated!" });
    } catch (error: any) {
      console.error("Visual generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingVisuals(false);
    }
  };

  const handleGenerateDelivery = async () => {
    if (!productBrief) return;

    setLoadingDelivery(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-gumroad", {
        body: { 
          type: "delivery",
          productName: productBrief.product_name,
        },
      });

      if (error) throw error;

      const instructions = `SETUP STEPS:\n${data.creator_setup_steps.join("\n")}\n\nTHANK YOU MESSAGE:\n${data.thank_you_message}`;
      onUpdate({ step4_delivery_instructions: instructions });
      toast({ title: "Delivery instructions generated!" });
    } catch (error: any) {
      console.error("Delivery generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingDelivery(false);
    }
  };

  const handleGenerateDomains = async () => {
    setLoadingDomains(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-gumroad", {
        body: { 
          type: "domains",
          brandName: project.step2_selected_brand,
          productName: productBrief?.product_name,
        },
      });

      if (error) throw error;

      onUpdate({ step4_domain_ideas: data });
      toast({ title: "Domain ideas generated!" });
    } catch (error: any) {
      console.error("Domain generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingDomains(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  return (
    <div className="space-y-6">
      {/* Context Display */}
      <div className="p-3 bg-secondary/50 rounded-lg flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Product:</span>
        <Badge variant="secondary">{productBrief?.product_name || "Not created"}</Badge>
        <span className="text-muted-foreground ml-2">Price:</span>
        <Badge variant="secondary">{productBrief?.price_range || "TBD"}</Badge>
      </div>

      {/* Listing Copy Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="w-5 h-5 text-primary" />
            Gumroad Listing Copy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerateListing} disabled={loadingListing} className="w-full gap-2">
            {loadingListing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Listing Copy</>
            )}
          </Button>

          {listing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mt-4"
            >
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Product Title</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(listing.title, "Title")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-lg font-bold">{listing.title}</p>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Description</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(listing.description, "Description")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm whitespace-pre-line">{listing.description}</div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Recommended Price</span>
                    <p className="text-2xl font-bold text-green-500">{listing.price}</p>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs text-right">{listing.price_reason}</p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Visual Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visual Asset Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Brand color/aesthetic (optional)</label>
            <Input
              placeholder="e.g. dark blue, minimalist white"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
            />
          </div>

          <Button onClick={handleGenerateVisuals} disabled={loadingVisuals || !productBrief} className="w-full gap-2">
            {loadingVisuals ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Visual Prompts</>
            )}
          </Button>

          {visuals && (
            <div className="space-y-3 mt-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Hero Image Prompt</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(visuals.hero_prompt, "Prompt")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{visuals.hero_prompt}</p>
              </div>

              {visuals.detail_prompts.map((prompt, i) => (
                <div key={i} className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Detail Image {i + 1}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(prompt, "Prompt")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{prompt}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerateDelivery} disabled={loadingDelivery || !productBrief} className="w-full gap-2">
            {loadingDelivery ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Delivery Instructions</>
            )}
          </Button>

          {project.step4_delivery_instructions && (
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Setup & Thank You Message</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(project.step4_delivery_instructions!, "Instructions")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                {project.step4_delivery_instructions}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            Custom Domain Ideas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerateDomains} disabled={loadingDomains} className="w-full gap-2">
            {loadingDomains ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Suggest Domain Names</>
            )}
          </Button>

          {domains && (
            <div className="flex flex-wrap gap-2 mt-4">
              {domains.map((domain, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="gap-1 cursor-pointer hover:bg-primary/10"
                  onClick={() => copyToClipboard(domain, "Domain")}
                >
                  {domain}
                  <Copy className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      {listing && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Launch kit ready!</p>
                <p className="font-bold">Gumroad listing prepared</p>
              </div>
              <Button onClick={onNext} className="ml-auto gap-2">
                Continue to Content
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
