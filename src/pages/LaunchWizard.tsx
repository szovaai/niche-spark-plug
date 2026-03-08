import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { WIZARD_STEPS } from "@/types/launchWizard";
import type { Step1Product, Step2Content, Step3Funnel, Step4Marketing, Step5Checklist, BuyerAvatar } from "@/types/launchWizard";
import type { ProductAssets } from "@/types/productAssets";
import WizardStep1 from "@/components/wizard/WizardStep1";
import WizardStep2 from "@/components/wizard/WizardStep2";
import WizardStep3 from "@/components/wizard/WizardStep3";
import WizardStep4 from "@/components/wizard/WizardStep4";
import WizardStep5 from "@/components/wizard/WizardStep5";
import GenerateAllModal from "@/components/wizard/GenerateAllModal";
import LaunchDNACard from "@/components/wizard/LaunchDNACard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export type LaunchMode = "standard" | "warriorplus";

const LaunchWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [genModalStep, setGenModalStep] = useState(0);
  const [genModalCompleted, setGenModalCompleted] = useState<number[]>([]);
  const [existingProjectId, setExistingProjectId] = useState<string | null>(null);
  const [launchMode, setLaunchMode] = useState<LaunchMode>("standard");

  // Step 1 state — pre-fill from URL params (from Research Agent / Steal This Launch)
  const [niche, setNiche] = useState(searchParams.get("niche") || "");
  const [targetAudience, setTargetAudience] = useState(searchParams.get("audience") || "");
  const [productType, setProductType] = useState(searchParams.get("productType") || "");
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [price, setPrice] = useState(17);
  const [lockedMechanism] = useState(searchParams.get("mechanism") || "");
  const [step1Result, setStep1Result] = useState<Step1Product | null>(null);
  const [buyerAvatar, setBuyerAvatar] = useState<BuyerAvatar | null>(null);

  // Step 2-5 state
  const [step2Result, setStep2Result] = useState<Step2Content | null>(null);
  const [step2Assets, setStep2Assets] = useState<ProductAssets>({});
  const [step3Result, setStep3Result] = useState<Step3Funnel | null>(null);
  const [step4Result, setStep4Result] = useState<Step4Marketing | null>(null);
  const [step5Result, setStep5Result] = useState<Step5Checklist | null>(null);

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  // Load existing project if projectId provided
  useEffect(() => {
    if (projectId && user) loadProject(projectId);
  }, [projectId, user]);

  // Autosave whenever any step result changes
  const autosave = useCallback(async () => {
    if (!user || isSavingRef.current) return;
    // Need at least step 1 data to save
    if (!step1Result && !niche.trim()) return;

    isSavingRef.current = true;
    try {
      const projectData = {
        name: step1Result?.title || "My Launch Project",
        niche: niche || null,
        target_audience: targetAudience || null,
        product_type: productType || null,
        topic: topic || null,
        step1_product: step1Result as any,
        step2_product_content: step2Result as any,
        step2_assets: (Object.keys(step2Assets).length > 0 ? step2Assets : null) as any,
        step3_funnel: step3Result as any,
        step4_marketing: step4Result as any,
        step5_checklist: step5Result as any,
        buyer_avatar: buyerAvatar as any,
        current_step: currentStep,
        status: step5Result ? "complete" : "in_progress",
      };

      if (existingProjectId) {
        await supabase.from("launch_projects").update(projectData).eq("id", existingProjectId);
      } else {
        const { data, error } = await supabase.from("launch_projects")
          .insert({ ...projectData, user_id: user.id })
          .select("id")
          .single();
        if (!error && data) {
          setExistingProjectId(data.id);
        }
      }
    } catch {
      // Silent fail for autosave
    } finally {
      isSavingRef.current = false;
    }
  }, [user, niche, targetAudience, productType, topic, step1Result, step2Result, step2Assets, step3Result, step4Result, step5Result, currentStep, existingProjectId, buyerAvatar]);

  // Debounced autosave trigger on step result changes
  useEffect(() => {
    if (!user || (!step1Result && !niche.trim())) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => { autosave(); }, 2000);
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, [step1Result, step2Result, step2Assets, step3Result, step4Result, step5Result, currentStep, autosave]);

  const loadProject = async (id: string) => {
    const { data, error } = await supabase
      .from("launch_projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) { toast.error("Project not found"); return; }

    setExistingProjectId(data.id);
    setNiche(data.niche || "");
    setTargetAudience(data.target_audience || "");
    setProductType(data.product_type || "");
    setTopic(data.topic || "");
    setStep1Result(data.step1_product as any);
    setStep2Result(data.step2_product_content as any);
    setStep2Assets(((data as any).step2_assets as ProductAssets) || {});
    setStep3Result(data.step3_funnel as any);
    setStep4Result(data.step4_marketing as any);
    setStep5Result(data.step5_checklist as any);
    setBuyerAvatar((data as any).buyer_avatar as any);
    setCurrentStep(data.current_step || 1);
  };

  const stepCompleted = (step: number) => {
    switch (step) {
      case 1: return !!step1Result;
      case 2: return !!step2Result;
      case 3: return !!step3Result;
      case 4: return !!step4Result;
      case 5: return !!step5Result;
      default: return false;
    }
  };

  const generateAll = async () => {
    if (!niche.trim() || !productType || !topic.trim()) return;
    setGeneratingAll(true);
    setGenModalStep(1);
    setGenModalCompleted([]);

    try {
      // Step 1
      setGenModalStep(1);
      const { data: s1, error: e1 } = await supabase.functions.invoke("generate-launch-product", {
        body: { niche, targetAudience, productType, topic, userId: user?.id, lockedMechanism, buyerAvatar, launchMode },
      });
      if (e1) throw e1;
      // Preserve locked mechanism from Research Agent
      if (lockedMechanism) {
        s1.uniqueMechanism = lockedMechanism;
      }
      setStep1Result(s1);
      setGenModalCompleted(prev => [...prev, 1]);
      setCurrentStep(2);

      // Step 2
      setGenModalStep(2);
      const { data: s2, error: e2 } = await supabase.functions.invoke("generate-launch-content", {
        body: { productBrief: s1, productType, userId: user?.id, buyerAvatar, launchMode },
      });
      if (e2) throw e2;
      setStep2Result(s2);
      setGenModalCompleted(prev => [...prev, 2]);
      setCurrentStep(3);

      // Step 3
      setGenModalStep(3);
      const { data: s3, error: e3 } = await supabase.functions.invoke("generate-launch-funnel", {
        body: { productBrief: s1, productContent: s2, price, userId: user?.id, buyerAvatar, salesStyle: launchMode === "warriorplus" ? "warriorplus" : "warriorplus", launchMode },
      });
      if (e3) throw e3;
      setStep3Result(s3);
      setGenModalCompleted(prev => [...prev, 3]);
      setCurrentStep(4);

      // Step 4
      setGenModalStep(4);
      const { data: s4, error: e4 } = await supabase.functions.invoke("generate-launch-marketing", {
        body: { productBrief: s1, productContent: s2, funnelCopy: s3, price, userId: user?.id, buyerAvatar, launchMode },
      });
      if (e4) throw e4;
      setStep4Result(s4);
      setGenModalCompleted(prev => [...prev, 4]);
      setCurrentStep(5);

      // Step 5
      setGenModalStep(5);
      const { data: s5, error: e5 } = await supabase.functions.invoke("generate-launch-checklist", {
        body: { productBrief: s1, hasContent: true, hasFunnel: true, hasMarketing: true, userId: user?.id, launchMode },
      });
      if (e5) throw e5;
      setStep5Result(s5);
      setGenModalCompleted(prev => [...prev, 5]);

      toast.success("🚀 Your entire launch system is ready!");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setGeneratingAll(false);
      // Keep modal open briefly to show completion
      setTimeout(() => { setGenModalStep(0); setGenModalCompleted([]); }, 1500);
    }
  };

  const saveProject = async () => {
    if (!user) {
      toast.error("Sign in to save your project");
      navigate("/auth");
      return;
    }

    try {
      const projectData = {
        name: step1Result?.title || "My Launch Project",
        niche,
        target_audience: targetAudience,
        product_type: productType,
        topic,
        step1_product: step1Result as any,
        step2_product_content: step2Result as any,
        step2_assets: (Object.keys(step2Assets).length > 0 ? step2Assets : null) as any,
        step3_funnel: step3Result as any,
        step4_marketing: step4Result as any,
        step5_checklist: step5Result as any,
        buyer_avatar: buyerAvatar as any,
        current_step: 5,
        status: step5Result ? "complete" : "in_progress",
      };

      if (existingProjectId) {
        const { error } = await supabase.from("launch_projects").update(projectData).eq("id", existingProjectId);
        if (error) throw error;
        toast.success("Project saved!");
      } else {
        const { data, error } = await supabase.from("launch_projects")
          .insert({ ...projectData, user_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        if (data) setExistingProjectId(data.id);
        toast.success("Project saved!");
      }
      navigate("/products");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  return (
    <DashboardLayout title="AI Launch Wizard">
      <GenerateAllModal open={generatingAll || genModalStep > 0} currentStep={genModalStep} completedSteps={genModalCompleted} />
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)]">
        {/* Left stepper */}
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border p-4 lg:p-6 shrink-0">
          {/* WarriorPlus Mode Toggle */}
          <div className="mb-4 p-3 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${launchMode === "warriorplus" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-bold uppercase tracking-wider">WP Mode</span>
              </div>
              <Switch
                checked={launchMode === "warriorplus"}
                onCheckedChange={(checked) => setLaunchMode(checked ? "warriorplus" : "standard")}
              />
            </div>
            {launchMode === "warriorplus" && (
              <p className="text-[10px] text-primary/80 mt-1">Short, bold, fast-action copy for WarriorPlus launches</p>
            )}
          </div>
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Steps</h3>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
            {WIZARD_STEPS.map(step => {
              const isActive = currentStep === step.number;
              const isDone = stepCompleted(step.number);
              return (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors min-w-[180px] lg:min-w-0 ${
                    isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone ? "bg-primary text-primary-foreground" : isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 p-6 max-w-4xl space-y-4">
          {/* Launch DNA Banner for steps 2-5 */}
          {currentStep > 1 && step1Result && (
            <LaunchDNACard product={step1Result} targetAudience={targetAudience} avatarName={buyerAvatar?.personaName} compact />
          )}
          <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            {currentStep === 1 && (
               <WizardStep1
                niche={niche} setNiche={setNiche}
                targetAudience={targetAudience} setTargetAudience={setTargetAudience}
                productType={productType} setProductType={setProductType}
                topic={topic} setTopic={setTopic}
                price={price} setPrice={setPrice}
                result={step1Result} setResult={setStep1Result}
                onNext={() => setCurrentStep(2)}
                onGenerateAll={generateAll}
                generatingAll={generatingAll}
                userId={user?.id}
                lockedMechanism={lockedMechanism}
                buyerAvatar={buyerAvatar}
                setBuyerAvatar={setBuyerAvatar}
                launchMode={launchMode}
              />
            )}
            {currentStep === 2 && (
              <WizardStep2
                productBrief={step1Result}
                productType={productType}
                result={step2Result} setResult={setStep2Result}
                onNext={() => setCurrentStep(3)}
                userId={user?.id}
                assets={step2Assets}
                setAssets={setStep2Assets}
                launchMode={launchMode}
              />
            )}
            {currentStep === 3 && (
               <WizardStep3
                productBrief={step1Result}
                productContent={step2Result}
                result={step3Result} setResult={setStep3Result}
                onNext={() => setCurrentStep(4)}
                userId={user?.id}
                price={price}
                launchMode={launchMode}
              />
            )}
            {currentStep === 4 && (
               <WizardStep4
                productBrief={step1Result}
                productContent={step2Result}
                funnelCopy={step3Result}
                result={step4Result} setResult={setStep4Result}
                onNext={() => setCurrentStep(5)}
                userId={user?.id}
                price={price}
                launchMode={launchMode}
              />
            )}
            {currentStep === 5 && (
              <WizardStep5
                productBrief={step1Result}
                hasContent={!!step2Result}
                hasFunnel={!!step3Result}
                hasMarketing={!!step4Result}
                result={step5Result} setResult={setStep5Result}
                onSave={saveProject}
                userId={user?.id}
                funnelData={step3Result}
                price={price}
                niche={niche}
                launchMode={launchMode}
              />
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaunchWizard;
