import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BuyerAvatar } from "@/types/launchWizard";

interface Props {
  niche: string;
  targetAudience: string;
  topic: string;
  avatar: BuyerAvatar | null;
  setAvatar: (v: BuyerAvatar | null) => void;
}

export default function AvatarBuilder({ niche, targetAudience, topic, avatar, setAvatar }: Props) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const generate = async () => {
    if (!niche.trim()) { toast.error("Enter a niche first"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-buyer-avatar", {
        body: { niche, targetAudience, topic },
      });
      if (error) throw error;
      setAvatar(data);
      setExpanded(true);
      toast.success(`Meet ${data.personaName}! Your ideal buyer avatar is ready.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate avatar");
    } finally {
      setLoading(false);
    }
  };

  if (!avatar) {
    return (
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="font-bold">Who Are You Selling To?</h3>
            <Badge variant="outline" className="text-xs">Optional</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Products built with a defined buyer avatar convert 3x better. The AI will create a hyper-specific persona so all copy speaks directly to your ideal customer.
          </p>
          <Button onClick={generate} disabled={loading || !niche.trim()} variant="outline" className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Buyer Avatar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-sm">Writing for: <span className="text-accent">{avatar.personaName}</span></h3>
            <Badge variant="secondary" className="text-xs">{avatar.occupation}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="gap-1 text-xs">
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? "Collapse" : "Details"}
            </Button>
            <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="text-xs gap-1">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Regenerate
            </Button>
          </div>
        </div>

        {!expanded && (
          <p className="text-xs text-muted-foreground italic">"{avatar.instantBuySentence}"</p>
        )}

        {expanded && (
          <div className="space-y-4 pt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Daily Frustration</p>
                <p className="text-sm">{avatar.dailyFrustration}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">What They've Tried</p>
                <p className="text-sm">{avatar.triedBefore}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Secret Dream</p>
                <p className="text-sm">{avatar.secretDream}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Biggest Fear</p>
                <p className="text-sm">{avatar.biggestFear}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Emotional State</p>
              <p className="text-sm">{avatar.emotionalState}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Pain Points (in their words)</p>
              <div className="flex flex-wrap gap-1.5">
                {avatar.painPoints?.map((p, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Top Desires</p>
              <div className="flex flex-wrap gap-1.5">
                {avatar.desires?.map((d, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Words They Use</p>
              <div className="flex flex-wrap gap-1.5">
                {avatar.languageTheyUse?.map((w, i) => (
                  <Badge key={i} variant="outline" className="text-xs italic">"{w}"</Badge>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Day in Their Life</p>
              <p className="text-sm text-muted-foreground italic">{avatar.dayInTheLife}</p>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">💡 The ONE Sentence That Makes Them Buy</p>
              <p className="text-sm font-medium">"{avatar.instantBuySentence}"</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
