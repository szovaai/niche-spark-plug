import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

import ToolkitNavbar, { TabId } from "@/components/toolkit/ToolkitNavbar";
import ProgressTimeline from "@/components/toolkit/ProgressTimeline";
import ChapterList, { Chapter } from "@/components/toolkit/ChapterList";
import CoverCreatorFlow from "@/components/toolkit/CoverCreatorFlow";
import MarketingKitDashboard from "@/components/toolkit/MarketingKitDashboard";
import DashboardTab from "@/components/toolkit/DashboardTab";
import HistoryTab from "@/components/toolkit/HistoryTab";

import type { Toolkit, ToolkitComponents, ToolkitContent } from "@/types/toolkit";

const ToolkitBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Toolkit State
  const [toolkitId, setToolkitId] = useState<string | null>(id || null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [niche, setNiche] = useState("");
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
  const [content, setContent] = useState<ToolkitContent>({});
  const [salesLetter, setSalesLetter] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [humanizeEnabled, setHumanizeEnabled] = useState(true);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Load existing toolkit
  useEffect(() => {
    const loadToolkit = async () => {
      if (!id || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("toolkits")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setToolkitId(data.id);
          setTitle(data.title);
          setSubtitle(data.subtitle || "");
          setNiche(data.niche);
          setTargetAudience(data.target_audience || "");
          setLogoUrl(data.logo_url);
          setEcoverUrl(data.ecover_url);
          const loadedComponents = (data.components as unknown as ToolkitComponents) || components;
          const loadedContent = (data.content as unknown as ToolkitContent) || {};
          setComponents(loadedComponents);
          setContent(loadedContent);
          setSalesLetter(data.sales_letter);
          
          // Build chapters from content
          buildChaptersFromContent(loadedContent, loadedComponents);
        }
      } catch (error) {
        console.error("Error loading toolkit:", error);
        toast.error("Failed to load toolkit");
      } finally {
        setIsLoading(false);
      }
    };

    loadToolkit();
  }, [id, user]);

  // Build chapters from toolkit content
  const buildChaptersFromContent = (tkContent: ToolkitContent, tkComponents: ToolkitComponents) => {
    const chapterList: Chapter[] = [];
    
    if (tkComponents?.guide && tkContent?.guide) {
      chapterList.push({
        id: "guide",
        type: "guide",
        title: tkContent.guide.title || "Guide",
        description: "Main guide content with sections",
        content: tkContent.guide.sections?.map(s => `${s.heading}\n\n${s.content}`).join("\n\n---\n\n"),
        wordCount: tkContent.guide.sections?.reduce((sum, s) => sum + (s.content?.split(/\s+/).length || 0), 0) || 0,
        status: tkContent.guide.sections?.length ? "complete" : "pending",
      });
    }
    
    if (tkComponents?.worksheet && tkContent?.worksheet) {
      chapterList.push({
        id: "worksheet",
        type: "worksheet",
        title: tkContent.worksheet.title || "Worksheet",
        description: "Interactive exercises and activities",
        content: tkContent.worksheet.exercises?.map(e => `${e.title}\n${e.instructions}`).join("\n\n"),
        wordCount: tkContent.worksheet.exercises?.reduce((sum, e) => sum + (e.instructions?.split(/\s+/).length || 0), 0) || 0,
        status: tkContent.worksheet.exercises?.length ? "complete" : "pending",
      });
    }
    
    if (tkComponents?.checklist && tkContent?.checklist) {
      chapterList.push({
        id: "checklist",
        type: "checklist",
        title: tkContent.checklist.title || "Checklist",
        description: "Action items and tasks",
        content: tkContent.checklist.items?.join("\n• "),
        wordCount: tkContent.checklist.items?.reduce((sum, i) => sum + (i?.split(/\s+/).length || 0), 0) || 0,
        status: tkContent.checklist.items?.length ? "complete" : "pending",
      });
    }
    
    if (tkComponents?.resourceList && tkContent?.resourceList) {
      chapterList.push({
        id: "resourceList",
        type: "resourceList",
        title: tkContent.resourceList.title || "Resources",
        description: "Curated list of helpful resources",
        content: tkContent.resourceList.resources?.map(r => `${r.name}: ${r.description}`).join("\n"),
        wordCount: tkContent.resourceList.resources?.reduce((sum, r) => sum + ((r.description?.split(/\s+/).length || 0) + (r.name?.split(/\s+/).length || 0)), 0) || 0,
        status: tkContent.resourceList.resources?.length ? "complete" : "pending",
      });
    }
    
    if (tkComponents?.templates && tkContent?.templates) {
      chapterList.push({
        id: "templates",
        type: "templates",
        title: tkContent.templates.title || "Templates",
        description: "Ready-to-use templates",
        content: tkContent.templates.templates?.map(t => `${t.name}\n\n${t.content}`).join("\n\n---\n\n"),
        wordCount: tkContent.templates.templates?.reduce((sum, t) => sum + (t.content?.split(/\s+/).length || 0), 0) || 0,
        status: tkContent.templates.templates?.length ? "complete" : "pending",
      });
    }
    
    if (tkComponents?.quiz && tkContent?.quiz) {
      chapterList.push({
        id: "quiz",
        type: "quiz",
        title: tkContent.quiz.title || "Quiz",
        description: "Knowledge check questions",
        content: tkContent.quiz.questions?.map(q => `Q: ${q.question}\nOptions: ${q.options?.join(", ")}`).join("\n\n"),
        wordCount: tkContent.quiz.questions?.reduce((sum, q) => sum + (q.question?.split(/\s+/).length || 0), 0) || 0,
        status: tkContent.quiz.questions?.length ? "complete" : "pending",
      });
    }

    setChapters(chapterList);
  };

  // Save toolkit
  const saveToolkit = async () => {
    if (!user) {
      toast.error("Please sign in to save");
      return;
    }

    setIsSaving(true);
    try {
      const toolkitData = {
        user_id: user.id,
        title: title || "Untitled Toolkit",
        subtitle,
        niche: niche || "General",
        target_audience: targetAudience,
        logo_url: logoUrl,
        ecover_url: ecoverUrl,
        components: JSON.parse(JSON.stringify(components)) as Json,
        content: JSON.parse(JSON.stringify(content)) as Json,
        sales_letter: salesLetter,
        status: "draft" as const,
        updated_at: new Date().toISOString(),
      };

      if (toolkitId) {
        const { error } = await supabase
          .from("toolkits")
          .update(toolkitData)
          .eq("id", toolkitId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("toolkits")
          .insert(toolkitData)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setToolkitId(data.id);
          navigate(`/toolkit/builder/${data.id}`, { replace: true });
        }
      }

      toast.success("Toolkit saved");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save toolkit");
    } finally {
      setIsSaving(false);
    }
  };

  // Regenerate a single chapter
  const handleRegenerateChapter = async (chapterId: string) => {
    if (!title || !niche) {
      toast.error("Please fill in the toolkit title and niche first");
      return;
    }

    setChapters(prev =>
      prev.map(c => (c.id === chapterId ? { ...c, status: "generating" as const } : c))
    );

    try {
      const { data, error } = await supabase.functions.invoke("generate-toolkit-content", {
        body: {
          title,
          niche,
          targetAudience,
          components,
          singleChapter: chapterId,
          humanize: humanizeEnabled,
        },
      });

      if (error) throw error;

      if (data?.content?.[chapterId]) {
        const generatedContent = data.content[chapterId];
        
        // Update the content state
        setContent(prev => ({ ...prev, [chapterId]: generatedContent }));
        
        // Update the chapter with new content
        setChapters(prev =>
          prev.map(c => {
            if (c.id !== chapterId) return c;
            
            const newContent = formatChapterContent(chapterId, generatedContent);
            const wordCount = newContent?.split(/\s+/).length || 0;
            
            return {
              ...c,
              status: "complete" as const,
              content: newContent,
              wordCount,
            };
          })
        );
        
        toast.success("Chapter generated successfully");
      } else {
        throw new Error("No content returned");
      }
    } catch (error) {
      console.error("Chapter generation error:", error);
      setChapters(prev =>
        prev.map(c => (c.id === chapterId ? { ...c, status: "pending" as const } : c))
      );
      toast.error("Failed to generate chapter. Please try again.");
    }
  };

  // Format chapter content based on type
  const formatChapterContent = (type: string, data: unknown): string => {
    if (!data) return "";
    
    switch (type) {
      case "guide": {
        const guide = data as { title?: string; sections?: { heading: string; content: string }[] };
        return guide.sections?.map(s => `## ${s.heading}\n\n${s.content}`).join("\n\n---\n\n") || "";
      }
      case "worksheet": {
        const worksheet = data as { exercises?: { title: string; instructions: string; fields?: string[] }[] };
        return worksheet.exercises?.map(e => 
          `### ${e.title}\n\n${e.instructions}\n\n${e.fields?.map(f => `- [ ] ${f}`).join("\n") || ""}`
        ).join("\n\n---\n\n") || "";
      }
      case "checklist": {
        const checklist = data as { items?: string[] };
        return checklist.items?.map(item => `☐ ${item}`).join("\n") || "";
      }
      case "resourceList": {
        const resources = data as { resources?: { name: string; description: string; url?: string }[] };
        return resources.resources?.map(r => 
          `**${r.name}**\n${r.description}${r.url ? `\n🔗 ${r.url}` : ""}`
        ).join("\n\n") || "";
      }
      case "templates": {
        const templates = data as { templates?: { name: string; content: string }[] };
        return templates.templates?.map(t => `### ${t.name}\n\n${t.content}`).join("\n\n---\n\n") || "";
      }
      case "quiz": {
        const quiz = data as { questions?: { question: string; options: string[]; correctIndex: number }[] };
        return quiz.questions?.map((q, i) => 
          `**Q${i + 1}: ${q.question}**\n${q.options.map((opt, j) => `  ${String.fromCharCode(65 + j)}) ${opt}`).join("\n")}`
        ).join("\n\n") || "";
      }
      default:
        return JSON.stringify(data, null, 2);
    }
  };

  // Regenerate all chapters
  const handleRegenerateAll = async () => {
    if (!title || !niche) {
      toast.error("Please fill in the toolkit title and niche first");
      return;
    }

    if (!Object.values(components).some(v => v)) {
      toast.error("Please select at least one component");
      return;
    }

    setIsGeneratingAll(true);
    setChapters(prev => prev.map(c => ({ ...c, status: "generating" as const })));

    try {
      const { data, error } = await supabase.functions.invoke("generate-toolkit-content", {
        body: {
          title,
          niche,
          targetAudience,
          components,
          humanize: humanizeEnabled,
        },
      });

      if (error) throw error;

      if (data?.content) {
        // Update the content state with all generated content
        setContent(data.content);
        
        // Rebuild chapters with new content
        const updatedChapters: Chapter[] = [];
        
        for (const [key, value] of Object.entries(data.content)) {
          if (components[key as keyof typeof components]) {
            const formattedContent = formatChapterContent(key, value);
            const chapterTitle = (value as { title?: string })?.title || key.charAt(0).toUpperCase() + key.slice(1);
            
            updatedChapters.push({
              id: key,
              type: key as Chapter["type"],
              title: chapterTitle,
              description: getChapterDescription(key),
              content: formattedContent,
              wordCount: formattedContent.split(/\s+/).length,
              status: "complete",
            });
          }
        }
        
        setChapters(updatedChapters);
        toast.success("All chapters generated successfully");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setChapters(prev => prev.map(c => ({ ...c, status: "pending" as const })));
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const getChapterDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      guide: "Main guide content with sections",
      worksheet: "Interactive exercises and activities",
      checklist: "Action items and tasks",
      resourceList: "Curated list of helpful resources",
      templates: "Ready-to-use templates",
      quiz: "Knowledge check questions",
    };
    return descriptions[type] || "";
  };

  // Calculate progress
  const progressSteps = [
    { id: "topic", label: "Select Topic", completed: !!title && !!niche },
    { id: "components", label: "Components", completed: Object.values(components).some(v => v) },
    { id: "content", label: "Content", completed: chapters.some(c => c.status === "complete"), active: activeTab === "content" },
    { id: "cover", label: "Cover", completed: !!ecoverUrl, active: activeTab === "cover" },
    { id: "complete", label: "Complete", completed: !!salesLetter && !!ecoverUrl },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ToolkitNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toolkitTitle={title || "New Toolkit"}
        onDownloadPdf={() => toast.info("PDF download coming soon")}
        onDownloadTxt={() => toast.info("TXT download coming soon")}
        onCopyAll={() => toast.info("Copy all coming soon")}
        onReset={() => {
          if (confirm("Are you sure you want to reset this toolkit?")) {
            setTitle("");
            setSubtitle("");
            setNiche("");
            setContent({});
            setChapters([]);
            toast.success("Toolkit reset");
          }
        }}
      />

      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Progress Timeline */}
        <ProgressTimeline steps={progressSteps} className="mb-8" />

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <DashboardTab
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            niche={niche}
            setNiche={setNiche}
            targetAudience={targetAudience}
            setTargetAudience={setTargetAudience}
            authorName={authorName}
            setAuthorName={setAuthorName}
            authorTagline={authorTagline}
            setAuthorTagline={setAuthorTagline}
            authorBio={authorBio}
            setAuthorBio={setAuthorBio}
            components={components}
            setComponents={setComponents}
            onSave={saveToolkit}
            isSaving={isSaving}
            onContinue={() => setActiveTab("content")}
          />
        )}

        {activeTab === "content" && (
          <ChapterList
            chapters={chapters}
            onRegenerate={handleRegenerateChapter}
            onRegenerateAll={handleRegenerateAll}
            isGeneratingAll={isGeneratingAll}
            humanizeEnabled={humanizeEnabled}
            onHumanizeToggle={setHumanizeEnabled}
          />
        )}

        {activeTab === "cover" && (
          <CoverCreatorFlow
            initialTitle={title}
            initialSubtitle={subtitle}
            initialAuthor={authorName}
            niche={niche}
            existingCover={ecoverUrl}
            onCoverGenerated={(url) => {
              setEcoverUrl(url);
              saveToolkit();
            }}
          />
        )}

        {activeTab === "marketing" && (
          <MarketingKitDashboard
            salesLetter={salesLetter || undefined}
            emailSequence={[]}
            upsell={undefined}
            onRegenerateSalesLetter={() => toast.info("Sales letter generation coming soon")}
            onRegenerateEmailSequence={() => toast.info("Email sequence generation coming soon")}
            onRegenerateUpsell={() => toast.info("Upsell generation coming soon")}
          />
        )}

        {activeTab === "history" && (
          <HistoryTab userId={user?.id} />
        )}
      </div>
    </div>
  );
};

export default ToolkitBuilder;
