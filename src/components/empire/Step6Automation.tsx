import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Rocket, Sparkles, Loader2, Check, ChevronRight, 
  Calendar, Target, Megaphone, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmpireProject, SchedulePlan, EngagementItem, AdAngle, ViralIdea, ProductPack } from "@/types/empire";

interface Step6AutomationProps {
  project: Partial<EmpireProject>;
  onUpdate: (updates: Partial<EmpireProject>) => void;
  onNext: () => void;
}

const DEFAULT_ENGAGEMENT: EngagementItem[] = [
  { id: "1", task: "Scroll niche content", target: "15-20 minutes" },
  { id: "2", task: "Like relevant posts", target: "~30 posts" },
  { id: "3", task: "Leave genuine comments", target: "5-10 comments" },
  { id: "4", task: "Follow similar accounts", target: "5-10 accounts" },
];

export const Step6Automation = ({ project, onUpdate, onNext }: Step6AutomationProps) => {
  const { toast } = useToast();
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const productBrief = project.step3_product_brief as ProductPack | null;
  const viralIdeas = project.step5_viral_ideas as ViralIdea[] | null;
  const schedulePlan = project.step6_schedule_plan as SchedulePlan | null;
  const engagementChecklist = (project.step6_engagement_checklist as EngagementItem[] | null) || DEFAULT_ENGAGEMENT;
  const adAngles = project.step6_ad_angles as AdAngle[] | null;

  const handleGenerateSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-content", {
        body: { 
          type: "schedule",
          daysPerWeek,
        },
      });

      if (error) throw error;

      onUpdate({ 
        step6_schedule_plan: data,
        step6_engagement_checklist: DEFAULT_ENGAGEMENT,
      });
      toast({ title: "Schedule plan created!" });
    } catch (error: any) {
      console.error("Schedule generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleGenerateAds = async () => {
    if (!viralIdeas || viralIdeas.length === 0) {
      toast({
        title: "Generate content ideas first",
        description: "Go to Step 5 and create your content topics.",
        variant: "destructive",
      });
      return;
    }

    setLoadingAds(true);
    try {
      const topics = viralIdeas.map(i => i.topic);
      
      const { data, error } = await supabase.functions.invoke("empire-generate-content", {
        body: { 
          type: "ads",
          topics,
          productName: productBrief?.product_name || project.step2_selected_brand,
        },
      });

      if (error) throw error;

      // Add IDs to ad angles
      const adsWithIds = data.map((ad: any, i: number) => ({
        ...ad,
        id: `ad-${i}`,
      }));

      onUpdate({ step6_ad_angles: adsWithIds });
      toast({ title: "Ad angles generated!" });
    } catch (error: any) {
      console.error("Ads generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingAds(false);
    }
  };

  const toggleEngagement = (itemId: string) => {
    const updated = engagementChecklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdate({ step6_engagement_checklist: updated });
  };

  const completedEngagement = engagementChecklist.filter(i => i.completed).length;

  return (
    <div className="space-y-6">
      {/* Schedule Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Posting Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-4 block">
              How many days per week can you post?
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[daysPerWeek]}
                onValueChange={([v]) => setDaysPerWeek(v)}
                min={3}
                max={7}
                step={1}
                className="flex-1"
              />
              <Badge variant="secondary" className="text-lg px-3">
                {daysPerWeek} days
              </Badge>
            </div>
          </div>

          <Button onClick={handleGenerateSchedule} disabled={loadingSchedule} className="w-full gap-2">
            {loadingSchedule ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating plan...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Schedule Plan</>
            )}
          </Button>

          {schedulePlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-secondary/50 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly output</p>
                  <p className="text-2xl font-bold">{schedulePlan.weekly_total} videos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Per day</p>
                  <p className="text-lg font-medium">{schedulePlan.videos_per_day} videos</p>
                </div>
              </div>
              <p className="text-sm">{schedulePlan.summary}</p>
              <ul className="text-sm space-y-1">
                {schedulePlan.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Daily Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            Daily Engagement Checklist
            <Badge variant="outline" className="ml-auto">
              {completedEngagement}/{engagementChecklist.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Complete these daily to keep your account healthy and algorithm-friendly.
          </p>
          <div className="space-y-2">
            {engagementChecklist.map((item) => (
              <div 
                key={item.id}
                className={`p-3 rounded-lg border transition-all ${
                  item.completed ? "bg-green-500/10 border-green-500/30" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={item.completed || false}
                    onCheckedChange={() => toggleEngagement(item.id)}
                  />
                  <div className="flex-1">
                    <span className="font-medium">{item.task}</span>
                    <p className="text-sm text-muted-foreground">{item.target}</p>
                  </div>
                  {item.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ad Scaling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="w-5 h-5 text-primary" />
            Ad Scaling Prep
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate ad angles from your best content ideas for TikTok/IG ads when you're ready to scale.
          </p>

          <Button onClick={handleGenerateAds} disabled={loadingAds} className="w-full gap-2">
            {loadingAds ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Ad Angles</>
            )}
          </Button>

          {adAngles && adAngles.length > 0 && (
            <div className="grid gap-3 mt-4">
              {adAngles.map((ad) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{ad.angle_name}</Badge>
                  </div>
                  <p className="font-medium text-sm mb-1">🎯 {ad.hook}</p>
                  <p className="text-sm text-muted-foreground">✨ {ad.benefit}</p>
                  <p className="text-sm text-green-400 mt-2">📣 {ad.cta}</p>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete */}
      {schedulePlan && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-primary/10">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text">Empire Blueprint Complete! 🎉</h3>
                <p className="text-muted-foreground mt-1">
                  You now have everything you need to launch your AI-driven digital product business.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">✓ Niche validated</Badge>
                <Badge variant="outline">✓ Brand created</Badge>
                <Badge variant="outline">✓ Product designed</Badge>
                <Badge variant="outline">✓ Gumroad ready</Badge>
                <Badge variant="outline">✓ Content system</Badge>
                <Badge variant="outline">✓ Scale plan</Badge>
              </div>
              <Button size="lg" className="gap-2" onClick={() => toast({ title: "Time to launch! 🚀" })}>
                <Rocket className="w-5 h-5" />
                Start Building Your Empire
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
