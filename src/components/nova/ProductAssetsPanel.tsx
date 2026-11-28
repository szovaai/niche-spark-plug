import { useState } from "react";
import { Plus, Trash2, Save, Sparkles, Download, Loader2, Package, ListChecks, Copy, Table2, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ASSET_FORMATS, ASSET_LABELS, assetReady, importGeneratedAsset, type AssetFormat, type ProductAsset } from "@/lib/productAssets";
import { exportAsset, exportProductBundle } from "@/lib/productAssetExport";
import type { Outline } from "@/lib/manuscript";
import type { Blueprint } from "@/hooks/useBlueprint";
import { toast } from "sonner";

const icons = { checklist: ListChecks, swipe_file: Copy, habit_tracker: Table2, worksheet: NotebookPen };
export function ProductAssetsPanel({ outline, blueprint, readOnly, disabled, onBusy, persist }: { outline: Outline | null; blueprint: Blueprint | null; readOnly: boolean; disabled: boolean; onBusy: (busy: boolean) => void; persist: (next: Outline) => Promise<void> }) {
  const [format, setFormat] = useState<AssetFormat>("checklist");
  const [draft, setDraft] = useState<ProductAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const assets = outline?.assets ?? [];
  const locked = busy || disabled;
  const saveAssets = async (next: ProductAsset[]) => {
    await persist({ ...(outline ?? { product_name: blueprint?.product_concept || blueprint?.business_name || "Product bundle", subtitle: "", outcome: blueprint?.desired_outcome ?? "", format: "Multi-format bundle", modules: [] }), assets: next });
  };
  const run = async (action: () => Promise<void> | void) => {
    setBusy(true); onBusy(true);
    try { await action(); } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't update the product."); } finally { setBusy(false); onBusy(false); }
  };
  const generate = () => run(async () => {
    if (readOnly || !blueprint?.niche || !blueprint?.target_audience || !blueprint?.customer_problem) throw new Error("Save your niche, audience and customer problem first.");
    const { data, error } = await supabase.functions.invoke("generate-micro-product", { body: { productType: format, nicheTopic: blueprint.niche, targetAudience: blueprint.target_audience, problemStatement: blueprint.customer_problem, config: { numItems: 20, groupByCategory: true, numTemplates: 10, numSections: 5, duration: 30, habitsPerDay: 5 } } });
    if (error) throw new Error("Generation failed. Your saved products are unchanged; check your AI balance before trying again.");
    const asset = importGeneratedAsset(format, data);
    // Keep the generated result in the editor even if the cloud save fails.
    setDraft(asset);
    await saveAssets([...assets, asset]); toast.success("Product saved online.");
  });
  const saveDraft = () => run(async () => {
    if (!draft || readOnly) return;
    const parsed = { ...draft, title: draft.title.trim(), approved: false };
    if (!parsed.title || !assetReady(parsed)) throw new Error("Add a title and content for every entry.");
    await saveAssets([...assets.filter(a => a.id !== parsed.id), parsed]); setDraft(null); toast.success("Product saved online.");
  });
  return <section className="space-y-4 border-t border-border pt-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Product assets</h2>{outline && <Button variant="outline" size="sm" disabled={locked || !!draft} onClick={() => run(() => exportProductBundle(outline))}><Package className="mr-2 h-4 w-4" />Export product bundle</Button>}</div>
    {!readOnly && <div className="flex flex-wrap items-center gap-2"><Select value={format} onValueChange={v => setFormat(v as AssetFormat)} disabled={locked}><SelectTrigger aria-label="Product asset format" className="w-44"><SelectValue /></SelectTrigger><SelectContent>{ASSET_FORMATS.map(f => <SelectItem key={f} value={f}>{ASSET_LABELS[f]}</SelectItem>)}</SelectContent></Select><Button variant="outline" disabled={locked || !!draft} onClick={() => setDraft({ id: crypto.randomUUID(), format, title: "", instructions: "", approved: false, entries: [{ heading: "", body: "" }] })}><Plus className="mr-2 h-4 w-4" />Create manually</Button><Button disabled={locked || !!draft || !blueprint?.niche || !blueprint?.target_audience || !blueprint?.customer_problem} onClick={generate}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Generate with AI</Button><span className="text-xs text-muted-foreground">Metered AI usage</span></div>}
    {assets.length === 0 && !draft && <p className="py-4 text-sm text-muted-foreground">No product assets saved yet.</p>}
    {assets.map(asset => { const Icon = icons[asset.format]; return <article key={asset.id} className="space-y-3 border-b border-border pb-4"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h3 className="flex items-center gap-2 break-words font-medium"><Icon className="h-4 w-4 shrink-0 text-primary" />{asset.title}</h3><div className="mt-1 flex gap-2"><Badge variant="outline">{ASSET_LABELS[asset.format]}</Badge><Badge variant={asset.approved ? "secondary" : "outline"}>{asset.approved ? "Approved" : "Draft"}</Badge></div></div><div className="flex flex-wrap gap-2">{!readOnly && <><Button variant="ghost" size="sm" disabled={locked || !!draft} onClick={() => setDraft(structuredClone(asset))}>Edit</Button><Button variant="outline" size="sm" disabled={locked || !!draft || !assetReady(asset)} onClick={() => run(async () => saveAssets(assets.map(a => a.id === asset.id ? { ...a, approved: !a.approved } : a)))}>{asset.approved ? "Unapprove" : "Approve"}</Button><Button variant="ghost" size="icon" aria-label={`Delete ${asset.title}`} disabled={locked || !!draft} onClick={() => { if (window.confirm(`Delete ${asset.title}?`)) void run(() => saveAssets(assets.filter(a => a.id !== asset.id))); }}><Trash2 className="h-4 w-4" /></Button></>}<Button variant="outline" size="sm" disabled={locked || !!draft || !assetReady(asset)} onClick={() => run(() => exportAsset(asset, "pdf"))}><Download className="mr-1 h-4 w-4" />PDF</Button>{asset.format === "habit_tracker" && <Button variant="outline" size="sm" disabled={locked || !!draft} onClick={() => run(() => exportAsset(asset, "csv"))}><Table2 className="mr-1 h-4 w-4" />CSV</Button>}</div></div><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{asset.instructions}</p><ol className="space-y-3">{asset.entries.map((e, i) => <li key={i} className="border-l-2 border-primary/30 pl-3"><h4 className="break-words text-sm font-medium">{i + 1}. {e.heading}</h4><p className="whitespace-pre-wrap break-words text-sm">{e.body}</p>{asset.format === "worksheet" && <div className="mt-2 h-12 border-b border-dashed border-border" />}{asset.format === "habit_tracker" && <div className="mt-2 grid grid-cols-10 gap-1">{Array.from({ length: 30 }, (_, day) => <span key={day} className="border border-border py-1 text-center text-xs text-muted-foreground">{day + 1}</span>)}</div>}</li>)}</ol></article>; })}
    {draft && !readOnly && <div className="space-y-4 border-l-2 border-primary pl-4"><h3 className="font-semibold">Edit {ASSET_LABELS[draft.format].toLowerCase()}</h3><div className="space-y-1"><Label htmlFor="asset-title">Title</Label><Input id="asset-title" value={draft.title} maxLength={200} disabled={locked} onChange={e => setDraft({ ...draft, title: e.target.value })} /></div><div className="space-y-1"><Label htmlFor="asset-instructions">Instructions</Label><Textarea id="asset-instructions" value={draft.instructions} maxLength={5000} disabled={locked} onChange={e => setDraft({ ...draft, instructions: e.target.value })} /></div>{draft.entries.map((entry, i) => <div key={i} className="space-y-2 border-b border-border pb-3"><div className="flex items-end gap-2"><div className="min-w-0 flex-1 space-y-1"><Label htmlFor={`asset-heading-${i}`}>Entry {i + 1}</Label><Input id={`asset-heading-${i}`} value={entry.heading} maxLength={500} disabled={locked} onChange={e => setDraft({ ...draft, entries: draft.entries.map((r, ri) => ri === i ? { ...r, heading: e.target.value } : r) })} /></div><Button variant="ghost" size="icon" disabled={locked || draft.entries.length === 1} aria-label={`Remove entry ${i + 1}`} onClick={() => setDraft({ ...draft, entries: draft.entries.filter((_, ri) => ri !== i) })}><Trash2 className="h-4 w-4" /></Button></div><Label htmlFor={`asset-body-${i}`}>{draft.format === "swipe_file" ? "Template" : draft.format === "worksheet" ? "Exercise" : "Details"}</Label><Textarea id={`asset-body-${i}`} value={entry.body} maxLength={10000} disabled={locked} onChange={e => setDraft({ ...draft, entries: draft.entries.map((r, ri) => ri === i ? { ...r, body: e.target.value } : r) })} /></div>)}<div className="flex flex-wrap gap-2"><Button variant="outline" disabled={locked || draft.entries.length >= 100} onClick={() => setDraft({ ...draft, entries: [...draft.entries, { heading: "", body: "" }] })}><Plus className="mr-2 h-4 w-4" />Add entry</Button><Button disabled={locked} onClick={saveDraft}><Save className="mr-2 h-4 w-4" />Save product</Button><Button variant="ghost" disabled={locked} onClick={() => setDraft(null)}>Cancel</Button></div></div>}
  </section>;
}