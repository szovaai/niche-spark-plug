import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { DOWNLOAD_TTL_SECONDS, hasDeliveryAccess } from '../_shared/deliveryAccess.ts';

const Input = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create_package'), project_id: z.string().uuid(), title: z.string().trim().min(1).max(150), file_path: z.string().max(400) }),
  z.object({ action: z.literal('grant'), package_id: z.string().uuid(), email: z.string().trim().email().max(254), expires_at: z.string().datetime().nullable() }),
  z.object({ action: z.literal('revoke'), order_id: z.string().uuid() }),
  z.object({ action: z.literal('library') }),
  z.object({ action: z.literal('download'), order_id: z.string().uuid() }),
]);
Deno.serve(async (req) => {
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !anon || !service) return reply({ error: 'Delivery is temporarily unavailable' }, 503);
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) return reply({ error: 'Please sign in' }, 401);
    const caller = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await caller.auth.getUser();
    if (authError || !user) return reply({ error: 'Please sign in' }, 401);
    const parsed = Input.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return reply({ error: 'Invalid delivery request' }, 400);
    const input = parsed.data;
    const db = createClient(url, service);
    const verified = !!user.email_confirmed_at;
    if (input.action === 'create_package') {
      const { data: project, error } = await db.from('business_projects').select('id').eq('id', input.project_id).eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      if (!project) return reply({ error: 'Business not found' }, 404);
      const parts = input.file_path.split('/');
      if (parts.length !== 3 || parts[0] !== user.id || !z.string().uuid().safeParse(parts[1]).success || !/^[a-zA-Z0-9_.-]+\.(pdf|zip|csv)$/i.test(parts[2])) return reply({ error: 'Invalid product file' }, 400);
      const folder = `${parts[0]}/${parts[1]}`;
      const { data: files, error: storageError } = await db.storage.from('product-delivery').list(folder, { search: parts[2] });
      if (storageError) throw storageError;
      const file = files?.find(f => f.name === parts[2]);
      if (!file || !file.metadata?.size) return reply({ error: 'Upload the product file first' }, 400);
      const { data, error: insertError } = await db.from('delivery_packages').insert({ project_id: project.id, owner_id: user.id, title: input.title, file_path: input.file_path, file_name: parts[2], file_size: file.metadata.size }).select('id').single();
      if (insertError) throw insertError;
      return reply(data);
    }
    if (input.action === 'grant') {
      const { data: pack, error } = await db.from('delivery_packages').select('id, business_projects!inner(user_id)').eq('id', input.package_id).eq('owner_id', user.id).maybeSingle();
      if (error) throw error;
      if (!pack || pack.business_projects.user_id !== user.id) return reply({ error: 'Product not found' }, 404);
      if (input.expires_at && Date.parse(input.expires_at) <= Date.now()) return reply({ error: 'Access expiry must be in the future' }, 400);
      const { data, error: insertError } = await db.from('delivery_orders').insert({ package_id: pack.id, owner_id: user.id, customer_email: input.email.toLowerCase(), status: 'complimentary', access_expires_at: input.expires_at }).select('id').single();
      if (insertError?.code === '23505') return reply({ error: 'This customer already has complimentary access. Revoke it before issuing a new grant.' }, 409);
      if (insertError) throw insertError;
      return reply(data);
    }
    if (input.action === 'revoke') {
      const { data, error } = await db.from('delivery_orders').update({ status: 'revoked' }).eq('id', input.order_id).eq('owner_id', user.id).select('id').maybeSingle();
      if (error) throw error;
      return data ? reply(data) : reply({ error: 'Order not found' }, 404);
    }
    if (!verified || !user.email) return reply({ error: 'Verify your email before accessing products' }, 403);
    if (input.action === 'library') {
      const { data, error } = await db.from('delivery_orders').select('id, customer_email, status, access_expires_at, created_at, delivery_packages!inner(title, file_name, file_size)').eq('customer_email', user.email.toLowerCase()).order('created_at', { ascending: false });
      if (error) throw error;
      return reply({ orders: (data ?? []).map(({ customer_email, ...row }) => ({ ...row, available: hasDeliveryAccess({ ...row, customer_email }, user.email, verified) })) });
    }
    const { data: order, error } = await db.from('delivery_orders').select('*, delivery_packages!inner(file_path, file_name)').eq('id', input.order_id).maybeSingle();
    if (error) throw error;
    if (!order || !hasDeliveryAccess(order, user.email, verified)) return reply({ error: 'Product access is unavailable, expired, or revoked' }, 403);
    const { data, error: signedError } = await db.storage.from('product-delivery').createSignedUrl(order.delivery_packages.file_path, DOWNLOAD_TTL_SECONDS, { download: order.delivery_packages.file_name });
    if (signedError) throw signedError;
    return reply({ url: data.signedUrl, expires_in: DOWNLOAD_TTL_SECONDS });
  } catch (error) {
    console.error('Delivery request failed', error instanceof Error ? error.message : 'Unknown error');
    return reply({ error: 'Unable to complete delivery. Please try again.' }, 500);
  }
});