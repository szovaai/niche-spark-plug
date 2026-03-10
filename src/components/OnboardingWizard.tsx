import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import OnboardingWelcome from "@/components/onboarding/OnboardingWelcome";
import OnboardingQuickSetup from "@/components/onboarding/OnboardingQuickSetup";
import OnboardingGeneration from "@/components/onboarding/OnboardingGeneration";
import OnboardingBlueprint from "@/components/onboarding/OnboardingBlueprint";

interface OnboardingWizardProps {
  onComplete: (preferences: { platform: string; interests: string[] }) => void;
  onSkip: () => void;
}

const OnboardingWizard = ({ onComplete, onSkip }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [setupData, setSetupData] = useState({ productType: "", niche: "", goal: "" });

  const handleSetupComplete = (data: { productType: string; niche: string; goal: string }) => {
    setSetupData(data);
    setStep(2);
  };

  const handleGenerationComplete = useCallback(() => {
    setStep(3);
  }, []);

  const handleBlueprintContinue = () => {
    onComplete({
      platform: "gumroad",
      interests: [setupData.niche, setupData.productType],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Layered background */}
      <div className="fixed inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Step indicator */}
        {step > 0 && step < 3 && (
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <OnboardingWelcome
              key="welcome"
              onStart={() => setStep(1)}
              onExplore={onSkip}
            />
          )}
          {step === 1 && (
            <OnboardingQuickSetup
              key="setup"
              onComplete={handleSetupComplete}
            />
          )}
          {step === 2 && (
            <OnboardingGeneration
              key="generation"
              onComplete={handleGenerationComplete}
            />
          )}
          {step === 3 && (
            <OnboardingBlueprint
              key="blueprint"
              data={setupData}
              onContinue={handleBlueprintContinue}
            />
          )}
        </AnimatePresence>

        {/* Skip */}
        {step === 1 && (
          <button
            onClick={onSkip}
            className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
