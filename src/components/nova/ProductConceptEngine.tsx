import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useBlueprint } from "@/hooks/useBlueprint";
import { toast } from "sonner";

type Concept = {
  name: string;
  format: string;
  promise: string;
  contents: string[];
  transformation: string;
  time_to_result: string;
  why_this_wins: string;
  price_range: string;
  effort_score: number;
  demand_fit_score: number;
};

export function ProductConceptEngine({ projectId }: { projectId: string }) {
  const { blueprint, save } = useBlueprint(projectId);
  const [items, setItems] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(blueprint?.product_concept ?? null);
  }, [blueprint?.product_concept]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("nova_tasks")
        .select("output_json")
        .eq("project_id", projectId)
        .eq("task_name", "product_concepts")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);
      const out = data?.[0]?.output_json as { concepts?: Concept[] } | null;
      setItems(out?.concepts ?? []);
      setLoading(false);
    })();
  }, [projectId]);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-concepts", {
        body: { project_id: projectId },
      });
      if (error) throw error;
      setItems((data as { concepts?: Concept[] })?.concepts ?? []);
      toast.success("Nova drafted 3 concepts.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate concepts. Try again.");
    } finally {
      setRunning(false);
    }
  };

  const pick = async (c: Concept) => {
    setSelected(c.name);
    await save({
      product_concept: c.name,
      product_promise: c.promise,
    });
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (uid) {
      await supabase.from("mission_tasks").upsert(
        [
          { project_id: projectId, user_id: uid, mission_id: "m3", task_key: "compare_concepts", label: "Compare and discuss with Nova", status: "done", approved_at: new Date().toISOString() },
          { project_id: projectId, user_id: uid, mission_id: "m3", task_key: "approve_brief", label: "Approve the Product Brief", status: "done", approved_at: new Date().toISOString() },
        ] as never,
        { onConflict: "project_id,mission_id,task_key" },
      );
      await supabase.from("mission_progress").upsert(
        { project_id: projectId, user_id: uid, mission_id: "m3", status: "complete", progress_pct: 100, completed_at: new Date().toISOString() } as never,
        { onConflict: "project_id,mission_id" },
      );
    }
    toast.success(`Locked in: ${c.name}`);
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <Package className="mx-auto h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-medium">Nova hasn't drafted concepts yet</div>
            <p className="text-xs text-muted-foreground">Costs 2 credits. Nova returns 3 distinct product options.</p>
          </div>
          <Button onClick={run} disabled={running}>
            {running ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Drafting…</> : <><Sparkles className="mr-1 h-4 w-4" /> Draft 3 concepts</>}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Product concepts</div>
        <Button variant="ghost" size="sm" onClick={run} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-draft (2 credits)"}
        </Button>
      </div>
      {items.map((c) => {
        const isSelected = selected === c.name;
        return (
          <Card key={c.name} className={isSelected ? "border-primary/40 bg-primary/[0.04]" : "border-border/30"}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-sm">{c.name}</CardTitle>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{c.format}</Badge>
                    <Badge variant="outline" className="text-[10px]">{c.price_range}</Badge>
                    <Badge variant="outline" className="text-[10px]">{c.time_to_result}</Badge>
                  </div>
                </div>
                {isSelected && (
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/20">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground">{c.promise}</p>
              <div>
                <div className="mb-1 text-[10px] uppercase text-muted-foreground/70">What's inside</div>
                <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                  {c.contents.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
              <div>
                <span className="font-medium text-foreground/80">Transformation:</span>{" "}
                <span className="text-muted-foreground">{c.transformation}</span>
              </div>
              <div>
                <span className="font-medium text-foreground/80">Why it wins:</span>{" "}
                <span className="text-muted-foreground">{c.why_this_wins}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="mb-0.5 text-[10px] uppercase text-muted-foreground/70">Fast to ship</div>
                  <Progress value={c.effort_score} className="h-1" />
                </div>
                <div>
                  <div className="mb-0.5 text-[10px] uppercase text-muted-foreground/70">Demand fit</div>
                  <Progress value={c.demand_fit_score} className="h-1" />
                </div>
              </div>
              <Button size="sm" variant={isSelected ? "outline" : "default"} className="w-full" onClick={() => pick(c)}>
                {isSelected ? "Locked in" : "Pick this concept"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
