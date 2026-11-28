import { describe, expect, it } from "vitest";
import { sanitizeText, sanitizeForPDF, sanitizeAIOutput } from "./textSanitizer";
describe("PDF text integrity", () => {
  it("preserves ordinary product text instead of stripping its letters", () => {
    const text = "Choose a container with drainage holes. Match the pot size to the mature plant.";
    expect(sanitizeText(text)).toBe(text);
    expect(sanitizeForPDF(text)).toBe(text);
    expect(sanitizeAIOutput(text)).toBe(text);
  });
  it("keeps paragraph breaks", () => { expect(sanitizeText("First paragraph\n\nSecond paragraph")).toBe("First paragraph\n\nSecond paragraph"); });
  it("normalizes actual Unicode punctuation and removes control characters", () => { expect(sanitizeForPDF("“Garden” — it’s simple\u0000")).toBe('"Garden" - it\'s simple'); });
});