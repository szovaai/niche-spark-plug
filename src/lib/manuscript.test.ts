import { describe, it, expect } from "vitest";
import { parseManuscript, manuscriptStats, mergeLegacyDrafts, type Outline } from "./manuscript";
const outline: Outline = { product_name: "Balcony Garden", subtitle: "", format: "PDF", outcome: "", modules: [{ title: "Start", purpose: "", sections: [{ title: "Choose pots", summary: "", html: `<p>${"Practical garden instructions. ".repeat(30)}</p>` }] }] };
describe("Manuscript persistence and completion", () => {
  it("requires approval of every drafted section before completion", () => {
    expect(manuscriptStats(outline).complete).toBe(false);
    expect(manuscriptStats({ ...outline, modules: [{ ...outline.modules[0], sections: [{ ...outline.modules[0].sections[0], approved: true }] }] }).complete).toBe(true);
  });
  it("does not mark empty HTML as drafted or approved", () => {
    const empty = { ...outline, modules: [{ ...outline.modules[0], sections: [{ title: "Choose pots", summary: "", html: "<p></p>", approved: true }] }] };
    expect(manuscriptStats(empty)).toEqual({ total: 1, drafted: 0, approved: 0, complete: false });
  });
  it("rejects malformed or empty outlines", () => {
    expect(parseManuscript({ modules: [] })).toBe(null);
    expect(parseManuscript(outline)?.product_name).toBe("Balcony Garden");
  });
  it("never imports browser drafts from a different outline with the same name", () => {
    const other = { ...outline, modules: [{ title: "Other", purpose: "", sections: [{ title: "Other", summary: "", html: "wrong business draft" }] }] };
    expect(mergeLegacyDrafts(outline, other)).toEqual(outline);
  });
});