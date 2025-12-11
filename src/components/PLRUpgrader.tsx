import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, ArrowRight, ArrowLeft, Loader2, Copy, Check, Sparkles,
  Palette, ShoppingBag, Package, Star, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { PLRUpgradeInput, PLRUpgradeOutput } from "@/types/plrUpgrade";
import { TARGET_AUDIENCES, STYLE_VIBES } from "@/types/personalization";

interface PLRUpgraderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeComplete?: (upgrade: PLRUpgradeOutput) => void;
}

const UPGRADE_LEVELS = [
  { id: 'basic', label: 'Basic Refresh', description: 'New title, description, and style suggestions', icon: '🔄' },
  { id: 'complete', label: 'Complete Makeover', description: 'Full rewrite + ecover concepts + marketing copy', icon: '✨' },
  { id: 'premium', label: 'Premium Bundle', description: 'Everything + upsells + bundle strategy', icon: '💎' },
];

const PLRUpgrader = ({ isOpen, onClose, onUpgradeComplete }: PLRUpgraderProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Form state
  const [input, setInput] = useState<PLRUpgradeInput>({
    plrTitle: "",
    plrDescription: "",
    plrContentSample: "",
    originalNiche: "",
    targetAudience: "",
    styleVibe: "",
    upgradeLevel: "complete",
  });
  
  const [upgrade, setUpgrade] = useState<PLRUpgradeOutput | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['title', 'description']);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to use PLR Upgrader");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('upgrade-plr', {
        body: input
      });

      if (error) throw error;
      setUpgrade(data);
      setStep(4);
      toast.success("PLR upgrade complete!");
      onUpgradeComplete?.(data);
    } catch (error) {
      console.error("PLR upgrade error:", error);
      toast.error("Failed to upgrade PLR. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => copyToClipboard(text, id)}
      className="h-6 px-2"
    >
      {copied === id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </Button>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Paste Your PLR Content</h3>
              <p className="text-muted-foreground text-sm">We'll transform it into something unique</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">PLR Title</label>
                <Input
                  value={input.plrTitle}
                  onChange={(e) => setInput({...input, plrTitle: e.target.value})}
                  placeholder="e.g., Self-Care Planner Bundle"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Original Description</label>
                <Textarea
                  value={input.plrDescription}
                  onChange={(e) => setInput({...input, plrDescription: e.target.value})}
                  placeholder="Paste the original PLR description here..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content Sample (optional)</label>
                <Textarea
                  value={input.plrContentSample}
                  onChange={(e) => setInput({...input, plrContentSample: e.target.value})}
                  placeholder="Paste a sample of the content for better rewriting..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Niche/Category</label>
                <Input
                  value={input.originalNiche}
                  onChange={(e) => setInput({...input, originalNiche: e.target.value})}
                  placeholder="e.g., Self-improvement, Wellness"
                />
              </div>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full gap-2"
              disabled={!input.plrTitle || !input.plrDescription}
            >
              Next: Choose Audience <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Who's This For?</h3>
              <p className="text-muted-foreground text-sm">Select your target audience</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TARGET_AUDIENCES.map(audience => (
                <button
                  key={audience.value}
                  onClick={() => setInput({...input, targetAudience: audience.value})}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    input.targetAudience === audience.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg mr-2">{audience.icon}</span>
                  <span className="text-sm font-medium">{audience.label}</span>
                </button>
              ))}
            </div>

            <div className="text-center mt-4 mb-2">
              <h4 className="font-semibold">Choose a Style Vibe</h4>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STYLE_VIBES.map(vibe => (
                <button
                  key={vibe.value}
                  onClick={() => setInput({...input, styleVibe: vibe.value})}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    input.styleVibe === vibe.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg mr-2">{vibe.icon}</span>
                  <span className="text-sm font-medium">{vibe.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="flex-1 gap-2"
                disabled={!input.targetAudience || !input.styleVibe}
              >
                Next: Choose Level <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Choose Upgrade Level</h3>
              <p className="text-muted-foreground text-sm">How much transformation do you need?</p>
            </div>

            <div className="space-y-3">
              {UPGRADE_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setInput({...input, upgradeLevel: level.id as 'basic' | 'complete' | 'premium'})}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    input.upgradeLevel === level.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                    {input.upgradeLevel === level.id && (
                      <Check className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Transform PLR
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        );

      case 4:
        return upgrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 max-h-[60vh] overflow-y-auto"
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Upgrade Complete!</h3>
              <Badge className="mt-2">
                {upgrade.differentiationReport.uniquenessScore}% Unique
              </Badge>
            </div>

            {/* Upgraded Title */}
            <Collapsible open={expandedSections.includes('title')} onOpenChange={() => toggleSection('title')}>
              <CollapsibleTrigger className="w-full p-3 rounded-lg bg-card border border-border flex items-center justify-between hover:bg-secondary/50">
                <span className="font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> New Title
                </span>
                {expandedSections.includes('title') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{upgrade.upgradedTitle}</span>
                  <CopyButton text={upgrade.upgradedTitle} id="title" />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* New Description */}
            <Collapsible open={expandedSections.includes('description')} onOpenChange={() => toggleSection('description')}>
              <CollapsibleTrigger className="w-full p-3 rounded-lg bg-card border border-border flex items-center justify-between hover:bg-secondary/50">
                <span className="font-semibold flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" /> New Description
                </span>
                {expandedSections.includes('description') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{upgrade.rewrittenDescription}</p>
                <CopyButton text={upgrade.rewrittenDescription} id="desc" />
              </CollapsibleContent>
            </Collapsible>

            {/* Style Guide */}
            <Collapsible open={expandedSections.includes('style')} onOpenChange={() => toggleSection('style')}>
              <CollapsibleTrigger className="w-full p-3 rounded-lg bg-card border border-border flex items-center justify-between hover:bg-secondary/50">
                <span className="font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" /> Style Guide
                </span>
                {expandedSections.includes('style') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded" style={{ background: upgrade.styleOverhaul.primaryColor }} />
                  <div className="w-6 h-6 rounded" style={{ background: upgrade.styleOverhaul.secondaryColor }} />
                  <div className="w-6 h-6 rounded" style={{ background: upgrade.styleOverhaul.accentColor }} />
                  <span className="text-sm text-muted-foreground ml-2">{upgrade.styleOverhaul.fontPairing}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {upgrade.styleOverhaul.moodKeywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Marketing Copy */}
            <Collapsible open={expandedSections.includes('marketing')} onOpenChange={() => toggleSection('marketing')}>
              <CollapsibleTrigger className="w-full p-3 rounded-lg bg-card border border-border flex items-center justify-between hover:bg-secondary/50">
                <span className="font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" /> Marketing Copy
                </span>
                {expandedSections.includes('marketing') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Headline</div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{upgrade.marketingCopy.headline}</span>
                    <CopyButton text={upgrade.marketingCopy.headline} id="headline" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Subheadline</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{upgrade.marketingCopy.subheadline}</span>
                    <CopyButton text={upgrade.marketingCopy.subheadline} id="sub" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Bullets</div>
                  <ul className="space-y-1">
                    {upgrade.marketingCopy.bullets.map((b, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Check className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Upsell Ideas */}
            {upgrade.upsellIdeas.length > 0 && (
              <Collapsible open={expandedSections.includes('upsells')} onOpenChange={() => toggleSection('upsells')}>
                <CollapsibleTrigger className="w-full p-3 rounded-lg bg-card border border-border flex items-center justify-between hover:bg-secondary/50">
                  <span className="font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" /> Upsell Ideas ({upgrade.upsellIdeas.length})
                  </span>
                  {expandedSections.includes('upsells') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg space-y-2">
                  {upgrade.upsellIdeas.map((upsell, i) => (
                    <div key={i} className="p-2 rounded-lg bg-secondary/50">
                      <div className="font-medium text-sm">{upsell.productName}</div>
                      <div className="text-xs text-muted-foreground">{upsell.description}</div>
                      <div className="text-xs text-primary mt-1">${upsell.priceRange.min}-${upsell.priceRange.max}</div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            <Button onClick={onClose} className="w-full">Done</Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            PLR Upgrader
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                s === step ? "w-6 bg-primary" : s < step ? "bg-primary/60" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default PLRUpgrader;
