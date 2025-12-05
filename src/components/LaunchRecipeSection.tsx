import { Clock, Crown } from "lucide-react";
import { LaunchRecipe } from "@/types/niche";
import BlurOverlay from "./BlurOverlay";
import { useAuth } from "@/hooks/useAuth";

interface LaunchRecipeSectionProps {
  recipe: LaunchRecipe[];
  onUpgradeClick: () => void;
}

const LaunchRecipeSection = ({ recipe, onUpgradeClick }: LaunchRecipeSectionProps) => {
  const { role, user } = useAuth();
  const isPro = role === "pro";
  const isLocked = !isPro;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          60-Minute Launch Plan
        </h2>
        {!isPro && (
          <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-accent px-2 py-1 rounded-full">
            <Crown className="w-3 h-3" />
            Pro
          </span>
        )}
      </div>

      <BlurOverlay 
        isBlurred={isLocked} 
        message={!user ? "Sign up to see launch plan" : "Upgrade to Pro for launch recipes"}
        onAction={onUpgradeClick}
        actionLabel={!user ? "Sign Up" : "Upgrade"}
      >
        <div className="space-y-4">
          {recipe.map((step) => (
            <div
              key={step.step}
              className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                  {step.step}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {step.timeEstimate}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-xl gradient-ocean border border-primary/20 text-center">
          <p className="text-sm font-medium">Total time: ~60 minutes from PLR to published listing</p>
        </div>
      </BlurOverlay>
    </div>
  );
};

export default LaunchRecipeSection;
