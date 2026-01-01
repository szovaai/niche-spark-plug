import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Download, RotateCcw, Sparkles, Book, Laptop, FileText, Smartphone, Tablet, Layers, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CoverCreatorFlowProps {
  initialTitle?: string;
  initialSubtitle?: string;
  initialAuthor?: string;
  niche?: string;
  existingCover?: string | null;
  logoUrl?: string | null;
  componentsIncluded?: string[];
  onCoverGenerated: (coverUrl: string) => void;
}

type CoverStyle = {
  id: string;
  name: string;
  description: string;
};

type MockupType = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const coverStyles: CoverStyle[] = [
  {
    id: "minimalist",
    name: "Minimalist & Clean",
    description: "Clean lines, white space, elegant simplicity",
  },
  {
    id: "bold",
    name: "Bold & Dynamic",
    description: "Vibrant colors, strong contrasts, eye-catching",
  },
  {
    id: "futuristic",
    name: "Futuristic & Tech",
    description: "Tech-inspired gradients, neon accents, modern",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate elegance, muted tones, trustworthy",
  },
  {
    id: "creative",
    name: "Creative & Artistic",
    description: "Unique textures, artistic flair, standout design",
  },
];

const mockupTypes: MockupType[] = [
  { id: "premium-bundle", name: "Premium Bundle", description: "Complete system with all devices & components", icon: Package },
  { id: "bundle-stack", name: "Bundle Stack", description: "Multiple products stacked together", icon: Layers },
  { id: "3d-book", name: "3D Book", description: "Classic 3D hardcover mockup", icon: Book },
  { id: "laptop", name: "Laptop Screen", description: "Digital product on laptop", icon: Laptop },
  { id: "tablet", name: "Tablet View", description: "Premium tablet display", icon: Tablet },
  { id: "phone-mockup", name: "Phone Display", description: "Mobile-friendly showcase", icon: Smartphone },
  { id: "floating-pages", name: "Floating Pages", description: "Artistic scattered pages", icon: FileText },
];

const colorPresets = [
  { primary: "#00d4ff", secondary: "#1a1a2e", name: "Cyber Blue" },
  { primary: "#10b981", secondary: "#064e3b", name: "Emerald" },
  { primary: "#f59e0b", secondary: "#78350f", name: "Amber" },
  { primary: "#8b5cf6", secondary: "#4c1d95", name: "Violet" },
  { primary: "#ef4444", secondary: "#7f1d1d", name: "Ruby" },
  { primary: "#ec4899", secondary: "#831843", name: "Pink" },
];

const CoverCreatorFlow = ({
  initialTitle = "",
  initialSubtitle = "",
  initialAuthor = "",
  niche = "",
  existingCover,
  logoUrl,
  componentsIncluded = [],
  onCoverGenerated,
}: CoverCreatorFlowProps) => {
  const [step, setStep] = useState(existingCover ? 4 : 1);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [selectedStyle, setSelectedStyle] = useState<CoverStyle | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<MockupType | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#00d4ff");
  const [secondaryColor, setSecondaryColor] = useState("#1a1a2e");
  const [additionalElements, setAdditionalElements] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverUrl, setCoverUrl] = useState(existingCover || "");

  const generateCover = async () => {
    if (!selectedStyle || !selectedMockup) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ecover", {
        body: {
          toolkitTitle: title,
          subtitle,
          authorName: author,
          componentsIncluded,
          coverStyle: selectedStyle.id,
          mockupType: selectedMockup.id,
          primaryColor,
          secondaryColor,
          additionalElements,
          niche,
        },
      });

      if (error) {
        toast.error("Failed to generate cover. Please try again.");
        return;
      }

      if (data?.imageUrl) {
        setCoverUrl(data.imageUrl);
        onCoverGenerated(data.imageUrl);
        setStep(4);
        toast.success("Cover generated successfully!");
      }
    } catch (err) {
      console.error("Cover generation error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setSelectedStyle(null);
    setSelectedMockup(null);
    setCoverUrl("");
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-1 md:gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s}
            </div>
            <span
              className={cn(
                "text-sm hidden sm:block",
                step >= s ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s === 1 && "Details"}
              {s === 2 && "Style"}
              {s === 3 && "Mockup"}
              {s === 4 && "Result"}
            </span>
            {s < 4 && (
              <div
                className={cn(
                  "w-6 md:w-12 h-0.5 mx-1 md:mx-2",
                  step > s ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Cover Details */}
      {step === 1 && (
        <Card className="glass-card">
          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Cover Details</h2>
              <p className="text-muted-foreground mt-2">
                Enter the details for your toolkit cover
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Toolkit Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., The Traffic Blueprint"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle (optional)</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g., Your Complete Guide to Buyer Traffic"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author Name</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  className="bg-muted/50"
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Label>Color Scheme</Label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        primaryColor === preset.primary
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Elements */}
              <div className="space-y-2">
                <Label htmlFor="additionalElements">Additional Elements (optional)</Label>
                <Textarea
                  id="additionalElements"
                  value={additionalElements}
                  onChange={(e) => setAdditionalElements(e.target.value)}
                  placeholder="Any specific imagery, themes, or elements to include..."
                  className="bg-muted/50 resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!title.trim()}
                className="gap-2"
              >
                Next: Choose Style
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Choose Style */}
      {step === 2 && (
        <Card className="glass-card">
          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Choose Your Cover Style</h2>
              <p className="text-muted-foreground mt-2">
                Select the visual style that best represents your toolkit
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {coverStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={cn(
                    "p-6 rounded-lg border-2 text-left transition-all hover:border-primary/50",
                    selectedStyle?.id === style.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles
                      className={cn(
                        "w-5 h-5",
                        selectedStyle?.id === style.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <h3 className="font-semibold">{style.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedStyle}
                className="gap-2"
              >
                Next: Choose Mockup
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Choose Mockup Type */}
      {step === 3 && (
        <Card className="glass-card">
          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Choose Mockup Type</h2>
              <p className="text-muted-foreground mt-2">
                Select how your product should be displayed
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {mockupTypes.map((mockup) => {
                const Icon = mockup.icon;
                const isRecommended = mockup.id === "premium-bundle";
                return (
                  <button
                    key={mockup.id}
                    onClick={() => setSelectedMockup(mockup)}
                    className={cn(
                      "p-6 rounded-lg border-2 text-left transition-all hover:border-primary/50 relative",
                      selectedMockup?.id === mockup.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card/50",
                      isRecommended && "ring-2 ring-primary/30"
                    )}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                        Recommended
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          selectedMockup?.id === mockup.id
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <h3 className="font-semibold">{mockup.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mockup.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Components Preview for bundle types */}
            {(selectedMockup?.id === "premium-bundle" || selectedMockup?.id === "bundle-stack") && componentsIncluded.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm font-medium mb-2">Visual elements based on your toolkit:</p>
                <div className="flex flex-wrap gap-2">
                  {componentsIncluded.map((comp) => (
                    <span key={comp} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={generateCover}
                disabled={!selectedMockup || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Create Cover
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Final Cover */}
      {step === 4 && (
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Your Cover is Ready!</h2>
              <p className="text-muted-foreground mt-2">
                Here's your professionally designed toolkit cover
              </p>
            </div>

            <div className="flex flex-col items-center gap-8">
              {/* Cover Preview - Full Size */}
              <div className="w-full flex justify-center">
                <div className="relative w-full max-w-5xl aspect-video rounded-lg overflow-hidden shadow-2xl border border-border">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Generated Cover"
                      className="w-full h-full object-contain bg-secondary/50"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-muted-foreground">No cover yet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions - Below Image */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{title}</h3>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                  )}
                  {author && (
                    <p className="text-sm text-primary">by {author}</p>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                  </Button>
                  <Button
                    onClick={generateCover}
                    variant="outline"
                    disabled={isGenerating || !selectedStyle || !selectedMockup}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                  </Button>
                  {coverUrl && (
                    <Button asChild className="gap-2">
                      <a href={coverUrl} download="toolkit-cover.jpg" target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" />
                        Download Cover
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoverCreatorFlow;
