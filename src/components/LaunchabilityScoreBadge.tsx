import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { getXLSRating, getXLSColor, getXLSBgColor, getXLSTagline } from "@/lib/launchabilityScore";

interface LaunchabilityScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

const LaunchabilityScoreBadge = ({ 
  score, 
  size = "md",
  showTagline = false 
}: LaunchabilityScoreBadgeProps) => {
  const rating = getXLSRating(score);
  const colorClass = getXLSColor(score);
  const bgGradient = getXLSBgColor(score);
  const tagline = getXLSTagline(score);

  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-lg",
    lg: "w-24 h-24 text-2xl"
  };

  const ringSize = {
    sm: 44,
    md: 60,
    lg: 88
  };

  const strokeWidth = size === "lg" ? 4 : 3;
  const radius = (ringSize[size] - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-1"
    >
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Background ring */}
        <svg 
          className="absolute inset-0 -rotate-90"
          width={ringSize[size]} 
          height={ringSize[size]}
        >
          <circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          <motion.circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={colorClass}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference
            }}
          />
        </svg>
        
        {/* Score display */}
        <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${bgGradient} rounded-full ${sizeClasses[size]}`}>
          <span className={`font-bold ${colorClass}`}>{score}</span>
          {size !== "sm" && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">XLS</span>
          )}
        </div>

        {/* Glow effect for excellent scores */}
        {score >= 85 && (
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-400/20 blur-md"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {showTagline && (
        <div className="text-center">
          <div className="flex items-center gap-1 text-xs">
            <Zap className={`w-3 h-3 ${colorClass}`} />
            <span className={`font-medium ${colorClass}`}>{rating}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{tagline}</p>
        </div>
      )}
    </motion.div>
  );
};

export default LaunchabilityScoreBadge;
