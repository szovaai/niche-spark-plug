import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Code, FileDown, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Step1Product, Step2Content, Step3Funnel, Step4Marketing } from "@/types/launchWizard";

interface ExportHubProps {
  product?: Step1Product | null;
  content?: Step2Content | null;
  funnel?: Step3Funnel | null;
  marketing?: Step4Marketing | null;
  productTitle?: string;
}

type ExportFormat = "markdown" | "docx" | "wordpress" | "notion";

const FORMATS: { id: ExportFormat; label: string; icon: typeof FileText; description: string }[] = [
  { id: "markdown", label: "Markdown", icon: FileDown, description: "Universal .md format for any editor" },
  { id: "docx", label: "DOCX", icon: FileText, description: "Microsoft Word compatible document" },
  { id: "wordpress", label: "WordPress HTML", icon: Code, description: "Ready-to-paste HTML for WordPress" },
  { id: "notion", label: "Notion Import", icon: FileDown, description: "Markdown optimized for Notion" },
];

function buildMarkdown(product: Step1Product | null, content: Step2Content | null, funnel: Step3Funnel | null, marketing: Step4Marketing | null, title: string): string {
  const lines: string[] = [];
  lines.push(`# ${title}\n`);

  if (product) {
    lines.push(`## Product Overview\n`);
    lines.push(`**Title:** ${product.title}`);
    lines.push(`**Subtitle:** ${product.subtitle}`);
    lines.push(`**Concept:** ${product.concept}`);
    lines.push(`**Unique Mechanism:** ${product.uniqueMechanism}\n`);
    if (product.painPoints?.length) {
      lines.push(`### Pain Points\n`);
      product.painPoints.forEach(p => lines.push(`- ${p}`));
      lines.push("");
    }
  }

  if (content) {
    lines.push(`## Product Content\n`);
    lines.push(`### Outline\n${content.outline}\n`);
    content.chapters?.forEach((ch, i) => {
      lines.push(`### Chapter ${i + 1}: ${ch.title}\n`);
      lines.push(`${ch.summary}\n`);
      if (ch.fullContent) {
        lines.push(`${ch.fullContent}\n`);
      } else {
        ch.keyPoints?.forEach(kp => lines.push(`- ${kp}`));
        lines.push("");
      }
    });
    if (content.bonuses?.length) {
      lines.push(`### Bonuses\n`);
      content.bonuses.forEach((b, i) => lines.push(`${i + 1}. ${b}`));
      lines.push("");
    }
  }

  if (funnel) {
    lines.push(`## Sales Funnel\n`);
    lines.push(`### Sales Page\n${funnel.salesPage}\n`);
    lines.push(`### Opt-in Page\n${funnel.optInPage}\n`);
    lines.push(`### Thank You Page\n${funnel.thankYouPage}\n`);
    lines.push(`### Bonus Page\n${funnel.bonusPage}\n`);
    lines.push(`### Checkout Copy\n${funnel.checkoutCopy}\n`);
  }

  if (marketing) {
    lines.push(`## Marketing Assets\n`);
    if (marketing.emails?.length) {
      lines.push(`### Email Sequence\n`);
      marketing.emails.forEach((e, i) => {
        lines.push(`**Email ${i + 1}: ${e.subject}**\n${e.body}\n`);
      });
    }
    if (marketing.socialPosts?.length) {
      lines.push(`### Social Posts\n`);
      marketing.socialPosts.forEach((p, i) => lines.push(`**Post ${i + 1}:**\n${p}\n`));
    }
    if (marketing.blogArticle) {
      lines.push(`### Blog Article\n${marketing.blogArticle}\n`);
    }
    if (marketing.videoScript) {
      lines.push(`### Video Script\n${marketing.videoScript}\n`);
    }
  }

  return lines.join("\n");
}

function markdownToWordpressHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>\n${match}</ul>\n`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\n{2,}/g, "\n\n")
    .split("\n\n")
    .map(p => {
      if (p.startsWith("<h") || p.startsWith("<ul") || p.startsWith("<li")) return p;
      return `<p>${p}</p>`;
    })
    .join("\n\n");
}

export default function ExportHub({ product, content, funnel, marketing, productTitle }: ExportHubProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [copied, setCopied] = useState(false);

  const title = productTitle || product?.title || "My Product";
  const md = buildMarkdown(product || null, content || null, funnel || null, marketing || null, title);

  const exportAs = async (format: ExportFormat) => {
    setExporting(format);
    try {
      switch (format) {
        case "markdown":
        case "notion": {
          const blob = new Blob([md], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success(`${format === "notion" ? "Notion-ready" : "Markdown"} file downloaded!`);
          break;
        }
        case "wordpress": {
          const html = markdownToWordpressHtml(md);
          await navigator.clipboard.writeText(html);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
          toast.success("WordPress HTML copied to clipboard!");
          break;
        }
        case "docx": {
          // DOCX export as HTML-based .doc (universally compatible)
          const htmlContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6;margin:1in;}h1{font-size:24pt;color:#1a1a2e;}h2{font-size:18pt;color:#16213e;border-bottom:1pt solid #ccc;padding-bottom:6pt;}h3{font-size:14pt;color:#0f3460;}ul,ol{margin-left:0.5in;}li{margin-bottom:4pt;}p{margin-bottom:8pt;}</style>
</head><body>${markdownToWordpressHtml(md)}</body></html>`;
          const blob = new Blob([htmlContent], { type: "application/msword" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.doc`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("DOCX file downloaded!");
          break;
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Export Hub</h3>
          <Badge variant="secondary" className="text-[10px]">Multi-Format</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {FORMATS.map(f => (
            <button
              key={f.id}
              onClick={() => exportAs(f.id)}
              disabled={exporting !== null}
              className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
            >
              {exporting === f.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
              ) : f.id === "wordpress" && copied ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <f.icon className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
