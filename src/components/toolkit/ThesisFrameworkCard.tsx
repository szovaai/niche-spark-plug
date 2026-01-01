import { useState, useEffect } from "react";
import { Lightbulb, ChevronDown, ChevronUp, Lock, Unlock, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ThesisFrameworkCardProps {
  thesis: string;
  onThesisChange: (thesis: string) => void;
  lockFramework: boolean;
  onLockChange: (locked: boolean) => void;
  onRegenerateThesis?: () => void;
  isRegenerating?: boolean;
}

const defaultOutline = [
  "Introduction – Why this system works",
  "Core Framework – The step-by-step method",
  "Application – Using the framework in real life",
  "Reinforcement – Habits, checklists, worksheets",
  "Assessment – Measuring progress and adjusting",
];

const ThesisFrameworkCard = ({
  thesis,
  onThesisChange,
  lockFramework,
  onLockChange,
  onRegenerateThesis,
  isRegenerating = false,
}: ThesisFrameworkCardProps) => {
  const [showOutline, setShowOutline] = useState(false);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Core Thesis & Framework</h3>
            <p className="text-sm text-muted-foreground">
              This is the core idea your entire toolkit is built around. All components will follow this structure.
            </p>
          </div>
        </div>

        {/* Thesis Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="thesis" className="text-sm font-medium">
              Toolkit Thesis / Core Formula
            </Label>
            {onRegenerateThesis && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerateThesis}
                disabled={isRegenerating}
                className="h-7 text-xs gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            )}
          </div>
          <Textarea
            id="thesis"
            value={thesis}
            onChange={(e) => onThesisChange(e.target.value)}
            placeholder="This toolkit is built on the idea that clear goals are achieved by breaking them into focused actions, supported by consistent habits and regular self-assessment..."
            rows={4}
            className="resize-none bg-background/50"
          />
        </div>

        {/* Lock Toggle */}
        <div className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2">
            {lockFramework ? (
              <Lock className="w-4 h-4 text-primary" />
            ) : (
              <Unlock className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Lock this framework for all components</span>
          </div>
          <Switch checked={lockFramework} onCheckedChange={onLockChange} />
        </div>

        {/* Collapsible Outline */}
        <Collapsible open={showOutline} onOpenChange={setShowOutline}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
            {showOutline ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>View content outline (optional)</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-background/50 rounded-lg p-4 space-y-2">
              {defaultOutline.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Footer Note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <Lightbulb className="w-3 h-3" />
          <span>Everything in your toolkit will follow this framework.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThesisFrameworkCard;
