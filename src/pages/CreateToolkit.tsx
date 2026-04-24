import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, Check, Loader2, 
  Lightbulb, FileText, Image, 
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
import { ToolkitComponents, WritingStyle, GuideSection, GUIDE_SECTION_TEMPLATES } from "@/types/toolkit";
import { useAutosave } from "@/hooks/useAutosave";

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
import GuideSectionBuilder from "@/components/toolkit/GuideSectionBuilder";
import ChapterOutlineBuilder, { CustomChapter, getDefaultChapters } from "@/components/toolkit/ChapterOutlineBuilder";
import { ToolkitTemplate } from "@/data/toolkitTemplates";

const steps = [
  { id: "template", title: "Choose Template", icon: LayoutTemplate },
  { id: "niche", title: "Niche & Title", icon: Lightbulb },
  { id: "components", title: "Select Components", icon: FileText },
  { id: "content", title: "Build Your Toolkit", icon: Sparkles },
  { id: "ecover", title: "E-Cover", icon: Image },
  { id: "sales", title: "Sales Letter", icon: Mail },
  { id: "emails", title: "Email Sequence", icon: Send },
  { id: "upsell", title: "Upsell (Optional)", icon: Gift },
  { id: "download", title: "Download", icon: Download },
];

const WIZARD_STORAGE_KEY = "toolkit-wizard-progress";

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
  
  // Check for edit mode (resume from saved toolkit)
  const editToolkitId = searchParams.get("edit");
  
  // Load saved progress from localStorage
  const savedProgress = localStorage.getItem(WIZARD_STORAGE_KEY);
  const initialState = savedProgress ? JSON.parse(savedProgress) : null;
  
  const [currentStep, setCurrentStep] = useState(initialState?.currentStep || 0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toolkitId, setToolkitId] = useState<string | null>(initialState?.toolkitId || null);
  const [isLoadingToolkit, setIsLoadingToolkit] = useState(!!editToolkitId);
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(initialState?.selectedTemplate || null);
  
  // Form state
  const [title, setTitle] = useState(initialState?.title || "");
  const [subtitle, setSubtitle] = useState(initialState?.subtitle || "");
  const [niche, setNiche] = useState(initialState?.niche || searchParams.get("niche") || "");
  const [targetAudience, setTargetAudience] = useState(initialState?.targetAudience || "");
  const [authorName, setAuthorName] = useState(initialState?.authorName || "");
  const [authorTagline, setAuthorTagline] = useState(initialState?.authorTagline || "");
  const [authorBio, setAuthorBio] = useState(initialState?.authorBio || "");
  const [logoUrl, setLogoUrl] = useState<string | null>(initialState?.logoUrl || null);
  const [ecoverUrl, setEcoverUrl] = useState<string | null>(initialState?.ecoverUrl || null);
  const [components, setComponents] = useState<ToolkitComponents>(initialState?.components || {
    guide: true,
    worksheet: false,
    checklist: false,
    resourceList: false,
    templates: false,
    quiz: false,
  });
  const [content, setContent] = useState<any>(initialState?.content || {});
  const [salesLetter, setSalesLetter] = useState(initialState?.salesLetter || "");
  const [emailSequence, setEmailSequence] = useState<any>(initialState?.emailSequence || null);
  const [upsell, setUpsell] = useState<any>(initialState?.upsell || null);

  // Content generation state
  const [writingStyle, setWritingStyle] = useState<WritingStyle>("conversational");
  const [humanize, setHumanize] = useState(true);
  const [componentStatus, setComponentStatus] = useState<Record<string, ComponentStatus>>({});
  const [generatingComponentId, setGeneratingComponentId] = useState<string | null>(null);
  
  // Thesis/Framework state
  const [thesis, setThesis] = useState(initialState?.thesis || "");
  const [lockFramework, setLockFramework] = useState(initialState?.lockFramework ?? true);
  const [isRegeneratingThesis, setIsRegeneratingThesis] = useState(false);
  const [thesisMode, setThesisMode] = useState<'manual' | 'ai'>(initialState?.thesisMode || 'ai');
  const [isImprovingThesis, setIsImprovingThesis] = useState(false);

  // Guide Section Builder state
  const [guideSections, setGuideSections] = useState<GuideSection[]>(
    initialState?.guideSections || [...GUIDE_SECTION_TEMPLATES]
  );
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(null);

  // Chapter Outline Builder state
  const [customChapters, setCustomChapters] = useState<CustomChapter[]>(
    initialState?.customChapters || getDefaultChapters()
  );

  // Flag to prevent save during reset
  const isResettingRef = useRef(false);

  // Universal autosave (2s debounce) — keystroke-level persistence
  useAutosave({
    table: "toolkits",
    recordId: toolkitId,
    setRecordId: setToolkitId,
    userId: user?.id,
    data: {
      title: title || "Untitled Toolkit",
      subtitle,
      niche: niche || "draft",
      target_audience: targetAudience,
      logo_url: logoUrl,
      ecover_url: ecoverUrl,
      components: components as any,
      content,
      sales_letter: salesLetter,
      upsell,
      thesis,
      guide_sections: guideSections as any,
      writing_style: writingStyle,
      wizard_step: currentStep,
      status: "draft",
    },
    enabled: !!user && !isResettingRef.current && (!!title || !!niche),
  });

  // Component metadata
  const componentMeta: Record<string, { title: string; description: string; estimatedSize: string }> = {
    guide: { title: "Main Guide", description: "Core educational content with sections", estimatedSize: "Est. ~25 pages" },
    worksheet: { title: "Worksheet Pack", description: "Interactive exercises", estimatedSize: "Includes 5 worksheets" },
    checklist: { title: "Checklist", description: "Step-by-step action items", estimatedSize: "Quick reference format" },
    resourceList: { title: "Resource List", description: "Curated tools and links", estimatedSize: "Valuable external resources" },
    templates: { title: "Templates", description: "Copy-paste swipe files", estimatedSize: "Ready-to-use formats" },
    quiz: { title: "Quiz/Assessment", description: "Self-evaluation tool", estimatedSize: "10 questions" },
  };

  // Calculate selected components (excluding guide since it uses section builder)
  const selectedComponentIds = Object.entries(components)
    .filter(([id, isSelected]) => isSelected && id !== 'guide')
    .map(([id]) => id);

  const guideComplete = guideSections.every(s => s.status === "complete");
  const completedCount = selectedComponentIds.filter(id => componentStatus[id] === "complete").length + (guideComplete ? 1 : 0);
  const totalComponentCount = selectedComponentIds.length + (components.guide ? 1 : 0);
  const totalWords = selectedComponentIds.reduce((acc, id) => {
    const componentContent = content[id];
    if (!componentContent) return acc;
    const text = JSON.stringify(componentContent);
    return acc + text.split(/\s+/).length;
  }, 0) + guideSections.reduce((acc, s) => acc + s.wordCount, 0);

  // Load toolkit from database if editing
  useEffect(() => {
    const loadToolkit = async () => {
      if (!editToolkitId || !user) return;
      
      try {
        const { data, error } = await supabase
          .from("toolkits")
          .select("*")
          .eq("id", editToolkitId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Toolkit not found");

        // Restore state from database
        setToolkitId(data.id);
        setTitle(data.title);
        setSubtitle(data.subtitle || "");
        setNiche(data.niche);
        setTargetAudience(data.target_audience || "");
        setLogoUrl(data.logo_url);
        setEcoverUrl(data.ecover_url);
        setComponents((data.components as unknown as ToolkitComponents) || { guide: true, worksheet: false, checklist: false, resourceList: false, templates: false, quiz: false });
        setContent(data.content || {});
        setSalesLetter(data.sales_letter || "");
        setUpsell(data.upsell || null);
        setCurrentStep((data as any).wizard_step || 3); // Default to content step
        setThesis((data as any).thesis || "");
        setWritingStyle(((data as any).writing_style as WritingStyle) || "conversational");
        
        // Restore guide sections if available
        const savedSections = (data as any).guide_sections;
        if (savedSections && Array.isArray(savedSections) && savedSections.length > 0) {
          setGuideSections(savedSections as GuideSection[]);
        }

        toast({
          title: "Toolkit Loaded",
          description: "Resuming from where you left off.",
        });
      } catch (error) {
        console.error("Error loading toolkit:", error);
        toast({
          title: "Error",
          description: "Failed to load toolkit.",
          variant: "destructive",
        });
        navigate("/my-toolkits");
      } finally {
        setIsLoadingToolkit(false);
      }
    };

    loadToolkit();
  }, [editToolkitId, user]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    // Don't save if we're in the process of resetting
    if (isResettingRef.current) return;
    
    const progressData = {
      currentStep,
      toolkitId,
      selectedTemplate,
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
      emailSequence,
      upsell,
      guideSections,
      thesis,
      writingStyle,
      thesisMode,
      lockFramework,
      customChapters,
    };
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(progressData));
  }, [currentStep, toolkitId, selectedTemplate, title, subtitle, niche, targetAudience, authorName, authorTagline, authorBio, logoUrl, ecoverUrl, components, content, salesLetter, emailSequence, upsell, guideSections, thesis, writingStyle, thesisMode, lockFramework, customChapters]);

  // Clear saved progress when toolkit is completed
  const clearSavedProgress = () => {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  };

  // Auto-generate thesis when reaching Step 3 (content step) if empty AND in AI mode
  useEffect(() => {
    if (currentStep === 3 && !thesis && title && niche && !isLoadingToolkit && thesisMode === 'ai') {
      handleRegenerateThesis();
    }
  }, [currentStep, thesis, title, niche, isLoadingToolkit, thesisMode]);

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

  // AI thesis improvement handlers
  const handleImproveThesis = async (mode: 'improve_clarity' | 'make_specific' | 'simplify') => {
    if (!thesis) return;

    setIsImprovingThesis(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-thesis', {
        body: {
          title,
          niche,
          targetAudience,
          components,
          existingThesis: thesis,
          mode,
        },
      });

      if (error) throw error;

      if (data?.thesis) {
        setThesis(data.thesis);
        toast({
          title: "Thesis Improved",
          description: mode === 'improve_clarity' 
            ? "Your thesis is now clearer." 
            : mode === 'make_specific' 
            ? "Your thesis is now more specific."
            : "Your thesis has been simplified.",
        });
      }
    } catch (error) {
      console.error('Error improving thesis:', error);
      toast({
        title: "Improvement Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImprovingThesis(false);
    }
  };

  // Source data for thesis card
  const thesisSourceData = {
    title,
    niche,
    targetAudience,
    components: Object.entries(components)
      .filter(([_, v]) => v)
      .map(([k]) => componentMeta[k]?.title || k),
  };

  const handleTemplateSelect = (template: ToolkitTemplate) => {
    setSelectedTemplate(template.id);
    
    // ALWAYS reset chapters, thesis, and guide sections for a clean slate
    setCustomChapters(getDefaultChapters());
    setThesis("");
    setGuideSections([...GUIDE_SECTION_TEMPLATES]);
    
    // Pre-populate fields from template (except for "blank")
    if (template.id !== "blank") {
      if (template.suggestedNiche) setNiche(template.suggestedNiche);
      if (template.suggestedTitle) setTitle(template.suggestedTitle);
      if (template.suggestedAudience) setTargetAudience(template.suggestedAudience);
      setComponents(template.components);
    } else {
      // For blank template, also reset form fields
      setNiche("");
      setTitle("");
      setTargetAudience("");
      setSubtitle("");
      setComponents({
        guide: true,
        worksheet: false,
        checklist: false,
        resourceList: false,
        templates: false,
        quiz: false,
      });
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
        wizard_step: currentStep,
        guide_sections: guideSections,
        thesis,
        writing_style: writingStyle,
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

  // Generate a single guide section
  const generateGuideSection = useCallback(async (sectionId: string) => {
    const section = guideSections.find(s => s.id === sectionId);
    if (!section) return;

    setGeneratingSectionId(sectionId);
    setGuideSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, status: "generating" as const } : s
    ));

    try {
      const { data, error } = await supabase.functions.invoke("generate-toolkit-content", {
        body: {
          title,
          niche,
          targetAudience,
          writingStyle,
          sectionId,
          sectionNumber: section.number,
          sectionTitle: section.title,
          thesis,
        },
      });

      if (error) throw error;

      // BUG FIX: edge function returns sectionContent (legacy) or chapterContent (new framework),
      // never `content`. Without this, every section saved as undefined and the PDF was blank.
      const resolvedContent: string =
        data?.sectionContent ?? data?.chapterContent ?? data?.content ?? "";

      if (!resolvedContent || resolvedContent.trim().length < 50) {
        throw new Error("Generated section came back empty. Please regenerate.");
      }

      setGuideSections(prev => prev.map(s => 
        s.id === sectionId ? { 
          ...s, 
          status: "complete" as const, 
          content: resolvedContent,
          wordCount: data?.wordCount || resolvedContent.split(/\s+/).filter(Boolean).length,
        } : s
      ));

      toast({
        title: "Section Generated!",
        description: `Section ${section.number}: ${section.title} is ready.`,
      });

      // Auto-save after generation
      saveDraft();
    } catch (error) {
      console.error(`Error generating section ${sectionId}:`, error);
      setGuideSections(prev => prev.map(s => 
        s.id === sectionId ? { ...s, status: "error" as const } : s
      ));
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingSectionId(null);
    }
  }, [title, niche, targetAudience, writingStyle, thesis, guideSections, toast]);

  // Compile guide from sections
  const compileGuide = useCallback(() => {
    const pendingSections = guideSections.filter(s => s.status !== "complete");
    if (pendingSections.length > 0) {
      toast({
        title: "Sections Incomplete",
        description: `${pendingSections.length} section(s) still need to be generated.`,
        variant: "destructive",
      });
      return;
    }

    const compiledGuide = {
      title: title,
      sections: guideSections.map(s => ({
        heading: `Chapter ${s.number}: ${s.title}`,
        content: s.content || "",
      })),
    };

    setContent((prev: any) => ({ ...prev, guide: compiledGuide }));
    setComponentStatus(prev => ({ ...prev, guide: "complete" }));

    toast({
      title: "Guide Compiled!",
      description: "Your complete guide is ready.",
    });

    saveDraft();
  }, [guideSections, title, toast]);

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
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              {initialState && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    isResettingRef.current = true;
                    clearSavedProgress();
                    window.location.reload();
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Start Fresh
                </Button>
              )}
            </div>
            
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

              {currentStep === 3 && (
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
                    thesisMode={thesisMode}
                    onThesisModeChange={setThesisMode}
                    sourceData={thesisSourceData}
                    onImproveClarity={() => handleImproveThesis('improve_clarity')}
                    onMakeSpecific={() => handleImproveThesis('make_specific')}
                    onSimplify={() => handleImproveThesis('simplify')}
                    isImproving={isImprovingThesis}
                  />

                  {/* Chapter Outline Builder - Customize structure before generating */}
                  {components.guide && (
                    <ChapterOutlineBuilder
                      chapters={customChapters}
                      onChaptersChange={setCustomChapters}
                      niche={niche}
                      targetAudience={targetAudience}
                    />
                  )}

                  {/* Controls Bar */}
                  <ContentControlsBar
                    humanize={humanize}
                    onHumanizeChange={setHumanize}
                    writingStyle={writingStyle}
                    onStyleChange={setWritingStyle}
                  />

                  {/* Main Guide Section Builder - Only show if guide component is selected */}
                  {components.guide && (
                    <GuideSectionBuilder
                      sections={guideSections}
                      onSectionsChange={setGuideSections}
                      thesis={thesis}
                      title={title}
                      niche={niche}
                      targetAudience={targetAudience}
                      writingStyle={writingStyle}
                      onGenerateSection={generateGuideSection}
                      onCompileGuide={compileGuide}
                      isGenerating={!!generatingSectionId}
                      generatingSectionId={generatingSectionId}
                    />
                  )}

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

              {currentStep === 4 && (
                <EcoverGenerator
                  title={title}
                  subtitle={subtitle}
                  niche={niche}
                  logoUrl={logoUrl}
                  onEcoverGenerated={setEcoverUrl}
                  existingEcover={ecoverUrl}
                />
              )}

              {currentStep === 5 && (
                <SalesLetterGenerator
                  title={title}
                  subtitle={subtitle}
                  niche={niche}
                  targetAudience={targetAudience}
                  components={components}
                  onSalesLetterGenerated={setSalesLetter}
                  existingSalesLetter={salesLetter}
                  authorName={authorName}
                  thesis={thesis}
                  guideSections={guideSections}
                  content={content}
                />
              )}

              {currentStep === 6 && (
                <EmailSequenceGenerator
                  offerName={title}
                  targetAudience={targetAudience || `${niche} enthusiasts`}
                  price={17}
                  onSequenceGenerated={setEmailSequence}
                />
              )}

              {currentStep === 7 && (
                <UpsellCreator
                  title={title}
                  niche={niche}
                  onUpsellCreated={setUpsell}
                  existingUpsell={upsell}
                />
              )}

              {currentStep === 8 && (
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
                    clearSavedProgress();
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
          {currentStep < 8 && (
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
