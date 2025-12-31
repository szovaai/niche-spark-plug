import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
          buildChaptersFromContent(data.content as ToolkitContent, data.components as ToolkitComponents);
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
        components,
        content,
        sales_letter: salesLetter,
        status: "draft",
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
    setChapters(prev =>
      prev.map(c => (c.id === chapterId ? { ...c, status: "generating" as const } : c))
    );
    
    // Simulate generation (replace with actual API call)
    setTimeout(() => {
      setChapters(prev =>
        prev.map(c =>
          c.id === chapterId
            ? { ...c, status: "complete" as const, wordCount: Math.floor(Math.random() * 1500) + 500 }
            : c
        )
      );
      toast.success("Chapter regenerated");
    }, 2000);
  };

  // Regenerate all chapters
  const handleRegenerateAll = async () => {
    setIsGeneratingAll(true);
    setChapters(prev => prev.map(c => ({ ...c, status: "generating" as const })));
    
    // Simulate generation
    setTimeout(() => {
      setChapters(prev =>
        prev.map(c => ({
          ...c,
          status: "complete" as const,
          wordCount: Math.floor(Math.random() * 1500) + 500,
        }))
      );
      setIsGeneratingAll(false);
      toast.success("All chapters regenerated");
    }, 3000);
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
