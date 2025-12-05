import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Inspiration {
  id: string;
  title: string;
  content: string;
  niche_link: string | null;
  category: string;
}

const categoryConfig = {
  tip: { icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  trend: { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  success: { icon: Trophy, color: "text-green-500", bg: "bg-green-500/10" },
};

const InspirationOfTheDay = () => {
  const [inspiration, setInspiration] = useState<Inspiration | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInspiration = async () => {
      // Get a "random" inspiration based on current day
      const { data } = await supabase
        .from("daily_inspiration")
        .select("*")
        .eq("is_active", true)
        .limit(10);

      if (data && data.length > 0) {
        // Use day of year to pick consistent daily inspiration
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const index = dayOfYear % data.length;
        setInspiration(data[index]);
      }
    };

    fetchInspiration();
  }, []);

  if (!inspiration) return null;

  const config = categoryConfig[inspiration.category as keyof typeof categoryConfig] || categoryConfig.tip;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${config.bg}`}>
          <Sparkles className={`w-4 h-4 ${config.color}`} />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Inspiration of the Day
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.bg} mt-0.5`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{inspiration.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{inspiration.content}</p>
          </div>
        </div>

        {inspiration.niche_link && (
          <button
            onClick={() => navigate(`/niche/${inspiration.niche_link}`)}
            className="flex items-center gap-1 text-sm text-primary hover:underline ml-9"
          >
            Explore this niche <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default InspirationOfTheDay;
