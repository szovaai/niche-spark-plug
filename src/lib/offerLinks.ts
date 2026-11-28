export function offerCheckoutLink(value?: string): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}