import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Pencil, Check, X, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { ChapterItem } from "@/types/launchWizard";

interface OutlineEditorProps {
  chapters: ChapterItem[];
  onUpdate: (chapters: ChapterItem[]) => void;
}

export default function OutlineEditor({ chapters, onUpdate }: OutlineEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditTitle(chapters[index].title);
    setEditSummary(chapters[index].summary);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...chapters];
    updated[editingIndex] = { ...updated[editingIndex], title: editTitle, summary: editSummary };
    onUpdate(updated);
    setEditingIndex(null);
  };

  const cancelEdit = () => setEditingIndex(null);

  const moveChapter = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= chapters.length) return;
    const updated = [...chapters];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onUpdate(updated);
  };

  const removeChapter = (index: number) => {
    if (chapters.length <= 2) return; // min 2 chapters
    onUpdate(chapters.filter((_, i) => i !== index));
  };

  const addChapter = () => {
    onUpdate([
      ...chapters,
      {
        title: `New Chapter ${chapters.length + 1}`,
        summary: "Describe what this chapter covers...",
        keyPoints: [],
      },
    ]);
  };

  return (
    <Card className="border-accent/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Outline Editor</p>
            <p className="text-xs text-muted-foreground">Reorder, rename, or remove chapters before writing</p>
          </div>
          <Badge variant="secondary" className="text-xs">{chapters.length} chapters</Badge>
        </div>

        <div className="space-y-2">
          {chapters.map((ch, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-border bg-card/50 group">
              {/* Drag handle + arrows */}
              <div className="flex flex-col items-center gap-0.5 pt-1">
                <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={i === 0} onClick={() => moveChapter(i, -1)}>
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={i === chapters.length - 1} onClick={() => moveChapter(i, 1)}>
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {editingIndex === i ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-sm h-8"
                      placeholder="Chapter title"
                    />
                    <Textarea
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      className="text-xs min-h-[60px]"
                      placeholder="Chapter summary"
                    />
                    <div className="flex gap-1">
                      <Button variant="default" size="sm" className="h-6 text-xs gap-1" onClick={saveEdit}>
                        <Check className="w-3 h-3" /> Save
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={cancelEdit}>
                        <X className="w-3 h-3" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] shrink-0">{i + 1}</Badge>
                      <p className="text-sm font-medium truncate">{ch.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ch.summary}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {editingIndex !== i && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(i)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeChapter(i)} disabled={chapters.length <= 2}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="gap-1 w-full text-xs" onClick={addChapter}>
          <Plus className="w-3 h-3" /> Add Chapter
        </Button>
      </CardContent>
    </Card>
  );
}
