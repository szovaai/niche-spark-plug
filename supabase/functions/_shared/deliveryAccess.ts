export const DOWNLOAD_TTL_SECONDS = 60;
export function hasDeliveryAccess(
  order: { customer_email: string; status: string; access_expires_at: string | null },
  email: string | undefined,
  verified: boolean,
  now = Date.now(),
) {
  if (!verified || !email || email.toLowerCase() !== order.customer_email.toLowerCase()) return false;
  if (!['paid', 'complimentary'].includes(order.status)) return false;
  return order.access_expires_at === null || Date.parse(order.access_expires_at) > now;
}