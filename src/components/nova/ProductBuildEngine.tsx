import { useCallback, useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, ChevronDown, ChevronRight, Wand2, BookOpen, Download, RefreshCw } from "lucide-react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useBlueprint } from "@/hooks/useBlueprint";
import { useAuth } from "@/hooks/useAuth";
import { parseManuscript, manuscriptStats, mergeLegacyDrafts, type Outline } from "@/lib/manuscript";
import { exportManuscriptPDF } from "@/lib/manuscriptPDF";
import { toast } from "sonner";
import { ProductAssetsPanel } from "./ProductAssetsPanel";

export function ProductBuildEngine({ projectId, readOnly = false }: { projectId: string; readOnly?: boolean }) {
  const { user } = useAuth();
  const { blueprint } = useBlueprint(projectId);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [drafting, setDrafting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null); setOutline(null); setRevision(null);
    try {
      const { data: saved, error: loadError } = await supabase.from("product_manuscripts").select("outline,revision,updated_at").eq("project_id", projectId).maybeSingle();
      if (loadError) throw loadError;
      if (saved) {
        const parsed = parseManuscript(saved.outline);
        if (!parsed) throw new Error("Saved manuscript could not be read.");
        setOutline(parsed); setRevision(saved.revision);
      } else if (!readOnly) {
        const { data: tasks, error: taskError } = await supabase.from("nova_tasks").select("output_json").eq("project_id", projectId).eq("task_name", "product_outline").eq("status", "completed").order("completed_at", { ascending: false }).limit(1);
        if (taskError) throw taskError;
        const remote = parseManuscript(tasks?.[0]?.output_json);
        if (remote) {
          let local: Outline | null = null;
          try { local = parseManuscript(JSON.parse(localStorage.getItem(`pz.outline.${projectId}`) ?? "null")); } catch { /* Invalid browser drafts are not imported. */ }
          const imported = mergeLegacyDrafts(remote, local);
          const { data: rev, error: saveError } = await supabase.rpc("save_manuscript", { _project_id: projectId, _outline: imported, _expected_revision: null });
          if (saveError) throw saveError;
          setOutline(imported); setRevision(rev);
          localStorage.removeItem(`pz.outline.${projectId}`);
        }
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn't load the manuscript."); }
    finally { setLoading(false); }
  }, [projectId, user?.id, readOnly]);
  useEffect(() => { void load(); }, [load]);

  const persist = async (next: Outline) => {
    const { data, error: saveError } = await supabase.rpc("save_manuscript", { _project_id: projectId, _outline: next, _expected_revision: revision });
    if (saveError) throw saveError;
    setOutline(next); setRevision(data);
  };
  const generate = async () => {
    if (readOnly || busy) return;
    setBusy(true);
    try {
      const { data, error: generationError } = await supabase.functions.invoke("generate-product-outline", { body: { project_id: projectId } });
      if (generationError) throw generationError;
      const next = parseManuscript(data);
      if (!next) throw new Error("Nova returned an incomplete outline.");
      await persist({ ...next, assets: outline?.assets }); setExpanded(0); toast.success("Outline saved online.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't generate the outline."); }
    finally { setBusy(false); }
  };
  const draftSection = async (mi: number, si: number) => {
    if (!outline || busy || readOnly) return;
    const m = outline.modules[mi], s = m.sections[si];
    setBusy(true); setDrafting(`${mi}:${si}`);
    try {
      const { data, error: generationError } = await supabase.functions.invoke("generate-product-section", { body: { project_id: projectId, module_title: m.title, section_title: s.title, section_summary: s.summary } });
      if (generationError) throw generationError;
      if (typeof data?.html !== "string" || data.html.replace(/<[^>]*>/g, "").trim().length < 50) throw new Error("Section content was empty.");
      const next = structuredClone(outline);
      next.modules[mi].sections[si] = { ...s, html: DOMPurify.sanitize(data.html), approved: false };
      await persist(next); toast.success("Section saved online.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't draft the section."); }
    finally { setBusy(false); setDrafting(null); }
  };
  const approveSection = async (mi: number, si: number) => {
    if (!outline || busy || readOnly) return;
    setBusy(true);
    try { const next = structuredClone(outline); const section = next.modules[mi].sections[si]; section.approved = !section.approved; await persist(next); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't save approval."); }
    finally { setBusy(false); }
  };
  const approveOutline = async () => {
    if (!user || readOnly) return;
    const { error: saveError } = await supabase.from("mission_tasks").upsert({ project_id: projectId, user_id: user.id, mission_id: "m4", task_key: "outline_approved", label: "Approve the outline", status: "done", approved_at: new Date().toISOString() }, { onConflict: "project_id,mission_id,task_key" });
    if (saveError) toast.error("Couldn't save outline approval."); else toast.success("Outline approved.");
  };
  const markComplete = async () => {
    if (!user || !outline || !manuscriptStats(outline).complete || readOnly) return;
    setBusy(true);
    try {
      const rows = ["draft_sections", "final_polish", "export_ready"].map(key => ({ project_id: projectId, user_id: user.id, mission_id: "m4", task_key: key, label: key, status: "done", approved_at: new Date().toISOString() }));
      const { error: taskError } = await supabase.from("mission_tasks").upsert(rows, { onConflict: "project_id,mission_id,task_key" });
      if (taskError) throw taskError;
      const { error: progressError } = await supabase.from("mission_progress").upsert({ project_id: projectId, user_id: user.id, mission_id: "m4", status: "complete", progress_pct: 100, completed_at: new Date().toISOString() }, { onConflict: "project_id,mission_id" });
      if (progressError) throw progressError;
      toast.success("Product build complete.");
    } catch { toast.error("Couldn't mark the product complete."); }
    finally { setBusy(false); }
  };
  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (error) return <div role="alert" className="space-y-3 py-6"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={() => void load()}><RefreshCw className="mr-2 h-4 w-4" />Reload manuscript</Button></div>;
  const assetPanel = <ProductAssetsPanel outline={outline} blueprint={blueprint} readOnly={readOnly} disabled={busy} onBusy={setBusy} persist={persist} />;
  if (!outline) return <div><section className="space-y-3 py-8 text-center"><BookOpen className="mx-auto h-6 w-6 text-primary" /><p className="text-sm text-muted-foreground">{readOnly ? "No manuscript shared yet." : !blueprint?.product_concept ? "Choose a product concept in Mission 3 first." : "No outline yet"}</p>{!readOnly && blueprint?.product_concept && <Button onClick={generate} disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Draft outline · 2 credits</Button>}</section>{assetPanel}</div>;
  const stats = manuscriptStats(outline);
  return <div className="space-y-4">
    <section className="space-y-3 border-b border-border pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-lg font-semibold">{outline.product_name}</h2><p className="text-sm text-muted-foreground">{outline.subtitle}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="outline">{outline.format}</Badge><Badge variant="outline">{outline.modules.length} modules</Badge><Badge variant="secondary">Saved online</Badge>{readOnly && <Badge variant="outline">Read-only</Badge>}</div></div>{!readOnly && <Button variant="ghost" size="sm" onClick={generate} disabled={busy}>Re-draft · 2</Button>}</div>
      <p className="text-xs text-muted-foreground">{outline.outcome}</p><div className="flex justify-between text-xs text-muted-foreground"><span>{stats.drafted}/{stats.total} drafted</span><span>{stats.approved} approved</span></div><Progress value={stats.drafted / stats.total * 100} className="h-1.5" />
      <div className="flex flex-wrap gap-2">{!readOnly && <>{outline.modules.length > 0 && <Button size="sm" variant="outline" disabled={busy} onClick={approveOutline}>Approve outline</Button>}<Button size="sm" disabled={busy || !stats.complete} onClick={markComplete}>Mark product build complete</Button></>}{outline.modules.some(m => m.sections.some(s => s.html)) && <Button size="sm" variant="outline" disabled={busy || !stats.drafted} onClick={() => { try { exportManuscriptPDF(outline); } catch (e) { toast.error(e instanceof Error ? e.message : "PDF export failed."); } }}><Download className="mr-2 h-4 w-4" />{stats.complete ? "Export PDF" : "Export draft PDF"}</Button>}</div>
    </section>
    {outline.modules.map((m, mi) => <section key={mi} className="border-b border-border pb-3">
      <Button variant="ghost" onClick={() => setExpanded(expanded === mi ? null : mi)} className="h-auto w-full justify-between gap-3 whitespace-normal px-0 py-3 text-left"><span className="min-w-0 break-words"><span className="block">Module {mi + 1}. {m.title}</span><span className="block text-xs font-normal text-muted-foreground">{m.purpose}</span></span>{expanded === mi ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}</Button>
      {expanded === mi && <div className="space-y-4">{m.sections.map((s, si) => <div key={si} className="border-l-2 border-primary/30 pl-3"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><h3 className="break-words text-sm font-medium">{s.title}</h3><p className="text-xs text-muted-foreground">{s.summary}</p></div>{!readOnly && <div className="flex flex-wrap gap-1">{s.html && <Button size="sm" variant={s.approved ? "default" : "outline"} disabled={busy} onClick={() => approveSection(mi, si)}><CheckCircle2 className="mr-1 h-3 w-3" />{s.approved ? "Approved" : "Approve"}</Button>}<Button size="sm" variant="ghost" disabled={busy} onClick={() => draftSection(mi, si)}>{drafting === `${mi}:${si}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wand2 className="mr-1 h-3 w-3" />{s.html ? "Redraft · 1" : "Draft · 1"}</>}</Button></div>}</div>{s.html && <div className="prose prose-sm dark:prose-invert mt-3 max-w-none break-words" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(s.html) }} />}</div>)}</div>}
    </section>)}
    {assetPanel}
  </div>;
}
