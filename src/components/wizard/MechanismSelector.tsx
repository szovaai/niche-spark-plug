import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Sparkles, Loader2, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Mechanism } from "@/types/launchWizard";

const FORMULA_COLORS: Record<string, string> = {
  "Number": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Timeframe": "bg-green-500/10 text-green-400 border-green-500/20",
  "Acronym": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Metaphor": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Insider": "bg-red-500/10 text-red-400 border-red-500/20",
  "Transformation": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Contrarian": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Simple": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

interface Props {
  mechanisms: Mechanism[];
  selectedMechanism: string;
  onSelect: (mechanism: Mechanism) => void;
  niche?: string;
  targetAudience?: string;
  productType?: string;
  topic?: string;
}

export default function MechanismSelector({ mechanisms, selectedMechanism, onSelect, niche, targetAudience, productType, topic }: Props) {
  const [regenerating, setRegenerating] = useState(false);
  const [mechs, setMechs] = useState<Mechanism[]>(mechanisms);

  if (!mechs?.length) return null;

  const regenerate = async () => {
    if (!niche) return;
    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-product", {
        body: { niche, targetAudience, productType, topic },
      });
      if (error) throw error;
      if (data.mechanisms?.length) {
        setMechs(data.mechanisms);
        toast.success("Fresh mechanisms generated!");
      }
    } catch {
      toast.error("Failed to generate more");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <h4 className="font-semibold text-sm">Choose Your Unique Mechanism</h4>
        </div>
        {niche && (
          <Button variant="ghost" size="sm" onClick={regenerate} disabled={regenerating} className="text-xs gap-1">
            {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Generate More
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Your unique mechanism is the proprietary framework that makes your product different. It will be woven into all your copy.
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {mechs.map((mech) => {
          const isSelected = selectedMechanism === mech.name || selectedMechanism?.startsWith(mech.name);
          const formulaStyle = mech.formula ? FORMULA_COLORS[mech.formula] || "" : "";
          return (
            <Card
              key={mech.name}
              className={`cursor-pointer transition-all hover:border-accent/40 ${
                isSelected ? "border-accent bg-accent/5 ring-1 ring-accent/30" : ""
              }`}
              onClick={() => onSelect(mech)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  {mech.formula ? (
                    <Badge variant="outline" className={`text-[10px] ${formulaStyle}`}>
                      {mech.formula}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] bg-accent/20 text-accent-foreground">
                      Framework
                    </Badge>
                  )}
                  {isSelected && <Check className="w-4 h-4 text-accent" />}
                </div>
                <p className="text-sm font-bold">{mech.name}</p>
                <p className="text-xs text-primary italic">{mech.tagline}</p>
                <p className="text-xs text-muted-foreground">{mech.description}</p>
                {mech.whyItWorks && (
                  <p className="text-[11px] text-accent/80 pt-1 border-t border-border/50">
                    💡 {mech.whyItWorks}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
