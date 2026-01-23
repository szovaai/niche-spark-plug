import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Loader2, Check, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmpireProject, NicheAnalysis, NicheScore, PROBLEM_TYPES } from "@/types/empire";

interface Step1NicheFinderProps {
  project: Partial<EmpireProject>;
  onUpdate: (updates: Partial<EmpireProject>) => void;
  onNext: () => void;
}

export const Step1NicheFinder = ({ project, onUpdate, onNext }: Step1NicheFinderProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nichesInput, setNichesInput] = useState(
    project.step1_niches_input?.niches?.join("\n") || ""
  );
  const [interests, setInterests] = useState(
    project.step1_niches_input?.interests || ""
  );
  const [problemType, setProblemType] = useState(
    project.step1_niches_input?.problemType || ""
  );

  const analysis = project.step1_niche_analysis as NicheAnalysis | null;

  const handleAnalyze = async () => {
    const niches = nichesInput.split(/[,\n]/).map(n => n.trim()).filter(Boolean);
    
    if (niches.length === 0) {
      toast({
        title: "Add some niches",
        description: "Enter at least one niche idea to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!problemType) {
      toast({
        title: "Select a problem type",
        description: "Choose the type of problem you want to solve.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-analyze-niches", {
        body: { niches, interests, problemType },
      });

      if (error) throw error;

      onUpdate({
        step1_niches_input: { niches, interests, problemType },
        step1_niche_analysis: data,
      });

      toast({ title: "Analysis complete!" });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNiche = (nicheName: string) => {
    onUpdate({ step1_final_niche: nicheName });
    toast({ title: `Selected: ${nicheName}` });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            Brainstorm Your Niches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Niche ideas you're interested in
            </label>
            <Textarea
              placeholder="Enter niche ideas (one per line or comma-separated)&#10;&#10;Examples:&#10;Productivity systems&#10;AI tools for creators&#10;Personal finance&#10;Habit tracking"
              value={nichesInput}
              onChange={(e) => setNichesInput(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              What content do you enjoy consuming?
            </label>
            <Textarea
              placeholder="What do you naturally watch or read? What topics keep you engaged?"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Primary problem type to solve
            </label>
            <Select value={problemType} onValueChange={setProblemType}>
              <SelectTrigger>
                <SelectValue placeholder="Select problem type..." />
              </SelectTrigger>
              <SelectContent>
                {PROBLEM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing niches...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze & Score Niches with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Niche Scoreboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Niche Scoreboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2">Niche</th>
                      <th className="text-center py-3 px-2">💰 Paying</th>
                      <th className="text-center py-3 px-2">❤️ Interest</th>
                      <th className="text-center py-3 px-2">🚀 Virality</th>
                      <th className="text-right py-3 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.niches.map((niche: NicheScore, i: number) => (
                      <tr 
                        key={i} 
                        className={`border-b border-border/50 ${
                          project.step1_final_niche === niche.name 
                            ? "bg-primary/10" 
                            : ""
                        }`}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {analysis.top_three.includes(niche.name) && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <span className="font-medium">{niche.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{niche.notes}</p>
                        </td>
                        <td className={`text-center py-3 px-2 font-bold ${getScoreColor(niche.paying_score)}`}>
                          {niche.paying_score}/10
                        </td>
                        <td className={`text-center py-3 px-2 font-bold ${getScoreColor(niche.interest_score)}`}>
                          {niche.interest_score}/10
                        </td>
                        <td className={`text-center py-3 px-2 font-bold ${getScoreColor(niche.virality_score)}`}>
                          {niche.virality_score}/10
                        </td>
                        <td className="text-right py-3 px-2">
                          <Button
                            size="sm"
                            variant={project.step1_final_niche === niche.name ? "default" : "outline"}
                            onClick={() => handleSelectNiche(niche.name)}
                          >
                            {project.step1_final_niche === niche.name ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Selected
                              </>
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">AI Recommended Niche</h3>
                    <Badge variant="secondary">Best for beginners</Badge>
                  </div>
                  <p className="text-xl font-bold gradient-text mb-2">
                    {analysis.recommended.name}
                  </p>
                  <p className="text-muted-foreground">
                    {analysis.recommended.reason}
                  </p>
                  
                  {project.step1_final_niche !== analysis.recommended.name && (
                    <Button
                      className="mt-4 gap-2"
                      onClick={() => handleSelectNiche(analysis.recommended.name)}
                    >
                      Use This Niche
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Niche Confirmation */}
          {project.step1_final_niche && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your selected niche:</p>
                    <p className="font-bold text-lg">{project.step1_final_niche}</p>
                  </div>
                  <Button onClick={onNext} className="ml-auto gap-2">
                    Continue to Branding
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};
