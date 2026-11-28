import { describe, it, expect } from "vitest";
import { enforceDownsell } from "../../supabase/functions/_shared/funnelOffers";
import { offerCheckoutLink } from "./offerLinks";
describe("Approved complementary offers", () => {
  it("omits an unconfigured downsell instead of inventing one", () => {
    expect(enforceDownsell({ downsellPage: "invented" }, {}).downsellPage).toBe("");
  });
  it("requires a generated page for an approved downsell", () => {
    expect(() => enforceDownsell({}, { downsell: "Pots worksheet $9" })).toThrow();
    expect(enforceDownsell({ downsellPage: "approved" }, { downsell: "Pots worksheet $9" }).downsellPage).toBe("approved");
  });
  it("never uses an absent offer checkout as a front-end checkout", () => {
    expect(offerCheckoutLink()).toBeNull();
    expect(offerCheckoutLink("https://checkout.example.com/worksheet")).toBe("https://checkout.example.com/worksheet");
  });
  it("rejects executable checkout URLs", () => { expect(offerCheckoutLink("javascript:alert(1)")).toBeNull(); });
});