import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Users, Sparkles, Palette, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PersonalizationData,
  TargetAudience,
  TransformationFocus,
  StyleVibe,
  PriceTier,
  TARGET_AUDIENCES,
  TRANSFORMATION_FOCUSES,
  STYLE_VIBES,
  PRICE_TIERS,
} from "@/types/personalization";

interface PersonalizationStepProps {
  onComplete: (data: PersonalizationData) => void;
  onBack: () => void;
}

type SelectionStep = "audience" | "transformation" | "style" | "price";

const PersonalizationStep = ({ onComplete, onBack }: PersonalizationStepProps) => {
  const [currentStep, setCurrentStep] = useState<SelectionStep>("audience");
  const [audience, setAudience] = useState<TargetAudience | null>(null);
  const [transformation, setTransformation] = useState<TransformationFocus | null>(null);
  const [style, setStyle] = useState<StyleVibe | null>(null);
  const [price, setPrice] = useState<PriceTier | null>(null);

  const steps: { key: SelectionStep; label: string; icon: React.ReactNode }[] = [
    { key: "audience", label: "Audience", icon: <Users className="w-4 h-4" /> },
    { key: "transformation", label: "Transform", icon: <Sparkles className="w-4 h-4" /> },
    { key: "style", label: "Style", icon: <Palette className="w-4 h-4" /> },
    { key: "price", label: "Price", icon: <DollarSign className="w-4 h-4" /> },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  const handleNext = () => {
    if (currentStep === "audience" && audience) {
      setCurrentStep("transformation");
    } else if (currentStep === "transformation" && transformation) {
      setCurrentStep("style");
    } else if (currentStep === "style" && style) {
      setCurrentStep("price");
    } else if (currentStep === "price" && price && audience && transformation && style) {
      onComplete({ targetAudience: audience, transformationFocus: transformation, styleVibe: style, priceTier: price });
    }
  };

  const handlePrevious = () => {
    if (currentStep === "price") {
      setCurrentStep("style");
    } else if (currentStep === "style") {
      setCurrentStep("transformation");
    } else if (currentStep === "transformation") {
      setCurrentStep("audience");
    } else {
      onBack();
    }
  };

  const isNextDisabled = () => {
    if (currentStep === "audience") return !audience;
    if (currentStep === "transformation") return !transformation;
    if (currentStep === "style") return !style;
    if (currentStep === "price") return !price;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                index < currentIndex
                  ? "bg-primary border-primary text-primary-foreground"
                  : index === currentIndex
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground"
              }`}
            >
              {index < currentIndex ? <Check className="w-5 h-5" /> : step.icon}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-2 ${
                  index < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="min-h-[320px]"
      >
        {/* Audience Selection */}
        {currentStep === "audience" && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Who is this product for?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This dramatically shapes content, tone, and examples.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TARGET_AUDIENCES.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setAudience(item.value)}
                  className={`p-3 rounded-xl border text-left transition-all hover:border-primary/50 ${
                    audience === item.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-xl mb-1 block">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Transformation Selection */}
        {currentStep === "transformation" && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">What transformation does it create?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This becomes the emotional hook in your marketing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TRANSFORMATION_FOCUSES.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setTransformation(item.value)}
                  className={`p-3 rounded-xl border text-left transition-all hover:border-primary/50 ${
                    transformation === item.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-xl mb-1 block">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Style Selection */}
        {currentStep === "style" && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">What's the visual vibe?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This determines colors, fonts, and overall aesthetic.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STYLE_VIBES.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStyle(item.value)}
                  className={`p-4 rounded-xl border text-left transition-all hover:border-primary/50 ${
                    style === item.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {item.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-border/50"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Tier Selection */}
        {currentStep === "price" && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">What price tier?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This affects perceived value and content depth.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {PRICE_TIERS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setPrice(item.value)}
                  className={`p-4 rounded-xl border text-center transition-all hover:border-primary/50 ${
                    price === item.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <span className="text-sm font-semibold text-foreground block">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    ${item.range.min} - ${item.range.max}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={handlePrevious} className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} disabled={isNextDisabled()} className="flex-1">
          {currentStep === "price" ? "Generate Blueprint" : "Next"}
        </Button>
      </div>

      {/* Summary Preview */}
      {(audience || transformation || style || price) && (
        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Your Product DNA:</p>
          <div className="flex flex-wrap gap-2">
            {audience && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                {TARGET_AUDIENCES.find((a) => a.value === audience)?.icon} {audience}
              </span>
            )}
            {transformation && (
              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
                {TRANSFORMATION_FOCUSES.find((t) => t.value === transformation)?.icon} {transformation}
              </span>
            )}
            {style && (
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">
                {STYLE_VIBES.find((s) => s.value === style)?.icon} {style}
              </span>
            )}
            {price && (
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">
                {PRICE_TIERS.find((p) => p.value === price)?.icon} {price}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizationStep;
