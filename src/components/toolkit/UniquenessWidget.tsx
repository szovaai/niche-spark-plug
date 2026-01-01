import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UniquenessWidgetProps {
  title: string;
  content: string;
  onScoreChange?: (score: number) => void;
}

const UniquenessWidget = ({ title, content, onScoreChange }: UniquenessWidgetProps) => {
  const [score, setScore] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Auto-check when content changes significantly
  useEffect(() => {
    if (content && content.length > 500 && !hasChecked) {
      checkUniqueness();
    }
  }, [content]);

  const checkUniqueness = async () => {
    if (!content || content.length < 100) {
      toast.error("Not enough content to analyze");
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-uniqueness", {
        body: {
          productName: title || "Untitled",
          content: content.substring(0, 5000), // Limit content size
        },
      });

      if (error) throw error;

      if (data?.uniquenessScore !== undefined) {
        const newScore = data.uniquenessScore;
        setScore(newScore);
        setHasChecked(true);
        onScoreChange?.(newScore);
      }
    } catch (error) {
      console.error("Uniqueness check error:", error);
      // Don't show error toast - just fail silently
    } finally {
      setIsChecking(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number): string => {
    if (score >= 70) return "bg-green-500/10 border-green-500/30";
    if (score >= 50) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 50) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Highly Original";
    if (score >= 70) return "Good";
    if (score >= 50) return "Moderate";
    return "Low";
  };

  if (!content || content.length < 100) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center">
            {isChecking ? (
              <Badge variant="outline" className="gap-1.5 cursor-default">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Checking...</span>
              </Badge>
            ) : score !== null ? (
              <Badge 
                variant="outline" 
                className={`gap-1.5 cursor-default ${getScoreBg(score)}`}
              >
                {getScoreIcon(score)}
                <span className={`text-xs font-medium ${getScoreColor(score)}`}>
                  {score}% {getScoreLabel(score)}
                </span>
              </Badge>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={checkUniqueness}
                className="gap-1.5 h-7 text-xs"
              >
                <Shield className="w-3 h-3" />
                Check Uniqueness
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-[200px]">
            {score !== null 
              ? `Your content is ${score}% unique based on AI analysis`
              : "Check how unique your toolkit content is"
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UniquenessWidget;
