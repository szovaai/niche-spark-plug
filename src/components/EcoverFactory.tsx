import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image, Loader2, Download, RefreshCw, Monitor, Square, 
  RectangleVertical, Instagram, Check, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductBlueprint } from "@/types/niche";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EcoverFactoryProps {
  blueprint: ProductBlueprint;
}

type EcoverType = "mockup" | "thumbnail" | "pinterest" | "instagram";

interface EcoverConfig {
  type: EcoverType;
  label: string;
  description: string;
  icon: React.ReactNode;
  aspectRatio: string;
}

const ECOVER_TYPES: EcoverConfig[] = [
  { 
    type: "mockup", 
    label: "3D Mockup", 
    description: "Hero image for listings",
    icon: <Monitor className="w-5 h-5" />,
    aspectRatio: "16:9"
  },
  { 
    type: "thumbnail", 
    label: "Listing Thumbnail", 
    description: "Square for Etsy/Gumroad",
    icon: <Square className="w-5 h-5" />,
    aspectRatio: "1:1"
  },
  { 
    type: "pinterest", 
    label: "Pinterest Pin", 
    description: "Tall pin format",
    icon: <RectangleVertical className="w-5 h-5" />,
    aspectRatio: "2:3"
  },
  { 
    type: "instagram", 
    label: "Instagram Post", 
    description: "Square social post",
    icon: <Instagram className="w-5 h-5" />,
    aspectRatio: "1:1"
  },
];

interface GeneratedEcover {
  type: EcoverType;
  imageUrl: string;
}

const EcoverFactory = ({ blueprint }: EcoverFactoryProps) => {
  const [generating, setGenerating] = useState<EcoverType | null>(null);
  const [generatedEcovers, setGeneratedEcovers] = useState<GeneratedEcover[]>([]);
  const [selectedType, setSelectedType] = useState<EcoverType | null>(null);

  const generateEcover = async (type: EcoverType) => {
    setGenerating(type);
    setSelectedType(type);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ecover", {
        body: {
          productName: blueprint.productName,
          productType: blueprint.productType,
          aesthetic: blueprint.styleGuide.aesthetic,
          primaryColor: blueprint.styleGuide.primaryColor,
          secondaryColor: blueprint.styleGuide.secondaryColor,
          moodKeywords: blueprint.styleGuide.moodKeywords,
          ecoverType: type,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else if (data.error.includes("usage limit")) {
          toast.error("AI usage limit reached. Please upgrade your plan.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      // Add or update the ecover
      setGeneratedEcovers(prev => {
        const existing = prev.filter(e => e.type !== type);
        return [...existing, { type, imageUrl: data.imageUrl }];
      });

      toast.success(`${ECOVER_TYPES.find(e => e.type === type)?.label} generated!`);
    } catch (error) {
      console.error("Error generating ecover:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      // For base64 images
      if (imageUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Image downloaded!");
      } else {
        // For URL images
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Image downloaded!");
      }
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const getEcover = (type: EcoverType) => generatedEcovers.find(e => e.type === type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl gradient-ocean border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Image className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Ecover & Promo Factory</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate AI-powered mockups and promotional images for your product. Each image is customized to match your style guide.
        </p>
      </div>

      {/* Ecover Type Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ECOVER_TYPES.map((ecover) => {
          const generated = getEcover(ecover.type);
          const isGenerating = generating === ecover.type;

          return (
            <motion.div
              key={ecover.type}
              whileHover={{ scale: 1.02 }}
              className={`relative rounded-xl border overflow-hidden transition-all ${
                generated 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-border bg-secondary/30 hover:border-primary/30"
              }`}
            >
              {/* Image Preview or Placeholder */}
              <div 
                className={`aspect-square relative ${
                  ecover.type === "pinterest" ? "aspect-[2/3]" : 
                  ecover.type === "mockup" ? "aspect-video" : "aspect-square"
                }`}
              >
                {generated ? (
                  <img 
                    src={generated.imageUrl} 
                    alt={ecover.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                    {isGenerating ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    ) : (
                      <div className="text-center p-4">
                        {ecover.icon}
                        <p className="text-xs text-muted-foreground mt-2">{ecover.aspectRatio}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Generated Badge */}
                {generated && !isGenerating && (
                  <div className="absolute top-2 right-2 p-1 bg-primary rounded-full">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Info & Actions */}
              <div className="p-3 space-y-2">
                <div>
                  <p className="font-medium text-sm">{ecover.label}</p>
                  <p className="text-xs text-muted-foreground">{ecover.description}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={generated ? "outline" : "default"}
                    className="flex-1 text-xs"
                    onClick={() => generateEcover(ecover.type)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : generated ? (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Redo
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Generate
                      </>
                    )}
                  </Button>

                  {generated && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => downloadImage(
                        generated.imageUrl, 
                        `${blueprint.productName.replace(/\s+/g, "-").toLowerCase()}-${ecover.type}.png`
                      )}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Generate All Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={async () => {
            for (const ecover of ECOVER_TYPES) {
              if (!getEcover(ecover.type)) {
                await generateEcover(ecover.type);
              }
            }
          }}
          disabled={generating !== null}
          className="border-primary/30"
        >
          <Sparkles className="w-4 h-4" />
          Generate All Missing
        </Button>
      </div>

      {/* Expanded Preview */}
      <AnimatePresence>
        {selectedType && getEcover(selectedType) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">
                  {ECOVER_TYPES.find(e => e.type === selectedType)?.label} Preview
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const ecover = getEcover(selectedType);
                    if (ecover) {
                      downloadImage(
                        ecover.imageUrl,
                        `${blueprint.productName.replace(/\s+/g, "-").toLowerCase()}-${selectedType}.png`
                      );
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download Full Size
                </Button>
              </div>
              <img 
                src={getEcover(selectedType)?.imageUrl} 
                alt="Preview"
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EcoverFactory;
