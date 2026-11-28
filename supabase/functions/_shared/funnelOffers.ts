export function downsellInstructions(facts: Record<string, unknown>): string {
  const offer = typeof facts.downsell === "string" ? facts.downsell.trim() : "";
  return offer
    ? `Include a "downsellPage" JSON string containing the complete downsell page for the authorized offer: ${JSON.stringify(offer)}. This follows an upsell decline; describe only its supplied contents and price, with a clear accept/decline choice. Never calculate its price from the front-end price or invent a Lite edition, discount, support, guarantee, or extra bonuses.`
    : `Include "downsellPage": "". No downsell is configured; do not invent an offer or price.`;
}
export function enforceDownsell(result: Record<string, unknown>, facts: Record<string, unknown>) {
  if (typeof facts.downsell !== "string" || !facts.downsell.trim()) result.downsellPage = "";
  else if (typeof result.downsellPage !== "string" || !result.downsellPage.trim()) throw new Error("Configured downsell page is missing");
  return result;
}