import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Clock, Play, ArrowUpDown, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import TrendingFeed from "@/components/TrendingFeed";
import NicheSnapshotCard from "@/components/NicheSnapshotCard";
import FastCashFilterToggle from "@/components/FastCashFilterToggle";
import UsageLimitBadge from "@/components/UsageLimitBadge";
import UpgradeModal from "@/components/UpgradeModal";
import InspirationOfTheDay from "@/components/InspirationOfTheDay";
import DemoModeModal from "@/components/DemoModeModal";
import OnboardingWizard from "@/components/OnboardingWizard";
import FirstTimeTooltip, { TOOLTIP_CONTENT } from "@/components/FirstTimeTooltip";
import CompetitorClone from "@/components/CompetitorClone";
import { trendingTopics, nicheSnapshots, isFastCashNiche } from "@/data/mockNiches";
import { useAuth } from "@/hooks/useAuth";
import { useSavedNiches } from "@/hooks/useSavedNiches";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";
import { CompetitorAnalysis } from "@/types/competitorAnalysis";

const categories = [
  "All",
  "Planners",
  "Printables",
  "Kids",
  "Finance",
  "Marketing",
  "Art",
  "Events",
];

const Discover = () => {
  const { user, role, canSearch, incrementSearch } = useAuth();
  const { savedNiches } = useSavedNiches();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [fastCashOnly, setFastCashOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "xls-high" | "xls-low">("relevance");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showCompetitorClone, setShowCompetitorClone] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  const handleSearch = async (query: string) => {
    if (query && user && role === "free") {
      const canProceed = await incrementSearch();
      if (!canProceed) {
        setUpgradeReason("You've used all 3 daily searches. Upgrade to Pro for unlimited searches!");
        setShowUpgradeModal(true);
        return;
      }
    }
    setSearchQuery(query);
  };

  const handleFastCashToggle = (enabled: boolean) => {
    setFastCashOnly(enabled);
    if (enabled) {
      toast.success("Showing fast-launch niches only");
    }
  };

  const handleUpgradeClick = (reason: string) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  const handleCompetitorCloneCreate = (analysis: CompetitorAnalysis) => {
    toast.success(`Ready to create: ${analysis.suggestedProduct.newTitle}`);
    // This could navigate to Product Factory with pre-filled data
  };

  let filteredNiches = nicheSnapshots.filter((niche) => {
    const matchesSearch = niche.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      niche.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
      niche.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Apply Fast Cash filter (Pro only)
  if (fastCashOnly && role === "pro") {
    filteredNiches = filteredNiches.filter(isFastCashNiche);
  }

  // Apply sorting
  if (sortBy === "xls-high") {
    filteredNiches = [...filteredNiches].sort((a, b) => b.launchabilityScore - a.launchabilityScore);
  } else if (sortBy === "xls-low") {
    filteredNiches = [...filteredNiches].sort((a, b) => a.launchabilityScore - b.launchabilityScore);
  }

  const recentlyViewed = savedNiches.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Discover </span>
              <span className="gradient-text glow-text">Profitable Niches</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Search trending digital products and find your next winning niche
            </p>

            {/* Demo Mode Button */}
            <div className="flex gap-2 justify-center mb-4">
              {!user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDemoModal(true)}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  See How It Works
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompetitorClone(true)}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Clone Competitor
              </Button>
            </div>

            {/* Usage Badge for Free users */}
            {user && role === "free" && (
              <div className="flex justify-center mb-4">
                <UsageLimitBadge type="searches" />
              </div>
            )}

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search niches, keywords, or product types..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 h-14 text-lg bg-card border-border/50 focus:border-primary/50"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              {/* Category Filters */}
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant="category"
                    size="sm"
                    data-active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Fast Cash Filter with Tooltip */}
              <FirstTimeTooltip
                tooltipId="fast_cash_filter"
                content={TOOLTIP_CONTENT.fast_cash_filter}
                side="bottom"
              >
                <FastCashFilterToggle
                  enabled={fastCashOnly}
                  onToggle={handleFastCashToggle}
                  onUpgradeClick={() => handleUpgradeClick("Fast-Launch Filter is a Pro feature. Instantly find niches ready to launch!")}
                />
              </FirstTimeTooltip>
            </div>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Niches */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {searchQuery ? "Search Results" : fastCashOnly ? "Fast-Launch Niches" : "Top Niches"}
                </h2>
                <div className="flex items-center gap-3">
                  <Select value={sortBy} onValueChange={(value: "relevance" | "xls-high" | "xls-low") => setSortBy(value)}>
                    <SelectTrigger className="w-[180px] bg-card border-border/50">
                      <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="xls-high">XLS: High → Low</SelectItem>
                      <SelectItem value="xls-low">XLS: Low → High</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredNiches.length} niches
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNiches.map((niche, index) => (
                  <NicheSnapshotCard
                    key={niche.id}
                    niche={niche}
                    index={index}
                    showBlur={!user}
                    onUpgradeClick={() => handleUpgradeClick("Sign up to see full niche insights")}
                  />
                ))}
              </div>

              {filteredNiches.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No niches found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Inspiration of the Day */}
              <InspirationOfTheDay />

              {/* Trending Feed */}
              <TrendingFeed topics={trendingTopics} />

              {/* Recently Saved (if logged in) */}
              {user && recentlyViewed.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Recently Saved
                  </h3>
                  <div className="space-y-2">
                    {recentlyViewed.map((saved) => (
                      <div
                        key={saved.id}
                        className="p-3 bg-card/50 border border-border/50 rounded-lg text-sm"
                      >
                        {saved.niche_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeReason}
      />

      <DemoModeModal
        open={showDemoModal}
        onOpenChange={setShowDemoModal}
      />

      <CompetitorClone
        isOpen={showCompetitorClone}
        onClose={() => setShowCompetitorClone(false)}
        onCreateProduct={handleCompetitorCloneCreate}
      />
    </div>
  );
};

export default Discover;
