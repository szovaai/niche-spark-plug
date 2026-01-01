import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Clock, ExternalLink, Copy } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LaunchStep, LaunchPlatform } from "@/types/launch";
import { getStepsForPlatform, getStepsByCategory, CATEGORY_INFO } from "@/data/launchSteps";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LaunchStepListProps {
  platform: LaunchPlatform | null;
  completedSteps: string[];
  onStepToggle: (stepId: string) => void;
}

export const LaunchStepList = ({ platform, completedSteps, onStepToggle }: LaunchStepListProps) => {
  const [openCategories, setOpenCategories] = useState<string[]>(['pre-launch', 'platform']);
  
  const allSteps = getStepsForPlatform(platform);
  const categories: LaunchStep['category'][] = ['pre-launch', 'platform', 'sales-page', 'testing', 'promotion'];
  
  const toggleCategory = (category: string) => {
    setOpenCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getCategoryProgress = (category: LaunchStep['category']) => {
    const categorySteps = getStepsByCategory(allSteps, category);
    const completed = categorySteps.filter(step => completedSteps.includes(step.id)).length;
    return { completed, total: categorySteps.length };
  };

  const totalProgress = {
    completed: completedSteps.length,
    total: allSteps.length
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Step 2: Launch Checklist</h2>
          <p className="text-sm text-muted-foreground">
            Follow these steps to go live
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {totalProgress.completed}/{totalProgress.total} Complete
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
          style={{ width: `${(totalProgress.completed / totalProgress.total) * 100}%` }}
        />
      </div>

      {/* Category Sections */}
      <div className="space-y-3">
        {categories.map((category) => {
          const categorySteps = getStepsByCategory(allSteps, category);
          if (categorySteps.length === 0) return null;

          const progress = getCategoryProgress(category);
          const isOpen = openCategories.includes(category);
          const isComplete = progress.completed === progress.total;

          return (
            <Collapsible
              key={category}
              open={isOpen}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="w-full">
                <div className={cn(
                  "flex items-center justify-between p-4 rounded-lg transition-colors",
                  isComplete ? "bg-green-500/10 border border-green-500/30" : "bg-card border border-border"
                )}>
                  <div className="flex items-center gap-3">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{CATEGORY_INFO[category].label}</span>
                        {isComplete && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_INFO[category].description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {progress.completed}/{progress.total}
                  </Badge>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-2 space-y-2 pl-4">
                  {categorySteps.map((step) => (
                    <StepItem
                      key={step.id}
                      step={step}
                      isCompleted={completedSteps.includes(step.id)}
                      onToggle={() => onStepToggle(step.id)}
                      onCopy={copyToClipboard}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

interface StepItemProps {
  step: LaunchStep;
  isCompleted: boolean;
  onToggle: () => void;
  onCopy: (text: string, label: string) => void;
}

const StepItem = ({ step, isCompleted, onToggle, onCopy }: StepItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-colors",
      isCompleted 
        ? "bg-green-500/5 border-green-500/20" 
        : "bg-card/50 border-border/50"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {step.title}
              </span>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {step.timeEstimate}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Less" : "More"}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            {step.description}
          </p>

          {expanded && (
            <div className="mt-4 space-y-4">
              {/* Instructions */}
              <div>
                <h4 className="text-sm font-medium mb-2">Steps:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {step.instructions.map((instruction, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Links */}
              {step.links && step.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {step.links.map((link, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {link.label}
                      </a>
                    </Button>
                  ))}
                </div>
              )}

              {/* Tips */}
              {step.tips.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <h4 className="text-sm font-medium text-amber-400 mb-1">💡 Tips</h4>
                  <ul className="space-y-1">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
