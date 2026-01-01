import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import type { ToolkitComponents, WritingStyle } from "@/types/toolkit";
import StyleSelector from "./StyleSelector";

interface DashboardTabProps {
  title: string;
  setTitle: (value: string) => void;
  subtitle: string;
  setSubtitle: (value: string) => void;
  niche: string;
  setNiche: (value: string) => void;
  targetAudience: string;
  setTargetAudience: (value: string) => void;
  authorName: string;
  setAuthorName: (value: string) => void;
  authorTagline: string;
  setAuthorTagline: (value: string) => void;
  authorBio: string;
  setAuthorBio: (value: string) => void;
  components: ToolkitComponents;
  setComponents: (value: ToolkitComponents) => void;
  writingStyle: WritingStyle;
  setWritingStyle: (value: WritingStyle) => void;
  onSave: () => void;
  isSaving: boolean;
  onContinue: () => void;
  onGenerateAll?: () => void;
  isGeneratingAll?: boolean;
  generatingStep?: string;
}

const categoryOptions = [
  "Business",
  "Marketing",
  "Health & Wellness",
  "Personal Development",
  "Finance",
  "Productivity",
  "Technology",
  "Lifestyle",
  "Education",
  "Creative",
];

const componentOptions = [
  { id: "guide" as const, label: "Guide", description: "Main content with sections" },
  { id: "worksheet" as const, label: "Worksheet", description: "Interactive exercises" },
  { id: "checklist" as const, label: "Checklist", description: "Action items" },
  { id: "resourceList" as const, label: "Resource List", description: "Curated resources" },
  { id: "templates" as const, label: "Templates", description: "Ready-to-use templates" },
  { id: "quiz" as const, label: "Quiz", description: "Knowledge check" },
];

const DashboardTab = ({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  niche,
  setNiche,
  targetAudience,
  setTargetAudience,
  authorName,
  setAuthorName,
  authorTagline,
  setAuthorTagline,
  authorBio,
  setAuthorBio,
  components,
  setComponents,
  writingStyle,
  setWritingStyle,
  onContinue,
  onGenerateAll,
  isGeneratingAll,
  generatingStep,
}: DashboardTabProps) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const toggleComponent = (id: keyof ToolkitComponents) => {
    setComponents({ ...components, [id]: !components[id] });
  };

  const isFormValid = title.trim() && niche.trim() && authorName.trim() && Object.values(components).some(v => v);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Toolkit Details</h1>
        <p className="text-muted-foreground">Enter your toolkit information to generate content</p>
      </div>

      {/* Main Form Card */}
      <Card className="glass-card">
        <CardContent className="pt-6 space-y-5">
          {/* Toolkit Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Toolkit Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Traffic Blueprint Toolkit"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle" className="text-muted-foreground">
              Subtitle (Optional)
            </Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., Your Complete Guide to Buyer Traffic"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName">
              Author Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 z-50">
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Writing Style Selector */}
          <StyleSelector value={writingStyle} onChange={setWritingStyle} />

          {/* Advanced Settings */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2">
              <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
              Advanced Settings
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-5 pt-4">
              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="audience" className="text-muted-foreground">
                  Target Audience
                </Label>
                <Input
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Online entrepreneurs"
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>

              {/* Author Tagline */}
              <div className="space-y-2">
                <Label htmlFor="authorTagline" className="text-muted-foreground">
                  Author Tagline
                </Label>
                <Input
                  id="authorTagline"
                  value={authorTagline}
                  onChange={(e) => setAuthorTagline(e.target.value)}
                  placeholder="e.g., Digital Marketing Expert"
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>

              {/* Author Bio */}
              <div className="space-y-2">
                <Label htmlFor="authorBio" className="text-muted-foreground">
                  Short Bio
                </Label>
                <Textarea
                  id="authorBio"
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Brief bio for your toolkit..."
                  className="bg-zinc-800/50 border-zinc-700 min-h-[80px]"
                />
              </div>

              {/* Component Selection */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">Toolkit Components</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {componentOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-start gap-3 p-3 border border-zinc-700 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        checked={components[option.id]}
                        onCheckedChange={() => toggleComponent(option.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="space-y-4">
        <Button
          size="lg"
          onClick={onGenerateAll}
          disabled={!isFormValid || isGeneratingAll}
          className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold h-14 text-base"
        >
          {isGeneratingAll ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {generatingStep || "Generating..."}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Your Toolkit
            </>
          )}
        </Button>

        {/* Skip Link */}
        <p className="text-center text-sm text-muted-foreground">
          Or{" "}
          <button
            onClick={onContinue}
            disabled={!title.trim() || !niche.trim() || isGeneratingAll}
            className="text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            skip to Your Toolkit to write manually
          </button>
        </p>
      </div>
    </div>
  );
};

export default DashboardTab;
