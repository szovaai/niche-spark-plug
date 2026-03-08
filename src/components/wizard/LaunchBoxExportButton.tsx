import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Package, Download, Loader2, CheckCircle2, FolderOpen } from "lucide-react";
import { createLaunchBoxZip, type LaunchBoxData, type LaunchBoxProgress } from "@/lib/launchBoxExport";
import type { Step1Product, Step2Content, Step3Graphics, Step3Funnel, Step4Marketing, Step5Checklist } from "@/types/launchWizard";
import type { ProductAssets } from "@/types/productAssets";
import { toast } from "sonner";

interface Props {
  product: Step1Product | null;
  content: Step2Content | null;
  funnel: Step3Funnel | null;
  marketing: Step4Marketing | null;
  checklist: Step5Checklist | null;
  graphics?: Step3Graphics | null;
  assets: ProductAssets;
  niche: string;
  price: number;
  authorName?: string;
}

const FOLDER_ITEMS = [
  { folder: "PRODUCT", files: ["Ebook.txt", "Workbook.txt", "CheatSheets.txt"], icon: "📄" },
  { folder: "BONUSES", files: ["Bonus1.txt", "Bonus2.txt", "Bonus3.txt"], icon: "🎁" },
  { folder: "FUNNEL", files: ["SalesPageCopy.txt", "OptinPageCopy.txt", "UpsellPageCopy.txt", "OrderBumpCopy.txt"], icon: "🔗" },
  { folder: "AFFILIATE", files: ["JVPage.txt", "AffiliateEmails.txt", "SocialPosts.txt"], icon: "🤝" },
  { folder: "MARKETING", files: ["EmailSwipes.txt", "AdCopy.txt", "VideoScript.txt"], icon: "📣" },
  { folder: "GRAPHICS", files: ["ProductCover.png", "BundleBox.png"], icon: "🎨" },
  { folder: "LAUNCH", files: ["LaunchTimeline.txt", "LaunchChecklist.txt"], icon: "🚀" },
];

export default function LaunchBoxExportButton({ product, content, funnel, marketing, checklist, graphics, assets, niche, price, authorName }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<LaunchBoxProgress | null>(null);
  const [showModal, setShowModal] = useState(false);

  const hasEnoughData = !!(product && (content || funnel));

  const handleExport = async () => {
    if (!product) return;
    setExporting(true);
    setShowModal(true);
    setProgress({ step: "Preparing...", current: 0, total: 8 });

    try {
      await createLaunchBoxZip(
        { product, content, funnel, marketing, checklist, graphics: graphics || null, assets, niche, price, authorName },
        setProgress
      );
      toast.success("🎉 Your Launch Kit has been downloaded!");
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setTimeout(() => {
        setExporting(false);
        setShowModal(false);
        setProgress(null);
      }, 1500);
    }
  };

  return (
    <>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Launch In A Box</h3>
              <p className="text-xs text-muted-foreground">Download your complete launch kit as a structured folder</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FOLDER_ITEMS.map(item => (
              <div key={item.folder} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-card border border-border">
                <span>{item.icon}</span>
                <div>
                  <p className="font-medium">{item.folder}/</p>
                  <p className="text-muted-foreground">{item.files.length} files</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleExport}
            disabled={!hasEnoughData || exporting}
            className="w-full gap-2"
            variant="hero"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export My Launch Kit
          </Button>

          {!hasEnoughData && (
            <p className="text-xs text-muted-foreground text-center">Complete Steps 1-2 to enable export</p>
          )}
        </CardContent>
      </Card>

      {/* Export Progress Modal */}
      <Dialog open={showModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-bold">Building Your Launch Kit</h3>
            </div>

            <div className="space-y-3">
              {["Building product files...", "Packaging bonuses...", "Assembling funnel copy...", "Creating affiliate kit...", "Adding marketing assets...", "Generating launch plan...", "Finalizing your launch kit..."].map((label, i) => {
                const stepNum = i + 1;
                const isDone = (progress?.current || 0) > stepNum;
                const isCurrent = (progress?.current || 0) === stepNum;
                return (
                  <div key={label} className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />
                    )}
                    <span className={`text-sm ${isDone ? "text-muted-foreground" : isCurrent ? "font-medium" : "text-muted-foreground/50"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${((progress?.current || 0) / 7) * 100}%` }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
