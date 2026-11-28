import { describe, expect, it } from 'vitest';
import { DOWNLOAD_TTL_SECONDS, hasDeliveryAccess } from '../../supabase/functions/_shared/deliveryAccess';
const order = { customer_email: 'buyer@example.com', status: 'complimentary', access_expires_at: null };
describe('private delivery access', () => {
  it('requires verified matching customer identity', () => {
    expect(hasDeliveryAccess(order, 'BUYER@example.com', true)).toBe(true);
    expect(hasDeliveryAccess(order, 'other@example.com', true)).toBe(false);
    expect(hasDeliveryAccess(order, order.customer_email, false)).toBe(false);
  });
  it('allows paid and complimentary orders only', () => {
    expect(hasDeliveryAccess({ ...order, status: 'paid' }, order.customer_email, true)).toBe(true);
    for (const status of ['pending', 'refunded', 'revoked']) {
      expect(hasDeliveryAccess({ ...order, status }, order.customer_email, true)).toBe(false);
    }
  });
  it('rejects expired access, including at the exact expiry', () => {
    const expiry = '2026-11-28T12:00:00Z';
    expect(hasDeliveryAccess({ ...order, access_expires_at: expiry }, order.customer_email, true, Date.parse(expiry))).toBe(false);
    expect(hasDeliveryAccess({ ...order, access_expires_at: expiry }, order.customer_email, true, Date.parse(expiry) - 1)).toBe(true);
  });
  it('limits issued download links to sixty seconds', () => expect(DOWNLOAD_TTL_SECONDS).toBe(60));
});