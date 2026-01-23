import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Video, Sparkles, Loader2, Check, ChevronRight, 
  Copy, Play, Zap, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmpireProject, ViralIdea, ContentScript, ProductPack } from "@/types/empire";

interface Step5ContentEngineProps {
  project: Partial<EmpireProject>;
  onUpdate: (updates: Partial<EmpireProject>) => void;
  onNext: () => void;
}

export const Step5ContentEngine = ({ project, onUpdate, onNext }: Step5ContentEngineProps) => {
  const { toast } = useToast();
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingScript, setLoadingScript] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ViralIdea | null>(null);

  const productBrief = project.step3_product_brief as ProductPack | null;
  const viralIdeas = project.step5_viral_ideas as ViralIdea[] | null;
  const scripts = project.step5_scripts as ContentScript[] | null;

  const handleGenerateIdeas = async () => {
    if (!project.step1_final_niche) {
      toast({
        title: "Select a niche first",
        variant: "destructive",
      });
      return;
    }

    setLoadingIdeas(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-content", {
        body: { 
          niche: project.step1_final_niche,
          type: "ideas",
        },
      });

      if (error) throw error;

      // Add IDs to ideas
      const ideasWithIds = data.map((idea: any, i: number) => ({
        ...idea,
        id: `idea-${i}`,
      }));

      onUpdate({ step5_viral_ideas: ideasWithIds });
      toast({ title: "10 viral ideas generated!" });
    } catch (error: any) {
      console.error("Ideas generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleGenerateScript = async (idea: ViralIdea) => {
    if (!productBrief) return;

    setLoadingScript(idea.id);
    setSelectedTopic(idea);

    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-content", {
        body: { 
          niche: project.step1_final_niche,
          productName: productBrief.product_name,
          topic: idea.topic,
          type: "script",
        },
      });

      if (error) throw error;

      const newScript: ContentScript = {
        id: `script-${Date.now()}`,
        topic: idea.topic,
        ...data,
      };

      const existingScripts = scripts || [];
      onUpdate({ step5_scripts: [...existingScripts, newScript] });
      toast({ title: "Script generated!" });
    } catch (error: any) {
      console.error("Script generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingScript(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "viral": return "bg-red-500/20 text-red-400";
      case "value": return "bg-blue-500/20 text-blue-400";
      default: return "bg-purple-500/20 text-purple-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Context Display */}
      <div className="p-3 bg-secondary/50 rounded-lg flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Creating content for:</span>
        <Badge variant="secondary">{productBrief?.product_name || project.step1_final_niche}</Badge>
      </div>

      {/* Viral Ideas Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="w-5 h-5 text-primary" />
            Viral Topic Ideas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate 10 scroll-stopping video ideas for TikTok, Reels, and Shorts.
          </p>

          <Button onClick={handleGenerateIdeas} disabled={loadingIdeas} className="w-full gap-2">
            {loadingIdeas ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating ideas...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate 10 Viral Topics</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Ideas List */}
      {viralIdeas && viralIdeas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Content Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {viralIdeas.map((idea) => {
                  const hasScript = scripts?.some(s => s.topic === idea.topic);
                  return (
                    <div 
                      key={idea.id}
                      className={`p-4 rounded-lg border transition-all ${
                        hasScript ? "border-green-500/30 bg-green-500/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getTypeColor(idea.type)}>
                              {idea.type}
                            </Badge>
                            {hasScript && (
                              <Badge variant="outline" className="text-green-500 border-green-500/30">
                                <Check className="w-3 h-3 mr-1" />
                                Script Ready
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium">{idea.topic}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{idea.explanation}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={hasScript ? "outline" : "default"}
                          onClick={() => handleGenerateScript(idea)}
                          disabled={loadingScript === idea.id}
                          className="shrink-0 gap-1"
                        >
                          {loadingScript === idea.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : hasScript ? (
                            <>Regenerate</>
                          ) : (
                            <><Play className="w-3 h-3" /> Create Script</>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Scripts */}
      {scripts && scripts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-primary" />
              Generated Scripts ({scripts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={scripts[0].id}>
              <TabsList className="w-full flex-wrap h-auto gap-1 mb-4">
                {scripts.map((script, i) => (
                  <TabsTrigger key={script.id} value={script.id} className="text-xs">
                    Script {i + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {scripts.map((script) => (
                <TabsContent key={script.id} value={script.id}>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">🎬 Hook (First 2 seconds)</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(script.hook, "Hook")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-lg font-bold">{script.hook}</p>
                    </div>

                    <div className="space-y-3">
                      {script.scenes.map((scene) => (
                        <div key={scene.scene_number} className="p-4 bg-secondary/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Scene {scene.scene_number}</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => copyToClipboard(
                                `NARRATION: ${scene.narration}\nTEXT: ${scene.on_screen_text}\nIMAGE: ${scene.image_prompt}`,
                                "Scene"
                              )}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><span className="text-muted-foreground">🎤 Say:</span> {scene.narration}</p>
                            <p><span className="text-muted-foreground">📝 Text:</span> {scene.on_screen_text}</p>
                            <p className="text-xs text-muted-foreground italic">🖼️ {scene.image_prompt}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">📣 Call to Action</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(script.cta, "CTA")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="font-medium">{script.cta}</p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      {viralIdeas && viralIdeas.length > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Content system ready!</p>
                <p className="font-bold">{viralIdeas.length} ideas, {scripts?.length || 0} scripts</p>
              </div>
              <Button onClick={onNext} className="ml-auto gap-2">
                Continue to Automation
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
