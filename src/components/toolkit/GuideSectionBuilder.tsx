import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, ChevronUp, Loader2, Check, AlertCircle, 
  Play, Eye, Edit2, RefreshCw, Zap, FileText, Target, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GuideSection, GuideSectionStatus } from "@/types/toolkit";
import SectionEditorModal from "./SectionEditorModal";

// Section metadata for purpose badges and preview
const SECTION_METADATA: Record<string, {
  purpose: string;
  quickWin: string;
  includes: string[];
  wordTarget: string;
  emoji: string;
}> = {
  problem: {
    purpose: "Make the reader say 'This is exactly my problem!'",
    quickWin: "Write 3 sentences describing their daily struggle",
    includes: ["Empathy Hook", "Surface Pain", "Hidden Cause", "Promise"],
    wordTarget: "400-470 words",
    emoji: "😤",
  },
  solution: {
    purpose: "Introduce your signature system/method",
    quickWin: "Name your system and list 3-5 pillars",
    includes: ["System Name", "Philosophy", "Pillars", "Transformation"],
    wordTarget: "400-470 words",
    emoji: "💡",
  },
  foundation: {
    purpose: "Set up their mindset, tools, and environment",
    quickWin: "Write a commitment statement",
    includes: ["Success Definition", "Mindset Shifts", "Essential Setup", "Checklist"],
    wordTarget: "450-520 words",
    emoji: "🏗️",
  },
  discovery: {
    purpose: "Teach research that saves time and effort",
    quickWin: "Find 5 signal-rich sources in your niche",
    includes: ["Why Research", "Discovery Process", "What to Look For", "Template"],
    wordTarget: "450-520 words",
    emoji: "🔍",
  },
  "execution-1": {
    purpose: "Guide through first real-world actions",
    quickWin: "Complete 3 specific actions in 7 days",
    includes: ["First Actions", "Scripts/Templates", "Weekly Schedule", "Win Tracking"],
    wordTarget: "450-520 words",
    emoji: "🚀",
  },
  "execution-2": {
    purpose: "Deepen implementation and optimize",
    quickWin: "Define top 3 success metrics",
    includes: ["Advanced Tactics", "Data Interpretation", "Success Indicators", "Pro Tip"],
    wordTarget: "450-520 words",
    emoji: "⚙️",
  },
  optimization: {
    purpose: "Refine and improve through testing",
    quickWin: "Run one micro-test this week",
    includes: ["Testing Variables", "A/B Framework", "Tracking Table", "Iteration Mindset"],
    wordTarget: "450-520 words",
    emoji: "🔬",
  },
  scaling: {
    purpose: "Grow results long-term without burnout",
    quickWin: "Write a 90-day Success Maintenance Plan",
    includes: ["Scaling Strategies", "Automation", "Sustainability Checklist", "Vision"],
    wordTarget: "430-500 words",
    emoji: "🌱",
  },
};

interface GuideSectionBuilderProps {
  sections: GuideSection[];
  onSectionsChange: (sections: GuideSection[]) => void;
  thesis: string;
  title: string;
  niche: string;
  targetAudience: string;
  writingStyle: string;
  onGenerateSection: (sectionId: string) => Promise<void>;
  onCompileGuide: () => void;
  isGenerating: boolean;
  generatingSectionId: string | null;
}

const GuideSectionBuilder = ({
  sections,
  onSectionsChange,
  thesis,
  title,
  niche,
  targetAudience,
  writingStyle,
  onGenerateSection,
  onCompileGuide,
  isGenerating,
  generatingSectionId,
}: GuideSectionBuilderProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingSection, setEditingSection] = useState<GuideSection | null>(null);
  const [showMetadata, setShowMetadata] = useState<string | null>(null);

  const completedCount = sections.filter(s => s.status === "complete").length;
  const totalCount = sections.length;
  const progress = (completedCount / totalCount) * 100;
  const totalWords = sections.reduce((acc, s) => acc + s.wordCount, 0);
  const allComplete = completedCount === totalCount;

  const getStatusIcon = (status: GuideSectionStatus, sectionId: string) => {
    if (generatingSectionId === sectionId) {
      return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    }
    switch (status) {
      case "complete":
        return <Check className="w-4 h-4 text-green-500" />;
      case "generating":
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const getStatusBadge = (status: GuideSectionStatus, wordCount: number) => {
    switch (status) {
      case "complete":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            Complete ({wordCount}w)
          </Badge>
        );
      case "generating":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            Generating...
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Not Started
          </Badge>
        );
    }
  };

  const handleGenerateAll = async () => {
    const pendingSections = sections.filter(s => s.status !== "complete");
    for (const section of pendingSections) {
      await onGenerateSection(section.id);
    }
  };

  const handleSectionEdit = (section: GuideSection) => {
    setEditingSection(section);
  };

  const handleSectionSave = (updatedSection: GuideSection) => {
    const newSections = sections.map(s => 
      s.id === updatedSection.id ? updatedSection : s
    );
    onSectionsChange(newSections);
    setEditingSection(null);
  };

  const metadata = (sectionId: string) => SECTION_METADATA[sectionId];

  return (
    <>
      <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-0">
          {/* Main Row - Collapsible Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Main Guide</h3>
                  <Badge variant="outline" className="text-xs">
                    {completedCount}/{totalCount} sections
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {allComplete 
                    ? `Complete • ${totalWords.toLocaleString()} words total`
                    : `${totalCount - completedCount} sections remaining`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 hidden sm:block">
                <Progress value={progress} className="h-2" />
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Expanded Section Builder */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                  {/* Thesis Display */}
                  {thesis && (
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Core Thesis (North Star)</p>
                      <p className="text-sm text-foreground">{thesis}</p>
                    </div>
                  )}

                  {/* Section List */}
                  <div className="space-y-2">
                    {sections.map((section) => {
                      const meta = metadata(section.id);
                      return (
                        <div key={section.id} className="space-y-2">
                          <div
                            className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {getStatusIcon(section.status, section.id)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">
                                    {meta?.emoji} Section {section.number}: {section.title}
                                  </p>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMetadata(showMetadata === section.id ? null : section.id);
                                          }}
                                          className="p-1 rounded hover:bg-primary/10"
                                        >
                                          <Target className="w-3 h-3 text-primary" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">{meta?.purpose}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <p className="text-xs text-muted-foreground">{section.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(section.status, section.wordCount)}
                              {section.status === "complete" ? (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSectionEdit(section);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSectionEdit(section);
                                    }}
                                  >
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onGenerateSection(section.id);
                                    }}
                                    disabled={isGenerating}
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onGenerateSection(section.id);
                                  }}
                                  disabled={isGenerating}
                                >
                                  {generatingSectionId === section.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-1" />
                                      Generate
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Section Metadata Preview */}
                          <AnimatePresence>
                            {showMetadata === section.id && meta && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-7 overflow-hidden"
                              >
                                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium text-primary">Purpose:</span>
                                    <span className="text-xs text-foreground">{meta.purpose}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-medium text-amber-600">Quick Win:</span>
                                    <span className="text-xs text-foreground">{meta.quickWin}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    <span className="text-xs text-muted-foreground">Includes:</span>
                                    {meta.includes.map((item, i) => (
                                      <Badge key={i} variant="outline" className="text-xs py-0">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Target: {meta.wordTarget}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handleGenerateAll}
                      disabled={isGenerating || allComplete}
                      className="gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Generate All Remaining
                    </Button>
                    <Button
                      variant="hero"
                      onClick={onCompileGuide}
                      disabled={!allComplete || isGenerating}
                      className="gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Compile Guide
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Section Editor Modal */}
      {editingSection && (
        <SectionEditorModal
          section={editingSection}
          onSave={handleSectionSave}
          onClose={() => setEditingSection(null)}
          onRegenerate={() => onGenerateSection(editingSection.id)}
          isRegenerating={generatingSectionId === editingSection.id}
        />
      )}
    </>
  );
};

export default GuideSectionBuilder;