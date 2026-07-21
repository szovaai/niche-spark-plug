import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, Gift, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useBlueprint } from "@/hooks/useBlueprint";
import { toast } from "sonner";

type Tier = { tier: string; price: number; reasoning: string; best_for: string };
type Bonus = { name: string; value: string; reason: string };
type Add = { name: string; price: number; pitch: string };

type Offer = {
  headline_offer: string;
  core_promise: string;
  price_options: Tier[];
  recommended_price: number;
  bonuses: Bonus[];
  order_bump: Add;
  upsell: Add;
  downsell: Add;
  guarantee: string;
  risk_reversal: string;
  stack_summary: string;
};

export function OfferArchitectEngine({ projectId }: { projectId: string }) {
  const { blueprint, save } = useBlueprint(projectId);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [chosenTier, setChosenTier] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("nova_tasks")
        .select("output_json")
        .eq("project_id", projectId)
        .eq("task_name", "offer_architecture")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);
      const out = data?.[0]?.output_json as Offer | null;
      if (out) {
        setOffer(out);
        const match = out.price_options.find((p) => p.price === out.recommended_price);
        setChosenTier(match?.tier ?? out.price_options[0]?.tier ?? null);
      }
      setLoading(false);
    })();
  }, [projectId]);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-offer-architecture", {
        body: { project_id: projectId },
      });
      if (error) throw error;
      const out = data as Offer;
      setOffer(out);
      setChosenTier(out.price_options.find((p) => p.price === out.recommended_price)?.tier ?? null);
      toast.success("Offer architecture drafted.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't draft the offer. Try again.");
    } finally {
      setRunning(false);
    }
  };

  const lockIn = async () => {
    if (!offer) return;
    const tier = offer.price_options.find((p) => p.tier === chosenTier) ?? offer.price_options[0];
    await save({
      price: tier.price,
      order_bump: `${offer.order_bump.name} — $${offer.order_bump.price}`,
      upsell: `${offer.upsell.name} — $${offer.upsell.price}`,
      downsell: `${offer.downsell.name} — $${offer.downsell.price}`,
      offer_summary: offer.stack_summary,
    });
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (uid) {
      const rows = ["pricing_decided", "approve_offer"].map((key) => ({
        project_id: projectId,
        user_id: uid,
        mission_id: "m5",
        task_key: key,
        label: key,
        status: "done",
        approved_at: new Date().toISOString(),
      }));
      await supabase.from("mission_tasks").upsert(rows as never, { onConflict: "project_id,mission_id,task_key" });
      await supabase.from("mission_progress").upsert(
        { project_id: projectId, user_id: uid, mission_id: "m5", status: "complete", progress_pct: 100, completed_at: new Date().toISOString() } as never,
        { onConflict: "project_id,mission_id" },
      );
    }
    toast.success(`Offer locked at $${tier.price}.`);
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  if (!blueprint?.product_concept) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Finish Mission 3 first — Nova needs a product concept before architecting the offer.
        </CardContent>
      </Card>
    );
  }

  if (!offer) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <TrendingUp className="mx-auto h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-medium">No offer drafted yet</div>
            <p className="text-xs text-muted-foreground">Costs 2 credits. Nova returns 3 price tiers, bonuses, bumps, and guarantee.</p>
          </div>
          <Button onClick={run} disabled={running}>
            {running ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Architecting…</> : <><Sparkles className="mr-1 h-4 w-4" /> Draft the offer</>}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base">{offer.headline_offer}</CardTitle>
              <p className="text-xs text-muted-foreground">{offer.core_promise}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={run} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-draft (2)"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{offer.stack_summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-2 md:grid-cols-3">
        {offer.price_options.map((tier) => {
          const isChosen = chosenTier === tier.tier;
          const isRec = tier.price === offer.recommended_price;
          return (
            <Card
              key={tier.tier}
              onClick={() => setChosenTier(tier.tier)}
              className={`cursor-pointer transition-colors ${isChosen ? "border-primary/50 bg-primary/[0.04]" : "border-border/30 hover:border-border/50"}`}
            >
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide">{tier.tier}</span>
                  {isRec && <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[10px]">Recommended</Badge>}
                </div>
                <div className="text-2xl font-semibold">${tier.price}</div>
                <p className="text-xs text-muted-foreground">{tier.reasoning}</p>
                <div className="text-[11px] text-muted-foreground/80">Best for: {tier.best_for}</div>
                {isChosen && (
                  <div className="flex items-center gap-1 pt-1 text-[11px] text-primary">
                    <CheckCircle2 className="h-3 w-3" /> Selected
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm"><Gift className="h-4 w-4 text-primary" /> Bonuses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {offer.bonuses.map((b, i) => (
            <div key={i} className="rounded-md border border-border/30 bg-background/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium">{b.name}</div>
                <Badge variant="outline" className="text-[10px]">{b.value}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{b.reason}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-2 md:grid-cols-3">
        {(["order_bump", "upsell", "downsell"] as const).map((k) => {
          const item = offer[k];
          const labels = { order_bump: "Order bump", upsell: "Upsell", downsell: "Downsell" } as const;
          return (
            <Card key={k} className="border-border/30">
              <CardContent className="space-y-1 p-4">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{labels[k]}</div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-primary">${item.price}</div>
                <p className="text-xs text-muted-foreground">{item.pitch}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/30">
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Shield className="h-4 w-4 text-primary" /> Guarantee</div>
          <p className="text-xs text-muted-foreground">{offer.guarantee}</p>
          <p className="text-xs text-muted-foreground italic">{offer.risk_reversal}</p>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={lockIn}>
        Lock in offer at ${offer.price_options.find((p) => p.tier === chosenTier)?.price ?? offer.recommended_price}
      </Button>
    </div>
  );
}
