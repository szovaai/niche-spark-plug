import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Save, Loader2, Sparkles } from "lucide-react";
import type { ToolkitComponents } from "@/types/toolkit";

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
  onSave: () => void;
  isSaving: boolean;
  onContinue: () => void;
  onGenerateAll?: () => void;
  isGeneratingAll?: boolean;
  generatingStep?: string;
}

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
  onSave,
  isSaving,
  onContinue,
  onGenerateAll,
  isGeneratingAll,
  generatingStep,
}: DashboardTabProps) => {
  const toggleComponent = (id: keyof ToolkitComponents) => {
    setComponents({ ...components, [id]: !components[id] });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Toolkit Details */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Toolkit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Traffic Blueprint Toolkit"
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., Your Complete Guide to Buyer Traffic"
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Niche *</Label>
            <Input
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g., Digital Marketing"
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Online entrepreneurs"
              className="bg-muted/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Author Identity */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Author Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="authorName">Your Name</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authorTagline">Tagline</Label>
            <Input
              id="authorTagline"
              value={authorTagline}
              onChange={(e) => setAuthorTagline(e.target.value)}
              placeholder="e.g., Digital Marketing Expert"
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authorBio">Short Bio</Label>
            <Textarea
              id="authorBio"
              value={authorBio}
              onChange={(e) => setAuthorBio(e.target.value)}
              placeholder="Brief bio for your toolkit..."
              className="bg-muted/50 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Component Selection */}
      <Card className="glass-card md:col-span-2">
        <CardHeader>
          <CardTitle>Toolkit Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {componentOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <Checkbox
                  checked={components[option.id]}
                  onCheckedChange={() => toggleComponent(option.id)}
                />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="md:col-span-2 flex flex-col gap-4">
        {/* Generate All Button */}
        {onGenerateAll && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-lg">Generate Complete Toolkit</h3>
                  <p className="text-sm text-muted-foreground">
                    Auto-generate all content, cover, sales letter, and email sequence in one click
                  </p>
                  {isGeneratingAll && generatingStep && (
                    <p className="text-sm text-primary mt-2 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {generatingStep}
                    </p>
                  )}
                </div>
                <Button
                  size="lg"
                  onClick={onGenerateAll}
                  disabled={!title || !niche || !Object.values(components).some(v => v) || isGeneratingAll}
                  className="gap-2 min-w-[200px]"
                >
                  {isGeneratingAll ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate All
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regular Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onSave} disabled={isSaving || isGeneratingAll} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            onClick={onContinue}
            disabled={!title || !niche || isGeneratingAll}
            className="gap-2"
          >
            Continue to Content Writer
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
