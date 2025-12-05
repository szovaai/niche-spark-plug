import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between px-6 py-3 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Digi<span className="text-primary">Stream</span>
            </span>
          </div>
          
          {/* Nav links - hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#trending" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Trends
            </a>
            <a href="#plr" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              PLR Sources
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </div>
          
          {/* CTA */}
          <Button variant="glow" size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
