import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ArrowRight, Rocket, Target, Gift, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PLRQuickstartKit, PLRNicheCategory, PLR_NICHE_CATEGORIES, PLR_GOALS, PLRPrefill } from "@/types/plrVault";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PLRQuickstartModalProps {
  open: boolean;
  onClose: () => void;
  onSelectKit: (prefill: PLRPrefill) => void;
}

type Step = 'goal' | 'niche' | 'kit';

export const PLRQuickstartModal = ({ open, onClose, onSelectKit }: PLRQuickstartModalProps) => {
  const { user, role } = useAuth();
  const isPro = role === "pro";
  const [step, setStep] = useState<Step>('goal');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<PLRNicheCategory | null>(null);
  const [kits, setKits] = useState<PLRQuickstartKit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && selectedNiche) {
      fetchKits();
    }
  }, [open, selectedNiche]);

  const fetchKits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plr_quickstart_kits')
        .select('*')
        .eq('niche_category', selectedNiche);
      
      if (error) throw error;
      
      // Type cast the data properly
      const typedKits: PLRQuickstartKit[] = (data || []).map(kit => ({
        id: kit.id,
        title: kit.title,
        description: kit.description,
        niche_category: kit.niche_category as PLRNicheCategory,
        included_item_ids: kit.included_item_ids || [],
        suggested_funnel_order: kit.suggested_funnel_order || [],
        difficulty_level: kit.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
        is_featured: kit.is_featured || false,
        is_pro_only: kit.is_pro_only || false,
        created_at: kit.created_at || ''
      }));
      
      setKits(typedKits);
    } catch (error) {
      console.error('Error fetching kits:', error);
      toast.error('Failed to load kits');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    setStep('niche');
  };

  const handleNicheSelect = (niche: PLRNicheCategory) => {
    setSelectedNiche(niche);
    setStep('kit');
  };

  const handleKitSelect = (kit: PLRQuickstartKit) => {
    if (kit.is_pro_only && !isPro) {
      toast.error('This kit is Pro-only. Upgrade to access it!');
      return;
    }

    const prefill: PLRPrefill = {
      kitId: kit.id,
      kitTitle: kit.title,
      nicheCategory: kit.niche_category,
      description: kit.description,
      funnelRole: selectedGoal === 'create_lead_magnet' ? 'lead_magnet' : 
                  selectedGoal === 'create_upsell' ? 'upsell' : 'front_end',
    };

    onSelectKit(prefill);
    handleClose();
  };

  const handleBack = () => {
    if (step === 'kit') {
      setStep('niche');
      setKits([]);
    } else if (step === 'niche') {
      setStep('goal');
      setSelectedNiche(null);
    }
  };

  const handleClose = () => {
    setStep('goal');
    setSelectedGoal(null);
    setSelectedNiche(null);
    setKits([]);
    onClose();
  };

  const getStepTitle = () => {
    switch (step) {
      case 'goal': return "What's your goal?";
      case 'niche': return "Choose your niche";
      case 'kit': return "Pick a Quickstart Kit";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'goal': return "We'll help you find the perfect PLR to transform";
      case 'niche': return "Select the category that matches your audience";
      case 'kit': return "Each kit includes everything you need to launch";
    }
  };

  const goalIcons: Record<string, React.ReactNode> = {
    launch_product: <Rocket className="w-6 h-6" />,
    create_lead_magnet: <Target className="w-6 h-6" />,
    create_upsell: <Gift className="w-6 h-6" />,
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">PLR Quickstart</span>
            </div>
            <h2 className="text-2xl font-bold">{getStepTitle()}</h2>
            <p className="text-muted-foreground">{getStepSubtitle()}</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2">
            {['goal', 'niche', 'kit'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s ? 'bg-primary text-primary-foreground' :
                  ['goal', 'niche', 'kit'].indexOf(step) > i ? 'bg-primary/20 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {['goal', 'niche', 'kit'].indexOf(step) > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`w-12 h-0.5 ${['goal', 'niche', 'kit'].indexOf(step) > i ? 'bg-primary/50' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {step === 'goal' && (
              <motion.div
                key="goal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-3"
              >
                {PLR_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => handleGoalSelect(goal.value)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-primary/50 hover:bg-primary/5 ${
                      selectedGoal === goal.value ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {goalIcons[goal.value]}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">{goal.label}</p>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'niche' && (
              <motion.div
                key="niche"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-3"
              >
                {PLR_NICHE_CATEGORIES.map((niche) => (
                  <button
                    key={niche.value}
                    onClick={() => handleNicheSelect(niche.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:border-primary/50 hover:bg-primary/5 ${
                      selectedNiche === niche.value ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <span className="text-3xl">{niche.icon}</span>
                    <p className="font-semibold text-sm">{niche.label}</p>
                    <p className="text-xs text-muted-foreground text-center">{niche.description}</p>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'kit' && (
              <motion.div
                key="kit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : kits.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No kits available for this niche yet.</p>
                    <p className="text-sm mt-2">Try a different niche or start from scratch!</p>
                  </div>
                ) : (
                  kits.map((kit) => (
                    <button
                      key={kit.id}
                      onClick={() => handleKitSelect(kit)}
                      disabled={kit.is_pro_only && !isPro}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        kit.is_pro_only && !isPro 
                          ? 'border-border/50 opacity-60 cursor-not-allowed' 
                          : 'hover:border-primary/50 hover:bg-primary/5 border-border'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{kit.title}</p>
                          {kit.is_featured && (
                            <Badge variant="secondary" className="text-xs">Featured</Badge>
                          )}
                          {kit.is_pro_only && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Lock className="w-3 h-3" /> Pro
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{kit.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {kit.difficulty_level}
                          </Badge>
                        </div>
                      </div>
                      {!(kit.is_pro_only && !isPro) && (
                        <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            {step !== 'goal' ? (
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
