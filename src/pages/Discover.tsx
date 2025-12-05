import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, TrendingUp, Clock, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import TrendingFeed from "@/components/TrendingFeed";
import NicheSnapshotCard from "@/components/NicheSnapshotCard";
import { trendingTopics, nicheSnapshots } from "@/data/mockNiches";
import { useAuth } from "@/hooks/useAuth";
import { useSavedNiches } from "@/hooks/useSavedNiches";

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
  const { user } = useAuth();
  const { savedNiches } = useSavedNiches();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredNiches = nicheSnapshots.filter((niche) => {
    const matchesSearch = niche.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      niche.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
      niche.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const recentlyViewed = savedNiches.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search niches, keywords, or product types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-lg bg-card border-border/50 focus:border-primary/50"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
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
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Niches */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {searchQuery ? "Search Results" : "Top Niches"}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filteredNiches.length} niches found
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNiches.map((niche, index) => (
                  <NicheSnapshotCard
                    key={niche.id}
                    niche={niche}
                    index={index}
                    showBlur={!user}
                  />
                ))}
              </div>

              {filteredNiches.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No niches found matching your search.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Trending Feed */}
              <TrendingFeed topics={trendingTopics} />

              {/* Recently Viewed (if logged in) */}
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
    </div>
  );
};

export default Discover;