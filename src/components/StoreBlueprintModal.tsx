import { motion, AnimatePresence } from "framer-motion";
import { X, Store, Layout, ShoppingBag } from "lucide-react";
import { StoreBlueprint } from "@/types/niche";

interface StoreBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprint: StoreBlueprint;
  nicheName: string;
}

const StoreBlueprintModal = ({ isOpen, onClose, blueprint, nicheName }: StoreBlueprintModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">1-Product Store Blueprint</h2>
                  <p className="text-sm text-muted-foreground">{nicheName}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Hero Headline */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Hero Headline</h3>
                <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                  <p className="text-lg font-semibold gradient-text">{blueprint.heroHeadline}</p>
                </div>
              </div>

              {/* Page Sections */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Page Structure
                </h3>
                <div className="space-y-3">
                  {blueprint.sections.map((section, i) => (
                    <div
                      key={section.name}
                      className="p-4 bg-card border border-border rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <h4 className="font-semibold">{section.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground pl-9">{section.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Recommendation */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Recommended Platform
                </h3>
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <p className="text-sm">{blueprint.recommendedPlatform}</p>
                </div>
              </div>

              {/* CTA Suggestion */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">CTA Button Text</h3>
                <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border border-primary/30 text-center">
                  <span className="font-semibold">{blueprint.ctaSuggestion}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-secondary/30 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                This is a blueprint preview. Full AI store builder coming in DigiStream 3.0!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StoreBlueprintModal;
