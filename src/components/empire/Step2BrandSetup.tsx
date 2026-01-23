import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Palette, Sparkles, Loader2, Check, Copy, Instagram,
  ChevronRight, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmpireProject, BrandOption, BRAND_TONES, SYMBOL_STYLES, WarmingDay } from "@/types/empire";

interface Step2BrandSetupProps {
  project: Partial<EmpireProject>;
  onUpdate: (updates: Partial<EmpireProject>) => void;
  onNext: () => void;
}

export const Step2BrandSetup = ({ project, onUpdate, onNext }: Step2BrandSetupProps) => {
  const { toast } = useToast();
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(false);
  
  const [tone, setTone] = useState("clean");
  const [extraWords, setExtraWords] = useState("");
  const [symbolStyle, setSymbolStyle] = useState("minimal");
  const [colorDirection, setColorDirection] = useState("");

  const brandOptions = project.step2_brand_options as BrandOption[] | null;
  const logoPrompts = project.step2_logo_prompts;
  const socialBios = project.step2_social_bios;
  const warmingPlan = project.step2_warming_checklist as WarmingDay[] | null;

  const handleGenerateBrands = async () => {
    if (!project.step1_final_niche) {
      toast({
        title: "Select a niche first",
        description: "Go back to Step 1 and select your niche.",
        variant: "destructive",
      });
      return;
    }

    setLoadingBrands(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-brand", {
        body: { 
          niche: project.step1_final_niche, 
          tone, 
          extraWords 
        },
      });

      if (error) throw error;

      onUpdate({ step2_brand_options: data.brands });
      toast({ title: "Brand names generated!" });
    } catch (error: any) {
      console.error("Brand generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleSelectBrand = (brandName: string) => {
    onUpdate({ step2_selected_brand: brandName });
    toast({ title: `Selected: ${brandName}` });
  };

  const handleGenerateLogoPrompts = async () => {
    if (!project.step2_selected_brand) {
      toast({
        title: "Select a brand first",
        description: "Choose a brand name before generating logo prompts.",
        variant: "destructive",
      });
      return;
    }

    setLoadingLogo(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-social", {
        body: { 
          brandName: project.step2_selected_brand,
          niche: project.step1_final_niche,
          type: "logo",
          symbolStyle,
          colorDirection,
        },
      });

      if (error) throw error;

      onUpdate({ step2_logo_prompts: data });
      toast({ title: "Logo prompts generated!" });
    } catch (error: any) {
      console.error("Logo prompt error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingLogo(false);
    }
  };

  const handleGenerateSocial = async () => {
    if (!project.step2_selected_brand) {
      toast({
        title: "Select a brand first",
        variant: "destructive",
      });
      return;
    }

    setLoadingSocial(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-social", {
        body: { 
          brandName: project.step2_selected_brand,
          niche: project.step1_final_niche,
          type: "social",
        },
      });

      if (error) throw error;

      onUpdate({ 
        step2_social_bios: { instagram_bio: data.instagram_bio, tiktok_bio: data.tiktok_bio },
        step2_warming_checklist: data.warming_plan,
      });
      toast({ title: "Social setup generated!" });
    } catch (error: any) {
      console.error("Social generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingSocial(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  const toggleWarmingDay = (dayIndex: number) => {
    if (!warmingPlan) return;
    const updated = warmingPlan.map((day, i) => 
      i === dayIndex ? { ...day, completed: !day.completed } : day
    );
    onUpdate({ step2_warming_checklist: updated });
  };

  return (
    <div className="space-y-6">
      {/* Current Niche Display */}
      {project.step1_final_niche && (
        <div className="p-3 bg-secondary/50 rounded-lg flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Building for:</span>
          <Badge variant="secondary">{project.step1_final_niche}</Badge>
        </div>
      )}

      {/* Brand Name Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="w-5 h-5 text-primary" />
            Brand Name Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Preferred tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRAND_TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Words you like (optional)</label>
              <Input
                placeholder="e.g. lab, studio, system"
                value={extraWords}
                onChange={(e) => setExtraWords(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGenerateBrands} disabled={loadingBrands} className="w-full gap-2">
            {loadingBrands ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Brand Name Ideas</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Brand Options */}
      {brandOptions && brandOptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose Your Brand Name</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brandOptions.map((brand, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectBrand(brand.name)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      project.step2_selected_brand === brand.name
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{brand.name}</span>
                      {project.step2_selected_brand === brand.name && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {brand.handles.map((handle, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {handle}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Logo Prompts */}
      {project.step2_selected_brand && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logo Prompt Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Symbol style</label>
                <Select value={symbolStyle} onValueChange={setSymbolStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SYMBOL_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color direction</label>
                <Input
                  placeholder="e.g. dark blue, minimal white"
                  value={colorDirection}
                  onChange={(e) => setColorDirection(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleGenerateLogoPrompts} disabled={loadingLogo} className="w-full gap-2">
              {loadingLogo ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Logo Prompts</>
              )}
            </Button>

            {logoPrompts && (
              <div className="space-y-3 mt-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Monogram Logo Prompt</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(logoPrompts.monogram_prompt, "Prompt")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{logoPrompts.monogram_prompt}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Symbol Logo Prompt</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(logoPrompts.symbol_prompt, "Prompt")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{logoPrompts.symbol_prompt}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Social Setup */}
      {project.step2_selected_brand && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Instagram className="w-5 h-5" />
              Social Profile Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateSocial} disabled={loadingSocial} className="w-full gap-2">
              {loadingSocial ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Bios & Warming Plan</>
              )}
            </Button>

            {socialBios && (
              <div className="space-y-3">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Instagram Bio</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(socialBios.instagram_bio, "Bio")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-line">{socialBios.instagram_bio}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">TikTok Bio</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(socialBios.tiktok_bio, "Bio")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-line">{socialBios.tiktok_bio}</p>
                </div>
              </div>
            )}

            {warmingPlan && (
              <div className="mt-4">
                <h4 className="font-medium mb-3">3-Day Account Warming Plan</h4>
                <div className="space-y-2">
                  {warmingPlan.map((day, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg border transition-all ${
                        day.completed ? "bg-green-500/10 border-green-500/30" : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={day.completed || false}
                          onCheckedChange={() => toggleWarmingDay(i)}
                        />
                        <div className="flex-1">
                          <span className="font-medium">Day {day.day}</span>
                          <p className="text-sm text-muted-foreground">
                            {day.scroll_time} scrolling • {day.likes} likes • {day.comments} comments • {day.follows} follows
                          </p>
                        </div>
                        {day.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      {project.step2_selected_brand && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your brand:</p>
                <p className="font-bold text-lg">{project.step2_selected_brand}</p>
              </div>
              <Button onClick={onNext} className="ml-auto gap-2">
                Continue to Product
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
