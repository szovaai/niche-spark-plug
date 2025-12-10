import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductType, ProductTypeConfig, PRODUCT_TYPES } from "@/types/niche";
import ProductTypeCard from "./ProductTypeCard";

interface ProductTypePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ProductType) => void;
  nicheName: string;
}

const ProductTypePicker = ({ isOpen, onClose, onSelect, nicheName }: ProductTypePickerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-3xl md:w-full bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Turn Into Product
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    What type of product do you want to create for <span className="text-foreground font-medium">{nicheName}</span>?
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Product Type Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PRODUCT_TYPES.map((productType, index) => (
                    <motion.div
                      key={productType.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductTypeCard
                        config={productType}
                        onClick={() => onSelect(productType.type)}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Info Footer */}
                <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
                    AI will generate a complete product blueprint with page-by-page content, style guide, and marketing copy.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductTypePicker;
