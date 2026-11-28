import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Trash2, Loader2 } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductBuildEngine } from "./ProductBuildEngine";
import { toast } from "sonner";

export function BusinessTeam({ projectId }: { projectId?: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["business-team", user?.id, projectId], enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error("Sign in first.");
      const [invites, shared, pending, members] = await Promise.all([
        projectId ? supabase.from("business_invitations").select("*").eq("project_id", projectId).eq("status", "pending").gt("expires_at", new Date().toISOString()) : Promise.resolve({ data: [], error: null }),
        supabase.from("business_members").select("id,project_id,business_projects(project_name)").eq("user_id", user.id),
        supabase.from("business_invitations").select("id,project_id,email").eq("email", (user.email ?? "").toLowerCase()).eq("status", "pending").gt("expires_at", new Date().toISOString()),
        projectId ? supabase.from("business_members").select("id,user_id").eq("project_id", projectId) : Promise.resolve({ data: [], error: null }),
      ]);
      for (const result of [invites, shared, pending, members]) if (result.error) throw result.error;
      return { invites: invites.data ?? [], shared: shared.data ?? [], pending: pending.data ?? [], members: members.data ?? [] };
    },
  });
  const action = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); await qc.invalidateQueries({ queryKey: ["business-team"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't update the team."); }
    finally { setBusy(false); }
  };
  const invite = () => action(async () => {
    if (!projectId) return;
    const parsed = z.string().email().max(254).safeParse(email.trim().toLowerCase());
    if (!parsed.success) throw new Error("Enter a valid email address.");
    if (parsed.data === user?.email?.toLowerCase()) throw new Error("You already own this business.");
    if (query.data?.invites.some(i => i.email === parsed.data)) throw new Error("An invitation is already pending for this email.");
    const { error } = await supabase.from("business_invitations").insert({ project_id: projectId, email: parsed.data });
    if (error) throw error;
    setEmail(""); toast.success("Invitation created; no email sent. Share your app link with the reviewer.");
  });
  return <section className="space-y-4 border-t border-border pt-6">
    <h2 className="flex items-center gap-2 text-lg font-semibold"><Users className="h-5 w-5 text-primary" />Business team</h2>
    {query.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
    {query.isError && <div role="alert"><p className="text-sm text-destructive">Couldn't load your team.</p><Button variant="outline" onClick={() => query.refetch()}>Try again</Button></div>}
    {projectId && <div className="space-y-2"><Label htmlFor="reviewer-email">Invite a read-only reviewer</Label><div className="flex flex-wrap gap-2"><Input id="reviewer-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="reviewer@example.com" className="max-w-sm" /><Button onClick={invite} disabled={busy || !email}><UserPlus className="mr-2 h-4 w-4" />Invite</Button></div></div>}
    {query.data?.invites.map(inv => <div key={inv.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm"><span className="min-w-0 break-all">{inv.email}<span className="block text-xs text-muted-foreground">Pending · expires {new Date(inv.expires_at).toLocaleDateString()}</span></span><Button size="icon" variant="ghost" title="Revoke invitation" aria-label={`Revoke invitation for ${inv.email}`} disabled={busy} onClick={() => action(async () => { const { error } = await supabase.from("business_invitations").update({ status: "revoked" }).eq("id", inv.id); if (error) throw error; })}><Trash2 className="h-4 w-4" /></Button></div>)}
    {query.data?.members.map(member => <div key={member.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm"><span>Reviewer {member.user_id.slice(0, 8)} · read-only</span><Button size="icon" variant="ghost" title="Remove reviewer" aria-label={`Remove reviewer ${member.user_id.slice(0, 8)}`} disabled={busy} onClick={() => action(async () => { const { error } = await supabase.from("business_members").delete().eq("id", member.id); if (error) throw error; })}><Trash2 className="h-4 w-4" /></Button></div>)}
    {query.data?.pending.map(inv => <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><p className="text-sm">Business review invitation</p><Button disabled={busy} onClick={() => action(async () => { const { data, error } = await supabase.rpc("accept_business_invitation", { _invitation_id: inv.id }); if (error) throw error; setReviewId(data); })}>Accept invitation</Button></div>)}
    {query.data?.shared.map(shared => <div key={shared.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><p className="text-sm">{shared.business_projects?.project_name ?? "Shared business"}<span className="block text-xs text-muted-foreground">Read-only reviewer</span></p><Button variant="outline" onClick={() => setReviewId(shared.project_id)}>Open shared product</Button></div>)}
    {!projectId && !query.isLoading && !query.data?.shared.length && !query.data?.pending.length && <p className="text-sm text-muted-foreground">No shared businesses yet.</p>}
    <Dialog open={!!reviewId} onOpenChange={open => { if (!open) setReviewId(null); }}><DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>Shared product · read-only</DialogTitle></DialogHeader>{reviewId && <ProductBuildEngine projectId={reviewId} readOnly />}</DialogContent></Dialog>
  </section>;
}