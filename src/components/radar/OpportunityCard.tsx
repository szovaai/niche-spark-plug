import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Wand2, Copy, Flame } from "lucide-react";

export interface RadarOpportunity {
  id?: string;
  title: string;
  niche?: string;
  score: number;
  demand?: number;
  pain?: number;
  competition?: number;
  emotion?: number;
  ad_potential?: number;
  upsell?: number;
  hooks?: string[];
  suggested_price?: number;
  platform?: string;
  payload?: any;
}

const scoreColor = (s: number) => {
  if (s >= 90) return "text-green-400 border-green-500/40 bg-green-500/10";
  if (s >= 75) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
  if (s >= 60) return "text-yellow-400 border-yellow-500/40 bg-yellow-500/10";
  return "text-red-400 border-red-500/40 bg-red-500/10";
};

const Metric = ({ label, value }: { label: string; value?: number }) => (
  <div className="flex flex-col items-center">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</div>
    <div className="text-sm font-bold text-foreground">{value ?? "—"}</div>
  </div>
);

interface Props {
  opp: RadarOpportunity;
  onView: () => void;
  onBuild: () => void;
  onClone: () => void;
}

export function OpportunityCard({ opp, onView, onBuild, onClone }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="relative overflow-hidden h-full">
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight text-foreground line-clamp-2">{opp.title}</h3>
              {opp.niche && (
                <Badge variant="outline" className="mt-1.5 text-[10px] capitalize border-border/40">
                  {opp.niche}
                </Badge>
              )}
            </div>
            <div className={`shrink-0 rounded-xl border-2 px-2.5 py-1.5 text-center ${scoreColor(opp.score)}`}>
              <div className="text-[9px] uppercase tracking-wider opacity-80">Score</div>
              <div className="text-xl font-black leading-none">{opp.score}</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5 py-2 px-2 rounded-lg bg-secondary/30 border border-border/20">
            <Metric label="Demand" value={opp.demand} />
            <Metric label="Comp" value={opp.competition} />
            <Metric label="Ads" value={opp.ad_potential} />
            <Metric label="Emotion" value={opp.emotion} />
            <Metric label="Upsell" value={opp.upsell} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {opp.platform && (
              <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{opp.platform}</Badge>
            )}
            {opp.suggested_price && (
              <Badge variant="outline" className="text-[10px] border-border/40">
                ${opp.suggested_price}
              </Badge>
            )}
            {opp.score >= 85 && (
              <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-[10px] gap-1">
                <Flame className="h-2.5 w-2.5" /> Hot
              </Badge>
            )}
          </div>

          <div className="flex gap-1.5 mt-auto pt-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={onView}>
              <Eye className="h-3 w-3" /> View
            </Button>
            <Button size="sm" variant="hero" className="flex-1 text-xs gap-1" onClick={onBuild}>
              <Wand2 className="h-3 w-3" /> Build
            </Button>
            <Button size="sm" variant="ghost" className="text-xs gap-1 px-2" onClick={onClone}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
