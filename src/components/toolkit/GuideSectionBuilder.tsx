import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, ChevronUp, Loader2, Check, AlertCircle, 
  Play, Eye, Edit2, RefreshCw, Zap, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GuideSection, GuideSectionStatus } from "@/types/toolkit";
import SectionEditorModal from "./SectionEditorModal";

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

  const completedCount = sections.filter(s => s.status === "complete").length;
  const totalCount = sections.length;
  const progress = (completedCount / totalCount) * 100;
  const totalWords = sections.reduce((acc, s) => acc + s.wordCount, 0);
  const allComplete = completedCount === totalCount;
  const hasAnyContent = sections.some(s => s.status === "complete");

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
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(section.status, section.id)}
                          <div>
                            <p className="font-medium text-sm">
                              Section {section.number}: {section.title}
                            </p>
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
                    ))}
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
