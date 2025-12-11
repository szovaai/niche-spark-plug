import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, Loader2, CheckCircle2, Circle, AlertCircle,
  FileText, Image, Package, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductBlueprint, NicheSnapshot } from "@/types/niche";
import { PersonalizationData } from "@/types/personalization";
import { BundleVariants } from "@/types/bundle";
import { LaunchKit } from "@/types/launchKit";
import { CompletionStep } from "@/types/productBuild";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CompleteProductWizardProps {
  niche: NicheSnapshot;
  productType: string;
  personalization: PersonalizationData;
  onComplete: (data: {
    blueprint: ProductBlueprint;
    bundles: BundleVariants;
    launchKit: LaunchKit;
  }) => void;
  onCancel: () => void;
}

const CompleteProductWizard = ({
  niche,
  productType,
  personalization,
  onComplete,
  onCancel,
}: CompleteProductWizardProps) => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<CompletionStep[]>([
    { id: "blueprint", label: "Product Blueprint", description: "Generating your personalized product structure...", status: "pending" },
    { id: "bundles", label: "Bundle Variants", description: "Creating Lite, Bonus, and Premium versions...", status: "pending" },
    { id: "launchKit", label: "Launch Marketing Kit", description: "Writing TikToks, emails, pins, and 7-day plan...", status: "pending" },
    { id: "save", label: "Save to Dashboard", description: "Saving your complete product package...", status: "pending" },
  ]);

  const [blueprint, setBlueprint] = useState<ProductBlueprint | null>(null);
  const [bundles, setBundles] = useState<BundleVariants | null>(null);
  const [launchKit, setLaunchKit] = useState<LaunchKit | null>(null);

  const updateStepStatus = (stepId: string, status: CompletionStep["status"]) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, status } : s
    ));
  };

  const runCompleteGeneration = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: Generate Blueprint
      setCurrentStep(0);
      updateStepStatus("blueprint", "generating");
      
      const { data: blueprintData, error: blueprintError } = await supabase.functions.invoke(
        "generate-product-blueprint",
        {
          body: {
            nicheName: niche.name,
            nicheCategory: niche.category,
            demandTier: niche.demandTier,
            competitionTier: niche.competitionTier,
            productType,
            personalization,
          },
        }
      );

      if (blueprintError || blueprintData?.error) {
        throw new Error(blueprintData?.error || "Failed to generate blueprint");
      }

      setBlueprint(blueprintData);
      updateStepStatus("blueprint", "complete");

      // Step 2: Generate Bundles
      setCurrentStep(1);
      updateStepStatus("bundles", "generating");

      const { data: bundlesData, error: bundlesError } = await supabase.functions.invoke(
        "generate-bundle-variants",
        {
          body: {
            blueprint: blueprintData,
            personalization,
          },
        }
      );

      if (bundlesError || bundlesData?.error) {
        throw new Error(bundlesData?.error || "Failed to generate bundles");
      }

      setBundles(bundlesData);
      updateStepStatus("bundles", "complete");

      // Step 3: Generate Launch Kit
      setCurrentStep(2);
      updateStepStatus("launchKit", "generating");

      const { data: launchKitData, error: launchKitError } = await supabase.functions.invoke(
        "generate-launch-kit",
        {
          body: {
            blueprint: blueprintData,
            personalization,
            nicheName: niche.name,
          },
        }
      );

      if (launchKitError || launchKitData?.error) {
        throw new Error(launchKitData?.error || "Failed to generate launch kit");
      }

      setLaunchKit(launchKitData);
      updateStepStatus("launchKit", "complete");

      // Step 4: Save to Database
      setCurrentStep(3);
      updateStepStatus("save", "generating");

      if (user) {
        const { error: saveError } = await supabase
          .from("user_product_builds")
          .insert({
            user_id: user.id,
            niche_id: niche.id,
            niche_name: niche.name,
            product_type: productType,
            product_name: blueprintData.productName,
            target_audience: personalization.targetAudience,
            transformation_focus: personalization.transformationFocus,
            style_vibe: personalization.styleVibe,
            price_tier: personalization.priceTier,
            blueprint: blueprintData,
            bundles: bundlesData,
            launch_kit: launchKitData,
            status: "in_progress",
            completion_steps: {
              blueprint: true,
              ecovers: false,
              bundles: true,
              launchKit: true,
            },
          });

        if (saveError) {
          console.error("Error saving product:", saveError);
          // Don't throw - product was generated, just couldn't save
          toast.warning("Product generated but couldn't save to dashboard");
        }
      }

      updateStepStatus("save", "complete");
      
      // Complete!
      toast.success("🎉 Complete product package generated!");
      onComplete({
        blueprint: blueprintData,
        bundles: bundlesData,
        launchKit: launchKitData,
      });

    } catch (error) {
      console.error("Error in complete generation:", error);
      const currentStepId = steps[currentStep]?.id;
      if (currentStepId) {
        updateStepStatus(currentStepId, "error");
      }
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (step: CompletionStep, index: number) => {
    switch (step.status) {
      case "complete":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "generating":
        return <Loader2 className="w-6 h-6 text-primary animate-spin" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-destructive" />;
      default:
        return <Circle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getMainIcon = (stepId: string) => {
    switch (stepId) {
      case "blueprint":
        return <FileText className="w-5 h-5" />;
      case "bundles":
        return <Package className="w-5 h-5" />;
      case "launchKit":
        return <Rocket className="w-5 h-5" />;
      case "save":
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const completedSteps = steps.filter(s => s.status === "complete").length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Building your complete product...</span>
          <span className="font-medium">{completedSteps}/{steps.length}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border transition-all ${
              step.status === "generating"
                ? "bg-primary/5 border-primary/30"
                : step.status === "complete"
                ? "bg-green-500/5 border-green-500/30"
                : step.status === "error"
                ? "bg-destructive/5 border-destructive/30"
                : "bg-secondary/30 border-border"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                {getMainIcon(step.id)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{step.label}</h4>
                  {step.status === "generating" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary animate-pulse">
                      Generating...
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {getStepIcon(step, index)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      {!isRunning && completedSteps === 0 && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={runCompleteGeneration} className="flex-1 gap-2">
            <Sparkles className="w-4 h-4" />
            Start Building
          </Button>
        </div>
      )}

      {isRunning && (
        <p className="text-center text-sm text-muted-foreground">
          This may take 1-2 minutes. Don't close this window.
        </p>
      )}
    </div>
  );
};

export default CompleteProductWizard;
