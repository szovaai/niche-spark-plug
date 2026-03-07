import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { sanitizeForPDF } from "@/lib/textSanitizer";

interface Props {
  content: string;
  title: string;
  authorName?: string;
  type?: "text" | "worksheet";
  className?: string;
}

/**
 * Download button group for individual asset cards.
 * Generates PDF and DOCX entirely client-side.
 */
export default function AssetDownloadButtons({ content, title, authorName, type = "text", className = "" }: Props) {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const flash = (key: string) => {
    setDownloaded(key);
    toast.success("Downloaded!");
    setTimeout(() => setDownloaded(null), 2000);
  };

  const sanitizeFilename = (name: string) =>
    name.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").toLowerCase().substring(0, 40);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = 210;
    const margins = { top: 30, bottom: 25, left: 25, right: 25 };
    const contentWidth = pageWidth - margins.left - margins.right;

    // Cover page
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 297, "F");
    doc.setFillColor(0, 120, 212);
    doc.rect(0, 0, pageWidth, 4, "F");

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(25, 90, pageWidth - 50, 120, 8, 8, "F");

    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(sanitizeForPDF(title), contentWidth - 20);
    let y = 130;
    titleLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, y, { align: "center" });
      y += 14;
    });

    if (authorName) {
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`By ${authorName}`, pageWidth / 2, y + 15, { align: "center" });
    }

    doc.setFillColor(0, 120, 212);
    doc.rect(0, 289, pageWidth, 8, "F");

    // Content pages
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 297, "F");

    // Left sidebar accent
    doc.setFillColor(0, 120, 212);
    doc.rect(0, 0, 5, 297, "F");

    // Header
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.text(title.substring(0, 50), margins.left, 15);
    doc.text("2", pageWidth - margins.right, 15, { align: "right" });

    y = margins.top + 5;
    const cleanContent = sanitizeForPDF(content);
    const paragraphs = cleanContent.split("\n").filter(p => p.trim());

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    let pageNum = 2;

    paragraphs.forEach(para => {
      const trimmed = para.trim();

      // Headings
      if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
        const headingText = trimmed.replace(/^#+\s*/, "");
        if (y > 250) {
          doc.addPage();
          pageNum++;
          doc.setFillColor(0, 120, 212);
          doc.rect(0, 0, 5, 297, "F");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(title.substring(0, 50), margins.left, 15);
          doc.text(`${pageNum}`, pageWidth - margins.right, 15, { align: "right" });
          y = margins.top + 5;
        }
        y += 4;
        const isH1 = trimmed.startsWith("# ");
        doc.setFontSize(isH1 ? 22 : 16);
        doc.setTextColor(0, 120, 212);
        doc.setFont("helvetica", "bold");
        const hLines = doc.splitTextToSize(headingText, contentWidth);
        hLines.forEach((line: string) => {
          doc.text(line, margins.left, y);
          y += isH1 ? 10 : 8;
        });
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "normal");
        y += 3;
        return;
      }

      // Callout boxes
      if (trimmed.toLowerCase().startsWith("pro tip:") || trimmed.toLowerCase().startsWith("note:")) {
        if (y > 240) {
          doc.addPage();
          pageNum++;
          doc.setFillColor(0, 120, 212);
          doc.rect(0, 0, 5, 297, "F");
          y = margins.top + 5;
        }
        const boxLines = doc.splitTextToSize(trimmed, contentWidth - 15);
        const boxH = 12 + boxLines.length * 5.5;
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margins.left, y - 3, contentWidth, boxH, 2, 2, "F");
        doc.setFillColor(0, 120, 212);
        doc.rect(margins.left, y - 3, 3, boxH, "F");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        boxLines.forEach((line: string, i: number) => {
          doc.text(line, margins.left + 8, y + 5 + i * 5.5);
        });
        y += boxH + 6;
        return;
      }

      // Regular paragraph
      const lines = doc.splitTextToSize(trimmed, contentWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          pageNum++;
          doc.setFillColor(0, 120, 212);
          doc.rect(0, 0, 5, 297, "F");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(title.substring(0, 50), margins.left, 15);
          doc.text(`${pageNum}`, pageWidth - margins.right, 15, { align: "right" });
          y = margins.top + 5;
          doc.setFontSize(11);
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "normal");
        }
        doc.text(line, margins.left, y);
        y += 5.5;
      });
      y += 3;
    });

    // Author bio last page
    if (authorName) {
      doc.addPage();
      pageNum++;
      doc.setFillColor(0, 120, 212);
      doc.rect(0, 0, 5, 297, "F");

      y = margins.top + 20;
      doc.setFontSize(18);
      doc.setTextColor(0, 120, 212);
      doc.setFont("helvetica", "bold");
      doc.text("About the Author", margins.left, y);
      y += 12;

      doc.setDrawColor(0, 120, 212);
      doc.setLineWidth(1);
      doc.line(margins.left, y, margins.left + 40, y);
      y += 12;

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(authorName, margins.left, y);
      y += 20;

      doc.setFontSize(16);
      doc.setTextColor(0, 120, 212);
      doc.setFont("helvetica", "bold");
      doc.text("Resources & Next Steps", margins.left, y);
      y += 10;
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text("Visit the sales page for more resources and premium content.", margins.left, y);
    }

    // Footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margins.left, 280, pageWidth - margins.right, 280);
      if (authorName) {
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`© ${new Date().getFullYear()} ${authorName}`, margins.left, 286);
      }
    }

    doc.save(`${sanitizeFilename(title)}.pdf`);
    flash("pdf");
  };

  const downloadTXT = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(title)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    flash("txt");
  };

  const estimateSize = () => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `~${bytes} B`;
    return `~${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadPDF}
        className="gap-1 text-xs h-7 px-2"
      >
        {downloaded === "pdf" ? <Check className="w-3 h-3 text-green-500" /> : <FileText className="w-3 h-3" />}
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadTXT}
        className="gap-1 text-xs h-7 px-2"
      >
        {downloaded === "txt" ? <Check className="w-3 h-3 text-green-500" /> : <FileSpreadsheet className="w-3 h-3" />}
        TXT
      </Button>
      <span className="text-[10px] text-muted-foreground">{estimateSize()}</span>
    </div>
  );
}
