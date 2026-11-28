import { supabase } from '@/integrations/supabase/client';
export async function deliveryRequest<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('product-delivery', { body });
  if (error) {
    const details = await error.context?.json?.().catch(() => null);
    throw new Error(details?.error || error.message || 'Unable to complete delivery');
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}
export type LibraryOrder = {
  id: string; status: string; available: boolean; access_expires_at: string | null;
  delivery_packages: { title: string; file_name: string; file_size: number };
};