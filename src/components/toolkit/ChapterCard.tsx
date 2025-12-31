import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  RefreshCw, 
  Copy, 
  Check,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChapterCardProps {
  id: string;
  number: number;
  title: string;
  description: string;
  content?: string;
  wordCount: number;
  status: "pending" | "generating" | "complete";
  isExpanded?: boolean;
  onView: () => void;
  onRegenerate: () => void;
  onToggleExpand?: () => void;
}

const ChapterCard = ({
  id,
  number,
  title,
  description,
  content,
  wordCount,
  status,
  isExpanded = false,
  onView,
  onRegenerate,
  onToggleExpand,
}: ChapterCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Content copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusConfig = {
    pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
    generating: { label: "Generating...", className: "bg-primary/20 text-primary animate-pulse" },
    complete: { label: "Complete", className: "bg-green-500/20 text-green-400" },
  };

  return (
    <div
      className={cn(
        "border border-border rounded-lg transition-all duration-200",
        isExpanded ? "bg-card" : "bg-card/50 hover:bg-card"
      )}
    >
      {/* Header Row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Chapter Number */}
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
            status === "complete"
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {status === "complete" ? (
            <Check className="w-5 h-5" />
          ) : (
            <span>{number}</span>
          )}
        </div>

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        </div>

        {/* Word Count */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>{wordCount.toLocaleString()} words</span>
        </div>

        {/* Status Badge */}
        <Badge className={cn("shrink-0", statusConfig[status].className)}>
          {statusConfig[status].label}
        </Badge>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            disabled={status !== "complete"}
            className="h-8 w-8"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
            disabled={status === "generating"}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("w-4 h-4", status === "generating" && "animate-spin")} />
          </Button>
        </div>

        {/* Expand/Collapse */}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Expanded Content Preview */}
      {isExpanded && content && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Content Preview
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">
              {content}
            </p>
            {content.length > 500 && (
              <Button
                variant="link"
                size="sm"
                onClick={onView}
                className="mt-2 p-0 h-auto text-primary"
              >
                View full content →
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterCard;
