import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Crown, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import LaunchPackCard from "@/components/LaunchPackCard";
import UpgradeModal from "@/components/UpgradeModal";
import BlurOverlay from "@/components/BlurOverlay";
import { launchPacks } from "@/data/mockNiches";
import { useAuth } from "@/hooks/useAuth";
const LaunchPacks = () => {
  const { user, role } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isPro = role === "pro";

  return (
    <DashboardLayout>
      <div className="pb-16 px-4">
        <div className="max-w-6xl mx-auto pt-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mb-6">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Done-For-You Launch Packs</span>
              {!isPro && <Crown className="w-4 h-4 text-accent" />}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Pick a Pack, </span>
              <span className="gradient-text glow-text">Launch Today</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Pre-curated product packs with everything you need: niche insights, PLR sources, 
              listing copy, and promo ideas. Just grab, customize, and publish.
            </p>
          </motion.div>

          {/* Packs Grid */}
          <BlurOverlay
            isBlurred={!isPro}
            message={!user ? "Sign up to see launch packs" : "Upgrade to Pro for Done-For-You packs"}
            onAction={() => setShowUpgradeModal(true)}
            actionLabel={!user ? "Sign Up" : "Upgrade to Pro"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {launchPacks.map((pack, index) => (
                <LaunchPackCard
                  key={pack.id}
                  pack={pack}
                  index={index}
                  onUpgradeClick={() => setShowUpgradeModal(true)}
                />
              ))}
            </div>
          </BlurOverlay>

          {/* Benefits Section (for non-Pro) */}
          {!isPro && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 text-center"
            >
              <div className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">What's Inside Each Pack?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Why this niche is hot right now</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Recommended PLR product source</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Ready-to-use listing title</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Copy-paste bullet points</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Image creation suggestions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span className="text-sm">Quick promo/marketing idea</span>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/20 border border-destructive/30 rounded-full text-sm font-medium text-destructive">
                    ⏰ Only 147 Founder spots left
                  </span>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Crown className="w-5 h-5" />
                  🔒 Lock In $17/mo Forever
                </button>
                <p className="text-xs text-muted-foreground mt-3">
                  Regular price $27/mo • Cancel anytime
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="Done-For-You Launch Packs are a Pro feature!"
      />
    </DashboardLayout>
  );
};

export default LaunchPacks;
