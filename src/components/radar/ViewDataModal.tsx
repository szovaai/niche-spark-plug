import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wand2, TrendingUp, Flame, DollarSign, Users, Lightbulb } from "lucide-react";
import { RadarOpportunity } from "./OpportunityCard";

interface Props {
  opp: RadarOpportunity | null;
  open: boolean;
  onClose: () => void;
  onBuild: () => void;
}

export function ViewDataModal({ opp, open, onClose, onBuild }: Props) {
  if (!opp) return null;
  const p = opp.payload || {};
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            {opp.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border/30 bg-secondary/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" /> Demand
              </div>
              <div className="text-2xl font-bold">{opp.demand}/10</div>
              {p.trend_velocity && <div className="text-[11px] text-primary mt-0.5">{p.trend_velocity}</div>}
            </div>
            <div className="rounded-lg border border-border/30 bg-secondary/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Flame className="h-3 w-3" /> Pain
              </div>
              <div className="text-2xl font-bold">{opp.pain}/10</div>
            </div>
            <div className="rounded-lg border border-border/30 bg-secondary/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Users className="h-3 w-3" /> Competition
              </div>
              <div className="text-2xl font-bold">{opp.competition}/10</div>
            </div>
          </div>

          {p.pain_analysis && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-foreground">Why people buy</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.pain_analysis}</p>
            </div>
          )}

          {p.target_audience && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Target Audience
              </h4>
              <p className="text-sm text-muted-foreground">{p.target_audience}</p>
            </div>
          )}

          {opp.hooks && opp.hooks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" /> Ad Hooks
              </h4>
              <ul className="space-y-1.5">
                {opp.hooks.map((h, i) => (
                  <li key={i} className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3">
                    "{h}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/30 bg-secondary/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <DollarSign className="h-3 w-3" /> Suggested Price
              </div>
              <div className="text-2xl font-bold text-primary">${opp.suggested_price}</div>
            </div>
            <div className="rounded-lg border border-border/30 bg-secondary/20 p-3">
              <div className="text-xs text-muted-foreground mb-1">Best Platform</div>
              <Badge className="bg-primary/15 text-primary border-primary/30 text-base px-3 py-1 mt-1">
                {opp.platform}
              </Badge>
            </div>
          </div>

          {p.upsell_ideas && p.upsell_ideas.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-foreground">Upsell Ideas</h4>
              <ul className="space-y-1">
                {p.upsell_ideas.map((u: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground">→ {u}</li>
                ))}
              </ul>
            </div>
          )}

          <Button variant="hero" size="lg" className="w-full gap-2" onClick={onBuild}>
            <Wand2 className="h-4 w-4" /> Build This Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
