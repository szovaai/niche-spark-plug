import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { sanitizeForPDF } from "./textSanitizer";
import { assetReady, assetText, trackerCSV, type ProductAsset } from "./productAssets";
import type { Outline } from "./manuscript";
import { manuscriptPlainText } from "./manuscriptPDF";

const filename = (title: string) => title.replace(/[^a-z0-9]+/gi, "-").slice(0, 80) || "product";
function assetPDF(asset: ProductAsset) {
  if (!assetReady(asset)) throw new Error("Add product content before exporting.");
  const doc = new jsPDF();
  let y = 20;
  const paragraphs = assetText(asset).split("\n");
  if (!asset.approved) paragraphs.unshift("DRAFT");
  for (const paragraph of paragraphs) {
    doc.setFontSize(paragraph === asset.title ? 16 : 11);
    const lines: string[] = paragraph ? doc.splitTextToSize(sanitizeForPDF(paragraph), 175) : [""];
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 20; }
      if (line) doc.text(line, 18, y);
      y += 7;
    }
  }
  return doc;
}
export function exportAsset(asset: ProductAsset, kind: "pdf" | "csv") {
  if (kind === "csv") saveAs(new Blob(["\uFEFF", trackerCSV(asset)], { type: "text/csv;charset=utf-8" }), `${filename(asset.title)}.csv`);
  else assetPDF(asset).save(`${filename(asset.title)}${asset.approved ? "" : "-draft"}.pdf`);
}
export async function exportProductBundle(outline: Outline) {
  const zip = new JSZip();
  let count = 0;
  for (const [i, asset] of (outline.assets ?? []).entries()) {
    if (!assetReady(asset)) continue;
    const path = `PRODUCT/${i + 1}-${filename(asset.title)}`;
    zip.file(`${path}.pdf`, assetPDF(asset).output("arraybuffer"));
    zip.file(`${path}.txt`, assetText(asset));
    if (asset.format === "habit_tracker") zip.file(`${path}.csv`, "\uFEFF" + trackerCSV(asset));
    count++;
  }
  const sections = outline.modules.flatMap(m => m.sections.filter(s => s.html).map(s => `${s.title}\n\n${manuscriptPlainText(s.html ?? "")}`));
  if (sections.length) { zip.file("PRODUCT/Manuscript.txt", sections.join("\n\n")); count++; }
  if (!count) throw new Error("Add product content before exporting.");
  zip.file("PRODUCT/Editable-product.json", JSON.stringify(outline, null, 2));
  zip.file("LAUNCH/README.txt", `${outline.product_name}\n\nContains only saved product content. Unapproved assets are marked DRAFT.\nTracker CSV files can be imported into Excel or Google Sheets; blank daily cells are for customer use.\nEditable-product.json preserves the saved product structure.\nPayment, publishing and delivery are not included.`);
  saveAs(await zip.generateAsync({ type: "blob" }), `${filename(outline.product_name)}-product-bundle.zip`);
}