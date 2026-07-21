import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useBlueprint } from "@/hooks/useBlueprint";
import { toast } from "sonner";

type Opportunity = {
  niche: string;
  audience: string;
  problem: string;
  product_idea: string;
  why_now: string;
  monetization: string;
  demand_score: number;
  competition_score: number;
  fit_score: number;
  monetization_score: number;
  evidence: string[];
};

export function OpportunityEngine({
  projectId,
  onSelect,
}: {
  projectId: string;
  onSelect?: () => void;
}) {
  const { blueprint, save } = useBlueprint(projectId);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(blueprint?.niche ?? null);
  }, [blueprint?.niche]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("nova_tasks")
        .select("output_json")
        .eq("project_id", projectId)
        .eq("task_name", "opportunity_shortlist")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);
      const out = data?.[0]?.output_json as { opportunities?: Opportunity[] } | null;
      setItems(out?.opportunities ?? []);
      setLoading(false);
    })();
  }, [projectId]);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-opportunities", {
        body: { project_id: projectId },
      });
      if (error) throw error;
      const opps = (data as { opportunities?: Opportunity[] })?.opportunities ?? [];
      setItems(opps);
      toast.success(`Nova found ${opps.length} opportunities.`);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate opportunities. Try again.");
    } finally {
      setRunning(false);
    }
  };

  const pick = async (opp: Opportunity) => {
    setSelected(opp.niche);
    await save({
      niche: opp.niche,
      target_audience: opp.audience,
      customer_problem: opp.problem,
      product_concept: opp.product_idea,
    });
    // Mark tasks
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (uid) {
      await supabase.from("mission_tasks").upsert(
        [
          {
            project_id: projectId,
            user_id: uid,
            mission_id: "m1",
            task_key: "review_shortlist",
            label: "Review Nova's shortlist",
            status: "done",
            approved_at: new Date().toISOString(),
          },
          {
            project_id: projectId,
            user_id: uid,
            mission_id: "m1",
            task_key: "select_opportunity",
            label: "Select one opportunity to pursue",
            status: "done",
            approved_at: new Date().toISOString(),
          },
        ] as never,
        { onConflict: "project_id,mission_id,task_key" },
      );
      await supabase.from("mission_progress").upsert(
        {
          project_id: projectId,
          user_id: uid,
          mission_id: "m1",
          status: "complete",
          progress_pct: 100,
          completed_at: new Date().toISOString(),
        } as never,
        { onConflict: "project_id,mission_id" },
      );
    }
    toast.success(`Locked in: ${opp.niche}`);
    onSelect?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-medium">Nova hasn't researched yet</div>
            <p className="text-xs text-muted-foreground">
              Costs 2 credits. Nova returns 4 tailored niches based on your founder profile.
            </p>
          </div>
          <Button onClick={run} disabled={running}>
            {running ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Researching…
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-4 w-4" /> Run opportunity research
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Nova's shortlist</div>
        <Button variant="ghost" size="sm" onClick={run} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-run (2 credits)"}
        </Button>
      </div>
      {items.map((opp) => {
        const isSelected = selected === opp.niche;
        return (
          <Card
            key={opp.niche}
            className={isSelected ? "border-primary/40 bg-primary/[0.04]" : "border-border/30"}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm">{opp.niche}</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">{opp.audience}</p>
                </div>
                {isSelected && (
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/20">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="font-medium text-foreground/80">Problem:</span>{" "}
                <span className="text-muted-foreground">{opp.problem}</span>
              </div>
              <div>
                <span className="font-medium text-foreground/80">First product:</span>{" "}
                <span className="text-muted-foreground">{opp.product_idea}</span>
              </div>
              <div>
                <span className="font-medium text-foreground/80">Why now:</span>{" "}
                <span className="text-muted-foreground">{opp.why_now}</span>
              </div>
              <div>
                <span className="font-medium text-foreground/80">Monetization:</span>{" "}
                <span className="text-muted-foreground">{opp.monetization}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {(
                  [
                    ["Demand", opp.demand_score],
                    ["Open", opp.competition_score],
                    ["Fit", opp.fit_score],
                    ["Monetize", opp.monetization_score],
                  ] as const
                ).map(([label, val]) => (
                  <div key={label}>
                    <div className="mb-0.5 text-[10px] uppercase text-muted-foreground/70">{label}</div>
                    <Progress value={val} className="h-1" />
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{val}</div>
                  </div>
                ))}
              </div>
              {opp.evidence.length > 0 && (
                <div className="border-t border-border/20 pt-2">
                  <div className="mb-1 text-[10px] uppercase text-muted-foreground/70">Evidence</div>
                  <ul className="list-disc pl-4 text-muted-foreground">
                    {opp.evidence.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-1">
                <Button
                  size="sm"
                  variant={isSelected ? "outline" : "default"}
                  className="w-full"
                  onClick={() => pick(opp)}
                >
                  {isSelected ? "Locked in" : "Pick this opportunity"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
