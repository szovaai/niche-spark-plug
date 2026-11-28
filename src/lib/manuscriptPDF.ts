import DOMPurify from "dompurify";
import { generateGuidePDF } from "./pdfGenerator";
import { manuscriptStats, type Outline } from "./manuscript";

export function manuscriptPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(DOMPurify.sanitize(html), "text/html");
  doc.querySelectorAll("p,h1,h2,h3,h4,li,br").forEach(node => node.append(doc.createTextNode("\n\n")));
  return doc.body.textContent?.trim() ?? "";
}
export function exportManuscriptPDF(outline: Outline) {
  const stats = manuscriptStats(outline);
  if (!stats.drafted) throw new Error("Draft a section before exporting.");
  const guide = {
    title: outline.product_name,
    sections: outline.modules.flatMap(m => m.sections.filter(s => s.html && manuscriptPlainText(s.html).length >= 50).map(s => ({ heading: s.title, content: manuscriptPlainText(s.html ?? "") }))),
  };
  const doc = generateGuidePDF(guide, outline.product_name, stats.complete ? outline.subtitle : `DRAFT — ${stats.drafted} of ${stats.total} sections`);
  doc.save(`${outline.product_name.replace(/[^a-z0-9]+/gi, "-").slice(0, 80)}${stats.complete ? "" : "-draft"}.pdf`);
}