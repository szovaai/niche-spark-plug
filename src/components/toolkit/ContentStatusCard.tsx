import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ContentStatusCardProps {
  title: string;
  niche: string;
  completedCount: number;
  totalCount: number;
  totalWords: number;
}

const ContentStatusCard = ({
  title,
  niche,
  completedCount,
  totalCount,
  totalWords,
}: ContentStatusCardProps) => {
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Toolkit In Progress</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Title:</span>
                <span className="text-foreground truncate">{title || "Untitled"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Category:</span>
                <span className="text-foreground truncate">{niche || "Not set"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="text-foreground">
                  {completedCount}/{totalCount} components generated
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progressPercent)}% complete</span>
            <span>{totalWords.toLocaleString()} words total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentStatusCard;
