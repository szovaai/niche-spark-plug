import { useState } from "react";
import { X, Copy, Check, RefreshCw, Edit2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { Chapter } from "./ChapterList";

interface ChapterViewModalProps {
  chapter: Chapter | null;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: () => void;
}

const ChapterViewModal = ({
  chapter,
  isOpen,
  onClose,
  onRegenerate,
}: ChapterViewModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!chapter) return null;

  const handleCopy = async () => {
    if (chapter.content) {
      await navigator.clipboard.writeText(chapter.content);
      setCopied(true);
      toast.success("Content copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const typeLabels: Record<string, string> = {
    guide: "Guide Section",
    worksheet: "Worksheet",
    checklist: "Checklist",
    templates: "Templates",
    quiz: "Quiz",
    resourceList: "Resource List",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">
                {typeLabels[chapter.type] || chapter.type}
              </Badge>
              <DialogTitle className="text-xl font-bold">
                {chapter.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {chapter.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{chapter.wordCount.toLocaleString()} words</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Action Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/30 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="prose prose-invert max-w-none">
            {chapter.content ? (
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {chapter.content}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No content generated yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRegenerate}
                  className="mt-4 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate Content
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterViewModal;
