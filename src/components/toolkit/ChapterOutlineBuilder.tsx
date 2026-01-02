import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  X,
  BookOpen,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CHAPTER_PROMPTS, CHAPTER_ORDER, ChapterPrompt } from "@/lib/toolkitSectionPrompts";

export interface CustomChapter {
  id: string;
  number: number;
  title: string;
  purpose: string;
  description: string;
  isCustom: boolean;
  originalId?: string;
}

interface ChapterOutlineBuilderProps {
  chapters: CustomChapter[];
  onChaptersChange: (chapters: CustomChapter[]) => void;
  niche: string;
  targetAudience: string;
}

const DEFAULT_CHAPTERS: CustomChapter[] = CHAPTER_ORDER.map((id, index) => ({
  id,
  number: index + 1,
  title: CHAPTER_PROMPTS[id].title,
  purpose: CHAPTER_PROMPTS[id].purpose,
  description: CHAPTER_PROMPTS[id].description,
  isCustom: false,
  originalId: id,
}));

const ChapterOutlineBuilder = ({
  chapters,
  onChaptersChange,
  niche,
  targetAudience,
}: ChapterOutlineBuilderProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingChapter, setEditingChapter] = useState<CustomChapter | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChapter, setNewChapter] = useState<Partial<CustomChapter>>({
    title: "",
    purpose: "",
    description: "",
  });

  // Renumber chapters after reorder
  const renumberChapters = (chapterList: CustomChapter[]): CustomChapter[] => {
    return chapterList.map((chapter, index) => ({
      ...chapter,
      number: index + 1,
    }));
  };

  const handleReorder = (newOrder: CustomChapter[]) => {
    onChaptersChange(renumberChapters(newOrder));
  };

  const handleAddChapter = () => {
    if (!newChapter.title?.trim()) return;

    const chapter: CustomChapter = {
      id: `custom-${Date.now()}`,
      number: chapters.length + 1,
      title: newChapter.title || "",
      purpose: newChapter.purpose || "",
      description: newChapter.description || "",
      isCustom: true,
    };

    onChaptersChange([...chapters, chapter]);
    setNewChapter({ title: "", purpose: "", description: "" });
    setIsAddDialogOpen(false);
  };

  const handleRemoveChapter = (chapterId: string) => {
    const updatedChapters = chapters.filter((c) => c.id !== chapterId);
    onChaptersChange(renumberChapters(updatedChapters));
  };

  const handleEditChapter = (chapter: CustomChapter) => {
    setEditingChapter({ ...chapter });
  };

  const handleSaveEdit = () => {
    if (!editingChapter) return;
    
    const updatedChapters = chapters.map((c) =>
      c.id === editingChapter.id ? { ...editingChapter, isCustom: true } : c
    );
    onChaptersChange(updatedChapters);
    setEditingChapter(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newChapters = [...chapters];
    [newChapters[index - 1], newChapters[index]] = [newChapters[index], newChapters[index - 1]];
    onChaptersChange(renumberChapters(newChapters));
  };

  const handleMoveDown = (index: number) => {
    if (index === chapters.length - 1) return;
    const newChapters = [...chapters];
    [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
    onChaptersChange(renumberChapters(newChapters));
  };

  const handleResetToDefault = () => {
    onChaptersChange(DEFAULT_CHAPTERS);
  };

  // Replace placeholders in title with actual niche/audience
  const formatTitle = (title: string) => {
    return title
      .replace(/\[Topic\]/g, niche || "[Topic]")
      .replace(/\[System\/Platform\]/g, "System")
      .replace(/\[System\/Account\]/g, "Account")
      .replace(/\[Research\/Discovery\]/g, "Research")
      .replace(/\[Scroll-Stopping\/High-Converting\]/g, "High-Converting")
      .replace(/\[Content Type\]/g, "Content");
  };

  return (
    <Card className="border-border">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Chapter Outline Builder
                <Badge variant="secondary" className="text-xs">
                  {chapters.length} chapters
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize your guide structure before generating
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetToDefault();
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to default structure</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 space-y-4">
              {/* Chapter List with Drag & Drop */}
              <Reorder.Group
                axis="y"
                values={chapters}
                onReorder={handleReorder}
                className="space-y-2"
              >
                {chapters.map((chapter, index) => (
                  <Reorder.Item
                    key={chapter.id}
                    value={chapter}
                    className="list-none"
                  >
                    <motion.div
                      layout
                      className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors group"
                    >
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Chapter Number */}
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                        {chapter.number}
                      </div>

                      {/* Chapter Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {formatTitle(chapter.title)}
                          </p>
                          {chapter.isCustom && (
                            <Badge variant="outline" className="text-xs py-0 flex-shrink-0">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Custom
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chapter.purpose}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move up</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === chapters.length - 1}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move down</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditChapter(chapter)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit chapter</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveChapter(chapter.id)}
                                disabled={chapters.length <= 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove chapter</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Add Chapter Button */}
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Chapter
              </Button>

              {/* Tips */}
              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <p className="font-medium mb-1">💡 Tips:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Drag chapters to reorder them</li>
                  <li>Edit chapter titles to match your specific topic</li>
                  <li>Add custom chapters for unique content needs</li>
                  <li>Remove chapters you don't need for a shorter guide</li>
                </ul>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Chapter Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chapter Title</label>
              <Input
                placeholder="e.g., Advanced Monetization Strategies"
                value={newChapter.title || ""}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose</label>
              <Input
                placeholder="e.g., Help readers maximize their earnings"
                value={newChapter.purpose || ""}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, purpose: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what this chapter will cover..."
                value={newChapter.description || ""}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChapter} disabled={!newChapter.title?.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Chapter Dialog */}
      <Dialog open={!!editingChapter} onOpenChange={() => setEditingChapter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapter {editingChapter?.number}</DialogTitle>
          </DialogHeader>
          {editingChapter && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chapter Title</label>
                <Input
                  value={editingChapter.title}
                  onChange={(e) =>
                    setEditingChapter({ ...editingChapter, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Purpose</label>
                <Input
                  value={editingChapter.purpose}
                  onChange={(e) =>
                    setEditingChapter({ ...editingChapter, purpose: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingChapter.description}
                  onChange={(e) =>
                    setEditingChapter({ ...editingChapter, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChapter(null)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ChapterOutlineBuilder;

// Helper to get default chapters
export const getDefaultChapters = (): CustomChapter[] => DEFAULT_CHAPTERS;

// Helper to convert custom chapters to chapter prompts for generation
export const convertToChapterPrompts = (
  customChapters: CustomChapter[]
): ChapterPrompt[] => {
  return customChapters.map((chapter) => {
    // If it's a standard chapter, use the original prompt
    if (!chapter.isCustom && chapter.originalId && CHAPTER_PROMPTS[chapter.originalId]) {
      return {
        ...CHAPTER_PROMPTS[chapter.originalId],
        number: chapter.number,
        title: chapter.title,
      };
    }

    // For custom chapters, create a minimal prompt structure
    return {
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      purpose: chapter.purpose,
      description: chapter.description,
      sections: [
        {
          id: "main",
          name: "Main Content",
          description: chapter.description,
          wordTarget: "400-600 words",
        },
      ],
      actionChecklist: [
        "Complete the main action from this chapter",
        "Review your progress",
        "Prepare for the next chapter",
      ],
      reflectionPrompt: "What's the biggest insight you gained from this chapter?",
      yourNextMoves: "Apply what you learned before moving on.",
      wordTarget: { min: 500, max: 700 },
      contextQuestions: [],
    };
  });
};
