import { describe, expect, it } from "vitest";
import { assetReady, importGeneratedAsset, trackerCSV, type ProductAsset } from "./productAssets";
const tracker: ProductAsset = { id: "a", format: "habit_tracker", title: "Garden", instructions: "", approved: false, entries: [{ heading: "=SUM(A1)", body: "Check soil" }] };
describe("Multi-format products", () => {
  it("imports grouped checklists without losing individual actions", () => {
    const asset = importGeneratedAsset("checklist", { product_title: "Start", product_content: [{ category: "Setup", items: ["Choose a pot", "Add drainage"] }] });
    expect(asset.entries).toEqual([{ heading: "Setup", body: "Choose a pot" }, { heading: "Setup", body: "Add drainage" }]);
  });
  it("preserves copy-paste swipe content", () => {
    expect(importGeneratedAsset("swipe_file", { product_title: "Swipes", product_content: [{ template_name: "Intro", content: "Hello [name]" }] }).entries[0].body).toBe("Hello [name]");
  });
  it("expands every workbook exercise", () => {
    expect(importGeneratedAsset("worksheet", { product_title: "Plan", product_content: [{ section: "Goals", exercises: ["Set a goal", "Choose a date"] }] }).entries).toHaveLength(2);
  });
  it("rejects malformed generated output instead of saving an empty product", () => {
    expect(() => importGeneratedAsset("habit_tracker", { product_title: "Bad", product_content: { habits: [] } })).toThrow();
  });
  it("exports 30 tracker days and neutralizes spreadsheet formulas", () => {
    const csv = trackerCSV(tracker);
    expect(csv.split("\r\n")[0].split(",")).toHaveLength(32);
    expect(csv).toContain('"Day 30"'); expect(csv).toContain('"\'=SUM(A1)"');
  });
  it("blocks approval readiness when any entry is empty", () => {
    expect(assetReady({ ...tracker, entries: [{ heading: "", body: "" }] })).toBe(false);
    expect(assetReady(tracker)).toBe(true);
  });
});