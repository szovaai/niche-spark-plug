import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Crown, Zap, Star, Sparkles, Clock, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: string;
}

const UpgradeModal = ({ isOpen, onClose, trigger }: UpgradeModalProps) => {
  const founderSpotsLeft = 147; // Can be made dynamic later
  
  const proFeatures = [
    { icon: Zap, text: "Unlimited searches & niche views" },
    { icon: Star, text: "Full snapshot with all metrics" },
    { icon: Sparkles, text: "Build My Product Pack (AI-powered)" },
    { icon: Crown, text: "Keyword Ideas panel" },
    { icon: Check, text: "60-Minute Launch Recipes" },
    { icon: Check, text: "Done-For-You Launch Packs" },
    { icon: Check, text: "Unlimited saved niches" },
    { icon: Check, text: "Momentum alerts" },
  ];

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
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Gradient header */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 pb-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">DigiStream Pro</h2>
                  <p className="text-sm text-muted-foreground">Unlock the full power</p>
                </div>
              </div>

              {/* Founder Plan Badge */}
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [0.9, 1.05, 1] }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/30 border border-accent/50 rounded-full"
                >
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-accent">FOUNDER PLAN</span>
                </motion.div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/20 border border-destructive/30 rounded-full">
                  <Users className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">{founderSpotsLeft} spots left</span>
                </div>
              </div>

              {trigger && (
                <p className="text-sm text-muted-foreground bg-background/20 rounded-lg px-3 py-2">
                  {trigger}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-muted-foreground line-through text-lg">$27/mo</span>
                </div>
                <div className="text-4xl font-bold">
                  $17<span className="text-lg font-normal text-muted-foreground">/mo</span>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm font-semibold text-primary mt-2"
                >
                  🔒 Lock in this price FOR LIFE
                </motion.p>
                <p className="text-xs text-muted-foreground mt-1">Cancel anytime. No risk.</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {proFeatures.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button variant="hero" size="xl" className="w-full dual-glow">
                🔒 Lock In $17/mo Forever
              </Button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-muted-foreground">Cancel anytime</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-muted-foreground">Unlimited exports</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-muted-foreground">Secure checkout</span>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-3">
                30-day "First Launch" guarantee. Get a refund if you can't launch.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
