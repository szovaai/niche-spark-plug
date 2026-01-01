import { Loader2, Play, Eye, RotateCcw, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ComponentStatus = "pending" | "generating" | "complete" | "error";

interface ComponentRowProps {
  number: number;
  id: string;
  title: string;
  description: string;
  estimatedSize: string;
  status: ComponentStatus;
  wordCount?: number;
  onGenerate: () => void;
  onView: () => void;
  disabled?: boolean;
}

const ComponentRow = ({
  number,
  id,
  title,
  description,
  estimatedSize,
  status,
  wordCount,
  onGenerate,
  onView,
  disabled,
}: ComponentRowProps) => {
  const isComplete = status === "complete";
  const isGenerating = status === "generating";

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all",
        isComplete
          ? "bg-green-500/5 border-green-500/20"
          : isGenerating
          ? "bg-primary/5 border-primary/30"
          : "bg-card/50 border-border/50 hover:border-border"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Number Badge */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-semibold",
            isComplete
              ? "bg-green-500/20 text-green-400"
              : isGenerating
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isComplete ? <Check className="w-4 h-4" /> : number}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-foreground">{title}</h4>
            <StatusBadge status={status} wordCount={wordCount} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">{estimatedSize}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isComplete ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onView}
                className="h-8 gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerate}
                disabled={disabled}
                className="h-8 gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Regenerate
              </Button>
            </>
          ) : isGenerating ? (
            <Button variant="outline" size="sm" disabled className="h-8 gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating...
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onGenerate}
              disabled={disabled}
              className="h-8 gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Generate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({
  status,
  wordCount,
}: {
  status: ComponentStatus;
  wordCount?: number;
}) => {
  switch (status) {
    case "complete":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
          <Check className="w-3 h-3 mr-1" />
          Complete {wordCount && `• ${wordCount.toLocaleString()} words`}
        </Badge>
      );
    case "generating":
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
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
        <Badge variant="secondary" className="text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />
          Not Started
        </Badge>
      );
  }
};

export default ComponentRow;
