import { useState } from "react";
import { Palette, RefreshCw, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LogoCreatorProps {
  brandName: string;
  onLogoGenerated: (url: string) => void;
  existingLogo?: string | null;
}

const LogoCreator = ({ brandName, onLogoGenerated, existingLogo }: LogoCreatorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoUrl, setLogoUrl] = useState(existingLogo || "");

  const generateLogo = async () => {
    setIsGenerating(true);
    // Placeholder - will be implemented with edge function
    setTimeout(() => {
      const placeholder = `https://via.placeholder.com/400x400/1a1a2e/00d4ff?text=${encodeURIComponent(brandName.substring(0, 2).toUpperCase())}`;
      setLogoUrl(placeholder);
      onLogoGenerated(placeholder);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold gradient-text">Create Your Logo</h2>
          <p className="text-muted-foreground mt-2">
            Generate a professional logo for your toolkit.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="w-48 h-48 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/50 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Palette className="w-16 h-16 text-muted-foreground/30" />
            )}
          </div>

          <Button
            variant="hero"
            onClick={generateLogo}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : logoUrl ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Palette className="w-4 h-4" />
            )}
            {logoUrl ? "Regenerate Logo" : "Generate Logo"}
          </Button>

          {logoUrl && (
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm">Logo ready!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoCreator;
