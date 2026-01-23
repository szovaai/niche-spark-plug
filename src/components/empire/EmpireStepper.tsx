import { motion } from "framer-motion";
import { Target, Palette, Package, Store, Video, Rocket, Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmpireStep, EmpireProject } from "@/types/empire";

interface EmpireStepperProps {
  steps: EmpireStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  project: Partial<EmpireProject>;
}

const stepIcons = {
  Target, Palette, Package, Store, Video, Rocket
};

const iconMap: Record<string, React.ElementType> = {
  Target, Palette, Package, Store, Video, Rocket
};

export const EmpireStepper = ({ steps, currentStep, onStepClick, project }: EmpireStepperProps) => {
  
  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 1: return !!project.step1_final_niche;
      case 2: return !!project.step2_selected_brand;
      case 3: return !!project.step3_selected_product;
      case 4: return !!project.step4_listing_copy;
      case 5: return !!(project.step5_viral_ideas && project.step5_viral_ideas.length > 0);
      case 6: return !!project.step6_schedule_plan;
      default: return false;
    }
  };

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const Icon = iconMap[step.icon] || Circle;
        const isActive = currentStep === step.id;
        const isComplete = isStepComplete(step.id);
        const isPast = step.id < currentStep;

        return (
          <motion.button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
              isActive 
                ? "bg-primary/10 border border-primary/30" 
                : "hover:bg-secondary/50",
              (isComplete || isPast) && !isActive && "opacity-80"
            )}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : isComplete 
                  ? "bg-green-500/20 text-green-500"
                  : "bg-secondary text-muted-foreground"
            )}>
              {isComplete ? (
                <Check className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground truncate hidden lg:block">
                {step.description}
              </p>
            </div>

            {isComplete && (
              <div className="text-xs text-green-500 font-medium">
                ✓
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
