import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Dna, Sparkles, ArrowRight, Copy, Star, Users, DollarSign,
  Zap, TrendingUp, Target, RefreshCw, Plus, Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Genome {
  id: string;
  name: string;
  niche: string;
  offer_type: string;
  price_point: number;
  headline_style: string;
  conversion_style: string;
  email_style: string;
  funnel_layout: string;
  bonus_count: number;
  tags: string[];
  genome_data: any;
  performance_score: number;
  uses_count: number;
  is_public: boolean;
  user_id: string;
  created_at: string;
}

const styleLabels: Record<string, string> = {
  transformation: "Transformation Promise",
  how_to: "How-To Framework",
  curiosity: "Curiosity Hook",
  framework: "System/Framework",
  contrarian: "Contrarian Angle",
  story_driven: "Story-Driven",
  direct: "Direct Response",
  urgency: "Urgency-Based",
  transformation_promise: "Transformation Promise",
};

const GenomeLibrary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [genomes, setGenomes] = useState<Genome[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [extracting, setExtracting] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [genomesRes, projectsRes] = await Promise.all([
        supabase.functions.invoke("launch-genome", { body: { action: "list" } }),
        supabase.from("launch_projects").select("id, name, niche, status, step1_product, step3_funnel")
          .eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10),
      ]);
      setGenomes(genomesRes.data?.genomes || []);
      setProjects(projectsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const extractGenome = async (projectId: string) => {
    setExtracting(projectId);
    try {
      const { data, error } = await supabase.functions.invoke("launch-genome", {
        body: { action: "extract", projectId },
      });
      if (error) throw error;
      toast.success("Launch Genome™ extracted!");
      setGenomes(prev => [data.genome, ...prev]);
    } catch (e: any) {
      toast.error(e.message || "Failed to extract genome");
    } finally {
      setExtracting(null);
    }
  };

  const useGenome = async (genome: Genome) => {
    try {
      await supabase.functions.invoke("launch-genome", {
        body: { action: "use", genomeId: genome.id },
      });
      // Navigate to wizard with genome data pre-filled
      const params = new URLSearchParams({
        niche: genome.niche,
        mechanism: genome.genome_data?.mechanism || "",
        audience: genome.genome_data?.audience || "",
        genome: genome.id,
      });
      navigate(`/wizard?${params.toString()}`);
    } catch (e) {
      toast.error("Failed to load genome");
    }
  };

  const eligibleProjects = projects.filter(p =>
    p.step1_product && p.step3_funnel && !genomes.some(g => g.project_id === p.id)
  );

  return (
    <DashboardLayout title="Launch Genome™">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Dna className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Launch Genome™</h1>
              <p className="text-sm text-muted-foreground">
                Capture winning launch DNA and reuse proven blueprints instantly
              </p>
            </div>
          </div>
        </motion.div>

        {/* Extract from Projects */}
        {eligibleProjects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <h3 className="font-bold text-sm">Extract DNA from Your Launches</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Save the winning patterns from your completed projects as reusable Launch Genomes.
                </p>
                <div className="space-y-2">
                  {eligibleProjects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.niche}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={extracting === p.id}
                        onClick={() => extractGenome(p.id)}
                      >
                        {extracting === p.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Dna className="w-3.5 h-3.5" />
                        )}
                        Extract DNA
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Genome Library */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : genomes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Dna className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Launch Genomes Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Complete a launch project, then extract its DNA to create your first reusable genome blueprint.
            </p>
            <Button onClick={() => navigate("/wizard")} className="gap-2">
              <Plus className="w-4 h-4" />
              Start a Launch Project
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Dna className="w-5 h-5 text-primary" />
              Your Launch Genomes
              <Badge variant="secondary" className="ml-1">{genomes.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {genomes.map((g, i) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="hover:shadow-lg hover:border-primary/40 transition-all">
                      <CardContent className="p-5 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-sm">{g.name}</h3>
                            <p className="text-xs text-muted-foreground">{g.niche}</p>
                          </div>
                          {g.is_public && (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Globe className="w-3 h-3" />Public
                            </Badge>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {g.tags?.filter(Boolean).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] py-0">{tag}</Badge>
                          ))}
                        </div>

                        {/* DNA Attributes */}
                        <div className="space-y-1.5 text-xs">
                          <DNARow icon={Target} label="Style" value={styleLabels[g.conversion_style] || g.conversion_style} />
                          <DNARow icon={Zap} label="Headline" value={styleLabels[g.headline_style] || g.headline_style} />
                          <DNARow icon={DollarSign} label="Price" value={`$${g.price_point}`} />
                          <DNARow icon={Star} label="Bonuses" value={`${g.bonus_count} items`} />
                          <DNARow icon={TrendingUp} label="Funnel" value={g.funnel_layout || "Standard"} />
                        </div>

                        {/* Score + Uses */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Copy className="w-3 h-3" />
                            Used {g.uses_count}x
                          </div>
                          {g.performance_score > 0 && (
                            <Badge variant="default" className="text-xs">
                              Score: {g.performance_score}
                            </Badge>
                          )}
                        </div>

                        {/* Action */}
                        <Button size="sm" className="w-full gap-1.5" onClick={() => useGenome(g)}>
                          <Dna className="w-3.5 h-3.5" />
                          Launch with this DNA
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const DNARow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
    <span className="text-muted-foreground w-16 shrink-0">{label}</span>
    <span className="font-medium truncate">{value}</span>
  </div>
);

export default GenomeLibrary;
