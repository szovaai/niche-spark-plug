import { useState } from "react";
import { Image, RefreshCw, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EcoverGeneratorProps {
  title: string;
  subtitle?: string;
  niche: string;
  logoUrl?: string | null;
  onEcoverGenerated: (url: string) => void;
  existingEcover?: string | null;
}

const EcoverGenerator = ({ title, niche, onEcoverGenerated, existingEcover }: EcoverGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ecoverUrl, setEcoverUrl] = useState(existingEcover || "");

  const generateEcover = async () => {
    setIsGenerating(true);
    toast.info("Generating your e-cover... This takes about 45-60 seconds.");
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout
      
      const { data, error } = await supabase.functions.invoke("generate-ecover", {
        body: {
          productName: title,
          productType: "Digital Toolkit",
          aesthetic: "modern, professional, clean",
          primaryColor: "#00d4ff",
          secondaryColor: "#1a1a2e",
          moodKeywords: [niche, "premium", "digital product"],
          ecoverType: "mockup"
        }
      });
      
      clearTimeout(timeoutId);

      if (error) {
        console.error("Ecover generation error:", error);
        toast.error("Failed to generate e-cover. Please try again.");
        return;
      }

      if (data?.imageUrl) {
        setEcoverUrl(data.imageUrl);
        onEcoverGenerated(data.imageUrl);
        toast.success("E-cover generated successfully!");
      } else {
        console.error("No image in response:", data);
        toast.error("No image returned. Please try again.");
      }
    } catch (err) {
      console.error("Ecover error:", err);
      if (err instanceof Error && err.name === 'AbortError') {
        toast.error("Generation timed out. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold gradient-text">Generate E-Cover</h2>
          <p className="text-muted-foreground mt-2">Create a professional product cover image.</p>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-full max-w-4xl aspect-video rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/50 overflow-hidden">
            {ecoverUrl ? (
              <img src={ecoverUrl} alt="E-Cover" className="w-full h-full object-contain" />
            ) : (
              <Image className="w-20 h-20 text-muted-foreground/30" />
            )}
          </div>

          <Button variant="hero" onClick={generateEcover} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating (~60s)...
              </>
            ) : (
              <>
                <Image className="w-4 h-4" />
                {ecoverUrl ? "Regenerate E-Cover" : "Generate E-Cover"}
              </>
            )}
          </Button>

          {ecoverUrl && (
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm">E-Cover ready!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EcoverGenerator;
