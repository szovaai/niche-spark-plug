import { motion } from "framer-motion";
import { RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrendingCard from "./TrendingCard";

const mockTrendingData = [
  {
    id: "1",
    name: "AI Prompt Templates Bundle",
    category: "Templates",
    trendScore: 98,
    growth: "+245%",
    searches: "32.5K",
    competition: "Low" as const,
  },
  {
    id: "2",
    name: "Social Media Content Calendar",
    category: "Business Assets",
    trendScore: 94,
    growth: "+189%",
    searches: "28.1K",
    competition: "Medium" as const,
  },
  {
    id: "3",
    name: "Digital Planner 2025",
    category: "Templates",
    trendScore: 91,
    growth: "+156%",
    searches: "45.2K",
    competition: "High" as const,
  },
  {
    id: "4",
    name: "Stock Photo Presets Pack",
    category: "Photography",
    trendScore: 87,
    growth: "+134%",
    searches: "19.8K",
    competition: "Low" as const,
  },
  {
    id: "5",
    name: "Meditation Audio Collection",
    category: "Audio & Music",
    trendScore: 84,
    growth: "+122%",
    searches: "15.3K",
    competition: "Medium" as const,
  },
  {
    id: "6",
    name: "Resume & CV Templates",
    category: "Templates",
    trendScore: 81,
    growth: "+98%",
    searches: "52.1K",
    competition: "High" as const,
  },
];

interface TrendingSectionProps {
  category: string;
  isVisible: boolean;
}

const TrendingSection = ({ category, isVisible }: TrendingSectionProps) => {
  const filteredData = category === "all" 
    ? mockTrendingData 
    : mockTrendingData.filter(item => 
        item.category.toLowerCase().includes(category.toLowerCase()) ||
        category === "templates" && item.category === "Templates" ||
        category === "business" && item.category === "Business Assets" ||
        category === "audio" && item.category === "Audio & Music" ||
        category === "photography" && item.category === "Photography"
      );

  const displayData = filteredData.length > 0 ? filteredData : mockTrendingData;

  if (!isVisible) return null;

  return (
    <section className="py-12 px-4" id="trending">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
            </div>
            <p className="text-muted-foreground">
              Top performing digital product niches based on real-time data
            </p>
          </div>
          <Button variant="outline" size="sm" className="self-start">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </motion.div>
        
        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-6"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="text-sm text-muted-foreground">Live data • Updated 2 min ago</span>
        </motion.div>
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayData.map((product, index) => (
            <TrendingCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
