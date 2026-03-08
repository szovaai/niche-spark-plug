import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CloneFunnelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: any[];
}

const TONES = [
  { value: "warriorplus", label: "WarriorPlus", desc: "Urgency, scarcity, value stacking" },
  { value: "authority", label: "Authority", desc: "Expert positioning, proof-heavy" },
  { value: "friendly", label: "Friendly", desc: "Conversational, approachable" },
  { value: "bold", label: "Bold", desc: "Big claims, pattern interrupts" },
];

const CloneFunnelModal = ({ open, onOpenChange, projects }: CloneFunnelModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"select" | "customize">("select");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [productName, setProductName] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("warriorplus");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep("select");
    setSelectedProject(null);
    setProductName("");
    setTargetMarket("");
    setNiche("");
    setTone("warriorplus");
    setLoading(false);
  };

  const handleSelect = (project: any) => {
    setSelectedProject(project);
    setProductName(project.name ? `${project.name} (Clone)` : "");
    setNiche(project.niche || "");
    setTargetMarket(project.target_audience || "");
    setStep("customize");
  };

  const cloneDirect = async () => {
    if (!user || !selectedProject) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("launch_projects").insert({
        user_id: user.id,
        name: productName || "Cloned Funnel",
        niche: niche || selectedProject.niche,
        target_audience: targetMarket || selectedProject.target_audience,
        product_type: selectedProject.product_type,
        topic: selectedProject.topic,
        step3_funnel: selectedProject.step3_funnel,
        step1_product: selectedProject.step1_product,
        step2_product_content: selectedProject.step2_product_content,
        current_step: 3,
        status: "in_progress",
      }).select("id").single();

      if (error) throw error;
      toast.success("Funnel cloned successfully!");
      onOpenChange(false);
      reset();
      navigate(`/wizard/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to clone funnel");
    } finally {
      setLoading(false);
    }
  };

  const cloneAndImprove = async () => {
    if (!user || !selectedProject) return;
    setLoading(true);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("clone-funnel", {
        body: {
          sourceFunnel: selectedProject.step3_funnel,
          newProductName: productName,
          newAudience: targetMarket,
          newNiche: niche,
          tone,
          improve: true,
          sourceProduct: selectedProject.step1_product,
        },
      });

      if (fnError) throw fnError;

      const { data, error } = await supabase.from("launch_projects").insert({
        user_id: user.id,
        name: productName || "Improved Funnel",
        niche: niche || selectedProject.niche,
        target_audience: targetMarket || selectedProject.target_audience,
        product_type: selectedProject.product_type,
        topic: selectedProject.topic,
        step3_funnel: fnData?.funnel || selectedProject.step3_funnel,
        step1_product: selectedProject.step1_product,
        step2_product_content: selectedProject.step2_product_content,
        current_step: 3,
        status: "in_progress",
      }).select("id").single();

      if (error) throw error;
      toast.success("Funnel cloned & improved!");
      onOpenChange(false);
      reset();
      navigate(`/wizard/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to clone funnel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-primary" />
            Clone My Funnel
          </DialogTitle>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select a funnel to clone and customize.</p>
            {projects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No funnels available to clone.</p>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {projects.map((p) => (
                  <Card
                    key={p.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleSelect(p)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{p.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {p.niche && `${p.niche} · `}{p.target_audience || "General audience"}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "customize" && (
          <div className="space-y-4">
            <button onClick={() => setStep("select")} className="text-xs text-primary hover:underline">
              ← Back to funnel list
            </button>

            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Cloning from</p>
              <p className="font-semibold text-sm">{selectedProject?.name}</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="productName">New Product Name</Label>
                <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Etsy Traffic AI" />
              </div>
              <div>
                <Label htmlFor="niche">Niche / Topic</Label>
                <Input id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Etsy sellers" />
              </div>
              <div>
                <Label htmlFor="targetMarket">Target Audience</Label>
                <Input id="targetMarket" value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="e.g. Side hustlers wanting passive income" />
              </div>
              <div>
                <Label>Copy Tone</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                        tone === t.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="font-medium">{t.label}</span>
                      <span className="block text-muted-foreground mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={cloneDirect} disabled={loading} variant="outline" className="flex-1 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Clone Funnel
              </Button>
              <Button onClick={cloneAndImprove} disabled={loading} className="flex-1 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Clone & Improve
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              <strong>Clone</strong> duplicates as-is. <strong>Clone & Improve</strong> rewrites with AI for stronger hooks, headlines & pricing.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CloneFunnelModal;
