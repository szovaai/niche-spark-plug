import { useState } from "react";
import { Mail, RefreshCw, Copy, Download, FileText, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolkitComponents } from "@/types/toolkit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSalesLetterHTML } from "@/lib/salesLetterExport";

interface SalesLetterGeneratorProps {
  title: string;
  subtitle?: string;
  niche: string;
  targetAudience?: string;
  components: ToolkitComponents;
  onSalesLetterGenerated: (letter: string) => void;
  existingSalesLetter?: string;
  price?: number;
  authorName?: string;
}

const SalesLetterGenerator = ({ 
  title, 
  subtitle,
  niche, 
  targetAudience,
  components,
  onSalesLetterGenerated, 
  existingSalesLetter,
  price = 17,
  authorName
}: SalesLetterGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [salesLetter, setSalesLetter] = useState(existingSalesLetter || "");
  const [copied, setCopied] = useState(false);
  const [uniqueMechanism, setUniqueMechanism] = useState("");
  const [keyBenefits, setKeyBenefits] = useState("");

  const generateSalesLetter = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sales-letter", {
        body: {
          title,
          subtitle,
          niche,
          targetAudience: targetAudience || "Online entrepreneurs and digital marketers",
          components,
          price,
          authorName,
          uniqueMechanism: uniqueMechanism || undefined,
          keyBenefits: keyBenefits ? keyBenefits.split("\n").filter(b => b.trim()) : undefined,
        },
      });

      if (error) throw error;

      if (data?.salesLetter) {
        setSalesLetter(data.salesLetter);
        onSalesLetterGenerated(data.salesLetter);
        toast.success("Sales letter generated successfully!");
      } else {
        throw new Error("No sales letter returned");
      }
    } catch (error) {
      console.error("Error generating sales letter:", error);
      toast.error("Failed to generate sales letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(salesLetter);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHTML = () => {
    const html = generateSalesLetterHTML({
      title,
      subtitle,
      salesLetter,
      niche,
      targetAudience,
    });
    
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-sales-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sales page HTML downloaded!");
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold gradient-text">Salesletter Framework</h2>
          <p className="text-muted-foreground mt-2">
            Generate a professional, conversion-optimized sales letter using our proprietary framework.
          </p>
        </div>

        {!salesLetter && (
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="uniqueMechanism">Unique Mechanism (optional)</Label>
              <Input
                id="uniqueMechanism"
                placeholder="What makes your approach different? e.g., 'The 3-Step Rapid Launch Method'"
                value={uniqueMechanism}
                onChange={(e) => setUniqueMechanism(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be woven throughout the sales letter to create curiosity.
              </p>
            </div>
            
            <div>
              <Label htmlFor="keyBenefits">Key Benefits (one per line, optional)</Label>
              <Textarea
                id="keyBenefits"
                placeholder="Build an email list without ads&#10;Create products in hours, not weeks&#10;Launch to your first sale within 48 hours"
                value={keyBenefits}
                onChange={(e) => setKeyBenefits(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {salesLetter ? (
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="source">Source Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-4">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-6 max-h-[500px] overflow-y-auto bg-background"
                dangerouslySetInnerHTML={{ __html: salesLetter }}
              />
            </TabsContent>
            
            <TabsContent value="source" className="mt-4">
              <Textarea 
                value={salesLetter} 
                onChange={(e) => {
                  setSalesLetter(e.target.value);
                  onSalesLetterGenerated(e.target.value);
                }} 
                rows={20} 
                className="font-mono text-sm" 
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">
              Generate a complete sales letter using our proprietary Salesletter Framework.
            </p>
            <p className="text-sm text-muted-foreground">
              Includes: Preheadline, Headline, Story, Benefits, Scarcity, CTA, and more.
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            variant="hero" 
            onClick={generateSalesLetter} 
            disabled={isGenerating} 
            className="gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {salesLetter ? "Regenerate" : "Generate Sales Letter"}
          </Button>
          
          {salesLetter && (
            <>
              <Button 
                variant="outline" 
                onClick={handleCopy} 
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDownloadHTML} 
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download HTML
              </Button>
            </>
          )}
        </div>

        {isGenerating && (
          <div className="text-center text-sm text-muted-foreground animate-pulse">
            Crafting your conversion-optimized sales letter...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesLetterGenerator;
