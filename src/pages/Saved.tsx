import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Bell, BellOff, Trash2, ChevronRight, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useSavedNiches } from "@/hooks/useSavedNiches";
import { nicheSnapshots } from "@/data/mockNiches";
import { getXLSRating, getXLSColor } from "@/lib/launchabilityScore";

const Saved = () => {
  const navigate = useNavigate();
  const { user, loading, role } = useAuth();
  const { savedNiches, unsaveNiche, toggleAlert, updateNote, maxSaves, canSaveMore } = useSavedNiches();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const getNicheData = (nicheId: string) => {
    return nicheSnapshots.find((n) => n.id === nicheId);
  };

  const handleNoteBlur = async (nicheId: string) => {
    if (editingNoteId === nicheId) {
      await updateNote(nicheId, noteValue);
      setEditingNoteId(null);
    }
  };

  const startEditingNote = (nicheId: string, currentNote: string | null) => {
    setEditingNoteId(nicheId);
    setNoteValue(currentNote || "");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold gradient-text mb-2">Saved Niches</h1>
            <p className="text-muted-foreground">
              {role === "free" 
                ? `${savedNiches.length}/${maxSaves} niches saved` 
                : `${savedNiches.length} niches saved`}
            </p>
          </motion.div>

          {savedNiches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Saved Niches Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start exploring and save niches you want to track.
              </p>
              <Button variant="hero" onClick={() => navigate("/discover")}>
                Explore Niches
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {savedNiches.map((saved, index) => {
                const nicheData = getNicheData(saved.niche_id);
                const score = nicheData?.launchabilityScore || 0;
                const rating = getXLSRating(score);
                const colorClass = getXLSColor(score);
                
                return (
                  <motion.div
                    key={saved.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* XLS Score Badge */}
                      {nicheData && (
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-background/50 border border-border">
                          <Zap className={`w-3 h-3 ${colorClass}`} />
                          <span className={`text-lg font-bold ${colorClass}`}>{score}</span>
                          <span className="text-[10px] text-muted-foreground">{rating}</span>
                        </div>
                      )}

                      <div 
                        className="flex-1 cursor-pointer min-w-0"
                        onClick={() => navigate(`/niche/${saved.niche_id}`)}
                      >
                        <h3 className="font-semibold hover:text-primary transition-colors truncate">
                          {saved.niche_name}
                        </h3>
                        {nicheData && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {nicheData.category}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className={`text-xs ${
                              nicheData.momentum === "rising" ? "text-ocean-300" :
                              nicheData.momentum === "declining" ? "text-magenta-300" :
                              "text-muted-foreground"
                            }`}>
                              {nicheData.momentum === "rising" ? "🔺" : nicheData.momentum === "declining" ? "🔻" : "➖"}
                              {" "}{nicheData.momentum}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Alert Toggle */}
                        <button
                          onClick={() => toggleAlert(saved.niche_id, !saved.alert_enabled)}
                          className={`p-2 rounded-lg transition-all ${
                            saved.alert_enabled
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                          title={saved.alert_enabled ? "Disable alerts" : "Enable alerts"}
                        >
                          {saved.alert_enabled ? (
                            <Bell className="w-4 h-4" />
                          ) : (
                            <BellOff className="w-4 h-4" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => unsaveNiche(saved.niche_id)}
                          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* View */}
                        <button
                          onClick={() => navigate(`/niche/${saved.niche_id}`)}
                          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-primary transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Notes Field */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                      {editingNoteId === saved.niche_id ? (
                        <Input
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          onBlur={() => handleNoteBlur(saved.niche_id)}
                          onKeyDown={(e) => e.key === "Enter" && handleNoteBlur(saved.niche_id)}
                          placeholder="Add a note (e.g., 'Holiday bundle idea')"
                          className="text-sm bg-background/50"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => startEditingNote(saved.niche_id, saved.notes)}
                          className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background/50"
                        >
                          {saved.notes || "Add a note..."}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Upgrade Prompt */}
          {role === "free" && !canSaveMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl text-center"
            >
              <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Save Limit Reached</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Free accounts can save up to 3 niches. Upgrade to Pro for unlimited saves.
              </p>
              <Button variant="hero">Upgrade to Pro</Button>
            </motion.div>
          )}

          {/* Alert Info */}
          {savedNiches.some((n) => n.alert_enabled) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-secondary/30 rounded-lg"
            >
              <p className="text-sm text-muted-foreground">
                <Bell className="w-4 h-4 inline mr-2" />
                You'll be notified when momentum changes on niches with alerts enabled.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Saved;