import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Library, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { deliveryRequest, type LibraryOrder } from '@/lib/productDelivery';

export default function CustomerLibrary() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['customer-library', user?.id], enabled: !!user,
    queryFn: () => deliveryRequest<{ orders: LibraryOrder[] }>({ action: 'library' }) });
  async function download(id: string) {
    setBusy(id);
    try {
      const { url } = await deliveryRequest<{ url: string }>({ action: 'download', order_id: id });
      // Storage supplies Content-Disposition; no async popup or cross-origin download attribute.
      const link = document.createElement('a'); link.href = url; document.body.appendChild(link); link.click(); link.remove();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Download unavailable'); await query.refetch(); }
    finally { setBusy(null); }
  }
  if (loading) return <p className="p-8 text-muted-foreground">Loading…</p>;
  if (!user) return <Navigate to="/auth?next=/library" replace />;
  return <DashboardLayout title="My downloads"><div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-primary text-xs uppercase font-semibold">Customer library</p><h2 className="text-3xl font-bold mt-2">My downloads</h2><p className="text-muted-foreground mt-2 break-all">{user.email}</p></div><Button variant="outline" asChild><Link to="/delivery">Product delivery</Link></Button></header>
    {query.isPending ? <p className="text-muted-foreground">Loading your products…</p> : query.error ? <div role="alert" className="space-y-3"><p className="text-destructive">{query.error.message}</p><Button variant="outline" onClick={() => query.refetch()}>Try again</Button></div> : !query.data?.orders.length ? <div className="py-16 border-y border-border text-center space-y-3"><Library className="h-10 w-10 mx-auto text-muted-foreground"/><h3 className="text-xl font-semibold">No products yet</h3><p className="text-muted-foreground">Products granted to this email will appear here.</p></div> : <div className="grid gap-4 md:grid-cols-2">{query.data.orders.map(order => <article key={order.id} className="border border-border bg-card rounded-lg p-5 space-y-4 min-w-0">
      <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold break-words">{order.delivery_packages.title}</h3><Badge variant={order.available ? 'secondary' : 'outline'}>{order.available ? 'Available' : order.status === 'revoked' || order.status === 'refunded' ? order.status : 'Unavailable'}</Badge></div>
      <p className="text-sm text-muted-foreground break-all">{order.delivery_packages.file_name} · {(order.delivery_packages.file_size / 1024 / 1024).toFixed(2)} MB</p>
      <p className="text-sm text-muted-foreground">{order.access_expires_at ? `Access until ${new Date(order.access_expires_at).toLocaleDateString()}` : 'No access expiry'}</p>
      <Button className="gap-2" disabled={!order.available || busy !== null} onClick={() => download(order.id)}>{busy === order.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4"/>}Download</Button>
    </article>)}</div>}
  </div></DashboardLayout>;
}