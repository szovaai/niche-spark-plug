import { z } from "zod";

export const manuscriptSchema = z.object({
  product_name: z.string().min(1),
  subtitle: z.string().default(""),
  format: z.string().default("PDF guide"),
  outcome: z.string().default(""),
  modules: z.array(z.object({
    title: z.string().min(1), purpose: z.string().default(""),
    sections: z.array(z.object({ title: z.string().min(1), summary: z.string().default(""), html: z.string().optional(), approved: z.boolean().optional() })).min(1),
  })).min(1),
});
export type Outline = z.infer<typeof manuscriptSchema>;
export function parseManuscript(value: unknown): Outline | null {
  const parsed = manuscriptSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
export function manuscriptStats(outline: Outline) {
  const sections = outline.modules.flatMap(m => m.sections);
  const drafted = sections.filter(s => (s.html ?? "").replace(/<[^>]*>/g, "").trim().length >= 50);
  const approved = drafted.filter(s => s.approved);
  return { total: sections.length, drafted: drafted.length, approved: approved.length, complete: sections.length > 0 && approved.length === sections.length };
}

// Legacy browser-only drafts may be imported only into the same owned outline.
export function mergeLegacyDrafts(remote: Outline, local: Outline | null): Outline {
  if (!local || JSON.stringify(remote.modules.map(m => [m.title, m.sections.map(s => s.title)])) !== JSON.stringify(local.modules.map(m => [m.title, m.sections.map(s => s.title)])) || remote.product_name !== local.product_name) return remote;
  return { ...remote, modules: remote.modules.map((m, mi) => ({ ...m, sections: m.sections.map((s, si) => ({ ...s, html: local.modules[mi].sections[si].html ?? s.html, approved: local.modules[mi].sections[si].approved ?? false })) })) };
}