import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Copy, Mail, FileText, FileJson, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { exportAsMarkdown, downloadAsFile, exportAsJSON, copyAllToClipboard } from "@/lib/exportUtils";
import { toast } from "sonner";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    blueprint?: any;
    bundles?: any;
    launchKit?: any;
    listingKit?: any;
    productName: string;
  };
}

const ExportModal = ({ isOpen, onClose, data }: ExportModalProps) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleCopyAll = async () => {
    const markdown = exportAsMarkdown(data);
    await copyAllToClipboard(markdown);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    setDownloading("md");
    const markdown = exportAsMarkdown(data);
    const filename = `${data.productName.replace(/\s+/g, "-").toLowerCase()}-blueprint.md`;
    downloadAsFile(markdown, filename, "text/markdown");
    toast.success("Downloaded as Markdown!");
    setTimeout(() => setDownloading(null), 500);
  };

  const handleDownloadJSON = () => {
    setDownloading("json");
    const filename = `${data.productName.replace(/\s+/g, "-").toLowerCase()}-blueprint.json`;
    exportAsJSON({
      productName: data.productName,
      blueprint: data.blueprint,
      bundles: data.bundles,
      launchKit: data.launchKit,
      listingKit: data.listingKit,
      exportedAt: new Date().toISOString(),
    }, filename);
    toast.success("Downloaded as JSON!");
    setTimeout(() => setDownloading(null), 500);
  };

  const handleDownloadText = () => {
    setDownloading("txt");
    const markdown = exportAsMarkdown(data);
    const filename = `${data.productName.replace(/\s+/g, "-").toLowerCase()}-blueprint.txt`;
    downloadAsFile(markdown, filename, "text/plain");
    toast.success("Downloaded as Text!");
    setTimeout(() => setDownloading(null), 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export "{data.productName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Quick Copy */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleCopyAll}
            className="w-full p-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">Copy All to Clipboard</p>
                <p className="text-sm text-muted-foreground">
                  Paste into Notion, Google Docs, etc.
                </p>
              </div>
            </div>
          </motion.button>

          {/* Download Options */}
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadMarkdown}
              disabled={downloading === "md"}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-secondary flex items-center justify-center">
                {downloading === "md" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <p className="text-sm font-medium">.md</p>
              <p className="text-xs text-muted-foreground">Markdown</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadJSON}
              disabled={downloading === "json"}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-secondary flex items-center justify-center">
                {downloading === "json" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileJson className="w-5 h-5" />
                )}
              </div>
              <p className="text-sm font-medium">.json</p>
              <p className="text-xs text-muted-foreground">Data</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadText}
              disabled={downloading === "txt"}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-secondary flex items-center justify-center">
                {downloading === "txt" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <p className="text-sm font-medium">.txt</p>
              <p className="text-xs text-muted-foreground">Plain Text</p>
            </motion.button>
          </div>

          {/* What's Included */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs font-medium mb-2">Export includes:</p>
            <div className="flex flex-wrap gap-2">
              {data.blueprint && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  ✓ Blueprint
                </span>
              )}
              {data.bundles && (
                <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
                  ✓ Bundles
                </span>
              )}
              {data.launchKit && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  ✓ Launch Kit
                </span>
              )}
              {data.listingKit && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                  ✓ Listing Kit
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Generated by DigiStream • {new Date().toLocaleDateString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
