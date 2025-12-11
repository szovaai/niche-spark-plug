import { motion } from "framer-motion";
import { Zap, Star, LogOut, User, Package, Crown, DollarSign, Boxes, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPro = role === "pro";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between px-6 py-3 rounded-2xl glass-card">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Digi<span className="gradient-text">Stream</span>
            </span>
          </button>
          
          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/discover")}
              className={`text-sm transition-colors ${
                isActive("/discover") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Discover
            </button>
            {user && (
              <>
                <button
                  onClick={() => navigate("/my-products")}
                  className={`text-sm transition-colors flex items-center gap-1 ${
                    isActive("/my-products") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  My Products
                </button>
                <button
                  onClick={() => navigate("/money-map")}
                  className={`text-sm transition-colors flex items-center gap-1 ${
                    isActive("/money-map") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Money Map
                </button>
              </>
            )}
            <button
              onClick={() => navigate("/launch-packs")}
              className={`text-sm transition-colors flex items-center gap-1 ${
                isActive("/launch-packs") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-4 h-4" />
              Launch Packs
              {!isPro && <Crown className="w-3 h-3 text-accent" />}
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className={`text-sm transition-colors flex items-center gap-1 ${
                isActive("/pricing") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Pricing
            </button>
            {user && (
              <button
                onClick={() => navigate("/saved")}
                className={`text-sm transition-colors flex items-center gap-1 ${
                  isActive("/saved") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className="w-4 h-4" />
                Saved
              </button>
            )}
          </div>
          
          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isPro && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary/20 to-accent/20 text-accent text-xs font-medium rounded-full">
                    <Crown className="w-3 h-3" />
                    Pro
                  </span>
                )}
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <Button variant="glow" size="sm" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
