import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Star, LogOut, User, Crown, Menu, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPro = role === "pro";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 rounded-2xl glass-card">
          {/* Logo */}
          <button onClick={() => handleNavigate("/")} className="flex items-center gap-2">
            <img src="/logo.png" alt="PDF Empire AI" className="h-10 w-10 object-contain drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
            <span className="text-xl font-bold hidden sm:inline">
              PDF <span className="gradient-text">Empire</span>
              <span className="text-xs text-muted-foreground ml-1">AI</span>
            </span>
          </button>
          
          {/* Auth Section + Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {isPro && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary/20 to-accent/20 text-accent text-xs font-medium rounded-full">
                      <Crown className="w-3 h-3" />
                      Pro
                    </span>
                  )}
                  <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                  <Button variant="glow" size="sm" onClick={() => navigate("/wizard")}>
                    <Wand2 className="w-4 h-4 mr-1" />
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-border">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold">LaunchStack AI</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="space-y-1">
                  <button onClick={() => handleNavigate("/wizard")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left bg-primary/10 text-primary font-medium">
                    <Wand2 className="w-5 h-5" />
                    <span>AI Launch Wizard</span>
                  </button>
                  <button onClick={() => handleNavigate("/dashboard")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-secondary">
                    <span>Dashboard</span>
                  </button>
                  <button onClick={() => handleNavigate("/templates")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-secondary">
                    <span>Templates</span>
                  </button>
                  <button onClick={() => handleNavigate("/pricing")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-secondary">
                    <span>Pricing</span>
                  </button>
                </nav>

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  {user ? (
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  ) : (
                    <Button variant="hero" className="w-full" onClick={() => handleNavigate("/auth")}>
                      Get Started
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
