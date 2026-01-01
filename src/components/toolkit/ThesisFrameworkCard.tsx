import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp, Lock, Unlock, RefreshCw, Wand2, Sparkles, Target, Zap, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface SourceData {
  title: string;
  niche: string;
  targetAudience: string;
  components: string[];
}

interface ThesisFrameworkCardProps {
  thesis: string;
  onThesisChange: (thesis: string) => void;
  lockFramework: boolean;
  onLockChange: (locked: boolean) => void;
  onRegenerateThesis?: () => void;
  isRegenerating?: boolean;
  // NEW: Mode control
  thesisMode: 'manual' | 'ai';
  onThesisModeChange: (mode: 'manual' | 'ai') => void;
  // NEW: Source data from Step 1
  sourceData: SourceData;
  // NEW: AI improvement callbacks
  onImproveClarity?: () => void;
  onMakeSpecific?: () => void;
  onSimplify?: () => void;
  isImproving?: boolean;
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
  thesisMode,
  onThesisModeChange,
  sourceData,
  onImproveClarity,
  onMakeSpecific,
  onSimplify,
  isImproving = false,
}: ThesisFrameworkCardProps) => {
  const [showOutline, setShowOutline] = useState(false);
  const [showSourceData, setShowSourceData] = useState(true);

  const isAIMode = thesisMode === 'ai';
  const hasThesis = thesis.trim().length > 0;
  const isProcessing = isRegenerating || isImproving;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Core Thesis & Framework</h3>
            <p className="text-sm text-muted-foreground">
              This is the core idea your entire toolkit is built around. All components will follow this structure.
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="bg-background/50 rounded-lg p-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
            Thesis Creation Mode
          </Label>
          <RadioGroup 
            value={thesisMode} 
            onValueChange={(value) => onThesisModeChange(value as 'manual' | 'ai')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual" className="flex items-center gap-1.5 cursor-pointer text-sm">
                <PenLine className="w-3.5 h-3.5" />
                Write My Own
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ai" id="ai" />
              <Label htmlFor="ai" className="flex items-center gap-1.5 cursor-pointer text-sm">
                <Wand2 className="w-3.5 h-3.5" />
                Generate with AI
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* AI Mode: Source Data Panel */}
        {isAIMode && (
          <Collapsible open={showSourceData} onOpenChange={setShowSourceData}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
              {showSourceData ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Data AI will use (from previous steps)
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-background/70 rounded-lg p-4 space-y-3 border border-border/50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <p className="text-sm font-medium text-foreground truncate">
                      {sourceData.title || <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <p className="text-sm font-medium text-foreground truncate">
                      {sourceData.niche || <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Target Audience</Label>
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {sourceData.targetAudience || <span className="text-muted-foreground italic">General audience</span>}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Components</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {sourceData.components.length > 0 ? (
                      sourceData.components.map((comp, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {comp}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">None selected</span>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Thesis Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="thesis" className="text-sm font-medium">
              Toolkit Thesis / Core Formula
            </Label>
            {isAIMode && !hasThesis && onRegenerateThesis && (
              <Button
                variant="hero"
                size="sm"
                onClick={onRegenerateThesis}
                disabled={isProcessing}
                className="h-7 text-xs gap-1.5"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                Generate Thesis
              </Button>
            )}
          </div>
          <Textarea
            id="thesis"
            value={thesis}
            onChange={(e) => onThesisChange(e.target.value)}
            placeholder={
              isAIMode 
                ? "Click 'Generate Thesis' to create an AI-powered core framework, or write your own..."
                : "Write your core thesis here. This should capture the unique insight or framework that drives your toolkit..."
            }
            rows={4}
            className="resize-none bg-background/50"
          />
        </div>

        {/* AI Mode: Improvement Buttons (show after thesis exists) */}
        {isAIMode && hasThesis && (
          <div className="flex flex-wrap gap-2">
            {onRegenerateThesis && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerateThesis}
                disabled={isProcessing}
                className="h-8 text-xs gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            )}
            {onImproveClarity && (
              <Button
                variant="outline"
                size="sm"
                onClick={onImproveClarity}
                disabled={isProcessing}
                className="h-8 text-xs gap-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isImproving ? "animate-pulse" : ""}`} />
                Improve Clarity
              </Button>
            )}
            {onMakeSpecific && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMakeSpecific}
                disabled={isProcessing}
                className="h-8 text-xs gap-1.5"
              >
                <Target className={`w-3.5 h-3.5 ${isImproving ? "animate-pulse" : ""}`} />
                Make Specific
              </Button>
            )}
            {onSimplify && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSimplify}
                disabled={isProcessing}
                className="h-8 text-xs gap-1.5"
              >
                <Zap className={`w-3.5 h-3.5 ${isImproving ? "animate-pulse" : ""}`} />
                Simplify
              </Button>
            )}
          </div>
        )}

        {/* Quick action for AI mode */}
        {isAIMode && hasThesis && (
          <button
            onClick={() => onThesisModeChange('manual')}
            className="text-xs text-primary/70 hover:text-primary underline transition-colors"
          >
            ✨ Switch to manual editing mode
          </button>
        )}

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
