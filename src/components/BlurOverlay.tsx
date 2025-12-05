import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BlurOverlayProps {
  children: React.ReactNode;
  isBlurred: boolean;
  message?: string;
  showCTA?: boolean;
}

const BlurOverlay = ({ children, isBlurred, message = "Sign up to unlock", showCTA = true }: BlurOverlayProps) => {
  const navigate = useNavigate();

  if (!isBlurred) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-md pointer-events-none select-none">
        {children}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg"
      >
        <Lock className="w-8 h-8 text-primary mb-3" />
        <p className="text-foreground font-medium mb-3">{message}</p>
        {showCTA && (
          <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
            Create Free Account
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default BlurOverlay;