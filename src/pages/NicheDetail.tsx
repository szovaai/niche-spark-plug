import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Star, ShoppingBag, ExternalLink, Lock, Crown, Store, Zap, Flame, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import BlurOverlay from "@/components/BlurOverlay";
import BuildPackModal from "@/components/BuildPackModal";
import UpgradeModal from "@/components/UpgradeModal";
import LaunchRecipeSection from "@/components/LaunchRecipeSection";
import StoreBlueprintModal from "@/components/StoreBlueprintModal";
import UsageLimitBadge from "@/components/UsageLimitBadge";
import LaunchabilityScoreBadge from "@/components/LaunchabilityScoreBadge";
import MicroSignalsBadges from "@/components/MicroSignalsBadges";
import LaunchTimelineBar from "@/components/LaunchTimelineBar";
import FirstTimeTooltip, { TOOLTIP_CONTENT } from "@/components/FirstTimeTooltip";
import { nicheSnapshots, getProductPatterns, getKeywordIdeas, getPLRSources, getLaunchRecipe, getStoreBlueprint } from "@/data/mockNiches";
import { useAuth } from "@/hooks/useAuth";
import { useSavedNiches } from "@/hooks/useSavedNiches";
import { getXLSRating, getXLSTagline } from "@/lib/launchabilityScore";

const NicheDetail = () => {
  const { nicheId } = useParams<{ nicheId: string }>();
  const navigate = useNavigate();
  const { user, role, canViewNiche, incrementView } = useAuth();
  const { isNicheSaved, saveNiche, unsaveNiche } = useSavedNiches();
  const [showPackModal, setShowPackModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [viewLimitHit, setViewLimitHit] = useState(false);

  const niche = nicheSnapshots.find((n) => n.id === nicheId);
  const isPro = role === "pro";

  // Check view limit on mount
  useEffect(() => {
    const checkViewLimit = async () => {
      if (user && role === "free") {
        const canView = await incrementView();
        if (!canView) {
          setViewLimitHit(true);
        }
      }
    };
    checkViewLimit();
  }, [user, role, incrementView]);
  
  if (!niche) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Niche Not Found</h1>
          <Button onClick={() => navigate("/discover")}>Back to Discover</Button>
        </div>
      </div>
    );
  }

  const patterns = getProductPatterns(nicheId || "");
  const keywords = getKeywordIdeas(nicheId || "");
  const plrSources = getPLRSources(nicheId || "");
  const launchRecipe = getLaunchRecipe(nicheId || "");
  const storeBlueprint = getStoreBlueprint(nicheId || "");

  const demandColors = {
    Spark: "bg-ocean-400/10 text-ocean-300",
    Hot: "bg-accent/10 text-accent",
    "On Fire": "bg-magenta-400/10 text-magenta-300",
  };

  const competitionColors = {
    Easy: "bg-ocean-400/10 text-ocean-300",
    Moderate: "bg-accent/10 text-accent",
    Saturated: "bg-magenta-400/10 text-magenta-300",
  };

  const handleSaveToggle = async () => {
    if (isNicheSaved(niche.id)) {
      await unsaveNiche(niche.id);
    } else {
      await saveNiche(niche.id, niche.name);
    }
  };

  const handleUpgradeClick = (reason: string) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  const handleBuildPackClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isPro) {
      handleUpgradeClick("Build My Product Pack is a Pro feature. Get AI-powered product recommendations!");
      return;
    }
    setShowPackModal(true);
  };

  const handleStoreBlueprintClick = () => {
    if (!isPro) {
      handleUpgradeClick("1-Product Store Blueprint is a Pro feature. Preview your store concept!");
      return;
    }
    setShowBlueprintModal(true);
  };

  // Show limit reached state
  if (viewLimitHit) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center py-16">
              <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Daily View Limit Reached</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Free accounts can view 2 niche details per day. Upgrade to Pro for unlimited access.
              </p>
              <Button variant="hero" onClick={() => handleUpgradeClick("Unlock unlimited niche views with Pro!")}>
                <Crown className="w-5 h-5" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </main>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          trigger={upgradeReason}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button + Usage Badge */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {user && role === "free" && <UsageLimitBadge type="views" />}
          </div>

          {/* Launch Timeline Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <LaunchTimelineBar currentStep={1} />
          </motion.div>

          {/* Hero Section - Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-border mb-8"
          >
            <div className="bg-card rounded-lg p-6 md:p-8">
              {/* Header with XLS Score */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {niche.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold mt-3 gradient-text">
                    {niche.name}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    <Zap className="w-4 h-4 inline text-primary mr-1" />
                    {getXLSRating(niche.launchabilityScore)} — {getXLSTagline(niche.launchabilityScore)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* XLS Score Badge with Tooltip */}
                  <FirstTimeTooltip
                    tooltipId="launchability_score"
                    content={TOOLTIP_CONTENT.launchability_score}
                    side="left"
                  >
                    <LaunchabilityScoreBadge score={niche.launchabilityScore} size="lg" showTagline />
                  </FirstTimeTooltip>
                  
                  {user && (
                    <button
                      onClick={handleSaveToggle}
                      className={`p-3 rounded-xl transition-all ${
                        isNicheSaved(niche.id)
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground hover:text-primary"
                      }`}
                    >
                      <Star className={`w-5 h-5 ${isNicheSaved(niche.id) ? "fill-current" : ""}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Micro-Signals Badges */}
              <div className="mb-6">
                <MicroSignalsBadges
                  demandTier={niche.demandTier}
                  competitionTier={niche.competitionTier}
                  momentum={niche.momentum}
                  launchSpeed={niche.launchSpeed}
                />
              </div>

              {/* AI Summary */}
              <div className="p-4 rounded-xl gradient-ocean border border-primary/20">
                <p className="text-sm leading-relaxed">
                  <strong>Quick Take:</strong> XLS {niche.launchabilityScore}/100 — 
                  {niche.launchabilityScore >= 85 && " Excellent opportunity! Launch this today."}
                  {niche.launchabilityScore >= 70 && niche.launchabilityScore < 85 && " Strong opportunity worth pursuing."}
                  {niche.launchabilityScore >= 50 && niche.launchabilityScore < 70 && " Good potential with some competition."}
                  {niche.launchabilityScore < 50 && " Research more before committing."}
                  {" "}Best suited for {niche.platform === "Multiple" ? "Etsy and Gumroad" : niche.platform}.
                </p>
              </div>
            </div>
          </motion.div>

          {/* What's Selling Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              What's Selling
            </h2>
            
            <BlurOverlay 
              isBlurred={!user} 
              message="Sign up to see product patterns"
              actionLabel="Sign Up"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="p-4 bg-card border border-border rounded-xl">
                    <h3 className="font-semibold mb-2">{pattern.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-secondary rounded">
                        ${pattern.priceRange.min}–${pattern.priceRange.max}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        pattern.difficulty === "Easy" ? "bg-ocean-400/10 text-ocean-300" :
                        pattern.difficulty === "Medium" ? "bg-accent/10 text-accent" :
                        "bg-magenta-400/10 text-magenta-300"
                      }`}>
                        {pattern.difficulty}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pattern.formats.map((format) => (
                        <span key={format} className="text-xs text-muted-foreground">
                          {format}
                        </span>
                      ))}
                    </div>
                    {pattern.seasonality && (
                      <p className="text-xs text-muted-foreground mt-2">
                        📅 {pattern.seasonality}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </BlurOverlay>
          </motion.section>

          {/* Shortcut to Launch Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4">Shortcut to Launch</h2>
            
            <BlurOverlay 
              isBlurred={!user} 
              message="Sign up to see PLR shortcuts"
              actionLabel="Sign Up"
            >
              <div className="space-y-4">
                {/* Step 1 - PLR Sources */}
                <div className="p-4 bg-card border border-border rounded-xl">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">1</span>
                    Grab a Base Product
                  </h3>
                  <div className="space-y-2">
                    {plrSources.slice(0, isPro ? plrSources.length : 1).map((source, i) => (
                      <a
                        key={source.id}
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <div>
                          <span className="font-medium">{source.name}</span>
                          <p className={`text-xs text-muted-foreground ${!isPro && i === 0 ? "" : ""}`}>
                            {isPro ? source.nicheRelevance : (i === 0 ? source.nicheRelevance?.slice(0, 20) + "..." : "")}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    ))}
                    {!isPro && plrSources.length > 1 && (
                      <div className="text-center py-2">
                        <button
                          onClick={() => handleUpgradeClick("Unlock all PLR sources with Pro!")}
                          className="text-xs text-accent hover:underline flex items-center gap-1 mx-auto"
                        >
                          <Crown className="w-3 h-3" />
                          +{plrSources.length - 1} more sources (Pro)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2 - Where to Sell */}
                <div className="p-4 bg-card border border-border rounded-xl">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">2</span>
                    Where to Sell
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {niche.platform === "Etsy" && "Best for Etsy printables – strong buyer intent for digital downloads."}
                    {niche.platform === "Shopify" && "Works well as a Shopify 1-product store or niche shop."}
                    {niche.platform === "Multiple" && "Flexible – works on Etsy for discoverability, Gumroad for direct sales, or Shopify for branding."}
                  </p>
                </div>
              </div>
            </BlurOverlay>
          </motion.section>

          {/* 60-Minute Launch Recipe Section (Pro) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <LaunchRecipeSection
              recipe={launchRecipe}
              onUpgradeClick={() => handleUpgradeClick("60-Minute Launch Recipes are a Pro feature!")}
            />
          </motion.section>

          {/* Keyword Ideas Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Keyword Ideas</h2>
              {!isPro && (
                <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-accent px-2 py-1 rounded-full">
                  <Crown className="w-3 h-3" />
                  Pro
                </span>
              )}
            </div>
            
            <BlurOverlay 
              isBlurred={!isPro} 
              message={!user ? "Sign up to see keywords" : "Upgrade to Pro for keyword insights"}
              onAction={() => !user ? navigate("/auth") : handleUpgradeClick("Keyword Ideas are a Pro feature!")}
              actionLabel={!user ? "Sign Up" : "Upgrade"}
            >
              <div className="space-y-2">
                {keywords.map((kw, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <span className="font-medium text-sm">"{kw.keyword}"</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${demandColors[kw.demandTier]}`}>
                        {kw.demandTier}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${competitionColors[kw.competitionTier]}`}>
                        {kw.competitionTier}
                      </span>
                      <span className="text-xs text-muted-foreground hidden md:block">
                        → {kw.suggestedProductType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </BlurOverlay>
          </motion.section>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* Build My Product Pack */}
            <Button
              variant="hero"
              size="xl"
              onClick={handleBuildPackClick}
              className="dual-glow"
            >
              {!isPro && <Crown className="w-5 h-5" />}
              <Sparkles className="w-5 h-5" />
              Build My Product Pack
            </Button>

            {/* 1-Product Store Blueprint */}
            <Button
              variant="outline"
              size="xl"
              onClick={handleStoreBlueprintClick}
              className="border-primary/30 hover:bg-primary/10"
            >
              {!isPro && <Crown className="w-4 h-4" />}
              <Store className="w-5 h-5" />
              Preview Store Concept
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <BuildPackModal
        isOpen={showPackModal}
        onClose={() => setShowPackModal(false)}
        niche={niche}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeReason}
      />

      <StoreBlueprintModal
        isOpen={showBlueprintModal}
        onClose={() => setShowBlueprintModal(false)}
        blueprint={storeBlueprint}
        nicheName={niche.name}
      />
    </div>
  );
};

export default NicheDetail;
