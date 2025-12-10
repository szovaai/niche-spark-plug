import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, ArrowLeft, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductBlueprint, ProductType, NicheSnapshot, PRODUCT_TYPES } from "@/types/niche";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProductTypeCard from "./ProductTypeCard";
import BlueprintDisplay from "./BlueprintDisplay";
import EcoverFactory from "./EcoverFactory";

interface ProductFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  niche: NicheSnapshot;
}

type Step = "select" | "generating" | "result";
type ResultTab = "blueprint" | "ecovers";

const ProductFactoryModal = ({ isOpen, onClose, niche }: ProductFactoryModalProps) => {
  const [step, setStep] = useState<Step>("select");
  const [resultTab, setResultTab] = useState<ResultTab>("blueprint");
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<ProductBlueprint | null>(null);

  const handleTypeSelect = async (type: ProductType) => {
    setSelectedType(type);
    setStep("generating");
    await generateBlueprint(type);
  };

  const generateBlueprint = async (type: ProductType) => {
    setLoading(true);
    setBlueprint(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-product-blueprint", {
        body: {
          nicheName: niche.name,
          nicheCategory: niche.category,
          demandTier: niche.demandTier,
          competitionTier: niche.competitionTier,
          productType: type,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else if (data.error.includes("usage limit")) {
          toast.error("AI usage limit reached. Please upgrade your plan.");
        } else {
          toast.error(data.error);
        }
        setStep("select");
        return;
      }

      setBlueprint(data);
      setStep("result");
    } catch (error) {
      console.error("Error generating blueprint:", error);
      toast.error("Failed to generate product blueprint. Please try again.");
      setStep("select");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (selectedType) {
      setStep("generating");
      generateBlueprint(selectedType);
    }
  };

  const handleBack = () => {
    setStep("select");
    setResultTab("blueprint");
    setBlueprint(null);
    setSelectedType(null);
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setStep("select");
      setResultTab("blueprint");
      setBlueprint(null);
      setSelectedType(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-3xl md:w-full bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  {step === "result" && (
                    <button onClick={handleBack} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      {step === "select" ? "Turn Into Product" : "AI Product Factory"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {step === "select" && `Choose a product type for "${niche.name}"`}
                      {step === "generating" && `Creating your ${selectedType} blueprint...`}
                      {step === "result" && `${selectedType} for "${niche.name}"`}
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Step: Select Product Type */}
                {step === "select" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {PRODUCT_TYPES.map((productType, index) => (
                        <motion.div
                          key={productType.type}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ProductTypeCard
                            config={productType}
                            onClick={() => handleTypeSelect(productType.type)}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                      <p className="text-sm text-muted-foreground text-center">
                        <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
                        AI generates page-by-page content with Human Tone Engine™ for natural, conversational copy.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step: Generating */}
                {step === "generating" && (
                  <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">Creating Your {selectedType}</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      AI is generating page-by-page content, style guide, and marketing copy with the Human Tone Engine™...
                    </p>
                    <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                      <p className="animate-pulse">✓ Analyzing niche trends</p>
                      <p className="animate-pulse" style={{ animationDelay: "0.5s" }}>✓ Generating content pages</p>
                      <p className="animate-pulse" style={{ animationDelay: "1s" }}>✓ Creating style guide</p>
                      <p className="animate-pulse" style={{ animationDelay: "1.5s" }}>✓ Writing marketing copy</p>
                    </div>
                  </div>
                )}

                {/* Step: Result */}
                {step === "result" && blueprint && (
                  <div className="space-y-6">
                    {/* Tab Switcher */}
                    <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
                      <button
                        onClick={() => setResultTab("blueprint")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                          resultTab === "blueprint"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        Blueprint
                      </button>
                      <button
                        onClick={() => setResultTab("ecovers")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                          resultTab === "ecovers"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Image className="w-4 h-4" />
                        Ecovers & Promos
                      </button>
                    </div>

                    {/* Tab Content */}
                    {resultTab === "blueprint" && (
                      <BlueprintDisplay 
                        blueprint={blueprint} 
                        onRegenerate={handleRegenerate}
                        loading={loading}
                      />
                    )}

                    {resultTab === "ecovers" && (
                      <EcoverFactory blueprint={blueprint} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductFactoryModal;
