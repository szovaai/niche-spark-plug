import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, Palette, Package, Store, Video, Rocket,
  ChevronLeft, ChevronRight, Check, Crown
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EmpireProject, EMPIRE_STEPS } from "@/types/empire";
import { EmpireStepper } from "@/components/empire/EmpireStepper";
import { Step1NicheFinder } from "@/components/empire/Step1NicheFinder";
import { Step2BrandSetup } from "@/components/empire/Step2BrandSetup";
import { Step3ProductPack } from "@/components/empire/Step3ProductPack";
import { Step4GumroadLaunch } from "@/components/empire/Step4GumroadLaunch";
import { Step5ContentEngine } from "@/components/empire/Step5ContentEngine";
import { Step6Automation } from "@/components/empire/Step6Automation";
import { useAutosave } from "@/hooks/useAutosave";

const stepIcons = {
  Target, Palette, Package, Store, Video, Rocket
};

const EmpireMode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Partial<EmpireProject>>({
    name: "My Empire Project",
    current_step: 1,
  });


  // Universal autosave (2s debounce)
  useAutosave({
    table: "empire_projects",
    recordId: project.id || null,
    setRecordId: (newId) => {
      setProject((p) => ({ ...p, id: newId } as any));
      navigate(`/empire/${newId}`, { replace: true });
    },
    userId: user?.id,
    data: { ...project, id: undefined },
    enabled: !!user && !loading,
  });

  useEffect(() => {
    if (id && user) {
      loadProject(id);
    } else if (user) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, user]);

  const loadProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("empire_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      if (data) {
        setProject(data as unknown as EmpireProject);
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast({
        title: "Error loading project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (updates: Partial<EmpireProject>) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save your progress.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updatedProject = { ...project, ...updates };
      
      if (project.id) {
        const { error } = await supabase
          .from("empire_projects")
          .update(updatedProject as any)
          .eq("id", project.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("empire_projects")
          .insert({ ...updatedProject, user_id: user.id } as any)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setProject(data as unknown as EmpireProject);
          navigate(`/empire/${data.id}`, { replace: true });
        }
      }
      
      setProject(updatedProject);
      toast({ title: "Progress saved!" });
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error saving",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 6) {
      saveProject({ current_step: step });
    }
  };

  const nextStep = () => {
    if ((project.current_step || 1) < 6) {
      goToStep((project.current_step || 1) + 1);
    }
  };

  const prevStep = () => {
    if ((project.current_step || 1) > 1) {
      goToStep((project.current_step || 1) - 1);
    }
  };

  const renderCurrentStep = () => {
    const currentStep = project.current_step || 1;
    const commonProps = {
      project,
      onUpdate: saveProject,
      onNext: nextStep,
    };

    switch (currentStep) {
      case 1:
        return <Step1NicheFinder {...commonProps} />;
      case 2:
        return <Step2BrandSetup {...commonProps} />;
      case 3:
        return <Step3ProductPack {...commonProps} />;
      case 4:
        return <Step4GumroadLaunch {...commonProps} />;
      case 5:
        return <Step5ContentEngine {...commonProps} />;
      case 6:
        return <Step6Automation {...commonProps} />;
      default:
        return <Step1NicheFinder {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Empire Mode">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Empire Mode">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Stepper Sidebar */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-card/50">
          <div className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Empire Mode</h2>
                <p className="text-xs text-muted-foreground">6-step blueprint</p>
              </div>
            </div>
            
            <EmpireStepper
              steps={EMPIRE_STEPS}
              currentStep={project.current_step || 1}
              onStepClick={goToStep}
              project={project}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            {/* Step Header */}
            <motion.div
              key={project.current_step}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>Step {project.current_step} of 6</span>
                {saving && <span className="text-xs animate-pulse">Saving...</span>}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">
                {EMPIRE_STEPS[(project.current_step || 1) - 1]?.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {EMPIRE_STEPS[(project.current_step || 1) - 1]?.description}
              </p>
            </motion.div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={project.current_step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={(project.current_step || 1) === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={(project.current_step || 1) === 6}
                className="gap-2"
              >
                {(project.current_step || 1) === 6 ? "Complete" : "Next Step"}
                {(project.current_step || 1) < 6 && <ChevronRight className="w-4 h-4" />}
                {(project.current_step || 1) === 6 && <Check className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmpireMode;
