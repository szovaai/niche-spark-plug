import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, ArrowLeft, Image, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductBlueprint, ProductType, NicheSnapshot, PRODUCT_TYPES } from "@/types/niche";
import { PersonalizationData } from "@/types/personalization";
import { BundleVariants } from "@/types/bundle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProductTypeCard from "./ProductTypeCard";
import BlueprintDisplay from "./BlueprintDisplay";
import EcoverFactory from "./EcoverFactory";
import PersonalizationStep from "./PersonalizationStep";
import BundleDisplay from "./BundleDisplay";

interface ProductFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  niche: NicheSnapshot;
}

type Step = "select" | "personalize" | "generating" | "result";
type ResultTab = "blueprint" | "ecovers" | "bundles";

const ProductFactoryModal = ({ isOpen, onClose, niche }: ProductFactoryModalProps) => {
  const [step, setStep] = useState<Step>("select");
  const [resultTab, setResultTab] = useState<ResultTab>("blueprint");
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);
  const [personalization, setPersonalization] = useState<PersonalizationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<ProductBlueprint | null>(null);
  const [bundles, setBundles] = useState<BundleVariants | null>(null);
  const [bundleLoading, setBundleLoading] = useState(false);

  const handleTypeSelect = (type: ProductType) => {
    setSelectedType(type);
    setStep("personalize");
  };

  const handlePersonalizationComplete = async (data: PersonalizationData) => {
    setPersonalization(data);
    setStep("generating");
    await generateBlueprint(selectedType!, data);
  };

  const generateBlueprint = async (type: ProductType, personalizationData: PersonalizationData) => {
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
          personalization: personalizationData,
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
        setStep("personalize");
        return;
      }

      setBlueprint(data);
      setStep("result");
    } catch (error) {
      console.error("Error generating blueprint:", error);
      toast.error("Failed to generate product blueprint. Please try again.");
      setStep("personalize");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (selectedType && personalization) {
      setStep("generating");
      setBundles(null); // Reset bundles when regenerating
      generateBlueprint(selectedType, personalization);
    }
  };

  const generateBundles = async () => {
    if (!blueprint || !personalization) return;
    
    setBundleLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-bundle-variants", {
        body: {
          blueprint,
          personalization,
        },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setBundles(data);
      toast.success("Bundle variants generated!");
    } catch (error) {
      console.error("Error generating bundles:", error);
      toast.error("Failed to generate bundle variants. Please try again.");
    } finally {
      setBundleLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "personalize") {
      setStep("select");
      setSelectedType(null);
    } else if (step === "result") {
      setStep("personalize");
      setResultTab("blueprint");
      setBlueprint(null);
      setBundles(null);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("select");
      setResultTab("blueprint");
      setBlueprint(null);
      setBundles(null);
      setSelectedType(null);
      setPersonalization(null);
    }, 300);
  };

  const getStepTitle = () => {
    switch (step) {
      case "select":
        return "Turn Into Product";
      case "personalize":
        return "Personalize Your Product";
      case "generating":
        return "AI Product Factory";
      case "result":
        return "AI Product Factory";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case "select":
        return `Choose a product type for "${niche.name}"`;
      case "personalize":
        return `Customize your ${selectedType} to stand out`;
      case "generating":
        return `Creating your personalized ${selectedType}...`;
      case "result":
        return `${selectedType} for "${niche.name}"`;
    }
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
                  {(step === "personalize" || step === "result") && (
                    <button onClick={handleBack} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      {getStepTitle()}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{getStepSubtitle()}</p>
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
                        Next: Personalize your product to make it unique and stand out from competitors.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step: Personalization */}
                {step === "personalize" && selectedType && (
                  <PersonalizationStep
                    onComplete={handlePersonalizationComplete}
                    onBack={handleBack}
                  />
                )}

                {/* Step: Generating */}
                {step === "generating" && (
                  <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">Creating Your Unique {selectedType}</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      AI is generating personalized content for {personalization?.targetAudience} focused on {personalization?.transformationFocus}...
                    </p>
                    <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                      <p className="animate-pulse">✓ Analyzing your personalization choices</p>
                      <p className="animate-pulse" style={{ animationDelay: "0.5s" }}>✓ Crafting unique content for {personalization?.targetAudience}</p>
                      <p className="animate-pulse" style={{ animationDelay: "1s" }}>✓ Applying {personalization?.styleVibe} aesthetic</p>
                      <p className="animate-pulse" style={{ animationDelay: "1.5s" }}>✓ Writing marketing copy with Human Tone™</p>
                    </div>
                  </div>
                )}

                {/* Step: Result */}
                {step === "result" && blueprint && (
                  <div className="space-y-6">
                    {/* Personalization Summary */}
                    {personalization && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Product DNA:</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                            👤 {personalization.targetAudience}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
                            ✨ {personalization.transformationFocus}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">
                            🎨 {personalization.styleVibe}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">
                            💰 {personalization.priceTier}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tab Switcher */}
                    <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
                      <button
                        onClick={() => setResultTab("blueprint")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
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
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                          resultTab === "ecovers"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Image className="w-4 h-4" />
                        Ecovers
                      </button>
                      <button
                        onClick={() => setResultTab("bundles")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                          resultTab === "bundles"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        Bundles
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

                    {resultTab === "bundles" && (
                      <div className="space-y-4">
                        {!bundles ? (
                          <div className="text-center py-12">
                            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">Create Product Bundle</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                              Turn your product into a complete product line with a Lite version (tripwire), 
                              Bonus add-on (upsell), and Premium Bundle (complete package).
                            </p>
                            <Button 
                              onClick={generateBundles} 
                              disabled={bundleLoading}
                              className="gap-2"
                            >
                              {bundleLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Generating Bundle Variants...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  Generate Bundle Variants
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <BundleDisplay 
                            bundles={bundles} 
                            originalProductName={blueprint.productName} 
                          />
                        )}
                      </div>
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
