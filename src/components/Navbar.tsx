import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Star, LogOut, User, Package, Crown, DollarSign, Boxes, Map, Menu, X, Search } from "lucide-react";
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

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: "/discover", label: "Discover", icon: Search, showAlways: true },
    { path: "/my-products", label: "My Products", icon: Boxes, requiresAuth: true },
    { path: "/money-map", label: "Money Map", icon: Map, requiresAuth: true },
    { path: "/launch-packs", label: "Launch Packs", icon: Package, showAlways: true, proBadge: !isPro },
    { path: "/pricing", label: "Pricing", icon: DollarSign, showAlways: true },
    { path: "/saved", label: "Saved", icon: Star, requiresAuth: true },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.showAlways || (item.requiresAuth && user)
  );

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
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Digi<span className="gradient-text">Stream</span>
            </span>
          </button>
          
          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {filteredNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm transition-colors flex items-center gap-1 ${
                  isActive(item.path) ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.proBadge && <Crown className="w-3 h-3 text-accent" />}
              </button>
            ))}
          </div>
          
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{user.email}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="glow" size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
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
                    <span className="text-lg font-bold">
                      Digi<span className="gradient-text">Stream</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>

                {/* User Info */}
                {user && (
                  <div className="mb-6 p-3 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.email}</p>
                        {isPro && (
                          <span className="inline-flex items-center gap-1 text-xs text-accent">
                            <Crown className="w-3 h-3" />
                            Pro Member
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Nav Links */}
                <nav className="space-y-1">
                  {filteredNavItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                        isActive(item.path) 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.proBadge && (
                        <Crown className="w-4 h-4 text-accent" />
                      )}
                    </button>
                  ))}
                </nav>

                {/* Mobile Auth Actions */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  ) : (
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => handleNavigate("/auth")}
                    >
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
