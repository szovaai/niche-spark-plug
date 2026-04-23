import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepSelectType from "@/components/micro-factory/StepSelectType";
import StepDefineNiche from "@/components/micro-factory/StepDefineNiche";
import StepCustomize from "@/components/micro-factory/StepCustomize";
import StepResults from "@/components/micro-factory/StepResults";
import { useAutosave } from "@/hooks/useAutosave";

const STEPS = ["Product Type", "Niche & Audience", "Customize", "Results"];

export default function MicroFactory() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [productType, setProductType] = useState("");
  const [nicheData, setNicheData] = useState({ nicheTopic: "", targetAudience: "", problemStatement: "" });
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [generating, setGenerating] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  useAutosave({
    table: "micro_products",
    recordId,
    setRecordId,
    userId: user?.id,
    data: {
      product_type: productType || "ebook",
      niche_topic: nicheData.nicheTopic || "draft",
      target_audience: nicheData.targetAudience || "draft",
      problem_statement: nicheData.problemStatement || "draft",
      config,
      generated_content: result,
      product_title: (result as any)?.product_title ?? null,
      product_subtitle: (result as any)?.product_subtitle ?? null,
      status: result ? "complete" : "draft",
    },
    enabled: !!user && (!!productType || !!nicheData.nicheTopic),
  });

  const canNext = () => {
    if (step === 0) return !!productType;
    if (step === 1) return !!(nicheData.nicheTopic && nicheData.targetAudience && nicheData.problemStatement);
    if (step === 2) return true;
    return false;
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Please sign in to generate products");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-micro-product", {
        body: { productType, ...nicheData, config },
      });
      if (error) throw error;
      setResult(data);

      // Save to DB
      await supabase.from("micro_products").insert({
        user_id: user.id,
        product_type: productType,
        niche_topic: nicheData.nicheTopic,
        target_audience: nicheData.targetAudience,
        problem_statement: nicheData.problemStatement,
        config,
        generated_content: data,
        product_title: data.product_title,
        product_subtitle: data.product_subtitle,
        status: "complete",
      } as any);

      setStep(3);
      toast.success("Product generated!");
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const next = () => {
    if (step === 2) {
      handleGenerate();
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  return (
    <DashboardLayout title="Micro Factory">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && <StepSelectType selected={productType} onSelect={setProductType} />}
            {step === 1 && <StepDefineNiche data={nicheData} onChange={setNicheData} />}
            {step === 2 && <StepCustomize productType={productType} config={config} onChange={setConfig} />}
            {step === 3 && <StepResults data={result} productType={productType} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 3 && (
          <div className="flex justify-between pt-2">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={next} disabled={!canNext() || generating} className="gap-2">
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : step === 2 ? (
                <><Sparkles className="w-4 h-4" /> Generate Everything</>
              ) : (
                <>Next <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => { setStep(0); setResult(null); setProductType(""); setConfig({}); }}>
              Create Another
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
