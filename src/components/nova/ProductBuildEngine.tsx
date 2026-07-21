import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, ChevronDown, ChevronRight, Wand2, BookOpen } from "lucide-react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useBlueprint } from "@/hooks/useBlueprint";
import { toast } from "sonner";

type Section = { title: string; summary: string; html?: string; approved?: boolean };
type Module = { title: string; purpose: string; sections: Section[] };
type Outline = {
  product_name: string;
  subtitle: string;
  format: string;
  outcome: string;
  modules: Module[];
};

const STORAGE_KEY = (projectId: string) => `pz.outline.${projectId}`;

export function ProductBuildEngine({ projectId }: { projectId: string }) {
  const { blueprint } = useBlueprint(projectId);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [drafting, setDrafting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Load latest outline from nova_tasks + any drafts from local mirror
      const { data } = await supabase
        .from("nova_tasks")
        .select("output_json")
        .eq("project_id", projectId)
        .eq("task_name", "product_outline")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);
      const remote = data?.[0]?.output_json as Outline | null;
      const localRaw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY(projectId)) : null;
      const local = localRaw ? (JSON.parse(localRaw) as Outline) : null;
      // Prefer local (has drafts) if same product name
      setOutline(local && remote && local.product_name === remote.product_name ? local : (remote ?? null));
      setLoading(false);
    })();
  }, [projectId]);

  useEffect(() => {
    if (outline && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(outline));
    }
  }, [outline, projectId]);

  const generate = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-outline", {
        body: { project_id: projectId },
      });
      if (error) throw error;
      setOutline(data as Outline);
      setExpanded(0);
      toast.success("Outline drafted. Review and start writing sections.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate outline. Try again.");
    } finally {
      setRunning(false);
    }
  };

  const draftSection = async (mIdx: number, sIdx: number) => {
    if (!outline) return;
    const mod = outline.modules[mIdx];
    const sec = mod.sections[sIdx];
    const key = `${mIdx}:${sIdx}`;
    setDrafting(key);
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-section", {
        body: {
          project_id: projectId,
          module_title: mod.title,
          section_title: sec.title,
          section_summary: sec.summary,
        },
      });
      if (error) throw error;
      const next = structuredClone(outline);
      next.modules[mIdx].sections[sIdx].html = (data as { html: string }).html;
      setOutline(next);
      toast.success("Section drafted.");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't draft that section.");
    } finally {
      setDrafting(null);
    }
  };

  const approveSection = (mIdx: number, sIdx: number) => {
    if (!outline) return;
    const next = structuredClone(outline);
    next.modules[mIdx].sections[sIdx].approved = !next.modules[mIdx].sections[sIdx].approved;
    setOutline(next);
  };

  const approveOutline = async () => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return;
    await supabase.from("mission_tasks").upsert(
      {
        project_id: projectId,
        user_id: uid,
        mission_id: "m4",
        task_key: "outline_approved",
        label: "Approve the outline",
        status: "done",
        approved_at: new Date().toISOString(),
      } as never,
      { onConflict: "project_id,mission_id,task_key" },
    );
    toast.success("Outline approved.");
  };

  const markComplete = async () => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return;
    const rows = ["draft_sections", "final_polish", "export_ready"].map((key) => ({
      project_id: projectId,
      user_id: uid,
      mission_id: "m4",
      task_key: key,
      label: key,
      status: "done",
      approved_at: new Date().toISOString(),
    }));
    await supabase.from("mission_tasks").upsert(rows as never, { onConflict: "project_id,mission_id,task_key" });
    await supabase.from("mission_progress").upsert(
      { project_id: projectId, user_id: uid, mission_id: "m4", status: "complete", progress_pct: 100, completed_at: new Date().toISOString() } as never,
      { onConflict: "project_id,mission_id" },
    );
    toast.success("Product build marked complete.");
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  if (!blueprint?.product_concept) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Pick a product concept in Mission 3 first — Nova needs one to build against.
        </CardContent>
      </Card>
    );
  }

  if (!outline) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <BookOpen className="mx-auto h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-medium">No outline yet</div>
            <p className="text-xs text-muted-foreground">Costs 2 credits. Nova drafts a full module + section outline.</p>
          </div>
          <Button onClick={generate} disabled={running}>
            {running ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Drafting outline…</> : <><Sparkles className="mr-1 h-4 w-4" /> Draft outline</>}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalSections = outline.modules.reduce((n, m) => n + m.sections.length, 0);
  const draftedCount = outline.modules.reduce(
    (n, m) => n + m.sections.filter((s) => s.html).length,
    0,
  );
  const approvedCount = outline.modules.reduce(
    (n, m) => n + m.sections.filter((s) => s.approved).length,
    0,
  );
  const draftedPct = totalSections ? Math.round((draftedCount / totalSections) * 100) : 0;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-base">{outline.product_name}</CardTitle>
              <p className="text-xs text-muted-foreground">{outline.subtitle}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{outline.format}</Badge>
                <Badge variant="outline" className="text-[10px]">{outline.modules.length} modules</Badge>
                <Badge variant="outline" className="text-[10px]">{totalSections} sections</Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={generate} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-draft (2)"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{outline.outcome}</p>
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Sections drafted</span>
              <span>{draftedCount}/{totalSections} · {approvedCount} approved</span>
            </div>
            <Progress value={draftedPct} className="h-1.5" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={approveOutline}>Approve outline</Button>
            <Button size="sm" onClick={markComplete} disabled={draftedCount < totalSections}>
              Mark product build complete
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {outline.modules.map((m, mIdx) => {
          const isOpen = expanded === mIdx;
          const modDrafted = m.sections.filter((s) => s.html).length;
          return (
            <Card key={mIdx} className="border-border/30">
              <button
                onClick={() => setExpanded(isOpen ? null : mIdx)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">Module {mIdx + 1}. {m.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.purpose}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{modDrafted}/{m.sections.length}</span>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {isOpen && (
                <CardContent className="space-y-2 border-t border-border/20 pt-3">
                  {m.sections.map((s, sIdx) => {
                    const key = `${mIdx}:${sIdx}`;
                    const isDrafting = drafting === key;
                    return (
                      <div key={sIdx} className="rounded-md border border-border/30 bg-background/40 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{s.title}</div>
                            <p className="text-xs text-muted-foreground">{s.summary}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            {s.html && (
                              <Button
                                size="sm"
                                variant={s.approved ? "default" : "outline"}
                                onClick={() => approveSection(mIdx, sIdx)}
                                className="h-7 px-2 text-xs"
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" /> {s.approved ? "Approved" : "Approve"}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => draftSection(mIdx, sIdx)}
                              disabled={isDrafting}
                              className="h-7 px-2 text-xs"
                            >
                              {isDrafting ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Wand2 className="mr-1 h-3 w-3" /> {s.html ? "Redraft" : "Draft (1)"}</>}
                            </Button>
                          </div>
                        </div>
                        {s.html && (
                          <div
                            className="prose prose-sm dark:prose-invert mt-3 max-w-none rounded-md bg-background/60 p-3 text-xs"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(s.html) }}
                          />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
