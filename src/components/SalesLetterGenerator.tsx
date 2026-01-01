import { useState } from "react";
import { Mail, RefreshCw, Copy, Download, Check, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ToolkitComponents } from "@/types/toolkit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSalesLetterHTML } from "@/lib/salesLetterExport";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

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

interface PromptBoxData {
  whatProductIs: string;
  whoItsFor: string;
  mainProblem: string;
  desiredOutcome: string;
  bonusesIncluded: string;
}

type Phase = 'input' | 'raw' | 'polished';

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
  const [currentPhase, setCurrentPhase] = useState<Phase>(existingSalesLetter ? 'polished' : 'input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawDraft, setRawDraft] = useState("");
  const [polishedLetter, setPolishedLetter] = useState(existingSalesLetter || "");
  const [copied, setCopied] = useState(false);
  const [promptBoxOpen, setPromptBoxOpen] = useState(true);
  
  const [promptBoxData, setPromptBoxData] = useState<PromptBoxData>({
    whatProductIs: "",
    whoItsFor: targetAudience || "",
    mainProblem: "",
    desiredOutcome: "",
    bonusesIncluded: "",
  });

  const updatePromptBox = (field: keyof PromptBoxData, value: string) => {
    setPromptBoxData(prev => ({ ...prev, [field]: value }));
  };

  const generateRawDraft = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sales-letter", {
        body: {
          phase: "raw",
          title,
          subtitle,
          niche,
          targetAudience: promptBoxData.whoItsFor || targetAudience || "Online entrepreneurs and digital marketers",
          components,
          price,
          authorName,
          promptBoxData,
        },
      });

      if (error) throw error;

      if (data?.salesLetter) {
        setRawDraft(data.salesLetter);
        setCurrentPhase('raw');
        setPromptBoxOpen(false);
        toast.success("Raw draft generated! Review it, then polish with our framework.");
      } else {
        throw new Error("No sales letter returned");
      }
    } catch (error) {
      console.error("Error generating raw draft:", error);
      toast.error("Failed to generate raw draft. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const polishWithFramework = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sales-letter", {
        body: {
          phase: "polish",
          title,
          subtitle,
          niche,
          targetAudience: promptBoxData.whoItsFor || targetAudience,
          components,
          price,
          authorName,
          promptBoxData,
          rawDraft,
        },
      });

      if (error) throw error;

      if (data?.salesLetter) {
        setPolishedLetter(data.salesLetter);
        onSalesLetterGenerated(data.salesLetter);
        setCurrentPhase('polished');
        toast.success("Sales letter polished with our Proprietary Framework!");
      } else {
        throw new Error("No sales letter returned");
      }
    } catch (error) {
      console.error("Error polishing sales letter:", error);
      toast.error("Failed to polish sales letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHTML = (content: string, version: string) => {
    const html = generateSalesLetterHTML({
      title,
      subtitle,
      salesLetter: content,
      niche,
      targetAudience,
    });
    
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-${version}-sales-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${version} sales page HTML downloaded!`);
  };

  const startOver = () => {
    setCurrentPhase('input');
    setRawDraft("");
    setPolishedLetter("");
    setPromptBoxOpen(true);
    onSalesLetterGenerated("");
  };

  const phaseIndicator = (
    <div className="flex items-center justify-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        currentPhase === 'input' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      }`}>
        <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">1</span>
        Input
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground" />
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        currentPhase === 'raw' 
          ? 'bg-primary text-primary-foreground' 
          : currentPhase === 'polished' 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-muted/50 text-muted-foreground/50'
      }`}>
        <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">2</span>
        Raw Draft
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground" />
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        currentPhase === 'polished' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted/50 text-muted-foreground/50'
      }`}>
        <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">3</span>
        Polished
      </div>
    </div>
  );

  const PromptBox = () => (
    <Collapsible open={promptBoxOpen} onOpenChange={setPromptBoxOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <span className="font-medium">Describe Your Offer (Raw Input)</span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${promptBoxOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter the details below. If you provide minimal input, we'll intelligently fill gaps using WarriorPlus-style best practices.
        </p>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="whatProductIs" className="text-sm font-medium">
              What is the product? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="whatProductIs"
              placeholder="A complete toolkit for generating buyer-intent traffic without paid ads or complicated tech..."
              value={promptBoxData.whatProductIs}
              onChange={(e) => updatePromptBox('whatProductIs', e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="whoItsFor" className="text-sm font-medium">
              Who is it for? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="whoItsFor"
              placeholder="Beginner to intermediate marketers who want traffic that converts"
              value={promptBoxData.whoItsFor}
              onChange={(e) => updatePromptBox('whoItsFor', e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="mainProblem" className="text-sm font-medium">
              Main problem it solves? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="mainProblem"
              placeholder="Most traffic advice focuses on vanity metrics, not actual buyers. People waste time on social media getting likes but no sales..."
              value={promptBoxData.mainProblem}
              onChange={(e) => updatePromptBox('mainProblem', e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="desiredOutcome" className="text-sm font-medium">
              Desired outcome? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="desiredOutcome"
              placeholder="A steady stream of buyer-intent traffic that converts into sales, without paid ads or social media burnout"
              value={promptBoxData.desiredOutcome}
              onChange={(e) => updatePromptBox('desiredOutcome', e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="bonusesIncluded" className="text-sm font-medium">
              Bonuses or components included (optional)
            </Label>
            <Textarea
              id="bonusesIncluded"
              placeholder="Core Guide, Traffic Worksheets, Quick-Start Checklists, Resource Vault with templates..."
              value={promptBoxData.bonusesIncluded}
              onChange={(e) => updatePromptBox('bonusesIncluded', e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  const RawDraftView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Sales Letter Draft — Version 1</h3>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            Thinking Draft
          </Badge>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        This is your unpolished, conversational draft. Review it, then polish it with our Proprietary Framework.
      </p>
      
      <div 
        className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-6 max-h-[400px] overflow-y-auto bg-background"
        dangerouslySetInnerHTML={{ __html: rawDraft }}
      />
      
      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          variant="hero" 
          onClick={polishWithFramework} 
          disabled={isGenerating} 
          className="gap-2"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Polish with Framework
        </Button>
        
        <Button 
          variant="outline" 
          onClick={generateRawDraft} 
          disabled={isGenerating} 
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Regenerate Raw
        </Button>
      </div>
    </div>
  );

  const PolishedView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Sales Letter — Final Version</h3>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Framework Applied
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="source">Source Code</TabsTrigger>
          <TabsTrigger value="compare" disabled={!rawDraft}>Compare</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-4">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-6 max-h-[400px] overflow-y-auto bg-background"
            dangerouslySetInnerHTML={{ __html: polishedLetter }}
          />
        </TabsContent>
        
        <TabsContent value="source" className="mt-4">
          <Textarea 
            value={polishedLetter} 
            onChange={(e) => {
              setPolishedLetter(e.target.value);
              onSalesLetterGenerated(e.target.value);
            }} 
            rows={15} 
            className="font-mono text-sm" 
          />
        </TabsContent>
        
        <TabsContent value="compare" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">Raw Draft</span>
                <Badge variant="secondary" className="text-xs">Before</Badge>
              </div>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-4 max-h-[300px] overflow-y-auto bg-muted/30 text-sm"
                dangerouslySetInnerHTML={{ __html: rawDraft }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">Polished</span>
                <Badge className="text-xs bg-emerald-500/10 text-emerald-600">After</Badge>
              </div>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-4 max-h-[300px] overflow-y-auto bg-background text-sm"
                dangerouslySetInnerHTML={{ __html: polishedLetter }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => handleCopy(polishedLetter)} 
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => handleDownloadHTML(polishedLetter, "final")} 
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download HTML
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={polishWithFramework} 
          disabled={isGenerating} 
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          Re-Polish
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={startOver} 
          className="gap-2 text-muted-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">Proprietary Salesletter Framework</h2>
          <p className="text-muted-foreground mt-2">
            Two-phase engine: Generate a raw draft, then polish with our conversion framework.
          </p>
        </div>

        {phaseIndicator}

        {/* Phase 1: Input */}
        {currentPhase === 'input' && (
          <div className="space-y-6">
            <PromptBox />
            
            {!promptBoxOpen && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-2">
                  Open the Prompt Box above to describe your offer.
                </p>
              </div>
            )}
            
            {promptBoxOpen && (
              <div className="flex justify-center">
                <Button 
                  variant="hero" 
                  onClick={generateRawDraft} 
                  disabled={isGenerating || !promptBoxData.whatProductIs.trim()} 
                  className="gap-2"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Generate Raw Draft
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Raw Draft */}
        {currentPhase === 'raw' && (
          <>
            <PromptBox />
            <RawDraftView />
          </>
        )}

        {/* Phase 3: Polished */}
        {currentPhase === 'polished' && (
          <>
            {rawDraft && <PromptBox />}
            <PolishedView />
          </>
        )}

        {isGenerating && (
          <div className="text-center text-sm text-muted-foreground animate-pulse">
            {currentPhase === 'input' 
              ? "Crafting your conversational raw draft..." 
              : "Applying our Proprietary Framework for maximum conversion..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesLetterGenerator;
