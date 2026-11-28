import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Upload, ShieldCheck, Ban, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { deliveryRequest } from '@/lib/productDelivery';

export default function ProductDelivery() {
  const { user, loading } = useAuth();
  const cache = useQueryClient();
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [packageId, setPackageId] = useState('');
  const [email, setEmail] = useState('');
  const [expiry, setExpiry] = useState('');
  const [busy, setBusy] = useState(false);
  const projects = useQuery({ queryKey: ['delivery-businesses', user?.id], enabled: !!user, queryFn: async () => {
    if (!user) return [];
    const { data, error } = await supabase.from('business_projects').select('id,project_name').eq('user_id', user.id).order('updated_at', { ascending: false });
    if (error) throw error; return data;
  } });
  const activeId = projectId || projects.data?.[0]?.id;
  const packages = useQuery({ queryKey: ['delivery-packages', user?.id, activeId], enabled: !!user && !!activeId, queryFn: async () => {
    if (!user || !activeId) return [];
    const { data, error } = await supabase.from('delivery_packages').select('*').eq('owner_id', user.id).eq('project_id', activeId).order('created_at', { ascending: false });
    if (error) throw error; return data;
  } });
  const orders = useQuery({ queryKey: ['delivery-orders', user?.id, activeId], enabled: !!user && !!activeId, queryFn: async () => {
    if (!user || !activeId) return [];
    const { data, error } = await supabase.from('delivery_orders').select('*, delivery_packages!inner(title,project_id)').eq('owner_id', user.id).eq('delivery_packages.project_id', activeId).order('created_at', { ascending: false });
    if (error) throw error; return data;
  } });
  const selectedPackage = packageId || packages.data?.[0]?.id;
  async function run(action: () => Promise<void>) {
    setBusy(true);
    try { await action(); await cache.invalidateQueries({ predicate: q => ['delivery-packages', 'delivery-orders', 'customer-library'].includes(String(q.queryKey[0])) }); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Please try again'); }
    finally { setBusy(false); }
  }
  async function upload() {
    if (!user || !activeId || !file) return;
    if (!/\.(pdf|zip|csv)$/i.test(file.name) || file.size === 0 || file.size > 50 * 1024 * 1024) throw new Error('Choose a PDF, ZIP, or CSV file up to 50 MB.');
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const path = `${user.id}/${crypto.randomUUID()}/${safeName}`;
    const mime = safeName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : safeName.toLowerCase().endsWith('.zip') ? 'application/zip' : 'text/csv';
    const { error } = await supabase.storage.from('product-delivery').upload(path, file, { contentType: mime, upsert: false });
    if (error) throw error;
    try { await deliveryRequest({ action: 'create_package', project_id: activeId, title: title.trim(), file_path: path }); }
    catch (e) { await supabase.storage.from('product-delivery').remove([path]); throw e; }
    setTitle(''); setFile(null); setFileKey(k => k + 1); toast.success('Product file saved privately');
  }
  if (loading) return <p className="p-8 text-muted-foreground">Loading…</p>;
  if (!user) return <Navigate to="/auth?next=/delivery" replace />;
  const error = projects.error || packages.error || orders.error;
  return <DashboardLayout title="Product delivery"><div className="max-w-6xl mx-auto p-4 md:p-8 space-y-7">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-primary text-xs uppercase font-semibold">Sell · Fulfillment</p><h2 className="text-3xl font-bold mt-2">Product delivery</h2><p className="text-muted-foreground mt-2">Product files and customer access</p></div><Button variant="outline" asChild><Link to="/library">My downloads</Link></Button></header>
    <div className="border-y border-border py-4 flex items-start gap-3"><ShieldCheck className="text-primary h-5 w-5 shrink-0 mt-0.5"/><div><p className="font-medium">Private delivery · Stripe proposed</p><p className="text-sm text-muted-foreground mt-1">Complimentary access only. Paid orders and automatic purchase delivery await tested payment integration and approval.</p></div></div>
    {error && <p role="alert" className="text-destructive">{error.message}</p>}
    {projects.isPending ? <p className="text-muted-foreground">Loading businesses…</p> : !projects.data?.length ? <div className="py-12 text-center space-y-4"><Package className="h-10 w-10 text-muted-foreground mx-auto"/><h3 className="text-xl font-semibold">No business yet</h3><Button asChild><Link to="/hq">Open Business HQ</Link></Button></div> : <>
      <div className="max-w-md space-y-2"><Label>Business</Label><Select value={activeId} onValueChange={id => { setProjectId(id); setPackageId(''); }}><SelectTrigger aria-label="Business"><SelectValue/></SelectTrigger><SelectContent>{projects.data.map(p => <SelectItem value={p.id} key={p.id}>{p.project_name}</SelectItem>)}</SelectContent></Select></div>
      <Tabs defaultValue="products"><TabsList><TabsTrigger value="products">Products</TabsTrigger><TabsTrigger value="access">Customer access</TabsTrigger></TabsList>
        <TabsContent value="products" className="space-y-6 mt-6">
          <form onSubmit={e => { e.preventDefault(); void run(upload); }} className="border-b border-border pb-6 space-y-4"><h3 className="text-xl font-semibold">Add a product file</h3><div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="product-title">Product name</Label><Input id="product-title" required maxLength={150} value={title} onChange={e => setTitle(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="product-file">PDF, ZIP, or CSV · up to 50 MB</Label><Input key={fileKey} id="product-file" type="file" accept=".pdf,.zip,.csv" required onChange={e => setFile(e.target.files?.[0] ?? null)}/></div></div><Button disabled={busy || !title.trim() || !file} className="gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}Save product</Button></form>
          {packages.isPending ? <p>Loading products…</p> : !packages.data?.length ? <p className="text-muted-foreground py-6">No delivery files saved for this business.</p> : <div className="grid md:grid-cols-2 gap-4">{packages.data.map(p => <article key={p.id} className="border border-border rounded-lg bg-card p-5 min-w-0 space-y-3"><div className="flex gap-3 items-start"><Package className="h-5 w-5 text-primary shrink-0"/><h3 className="font-semibold break-words">{p.title}</h3></div><p className="text-muted-foreground text-sm break-all">{p.file_name} · {(p.file_size / 1024 / 1024).toFixed(2)} MB</p><Badge variant="secondary">Private file</Badge></article>)}</div>}
        </TabsContent>
        <TabsContent value="access" className="space-y-6 mt-6">
          <form onSubmit={e => { e.preventDefault(); void run(async () => {
            await deliveryRequest({ action: 'grant', package_id: selectedPackage, email, expires_at: expiry ? new Date(`${expiry}T23:59:59`).toISOString() : null });
            setEmail(''); toast.success('Complimentary access granted. Share the customer library link.');
          }); }} className="border-b border-border pb-6 space-y-4"><h3 className="text-xl font-semibold">Grant complimentary access</h3><div className="grid md:grid-cols-3 gap-4"><div className="space-y-2"><Label>Product</Label><Select value={selectedPackage} onValueChange={setPackageId}><SelectTrigger aria-label="Product"><SelectValue placeholder="Select product"/></SelectTrigger><SelectContent>{packages.data?.map(p => <SelectItem value={p.id} key={p.id}>{p.title}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="customer-email">Customer email</Label><Input id="customer-email" type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="access-expiry">Access expiry (optional)</Label><Input id="access-expiry" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} /></div></div><div className="flex flex-wrap gap-3"><Button disabled={busy || !selectedPackage} className="gap-2"><ShieldCheck className="h-4 w-4"/>Grant access</Button><Button type="button" variant="outline" className="gap-2" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/library`); toast.success('Customer library link copied. No email has been sent.'); } catch { toast.error('Unable to copy the link'); } }}><Copy className="h-4 w-4"/>Copy library link</Button></div></form>
          {orders.isPending ? <p>Loading customer access…</p> : !orders.data?.length ? <p className="text-muted-foreground py-6">No customer access granted yet.</p> : <div className="divide-y divide-border">{orders.data.map(o => <article key={o.id} className="flex flex-wrap justify-between items-start gap-4 py-4"><div className="min-w-0 space-y-1"><h3 className="font-medium break-all">{o.customer_email}</h3><p className="text-sm text-muted-foreground break-words">{o.delivery_packages.title}</p><p className="text-xs text-muted-foreground">{o.access_expires_at ? `Expires ${new Date(o.access_expires_at).toLocaleDateString()}` : 'No access expiry'}</p></div><div className="flex gap-3 items-center"><Badge variant="outline">{o.status}</Badge>{!['revoked','refunded'].includes(o.status) && <Button aria-label={`Revoke access for ${o.customer_email}`} title="Revoke access" variant="ghost" size="icon" disabled={busy} onClick={() => { if (window.confirm('Revoke this customer’s access? Previously issued download links may work for up to 60 seconds.')) void run(async () => { await deliveryRequest({ action: 'revoke', order_id: o.id }); toast.success('Access revoked'); }); }}><Ban className="h-4 w-4 text-destructive"/></Button>}</div></article>)}</div>}
        </TabsContent>
      </Tabs>
    </>}
  </div></DashboardLayout>;
}