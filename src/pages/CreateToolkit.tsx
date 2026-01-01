import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, Check, Loader2, 
  Lightbulb, Palette, FileText, Image, 
  Mail, Gift, Download, Sparkles, LayoutTemplate, Send, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ToolkitComponents, WritingStyle } from "@/types/toolkit";
import LogoCreator from "@/components/LogoCreator";
import EcoverGenerator from "@/components/EcoverGenerator";
import SalesLetterGenerator from "@/components/SalesLetterGenerator";
import EmailSequenceGenerator from "@/components/EmailSequenceGenerator";
import UpsellCreator from "@/components/UpsellCreator";
import ToolkitPreview from "@/components/ToolkitPreview";
import PricingSuggester from "@/components/PricingSuggester";
import TemplateSelector from "@/components/TemplateSelector";
import ContentStatusCard from "@/components/toolkit/ContentStatusCard";
import ContentControlsBar from "@/components/toolkit/ContentControlsBar";
import ComponentRow, { ComponentStatus } from "@/components/toolkit/ComponentRow";
import ThesisFrameworkCard from "@/components/toolkit/ThesisFrameworkCard";
import { ToolkitTemplate } from "@/data/toolkitTemplates";

const steps = [
  { id: "template", title: "Choose Template", icon: LayoutTemplate },
  { id: "niche", title: "Niche & Title", icon: Lightbulb },
  { id: "logo", title: "Create Logo", icon: Palette },
  { id: "components", title: "Select Components", icon: FileText },
  { id: "content", title: "Build Your Toolkit", icon: Sparkles },
  { id: "ecover", title: "E-Cover", icon: Image },
  { id: "sales", title: "Sales Letter", icon: Mail },
  { id: "emails", title: "Email Sequence", icon: Send },
  { id: "upsell", title: "Upsell (Optional)", icon: Gift },
  { id: "download", title: "Download", icon: Download },
];

const componentOptions = [
  { id: "guide", label: "Main Guide/Ebook", description: "Core content piece", required: true },
  { id: "worksheet", label: "Worksheet/Workbook", description: "Interactive exercises" },
  { id: "checklist", label: "Checklist", description: "Step-by-step action items" },
  { id: "resourceList", label: "Resource List", description: "Curated tools and links" },
  { id: "templates", label: "Templates", description: "Copy-paste swipe files" },
  { id: "quiz", label: "Quiz/Assessment", description: "Self-evaluation tool" },
];

const CreateToolkit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toolkitId, setToolkitId] = useState<string | null>(null);
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [niche, setNiche] = useState(searchParams.get("niche") || "");
  const [targetAudience, setTargetAudience] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorTagline, setAuthorTagline] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [ecoverUrl, setEcoverUrl] = useState<string | null>(null);
  const [components, setComponents] = useState<ToolkitComponents>({
    guide: true,
    worksheet: false,
    checklist: false,
    resourceList: false,
    templates: false,
    quiz: false,
  });
  const [content, setContent] = useState<any>({});
  const [salesLetter, setSalesLetter] = useState("");
  const [emailSequence, setEmailSequence] = useState<any>(null);
  const [upsell, setUpsell] = useState<any>(null);

  // Content generation state
  const [writingStyle, setWritingStyle] = useState<WritingStyle>("conversational");
  const [humanize, setHumanize] = useState(true);
  const [componentStatus, setComponentStatus] = useState<Record<string, ComponentStatus>>({});
  const [generatingComponentId, setGeneratingComponentId] = useState<string | null>(null);
  
  // Thesis/Framework state
  const [thesis, setThesis] = useState("");
  const [lockFramework, setLockFramework] = useState(true);
  const [isRegeneratingThesis, setIsRegeneratingThesis] = useState(false);

  // Component metadata
  const componentMeta: Record<string, { title: string; description: string; estimatedSize: string }> = {
    guide: { title: "Main Guide", description: "Core educational content with sections", estimatedSize: "Est. ~25 pages" },
    worksheet: { title: "Worksheet Pack", description: "Interactive exercises", estimatedSize: "Includes 5 worksheets" },
    checklist: { title: "Checklist", description: "Step-by-step action items", estimatedSize: "Quick reference format" },
    resourceList: { title: "Resource List", description: "Curated tools and links", estimatedSize: "Valuable external resources" },
    templates: { title: "Templates", description: "Copy-paste swipe files", estimatedSize: "Ready-to-use formats" },
    quiz: { title: "Quiz/Assessment", description: "Self-evaluation tool", estimatedSize: "10 questions" },
  };

  // Calculate selected components
  const selectedComponentIds = Object.entries(components)
    .filter(([_, isSelected]) => isSelected)
    .map(([id]) => id);

  const completedCount = selectedComponentIds.filter(id => componentStatus[id] === "complete").length;
  const totalWords = selectedComponentIds.reduce((acc, id) => {
    const componentContent = content[id];
    if (!componentContent) return acc;
    const text = JSON.stringify(componentContent);
    return acc + text.split(/\s+/).length;
  }, 0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Auto-generate thesis when reaching Step 4 if empty
  useEffect(() => {
    if (currentStep === 4 && !thesis && title && niche) {
      // Trigger AI generation automatically on first visit to step 4
      handleRegenerateThesis();
    }
  }, [currentStep, thesis, title, niche]);

  const handleRegenerateThesis = async () => {
    if (!title || !niche) {
      toast({
        title: "Missing Information",
        description: "Title and niche are required to generate a thesis.",
        variant: "destructive",
      });
      return;
    }

    setIsRegeneratingThesis(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-thesis', {
        body: {
          title,
          niche,
          targetAudience,
          components,
        },
      });

      if (error) throw error;

      if (data?.thesis) {
        setThesis(data.thesis);
        toast({
          title: "Thesis Generated",
          description: "Your core framework thesis has been created.",
        });
      }
    } catch (error) {
      console.error('Error generating thesis:', error);
      // Fallback to simple thesis
      const fallbackThesis = `This toolkit is built on the idea that ${niche.toLowerCase()} mastery is achieved through a systematic approach of focused learning, practical application, and consistent reinforcement. ${targetAudience ? `Designed specifically for ${targetAudience.toLowerCase()}, ` : ""}the framework guides users from understanding core concepts to implementing real-world solutions, using actionable tools that reinforce progress at each stage.`;
      setThesis(fallbackThesis);
      toast({
        title: "Using Default Thesis",
        description: "AI generation unavailable. You can edit the thesis manually.",
        variant: "destructive",
      });
    } finally {
      setIsRegeneratingThesis(false);
    }
  };

  const handleTemplateSelect = (template: ToolkitTemplate) => {
    setSelectedTemplate(template.id);
    
    // Pre-populate fields from template (except for "blank")
    if (template.id !== "blank") {
      if (template.suggestedNiche) setNiche(template.suggestedNiche);
      if (template.suggestedTitle) setTitle(template.suggestedTitle);
      if (template.suggestedAudience) setTargetAudience(template.suggestedAudience);
      setComponents(template.components);
    }
  };

  const handleNext = async () => {
    // Validation for template selection
    if (currentStep === 0 && !selectedTemplate) {
      toast({
        title: "Choose a Template",
        description: "Please select a template to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validation for niche & title
    if (currentStep === 1 && (!title || !niche)) {
      toast({
        title: "Missing Information",
        description: "Please fill in the toolkit title and niche.",
        variant: "destructive",
      });
      return;
    }

    // Save draft when moving forward from niche step
    if (currentStep === 1 && !toolkitId) {
      await saveDraft();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveDraft = async () => {
    if (!user) return;
    
    try {
      const toolkitData: any = {
        user_id: user.id,
        title,
        subtitle,
        niche,
        target_audience: targetAudience,
        logo_url: logoUrl,
        ecover_url: ecoverUrl,
        components,
        content,
        sales_letter: salesLetter,
        upsell,
        status: "draft",
      };

      if (toolkitId) {
        await supabase.from("toolkits").update(toolkitData).eq("id", toolkitId);
      } else {
        const { data, error } = await supabase.from("toolkits").insert(toolkitData).select("id").single();
        if (error) throw error;
        setToolkitId(data.id);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const handleComponentToggle = (componentId: keyof ToolkitComponents) => {
    if (componentId === "guide") return; // Guide is required
    setComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId],
    }));
  };

  // Generate a single component
  const generateSingleComponent = useCallback(async (componentId: string) => {
    setGeneratingComponentId(componentId);
    setComponentStatus(prev => ({ ...prev, [componentId]: "generating" }));

    try {
      const { data, error } = await supabase.functions.invoke("generate-toolkit-content", {
        body: {
          title,
          niche,
          targetAudience,
          components: { [componentId]: true },
          writingStyle,
          humanize,
        },
      });

      if (error) throw error;

      setContent((prev: any) => ({
        ...prev,
        [componentId]: data.content[componentId],
      }));
      setComponentStatus(prev => ({ ...prev, [componentId]: "complete" }));

      toast({
        title: "Component Generated!",
        description: `${componentMeta[componentId]?.title || componentId} is ready.`,
      });
    } catch (error) {
      console.error(`Error generating ${componentId}:`, error);
      setComponentStatus(prev => ({ ...prev, [componentId]: "error" }));
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingComponentId(null);
    }
  }, [title, niche, targetAudience, writingStyle, humanize, toast, componentMeta]);

  // Generate all remaining components
  const generateAllRemaining = useCallback(async () => {
    const pendingComponents = selectedComponentIds.filter(
      id => componentStatus[id] !== "complete"
    );

    if (pendingComponents.length === 0) {
      toast({
        title: "All Done!",
        description: "All components have already been generated.",
      });
      return;
    }

    setIsGenerating(true);

    for (const componentId of pendingComponents) {
      await generateSingleComponent(componentId);
    }

    setIsGenerating(false);

    toast({
      title: "Toolkit Complete! 🎉",
      description: "All components have been generated.",
    });
  }, [selectedComponentIds, componentStatus, generateSingleComponent, toast]);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <DashboardLayout title="Create Toolkit">
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
                <span className="font-medium">{currentStepData.title}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mt-6 overflow-x-auto pb-2">
              {steps.map((step, i) => (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center min-w-[60px] ${
                    i <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    i < currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : i === currentStep 
                        ? 'bg-primary/20 border-2 border-primary' 
                        : 'bg-secondary'
                  }`}>
                    {i < currentStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <span className="text-xs mt-1 hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <Card>
                  <CardContent className="p-6">
                    <TemplateSelector
                      selectedTemplate={selectedTemplate}
                      onSelect={handleTemplateSelect}
                    />
                  </CardContent>
                </Card>
              )}

              {currentStep === 1 && (
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold gradient-text">What's Your Toolkit About?</h2>
                      <p className="text-muted-foreground mt-2">
                        {selectedTemplate !== "blank" 
                          ? "We've pre-filled some suggestions based on your template. Feel free to customize!"
                          : "Pick a niche that solves a specific problem for your target audience."
                        }
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="niche">Niche/Topic *</Label>
                        <Input
                          id="niche"
                          placeholder="e.g., AI Prompt Engineering, Traffic Generation, Email Marketing"
                          value={niche}
                          onChange={(e) => setNiche(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="title">Toolkit Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., The Ultimate AI Prompt Toolkit"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                        <Input
                          id="subtitle"
                          placeholder="e.g., 50+ Ready-to-Use Prompts for Content Creators"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="audience">Target Audience</Label>
                        <Textarea
                          id="audience"
                          placeholder="Who is this for? e.g., Beginner content creators who want to leverage AI"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      {/* Author Identity Section */}
                      <div className="pt-4 border-t border-border">
                        <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                          ✍️ Author Identity
                          <span className="text-xs font-normal text-muted-foreground">(Builds trust & increases perceived value)</span>
                        </h3>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="authorName">Author Name *</Label>
                            <Input
                              id="authorName"
                              placeholder="Your name or pen name (e.g., Sarah Mitchell)"
                              value={authorName}
                              onChange={(e) => setAuthorName(e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="authorTagline">Tagline (Optional)</Label>
                            <Input
                              id="authorTagline"
                              placeholder="e.g., Digital Marketing Strategist | 10+ Years Experience"
                              value={authorTagline}
                              onChange={(e) => setAuthorTagline(e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="authorBio">Short Bio (Optional)</Label>
                            <Textarea
                              id="authorBio"
                              placeholder="2-3 lines about you or your brand that builds credibility..."
                              value={authorBio}
                              onChange={(e) => setAuthorBio(e.target.value)}
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <LogoCreator 
                  brandName={title}
                  onLogoGenerated={setLogoUrl}
                  existingLogo={logoUrl}
                />
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold gradient-text">What's In Your Toolkit?</h2>
                        <p className="text-muted-foreground mt-2">
                          {selectedTemplate !== "blank"
                            ? "Components from your template are pre-selected. Adjust as needed."
                            : "Select the components you want to include. More components = more value."
                          }
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {componentOptions.map((option) => (
                          <div
                            key={option.id}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              components[option.id as keyof ToolkitComponents]
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            } ${option.required ? 'opacity-100' : ''}`}
                            onClick={() => handleComponentToggle(option.id as keyof ToolkitComponents)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={components[option.id as keyof ToolkitComponents]}
                                disabled={option.required}
                              />
                              <div>
                                <p className="font-medium">
                                  {option.label}
                                  {option.required && <span className="text-xs text-primary ml-2">(Required)</span>}
                                </p>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pricing Suggester */}
                  <PricingSuggester 
                    niche={niche}
                    components={components}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Status Card */}
                  <ContentStatusCard
                    title={title}
                    niche={niche}
                    completedCount={completedCount}
                    totalCount={selectedComponentIds.length}
                    totalWords={totalWords}
                  />

                  {/* Thesis & Framework Card */}
                  <ThesisFrameworkCard
                    thesis={thesis}
                    onThesisChange={setThesis}
                    lockFramework={lockFramework}
                    onLockChange={setLockFramework}
                    onRegenerateThesis={handleRegenerateThesis}
                    isRegenerating={isRegeneratingThesis}
                  />

                  {/* Controls Bar */}
                  <ContentControlsBar
                    humanize={humanize}
                    onHumanizeChange={setHumanize}
                    writingStyle={writingStyle}
                    onStyleChange={setWritingStyle}
                  />

                  {/* Component List Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Components</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedComponentIds.length - completedCount} remaining
                      </p>
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={generateAllRemaining}
                      disabled={isGenerating || completedCount === selectedComponentIds.length}
                      className="gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Generate All Remaining
                    </Button>
                  </div>

                  {/* Component Rows */}
                  <div className="space-y-3">
                    {selectedComponentIds.map((componentId, index) => (
                      <ComponentRow
                        key={componentId}
                        number={index + 1}
                        id={componentId}
                        title={componentMeta[componentId]?.title || componentId}
                        description={componentMeta[componentId]?.description || ""}
                        estimatedSize={componentMeta[componentId]?.estimatedSize || ""}
                        status={componentStatus[componentId] || "pending"}
                        wordCount={
                          content[componentId]
                            ? JSON.stringify(content[componentId]).split(/\s+/).length
                            : undefined
                        }
                        onGenerate={() => generateSingleComponent(componentId)}
                        onView={() => {
                          toast({
                            title: componentMeta[componentId]?.title || componentId,
                            description: "Component preview will open in the final step.",
                          });
                        }}
                        disabled={isGenerating && generatingComponentId !== componentId}
                      />
                    ))}
                  </div>

                  {/* All Complete Message */}
                  {completedCount === selectedComponentIds.length && completedCount > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">
                          All components generated! You can proceed to the next step.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                <EcoverGenerator
                  title={title}
                  subtitle={subtitle}
                  niche={niche}
                  logoUrl={logoUrl}
                  onEcoverGenerated={setEcoverUrl}
                  existingEcover={ecoverUrl}
                />
              )}

              {currentStep === 6 && (
                <SalesLetterGenerator
                  title={title}
                  subtitle={subtitle}
                  niche={niche}
                  targetAudience={targetAudience}
                  components={components}
                  onSalesLetterGenerated={setSalesLetter}
                  existingSalesLetter={salesLetter}
                />
              )}

              {currentStep === 7 && (
                <EmailSequenceGenerator
                  offerName={title}
                  targetAudience={targetAudience || `${niche} enthusiasts`}
                  price={17}
                  onSequenceGenerated={setEmailSequence}
                />
              )}

              {currentStep === 8 && (
                <UpsellCreator
                  title={title}
                  niche={niche}
                  onUpsellCreated={setUpsell}
                  existingUpsell={upsell}
                />
              )}

              {currentStep === 9 && (
                <ToolkitPreview
                  toolkit={{
                    title,
                    subtitle,
                    niche,
                    targetAudience,
                    authorName,
                    authorTagline,
                    authorBio,
                    logoUrl,
                    ecoverUrl,
                    components,
                    content,
                    salesLetter,
                    upsell,
                    emailSequence,
                  }}
                  toolkitId={toolkitId}
                  onComplete={async () => {
                    if (toolkitId) {
                      await supabase.from("toolkits").update({ status: "complete" }).eq("id", toolkitId);
                    }
                    toast({
                      title: "Toolkit Complete! 🎉",
                      description: "Your toolkit has been saved and is ready to download.",
                    });
                    navigate("/my-toolkits");
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 9 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="hero"
                onClick={handleNext}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateToolkit;
