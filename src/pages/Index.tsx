import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySelector from "@/components/CategorySelector";
import TrendingSection from "@/components/TrendingSection";
import PLRSection from "@/components/PLRSection";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showResults, setShowResults] = useState(false);
  const trendingRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    setShowResults(true);
    setTimeout(() => {
      trendingRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (!showResults) {
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <HeroSection onGetStarted={handleGetStarted} />
        
        <CategorySelector 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <div ref={trendingRef}>
          <TrendingSection 
            category={selectedCategory}
            isVisible={showResults}
          />
        </div>
        
        <div id="plr">
          <PLRSection isVisible={showResults} />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 DigiStream. Powered by real-time market data.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
