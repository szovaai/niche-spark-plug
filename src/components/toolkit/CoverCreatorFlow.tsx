import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Download, RotateCcw, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CoverCreatorFlowProps {
  initialTitle?: string;
  initialSubtitle?: string;
  initialAuthor?: string;
  niche?: string;
  existingCover?: string | null;
  onCoverGenerated: (coverUrl: string) => void;
}

type CoverStyle = {
  id: string;
  name: string;
  description: string;
  keywords: string[];
};

const coverStyles: CoverStyle[] = [
  {
    id: "bold",
    name: "Bold & Dynamic",
    description: "Eye-catching design with vibrant colors and strong typography",
    keywords: ["bold", "vibrant", "dynamic", "energetic"],
  },
  {
    id: "minimalist",
    name: "Minimalist & Clean",
    description: "Simple, elegant design with clean lines and subtle colors",
    keywords: ["minimalist", "clean", "elegant", "simple"],
  },
  {
    id: "creative",
    name: "Creative & Artistic",
    description: "Unique artistic style with creative visual elements",
    keywords: ["creative", "artistic", "unique", "abstract"],
  },
];

const CoverCreatorFlow = ({
  initialTitle = "",
  initialSubtitle = "",
  initialAuthor = "",
  niche = "",
  existingCover,
  onCoverGenerated,
}: CoverCreatorFlowProps) => {
  const [step, setStep] = useState(existingCover ? 3 : 1);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [selectedStyle, setSelectedStyle] = useState<CoverStyle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverUrl, setCoverUrl] = useState(existingCover || "");

  const generateCover = async () => {
    if (!selectedStyle) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ecover", {
        body: {
          productName: title,
          productType: "Digital Toolkit",
          aesthetic: selectedStyle.keywords.join(", "),
          primaryColor: "#00d4ff",
          secondaryColor: "#1a1a2e",
          moodKeywords: [niche, ...selectedStyle.keywords, "premium"],
          ecoverType: "mockup",
        },
      });

      if (error) {
        toast.error("Failed to generate cover. Please try again.");
        return;
      }

      if (data?.imageUrl) {
        setCoverUrl(data.imageUrl);
        onCoverGenerated(data.imageUrl);
        setStep(3);
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
    setCoverUrl("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
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
              {s === 1 && "Book Details"}
              {s === 2 && "Choose Style"}
              {s === 3 && "Your Cover"}
            </span>
            {s < 3 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-2",
                  step > s ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Book Details */}
      {step === 1 && (
        <Card className="glass-card">
          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Book Details</h2>
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
                onClick={generateCover}
                disabled={!selectedStyle || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Create This Cover
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Final Cover */}
      {step === 3 && (
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Your Cover is Ready!</h2>
              <p className="text-muted-foreground mt-2">
                Here's your professionally designed toolkit cover
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Cover Preview */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-64 h-80 rounded-lg overflow-hidden shadow-2xl border border-border">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Generated Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-muted-foreground">No cover yet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{title}</h3>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                  )}
                  {author && (
                    <p className="text-sm text-primary">by {author}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-4">
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
                    disabled={isGenerating || !selectedStyle}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                  </Button>
                  {coverUrl && (
                    <Button asChild className="gap-2">
                      <a href={coverUrl} download="toolkit-cover.jpg" target="_blank">
                        <Download className="w-4 h-4" />
                        Download as JPG
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
