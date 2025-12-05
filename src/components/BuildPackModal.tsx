import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, DollarSign, Lightbulb, FileText, Target, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPack, NicheSnapshot } from "@/types/niche";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BuildPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  niche: NicheSnapshot;
}

const BuildPackModal = ({ isOpen, onClose, niche }: BuildPackModalProps) => {
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<ProductPack | null>(null);

  const generatePack = async () => {
    setLoading(true);
    setPack(null);

    try {
      const { data, error } = await supabase.functions.invoke("build-pack", {
        body: {
          nicheName: niche.name,
          nicheCategory: niche.category,
          demandTier: niche.demandTier,
          competitionTier: niche.competitionTier,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else if (data.error.includes("usage limit")) {
          toast.error("AI usage limit reached. Please upgrade your plan.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      setPack(data);
    } catch (error) {
      console.error("Error generating pack:", error);
      toast.error("Failed to generate product pack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold gradient-text">Build My Product Pack</h2>
                  <p className="text-sm text-muted-foreground">{niche.name}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {!pack && !loading && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Build Your Pack?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      AI will analyze this niche and generate product recommendations, title ideas, pricing, and more.
                    </p>
                    <Button variant="hero" size="lg" onClick={generatePack}>
                      <Sparkles className="w-5 h-5" />
                      Generate Product Pack
                    </Button>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-muted-foreground">Generating your product pack...</p>
                  </div>
                )}

                {pack && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* AI Summary */}
                    <div className="p-4 rounded-xl gradient-ocean border border-primary/20">
                      <p className="text-sm leading-relaxed">{pack.aiSummary}</p>
                    </div>

                    {/* Product Type */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        Recommended Product
                      </div>
                      <p className="text-lg font-semibold">{pack.productType}</p>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        Suggested Price Range
                      </div>
                      <p className="text-2xl font-bold gradient-text">
                        ${pack.priceRange.min} – ${pack.priceRange.max}
                      </p>
                    </div>

                    {/* Title Ideas */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Target className="w-4 h-4" />
                        Title Ideas
                      </div>
                      <ul className="space-y-2">
                        {pack.titleIdeas.map((title, i) => (
                          <li key={i} className="p-3 bg-secondary/50 rounded-lg text-sm">
                            {title}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Product Outline */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        Product Outline
                      </div>
                      <ol className="space-y-1 list-decimal list-inside">
                        {pack.productOutline.map((item, i) => (
                          <li key={i} className="text-sm text-foreground/90">{item}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Differentiator Tips */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Lightbulb className="w-4 h-4" />
                        How to Stand Out
                      </div>
                      <ul className="space-y-2">
                        {pack.differentiatorTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Best Platform */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        Where to Sell
                      </div>
                      <p className="text-sm">{pack.bestPlatform}</p>
                    </div>

                    {/* Regenerate Button */}
                    <div className="pt-4 border-t border-border">
                      <Button variant="outline" onClick={generatePack} className="w-full">
                        <Sparkles className="w-4 h-4" />
                        Regenerate Pack
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BuildPackModal;