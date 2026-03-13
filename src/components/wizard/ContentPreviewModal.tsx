import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Download, Printer } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import ReadabilityMeter from "./ReadabilityMeter";

interface ContentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  chapterNumber?: number;
}

export default function ContentPreviewModal({ open, onClose, title, content, chapterNumber }: ContentPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chapterNumber ? `Chapter_${chapterNumber}_` : ""}${title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.8; font-size: 14px; }
          h1 { font-size: 24px; margin-bottom: 8px; border-bottom: 2px solid #333; padding-bottom: 8px; }
          h2 { font-size: 20px; margin-top: 32px; }
          h3 { font-size: 16px; margin-top: 24px; }
          p { margin: 12px 0; }
          ul, ol { margin: 12px 0; padding-left: 24px; }
          li { margin: 4px 0; }
          blockquote { border-left: 3px solid #666; padding-left: 16px; margin: 16px 0; color: #555; font-style: italic; }
          .chapter-num { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
          hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
          @media print { body { margin: 0; padding: 20px; } }
        </style>
      </head>
      <body>
        ${chapterNumber ? `<div class="chapter-num">Chapter ${chapterNumber}</div>` : ""}
        <h1>${title}</h1>
        ${content.split("\n").map(line => {
          if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
          if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
          if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
          if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
          if (line.startsWith("> ")) return `<blockquote>${line.slice(2)}</blockquote>`;
          if (line.startsWith("---")) return "<hr />";
          if (line.trim() === "") return "";
          return `<p>${line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/`(.*?)`/g, "<code>$1</code>")}</p>`;
        }).join("\n")}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Simple markdown rendering
  const renderMarkdown = (md: string) => {
    return md.split("\n").map((line, i) => {
      if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold mt-6 mb-2 text-foreground">{line.slice(4)}</h3>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-8 mb-3 text-foreground">{line.slice(3)}</h2>;
      if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-8 mb-3 text-foreground">{line.slice(2)}</h1>;
      if (line.startsWith("- ")) return <li key={i} className="text-sm text-muted-foreground ml-4 list-disc">{renderInline(line.slice(2))}</li>;
      if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-accent pl-3 my-2 italic text-sm text-muted-foreground">{renderInline(line.slice(2))}</blockquote>;
      if (line.startsWith("---")) return <hr key={i} className="my-6 border-border" />;
      if (line.trim() === "") return <div key={i} className="h-3" />;
      return <p key={i} className="text-sm text-muted-foreground leading-relaxed my-1.5">{renderInline(line)}</p>;
    });
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
      if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="bg-secondary/50 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
      return part;
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {chapterNumber && <Badge variant="outline" className="text-xs">Ch. {chapterNumber}</Badge>}
              <DialogTitle className="text-lg">{title}</DialogTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1 text-xs">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1 text-xs">
                <Download className="w-3 h-3" /> Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1 text-xs">
                <Printer className="w-3 h-3" /> Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-4">
          <ReadabilityMeter text={content} label="Content Quality Metrics" />

          <div ref={contentRef} className="p-6 rounded-lg bg-background border border-border">
            {renderMarkdown(content)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
