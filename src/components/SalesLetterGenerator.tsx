import { useState, useEffect } from "react";
import { Mail, RefreshCw, Copy, Download, Check, Sparkles, ArrowRight, RotateCcw, Zap, Loader2, Code, Eye, ExternalLink, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ToolkitComponents, ToolkitContent, GuideSection } from "@/types/toolkit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSalesLetterHTML, openLivePreview, downloadAsFile, PageTemplate } from "@/lib/salesLetterExport";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { sanitizeHTML } from "@/lib/sanitize";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  thesis?: string;
  guideSections?: GuideSection[];
  content?: ToolkitContent;
  savedOfferDetails?: PromptBoxData;
  savedRawDraft?: string;
  savedPolishedLetter?: string;
  savedStep?: Phase;
  savedHtml?: string;
  onStateChange?: (state: { 
    offerDetails: PromptBoxData; 
    rawDraft: string; 
    polishedLetter: string; 
    step: Phase;
    html: string;
  }) => void;
}

interface PromptBoxData {
  whatProductIs: string;
  whoItsFor: string;
  mainProblem: string;
  desiredOutcome: string;
  bonusesIncluded: string;
}

type Phase = 'input' | 'raw' | 'polished';
type ViewMode = 'preview' | 'source';

const SalesLetterGenerator = ({ 
  title, 
  subtitle,
  niche, 
  targetAudience,
  components,
  onSalesLetterGenerated, 
  existingSalesLetter,
  price = 17,
  authorName,
  thesis,
  guideSections,
  content,
  savedOfferDetails,
  savedRawDraft,
  savedPolishedLetter,
  savedStep,
  savedHtml,
  onStateChange,
}: SalesLetterGeneratorProps) => {
  const [currentPhase, setCurrentPhase] = useState<Phase>(savedStep || (existingSalesLetter ? 'polished' : 'input'));
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate>('kennedy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFillingFromToolkit, setIsFillingFromToolkit] = useState(false);
  const [isOneClickGenerating, setIsOneClickGenerating] = useState(false);
  const [oneClickStep, setOneClickStep] = useState<1 | 2 | 3 | null>(null);
  const [rawDraft, setRawDraft] = useState(savedRawDraft || "");
  const [polishedLetter, setPolishedLetter] = useState(savedPolishedLetter || existingSalesLetter || "");
  const [htmlOutput, setHtmlOutput] = useState(savedHtml || "");
  const [copied, setCopied] = useState(false);
  const [promptBoxOpen, setPromptBoxOpen] = useState(true);
  
  const [promptBoxData, setPromptBoxData] = useState<PromptBoxData>(savedOfferDetails || {
    whatProductIs: "",
    whoItsFor: targetAudience || "",
    mainProblem: "",
    desiredOutcome: "",
    bonusesIncluded: "",
  });

  // Generate HTML whenever polished letter or template changes
  useEffect(() => {
    if (polishedLetter) {
      const html = generateSalesLetterHTML({
        title,
        subtitle,
        salesLetter: polishedLetter,
        niche,
        targetAudience,
        price,
        template: selectedTemplate,
      });
      setHtmlOutput(html);
    }
  }, [polishedLetter, selectedTemplate, title, subtitle, niche, targetAudience, price]);

  // Persist state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        offerDetails: promptBoxData,
        rawDraft,
        polishedLetter,
        step: currentPhase,
        html: htmlOutput,
      });
    }
  }, [promptBoxData, rawDraft, polishedLetter, currentPhase, htmlOutput, onStateChange]);

  const updatePromptBox = (field: keyof PromptBoxData, value: string) => {
    setPromptBoxData(prev => ({ ...prev, [field]: value }));
  };

  const fillFromToolkit = async () => {
    if (!title || !niche) {
      toast.error("Please ensure the toolkit has a title and niche defined.");
      return;
    }

    setIsFillingFromToolkit(true);
    try {
      toast.info("Analyzing your toolkit to generate offer details...");
      
      const { data, error } = await supabase.functions.invoke("generate-offer-details", {
        body: {
          title,
          niche,
          targetAudience,
          thesis,
          components,
          guideSections,
          content,
        },
      });

      if (error) throw error;

      if (data?.offerDetails) {
        setPromptBoxData({
          whatProductIs: data.offerDetails.whatProductIs || "",
          whoItsFor: data.offerDetails.whoItsFor || targetAudience || "",
          mainProblem: data.offerDetails.mainProblem || "",
          desiredOutcome: data.offerDetails.desiredOutcome || "",
          bonusesIncluded: data.offerDetails.bonusesIncluded || "",
        });
        toast.success("Offer details filled from your toolkit!");
      } else {
        throw new Error("No offer details returned");
      }
    } catch (error) {
      console.error("Error filling from toolkit:", error);
      toast.error("Failed to generate offer details. Please fill manually.");
    } finally {
      setIsFillingFromToolkit(false);
    }
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
        toast.success("Raw draft generated! Now polish with the DigiStream Conversion Pattern.");
        return true;
      } else {
        throw new Error("No sales letter returned");
      }
    } catch (error) {
      console.error("Error generating raw draft:", error);
      toast.error("Failed to generate raw draft. Please try again.");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const polishWithDCP = async (draftToPolish?: string) => {
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
          rawDraft: draftToPolish || rawDraft,
        },
      });

      if (error) throw error;

      if (data?.salesLetter) {
        setPolishedLetter(data.salesLetter);
        onSalesLetterGenerated(data.salesLetter);
        setCurrentPhase('polished');
        toast.success("Sales letter polished with DigiStream Conversion Pattern!");
        return true;
      } else {
        throw new Error("No sales letter returned");
      }
    } catch (error) {
      console.error("Error polishing sales letter:", error);
      toast.error("Failed to polish sales letter. Please try again.");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const oneClickGenerate = async () => {
    if (!title || !niche) {
      toast.error("Please ensure the toolkit has a title and niche defined.");
      return;
    }

    setIsOneClickGenerating(true);
    
    try {
      const hasOfferDetails = promptBoxData.whatProductIs || promptBoxData.mainProblem;
      let currentPromptData = promptBoxData;
      
      if (!hasOfferDetails) {
        setOneClickStep(1);
        toast.info("Step 1/3: Generating offer details from your toolkit...");
        
        const { data: fillData, error: fillError } = await supabase.functions.invoke("generate-offer-details", {
          body: {
            title,
            niche,
            targetAudience,
            thesis,
            components,
            guideSections,
            content,
          },
        });

        if (fillError) throw fillError;

        if (fillData?.offerDetails) {
          currentPromptData = {
            whatProductIs: fillData.offerDetails.whatProductIs || "",
            whoItsFor: fillData.offerDetails.whoItsFor || targetAudience || "",
            mainProblem: fillData.offerDetails.mainProblem || "",
            desiredOutcome: fillData.offerDetails.desiredOutcome || "",
            bonusesIncluded: fillData.offerDetails.bonusesIncluded || "",
          };
          setPromptBoxData(currentPromptData);
        }
      }

      setOneClickStep(2);
      toast.info("Step 2/3: Generating raw draft...");
      
      const { data: rawData, error: rawError } = await supabase.functions.invoke("generate-sales-letter", {
        body: {
          phase: "raw",
          title,
          subtitle,
          niche,
          targetAudience: currentPromptData.whoItsFor || targetAudience || "Online entrepreneurs",
          components,
          price,
          authorName,
          promptBoxData: currentPromptData,
        },
      });

      if (rawError) throw rawError;

      if (!rawData?.salesLetter) {
        throw new Error("No raw draft returned");
      }

      setRawDraft(rawData.salesLetter);

      setOneClickStep(3);
      toast.info("Step 3/3: Applying DigiStream Conversion Pattern...");
      
      const { data: polishData, error: polishError } = await supabase.functions.invoke("generate-sales-letter", {
        body: {
          phase: "polish",
          title,
          subtitle,
          niche,
          targetAudience: currentPromptData.whoItsFor || targetAudience,
          components,
          price,
          authorName,
          promptBoxData: currentPromptData,
          rawDraft: rawData.salesLetter,
        },
      });

      if (polishError) throw polishError;

      if (polishData?.salesLetter) {
        setPolishedLetter(polishData.salesLetter);
        onSalesLetterGenerated(polishData.salesLetter);
        setCurrentPhase('polished');
        setPromptBoxOpen(false);
        toast.success("Sales letter complete using DigiStream Conversion Pattern!");
      } else {
        throw new Error("No polished letter returned");
      }
    } catch (error) {
      console.error("One-click generation error:", error);
      toast.error("Generation failed. Please try the manual steps.");
    } finally {
      setIsOneClickGenerating(false);
      setOneClickStep(null);
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHTML = () => {
    const filename = `${title.replace(/\s+/g, "-").toLowerCase()}-sales-page.html`;
    downloadAsFile(htmlOutput, filename, 'text/html');
    toast.success("HTML file downloaded!");
  };

  const handleDownloadTXT = () => {
    // Strip HTML tags for plain text
    const plainText = polishedLetter
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    const filename = `${title.replace(/\s+/g, "-").toLowerCase()}-sales-letter.txt`;
    downloadAsFile(plainText, filename, 'text/plain');
    toast.success("Text file downloaded!");
  };

  const handleLivePreview = () => {
    openLivePreview(htmlOutput);
    toast.success("Opening live preview in new tab...");
  };

  const startOver = () => {
    setCurrentPhase('input');
    setRawDraft("");
    setPolishedLetter("");
    setHtmlOutput("");
    setPromptBoxOpen(true);
    setViewMode('preview');
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
        DCP Applied
      </div>
    </div>
  );

  const AutoFillBar = () => (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">Auto-build from toolkit</p>
          <p className="text-xs text-muted-foreground">Uses your Title, Audience, Thesis, Components, and Content</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fillFromToolkit}
          disabled={isFillingFromToolkit || isOneClickGenerating}
          className="gap-2"
        >
          {isFillingFromToolkit ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Filling...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Fill from Toolkit
            </>
          )}
        </Button>
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
            {promptBoxData.whatProductIs && (
              <Badge variant="secondary" className="ml-2 bg-emerald-500/10 text-emerald-600">
                Filled
              </Badge>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${promptBoxOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter the details below, or use "Fill from Toolkit" to auto-generate these from your toolkit data.
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Draft v1 (Raw)</h3>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            Clarity Draft - No Framework
          </Badge>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        This is your unpolished, honest draft. Click below to apply the DigiStream Conversion Pattern.
      </p>
      
      <div 
        className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-6 max-h-[300px] overflow-y-auto bg-background"
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(rawDraft) }}
      />

      <div className="border rounded-lg p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">DigiStream Conversion Pattern™</h4>
            <p className="text-xs text-muted-foreground mt-1">
              A clarity-first sales letter framework engineered for real buyers — not hype. 
              Follows the flow: Clarity → Belief → Momentum → Action.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          variant="hero" 
          onClick={() => polishWithDCP()} 
          disabled={isGenerating} 
          className="gap-2"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Apply DigiStream Conversion Pattern
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => handleCopy(rawDraft)} 
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy Draft
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Final (DCP Applied)</h3>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Conversion Optimized
          </Badge>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Zap className="w-3 h-3" />
          DigiStream Conversion Pattern™
        </Badge>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">View Mode:</span>
          <div className="flex rounded-lg border bg-background p-1">
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="gap-2 h-8"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              variant={viewMode === 'source' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('source')}
              className="gap-2 h-8"
            >
              <Code className="w-4 h-4" />
              Source Code
            </Button>
          </div>
        </div>

        {viewMode === 'source' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Template:</span>
            <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as PageTemplate)}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warriorplus">WarriorPlus (Dark)</SelectItem>
                <SelectItem value="saas">Clean SaaS (Light)</SelectItem>
                <SelectItem value="simple">Simple Checkout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {viewMode === 'preview' ? (
        <>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Formatted</TabsTrigger>
              <TabsTrigger value="compare" disabled={!rawDraft}>Compare</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-4">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-6 max-h-[400px] overflow-y-auto bg-background"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(polishedLetter) }}
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
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(rawDraft) }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">DCP Applied</span>
                    <Badge className="text-xs bg-emerald-500/10 text-emerald-600">After</Badge>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-4 max-h-[300px] overflow-y-auto bg-background text-sm"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(polishedLetter) }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => polishWithDCP()}
              disabled={isGenerating}
              className="gap-2 text-muted-foreground"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Re-polish with DCP
            </Button>
          </div>
          
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
              onClick={handleDownloadHTML} 
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download HTML
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
        </>
      ) : (
        /* Source Code View */
        <div className="space-y-4">
          <Textarea 
            value={htmlOutput} 
            onChange={(e) => setHtmlOutput(e.target.value)} 
            rows={18} 
            className="font-mono text-xs leading-relaxed" 
          />

          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleCopy(htmlOutput)} 
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy HTML
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownloadHTML} 
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download .html
            </Button>

            <Button 
              variant="outline" 
              onClick={handleDownloadTXT} 
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Download .txt
            </Button>

            <Button 
              variant="outline" 
              onClick={handleLivePreview} 
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Live Preview
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => {
                const html = generateSalesLetterHTML({
                  title,
                  subtitle,
                  salesLetter: polishedLetter,
                  niche,
                  targetAudience,
                  price,
                  template: selectedTemplate,
                });
                setHtmlOutput(html);
                toast.success("Reset to template!");
              }} 
              className="gap-2 text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Template
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">DigiStream Conversion Pattern™</h2>
          <p className="text-muted-foreground mt-2">
            A clarity-first sales letter framework engineered for real buyers — not hype.
          </p>
        </div>

        {phaseIndicator}

        {/* Phase 1: Input */}
        {currentPhase === 'input' && (
          <div className="space-y-6">
            <div className="text-center p-6 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
              <Zap className="w-10 h-10 mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Recommended: One-Click Generate</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Automatically fills offer details, generates a raw draft, and applies the DigiStream Conversion Pattern.
              </p>
              <Button 
                variant="hero" 
                size="lg"
                onClick={oneClickGenerate}
                disabled={isOneClickGenerating || !title || !niche}
                className="gap-2"
              >
                {isOneClickGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {oneClickStep === 1 && "Step 1/3: Filling details..."}
                    {oneClickStep === 2 && "Step 2/3: Generating draft..."}
                    {oneClickStep === 3 && "Step 3/3: Applying DCP..."}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate Sales Letter (Recommended)
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or customize manually
                </span>
              </div>
            </div>
            
            <AutoFillBar />
            <PromptBox />
            
            {promptBoxOpen && (
              <div className="flex justify-center gap-3">
                <Button 
                  variant="hero" 
                  onClick={generateRawDraft} 
                  disabled={isGenerating || !promptBoxData.whatProductIs}
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
            
            {!promptBoxOpen && !promptBoxData.whatProductIs && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-2">
                  Open the Prompt Box above to describe your offer.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Raw Draft */}
        {currentPhase === 'raw' && <RawDraftView />}

        {/* Phase 3: Polished with DCP */}
        {currentPhase === 'polished' && <PolishedView />}
      </CardContent>
    </Card>
  );
};

export default SalesLetterGenerator;
