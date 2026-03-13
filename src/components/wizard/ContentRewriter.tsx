import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wand2, Loader2, MessageSquare, BookOpen, Scissors, Expand, Eraser, Check, Copy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const REWRITE_MODES = [
  { id: "conversational", label: "Make Conversational", icon: MessageSquare, description: "Warm mentor tone, short sentences" },
  { id: "stories", label: "Add Stories", icon: BookOpen, description: "Inject mini-stories and examples" },
  { id: "shorten", label: "Shorten", icon: Scissors, description: "Cut fluff, keep essentials" },
  { id: "expand", label: "Expand with Examples", icon: Expand, description: "Add specific walkthroughs" },
  { id: "deai", label: "Remove AI Phrases", icon: Eraser, description: "Strip buzzwords and clichés" },
] as const;

type RewriteMode = typeof REWRITE_MODES[number]["id"];

interface ContentRewriterProps {
  text: string;
  onApply: (newText: string) => void;
  context?: { productTitle?: string; uniqueMechanism?: string };
  compact?: boolean;
}

export default function ContentRewriter({ text, onApply, context, compact = false }: ContentRewriterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<RewriteMode | null>(null);
  const [rewritten, setRewritten] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rewrite = async (selectedMode: RewriteMode) => {
    setMode(selectedMode);
    setLoading(true);
    setRewritten(null);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-content", {
        body: { text, mode: selectedMode, productTitle: context?.productTitle, uniqueMechanism: context?.uniqueMechanism },
      });
      if (error) throw error;
      setRewritten(data.rewritten);
    } catch (e: any) {
      toast.error(e.message || "Rewrite failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (rewritten) {
      onApply(rewritten);
      setRewritten(null);
      setOpen(false);
      toast.success("Content updated!");
    }
  };

  const handleCopy = () => {
    if (rewritten) {
      navigator.clipboard.writeText(rewritten);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size={compact ? "icon" : "sm"} className={compact ? "h-7 w-7" : "gap-1.5 h-7 text-xs"}>
          <Wand2 className="w-3.5 h-3.5" />
          {!compact && "Rewrite"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="end">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-primary" />
              AI Content Rewriter
            </h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="p-3 space-y-1.5">
          {REWRITE_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => rewrite(m.id)}
              disabled={loading}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors text-sm
                ${mode === m.id && loading ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/80 border border-transparent"}
                ${loading && mode !== m.id ? "opacity-50" : ""}
              `}
            >
              <m.icon className={`w-4 h-4 shrink-0 ${mode === m.id && loading ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
              {mode === m.id && loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </button>
          ))}
        </div>

        {/* Rewritten Result */}
        {rewritten && (
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs gap-1">
                <Check className="w-3 h-3" /> Rewritten
              </Badge>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={handleCopy}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-[200px]">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{rewritten}</p>
            </ScrollArea>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-1" onClick={handleApply}>
                <Check className="w-3.5 h-3.5" /> Apply Changes
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRewritten(null)}>
                Discard
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
