import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ChapterCard from "./ChapterCard";
import ChapterViewModal from "./ChapterViewModal";

export interface Chapter {
  id: string;
  type: "guide" | "worksheet" | "checklist" | "templates" | "quiz" | "resourceList";
  title: string;
  description: string;
  content?: string;
  wordCount: number;
  status: "pending" | "generating" | "complete";
}

interface ChapterListProps {
  chapters: Chapter[];
  onRegenerate: (chapterId: string) => void;
  onRegenerateAll: () => void;
  isGeneratingAll?: boolean;
  humanizeEnabled?: boolean;
  onHumanizeToggle?: (enabled: boolean) => void;
}

const ChapterList = ({
  chapters,
  onRegenerate,
  onRegenerateAll,
  isGeneratingAll = false,
  humanizeEnabled = true,
  onHumanizeToggle,
}: ChapterListProps) => {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [viewingChapter, setViewingChapter] = useState<Chapter | null>(null);

  const completedCount = chapters.filter((c) => c.status === "complete").length;
  const totalWords = chapters.reduce((sum, c) => sum + c.wordCount, 0);

  return (
    <div className="space-y-6">
      {/* AI Writing Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="humanize"
              checked={humanizeEnabled}
              onCheckedChange={onHumanizeToggle}
            />
            <Label htmlFor="humanize" className="text-sm font-medium cursor-pointer">
              Humanize Writing
            </Label>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI-powered natural language optimization</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{completedCount}</span>/{chapters.length} chapters •{" "}
            <span className="font-semibold text-foreground">{totalWords.toLocaleString()}</span> words
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateAll}
            disabled={isGeneratingAll}
            className="gap-2"
          >
            <RefreshCw className={isGeneratingAll ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
            Regenerate All
          </Button>
        </div>
      </div>

      {/* Chapter Cards */}
      <div className="space-y-3">
        {chapters.map((chapter, index) => (
          <ChapterCard
            key={chapter.id}
            id={chapter.id}
            number={index + 1}
            title={chapter.title}
            description={chapter.description}
            content={chapter.content}
            wordCount={chapter.wordCount}
            status={chapter.status}
            isExpanded={expandedChapter === chapter.id}
            onView={() => setViewingChapter(chapter)}
            onRegenerate={() => onRegenerate(chapter.id)}
            onToggleExpand={() =>
              setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)
            }
          />
        ))}
      </div>

      {/* Chapter View Modal */}
      <ChapterViewModal
        chapter={viewingChapter}
        isOpen={!!viewingChapter}
        onClose={() => setViewingChapter(null)}
        onRegenerate={() => {
          if (viewingChapter) {
            onRegenerate(viewingChapter.id);
          }
        }}
      />
    </div>
  );
};

export default ChapterList;
