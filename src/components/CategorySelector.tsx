import { motion } from "framer-motion";
import { 
  BookOpen, 
  Palette, 
  Music, 
  Code, 
  Camera, 
  GraduationCap,
  Briefcase,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "all", label: "All Categories", icon: null },
  { id: "ebooks", label: "eBooks & Guides", icon: BookOpen },
  { id: "templates", label: "Templates", icon: Palette },
  { id: "audio", label: "Audio & Music", icon: Music },
  { id: "software", label: "Software & Tools", icon: Code },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "courses", label: "Online Courses", icon: GraduationCap },
  { id: "business", label: "Business Assets", icon: Briefcase },
  { id: "wellness", label: "Health & Wellness", icon: Heart },
];

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategorySelector = ({ selectedCategory, onCategoryChange }: CategorySelectorProps) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Choose Your Niche</h2>
          <p className="text-muted-foreground">Select a category to discover trending products</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="category"
                  size="sm"
                  data-active={selectedCategory === category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className="flex items-center gap-2"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {category.label}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySelector;
