import { z } from "zod";

export const ASSET_FORMATS = ["checklist", "swipe_file", "habit_tracker", "worksheet"] as const;
export type AssetFormat = typeof ASSET_FORMATS[number];
export const ASSET_LABELS: Record<AssetFormat, string> = { checklist: "Checklist", swipe_file: "Swipe file", habit_tracker: "Tracker", worksheet: "Workbook" };
export const productAssetSchema = z.object({
  id: z.string().min(1), format: z.enum(ASSET_FORMATS), title: z.string().min(1).max(200),
  instructions: z.string().max(5000).default(""), approved: z.boolean().default(false),
  entries: z.array(z.object({ heading: z.string().max(500), body: z.string().max(10000) })).max(100),
});
export type ProductAsset = z.infer<typeof productAssetSchema>;
export function assetReady(asset: ProductAsset) { return asset.entries.length > 0 && asset.entries.every(e => e.heading.trim().length > 0 || e.body.trim().length > 0); }

// Validate the legacy generator's format-specific contract before importing any result.
export function importGeneratedAsset(format: AssetFormat, value: unknown): ProductAsset {
  const envelope = z.object({ product_title: z.string().min(1).max(200), product_subtitle: z.string().optional(), product_content: z.unknown() }).parse(value);
  const text = z.string().min(1);
  let entries: ProductAsset["entries"];
  if (format === "checklist") {
    const rows = z.array(z.union([z.object({ category: text, items: z.array(text).min(1) }), z.object({ item: text, details: z.string().optional() })])).min(1).parse(envelope.product_content);
    entries = rows.flatMap(r => "category" in r ? r.items.map(item => ({ heading: r.category, body: item })) : [{ heading: r.item, body: r.details ?? "" }]);
  } else if (format === "swipe_file") {
    entries = z.array(z.object({ template_name: text, content: text, when_to_use: z.string().optional() })).min(1).parse(envelope.product_content).map(r => ({ heading: r.template_name, body: [r.when_to_use, r.content].filter(Boolean).join("\n\n") }));
  } else if (format === "habit_tracker") {
    const tracker = z.object({ habits: z.array(z.object({ name: text, description: z.string().optional() })).min(1), daily_structure: z.string().optional() }).parse(envelope.product_content);
    entries = tracker.habits.map(h => ({ heading: h.name, body: h.description ?? "" }));
    envelope.product_subtitle = [envelope.product_subtitle, tracker.daily_structure].filter(Boolean).join("\n\n");
  } else {
    entries = z.array(z.object({ section: text, objective: z.string().optional(), exercises: z.array(text).min(1) })).min(1).parse(envelope.product_content).flatMap(r => r.exercises.map(exercise => ({ heading: r.section, body: [r.objective, exercise].filter(Boolean).join("\n\n") })));
  }
  return productAssetSchema.parse({ id: crypto.randomUUID(), format, title: envelope.product_title, instructions: envelope.product_subtitle ?? "", entries, approved: false });
}

const csvCell = (value: string) => `"${(/^[\s]*[=+@-]/.test(value) ? "'" : "") + value.replace(/"/g, '""')}"`;
export function trackerCSV(asset: ProductAsset) {
  if (asset.format !== "habit_tracker" || !assetReady(asset)) throw new Error("Add tracking habits first.");
  return [["Habit", "Notes", ...Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)], ...asset.entries.map(e => [e.heading, e.body, ...Array(30).fill("")])].map(row => row.map(csvCell).join(",")).join("\r\n");
}
export function assetText(asset: ProductAsset) {
  return [asset.title, asset.instructions, ...asset.entries.map((e, i) => `${i + 1}. ${e.heading}\n${e.body}${asset.format === "worksheet" ? "\n\nYour response: ________________________________________\n______________________________________________________" : ""}${asset.format === "habit_tracker" ? "\nWeek: __________  Mon [ ] Tue [ ] Wed [ ] Thu [ ] Fri [ ] Sat [ ] Sun [ ]" : ""}`)].join("\n\n");
}