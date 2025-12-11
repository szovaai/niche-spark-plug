import { useState } from "react";
import { motion } from "framer-motion";
import { Package, ExternalLink, Star, Check, Wand2, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import PLRUpgrader from "@/components/PLRUpgrader";
import { UniquenessChecker } from "@/components/UniquenessChecker";
import FirstTimeTooltip, { TOOLTIP_CONTENT } from "@/components/FirstTimeTooltip";

const plrSources = [
  {
    id: "1",
    name: "PLR.me",
    description: "Premium PLR content for coaches, consultants, and course creators",
    features: ["10,000+ articles", "Editable graphics", "Video scripts"],
    rating: 4.8,
    category: "All-in-One",
    highlight: true,
    link: "#", // Affiliate link placeholder
  },
  {
    id: "2",
    name: "IDPLR",
    description: "Massive collection of digital products with full PLR rights",
    features: ["12,500+ products", "Software included", "Membership site"],
    rating: 4.6,
    category: "Bulk Downloads",
    highlight: false,
    link: "#",
  },
  {
    id: "3",
    name: "PLR Database",
    description: "Curated PLR content organized by niche and category",
    features: ["Niche-specific", "Weekly updates", "Done-for-you"],
    rating: 4.5,
    category: "Curated",
    highlight: false,
    link: "#",
  },
  {
    id: "4",
    name: "Content Sparks",
    description: "White-label courses and training materials",
    features: ["Full courses", "Slide decks", "Workbooks"],
    rating: 4.7,
    category: "Courses",
    highlight: true,
    link: "#",
  },
];

interface PLRSectionProps {
  isVisible: boolean;
}

const PLRSection = ({ isVisible }: PLRSectionProps) => {
  const [showUpgrader, setShowUpgrader] = useState(false);
  const [showUniquenessChecker, setShowUniquenessChecker] = useState(false);

  if (!isVisible) return null;

  return (
    <section className="py-16 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm gradient-text font-medium">Recommended Sources</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Get Started with Quality PLR Content
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            These trusted platforms offer ready-to-sell digital products that match your trending niches
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <FirstTimeTooltip
              tooltipId="plr_upgrader"
              content={TOOLTIP_CONTENT.plr_upgrader}
              side="bottom"
            >
              <Button 
                variant="hero" 
                onClick={() => setShowUpgrader(true)}
              >
                <Wand2 className="w-5 h-5" />
                Upgrade Your PLR
              </Button>
            </FirstTimeTooltip>
            
            <FirstTimeTooltip
              tooltipId="uniqueness_checker"
              content={TOOLTIP_CONTENT.uniqueness_checker}
              side="bottom"
            >
              <Button 
                variant="outline" 
                onClick={() => setShowUniquenessChecker(true)}
              >
                <Fingerprint className="w-5 h-5" />
                Check Uniqueness
              </Button>
            </FirstTimeTooltip>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plrSources.map((source, index) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                source.highlight 
                  ? 'gradient-ocean border border-primary/30 hover:border-primary/50 hover:shadow-primary/20' 
                  : 'bg-card border border-border hover:border-border/80'
              }`}
            >
              {source.highlight && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold rounded-full shadow-lg shadow-primary/30">
                  RECOMMENDED
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{source.name}</h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {source.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-accent">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{source.rating}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4">
                {source.description}
              </p>
              
              <ul className="space-y-2 mb-6">
                {source.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={source.highlight ? "hero" : "outline"} 
                className="w-full"
                asChild
              >
                <a href={source.link} target="_blank" rel="noopener noreferrer">
                  Visit {source.name}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </motion.div>
          ))}
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          * Some links may be affiliate links. We only recommend products we trust.
        </motion.p>
      </div>

      {/* PLR Upgrader Modal */}
      <PLRUpgrader 
        isOpen={showUpgrader} 
        onClose={() => setShowUpgrader(false)} 
      />

      {/* Uniqueness Checker Modal */}
      <UniquenessChecker
        isOpen={showUniquenessChecker}
        onClose={() => setShowUniquenessChecker(false)}
        initialType="plr_content"
      />
    </section>
  );
};

export default PLRSection;