import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Rocket, Star, PartyPopper, User, Calendar, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface CommunityWin {
  id: string;
  display_name: string;
  product_name: string;
  win_type: string;
  niche_name: string | null;
  platform: string | null;
  created_at: string;
}

const WIN_TYPES = [
  { value: "launched", label: "🚀 Launched Product", icon: Rocket },
  { value: "first_sale", label: "💰 First Sale", icon: Star },
  { value: "milestone", label: "🎯 Hit Milestone", icon: Trophy },
  { value: "featured", label: "⭐ Got Featured", icon: Star },
];

const SuccessWall = () => {
  const { user } = useAuth();
  const [wins, setWins] = useState<CommunityWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newWin, setNewWin] = useState({
    product_name: "",
    win_type: "launched",
    niche_name: "",
    platform: "",
    display_name: "",
  });

  useEffect(() => {
    fetchWins();
  }, []);

  const fetchWins = async () => {
    try {
      const { data, error } = await supabase
        .from("community_wins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setWins(data || []);
    } catch (error) {
      console.error("Error fetching wins:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitWin = async () => {
    if (!user) {
      toast.error("Please sign in to share your win");
      return;
    }

    if (!newWin.product_name.trim()) {
      toast.error("Please enter your product name");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("community_wins")
        .insert({
          user_id: user.id,
          display_name: newWin.display_name || "DigiStream User",
          product_name: newWin.product_name,
          win_type: newWin.win_type,
          niche_name: newWin.niche_name || null,
          platform: newWin.platform || null,
        })
        .select()
        .single();

      if (error) throw error;

      setWins([data, ...wins]);
      setShowAddDialog(false);
      setNewWin({
        product_name: "",
        win_type: "launched",
        niche_name: "",
        platform: "",
        display_name: "",
      });

      // Celebrate!
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success("🎉 Congratulations! Your win has been shared!");
    } catch (error) {
      console.error("Error submitting win:", error);
      toast.error("Failed to share your win");
    } finally {
      setSubmitting(false);
    }
  };

  const getWinIcon = (type: string) => {
    const found = WIN_TYPES.find(w => w.value === type);
    return found?.label.split(" ")[0] || "🚀";
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-card border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Success Wall</h3>
          <Badge variant="secondary" className="text-xs">{wins.length} wins</Badge>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="glow" size="sm" className="gap-1">
              <PartyPopper className="w-4 h-4" />
              I Launched!
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-accent" />
                Share Your Win! 🎉
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name (optional)</label>
                <Input
                  placeholder="Anonymous"
                  value={newWin.display_name}
                  onChange={(e) => setNewWin({ ...newWin, display_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Product Name *</label>
                <Input
                  placeholder="My Awesome Planner"
                  value={newWin.product_name}
                  onChange={(e) => setNewWin({ ...newWin, product_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Win Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {WIN_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewWin({ ...newWin, win_type: type.value })}
                      className={`p-3 rounded-lg border text-sm text-left transition-all ${
                        newWin.win_type === type.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Niche (optional)</label>
                  <Input
                    placeholder="Wellness"
                    value={newWin.niche_name}
                    onChange={(e) => setNewWin({ ...newWin, niche_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Platform (optional)</label>
                  <Input
                    placeholder="Etsy"
                    value={newWin.platform}
                    onChange={(e) => setNewWin({ ...newWin, platform: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={submitWin}
                disabled={submitting || !newWin.product_name.trim()}
                className="w-full"
                variant="hero"
              >
                {submitting ? "Sharing..." : "Share My Win! 🎉"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wins Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-secondary/50 animate-pulse">
              <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : wins.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Be the first to share a win!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {wins.map((win, i) => (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getWinIcon(win.win_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{win.product_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {win.display_name}
                      </span>
                      {win.platform && (
                        <Badge variant="outline" className="text-xs">
                          {win.platform}
                        </Badge>
                      )}
                      {win.niche_name && (
                        <span className="truncate">{win.niche_name}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getTimeAgo(win.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default SuccessWall;
