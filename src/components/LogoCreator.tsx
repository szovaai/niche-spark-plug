import { useState } from "react";
import { Palette, RefreshCw, Check, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LogoCreatorProps {
  brandName: string;
  onLogoGenerated: (url: string) => void;
  existingLogo?: string | null;
}

const brandStyles = [
  { id: "modern", label: "Modern", description: "Clean, contemporary look" },
  { id: "elegant", label: "Elegant", description: "Sophisticated and refined" },
  { id: "minimalist", label: "Minimalist", description: "Simple and clean" },
  { id: "bold", label: "Bold", description: "Strong and impactful" },
  { id: "playful", label: "Playful", description: "Fun and approachable" },
];

const logoStyles = [
  { id: "abstract-icon", label: "Abstract Icon", description: "Unique geometric symbol" },
  { id: "wordmark", label: "Wordmark", description: "Stylized text logo" },
  { id: "mascot", label: "Mascot", description: "Character-based logo" },
  { id: "geometric", label: "Geometric", description: "Shapes and patterns" },
  { id: "sleek-symbol", label: "Sleek Symbol", description: "Minimal iconic mark" },
];

const colorPresets = [
  { primary: "#00d4ff", secondary: "#1a1a2e", name: "Cyber Blue" },
  { primary: "#10b981", secondary: "#064e3b", name: "Emerald" },
  { primary: "#f59e0b", secondary: "#78350f", name: "Amber" },
  { primary: "#8b5cf6", secondary: "#4c1d95", name: "Violet" },
  { primary: "#ef4444", secondary: "#7f1d1d", name: "Ruby" },
  { primary: "#ec4899", secondary: "#831843", name: "Pink" },
];

const LogoCreator = ({ brandName, onLogoGenerated, existingLogo }: LogoCreatorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoUrl, setLogoUrl] = useState(existingLogo || "");
  
  // Form state
  const [tagline, setTagline] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#00d4ff");
  const [secondaryColor, setSecondaryColor] = useState("#1a1a2e");
  const [brandStyle, setBrandStyle] = useState("modern");
  const [logoStyle, setLogoStyle] = useState("abstract-icon");
  const [keyElements, setKeyElements] = useState("");

  const generateLogo = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-logo", {
        body: {
          brandName,
          tagline,
          primaryColor,
          secondaryColor,
          brandStyle,
          keyElements,
          logoStyle,
        },
      });

      if (error) {
        toast.error("Failed to generate logo. Please try again.");
        return;
      }

      if (data?.imageUrl) {
        setLogoUrl(data.imageUrl);
        onLogoGenerated(data.imageUrl);
        toast.success("Logo generated successfully!");
      }
    } catch (err) {
      console.error("Logo generation error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold gradient-text">Create Your Logo</h2>
          <p className="text-muted-foreground mt-2">
            Generate a professional logo for "{brandName}"
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side: Form */}
          <div className="space-y-5">
            {/* Tagline */}
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline (Optional)</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., Your success starts here"
                className="bg-muted/50"
              />
            </div>

            {/* Color Presets */}
            <div className="space-y-2">
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
                    style={{ 
                      background: primaryColor === preset.primary 
                        ? `linear-gradient(135deg, ${preset.primary}20, ${preset.secondary}20)`
                        : undefined 
                    }}
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

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-muted/50 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 bg-muted/50 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Brand Style */}
            <div className="space-y-2">
              <Label>Brand Style</Label>
              <Select value={brandStyle} onValueChange={setBrandStyle}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brandStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{style.label}</span>
                        <span className="text-muted-foreground text-xs">
                          — {style.description}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Logo Style */}
            <div className="space-y-2">
              <Label>Logo Style</Label>
              <Select value={logoStyle} onValueChange={setLogoStyle}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {logoStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{style.label}</span>
                        <span className="text-muted-foreground text-xs">
                          — {style.description}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Key Elements */}
            <div className="space-y-2">
              <Label htmlFor="keyElements">Key Elements (Optional)</Label>
              <Textarea
                id="keyElements"
                value={keyElements}
                onChange={(e) => setKeyElements(e.target.value)}
                placeholder="Describe any symbols, themes, or motifs to include (e.g., lightning bolt, book, compass)"
                className="bg-muted/50 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Right Side: Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-64 h-64 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/30 overflow-hidden mb-4">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Creating your logo...</span>
                </div>
              ) : logoUrl ? (
                <img src={logoUrl} alt="Generated Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <Palette className="w-12 h-12 text-muted-foreground/30" />
                  <span className="text-sm text-muted-foreground">
                    Configure your settings and click Generate
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button
                variant="hero"
                onClick={generateLogo}
                disabled={isGenerating}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : logoUrl ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Logo
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4" />
                    Generate Logo
                  </>
                )}
              </Button>

              {logoUrl && (
                <>
                  <div className="flex items-center gap-2 text-green-400 justify-center">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Logo ready!</span>
                  </div>
                  <Button asChild variant="outline" className="w-full gap-2">
                    <a href={logoUrl} download="logo.png" target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                      Download PNG
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoCreator;
