import { useState } from "react";
import { X, Save, RefreshCw, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuideSection } from "@/types/toolkit";
import { useToast } from "@/hooks/use-toast";

interface SectionEditorModalProps {
  section: GuideSection;
  onSave: (updatedSection: GuideSection) => void;
  onClose: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const SectionEditorModal = ({
  section,
  onSave,
  onClose,
  onRegenerate,
  isRegenerating,
}: SectionEditorModalProps) => {
  const { toast } = useToast();
  const [editedContent, setEditedContent] = useState(section.content || "");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const wordCount = editedContent.split(/\s+/).filter(Boolean).length;
  const hasChanges = editedContent !== section.content;

  const handleSave = () => {
    const updatedSection: GuideSection = {
      ...section,
      content: editedContent,
      wordCount,
      status: "complete",
    };
    onSave(updatedSection);
    toast({
      title: "Section Saved",
      description: `Section ${section.number} has been updated.`,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Section content copied to clipboard.",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Section {section.number}: {section.title}</span>
            <Badge variant="outline">{wordCount} words</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-auto">
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[400px] h-full resize-none font-mono text-sm"
                placeholder="Section content..."
              />
            ) : (
              <div className="p-4 rounded-lg bg-secondary/30 border border-border min-h-[400px] overflow-auto">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {editedContent.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditedContent(section.content || "");
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleSave}
                    disabled={!hasChanges}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Content
                  </Button>
                  <Button variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SectionEditorModal;
