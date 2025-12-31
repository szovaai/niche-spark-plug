import { useState } from "react";
import { 
  Download, Package, FileText, Image, Mail, 
  Loader2, Check, Gift, BookOpen, ListChecks,
  Link, ClipboardList, HelpCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createToolkitZip, downloadSinglePDF, ToolkitData, BundleProgress } from "@/lib/zipBundler";
import { ToolkitComponents, ToolkitContent, ToolkitUpsell } from "@/types/toolkit";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ToolkitPreviewProps {
  toolkit: {
    title: string;
    subtitle?: string;
    niche: string;
    targetAudience?: string;
    logoUrl?: string | null;
    ecoverUrl?: string | null;
    components: ToolkitComponents;
    content: ToolkitContent;
    salesLetter?: string;
    upsell?: ToolkitUpsell | null;
  };
  toolkitId: string | null;
  onComplete: () => void;
}

const componentIcons: Record<string, React.ElementType> = {
  guide: BookOpen,
  worksheet: FileText,
  checklist: ListChecks,
  resourceList: Link,
  templates: ClipboardList,
  quiz: HelpCircle,
};

const componentLabels: Record<string, string> = {
  guide: "Main Guide",
  worksheet: "Worksheet",
  checklist: "Checklist",
  resourceList: "Resource List",
  templates: "Templates",
  quiz: "Quiz/Assessment",
};

const ToolkitPreview = ({ toolkit, toolkitId, onComplete }: ToolkitPreviewProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<BundleProgress | null>(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    setDownloadProgress(null);
    
    try {
      await createToolkitZip(
        toolkit as ToolkitData,
        (progress) => setDownloadProgress(progress)
      );
      
      // Update download count in database
      if (toolkitId) {
        await supabase
          .from("toolkits")
          .update({ 
            downloads: (toolkit as any).downloads ? (toolkit as any).downloads + 1 : 1,
            status: "complete"
          })
          .eq("id", toolkitId);
      }
      
      setDownloadComplete(true);
      toast({
        title: "Download Complete!",
        description: "Your toolkit has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error creating your toolkit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const handleDownloadSingle = async (componentKey: string) => {
    setDownloadingFile(componentKey);
    
    try {
      await downloadSinglePDF(componentKey as keyof ToolkitComponents, toolkit as ToolkitData);
      toast({
        title: "Downloaded!",
        description: `${componentLabels[componentKey]} has been downloaded.`,
      });
    } catch (error) {
      console.error("Single download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading this file.",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  const activeComponents = Object.entries(toolkit.components)
    .filter(([_, isActive]) => isActive)
    .map(([key]) => key);

  const progressPercent = downloadProgress 
    ? (downloadProgress.current / downloadProgress.total) * 100 
    : 0;

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold gradient-text">Your Toolkit is Ready!</h2>
          <p className="text-muted-foreground mt-2">
            Review your package and download everything in one click.
          </p>
        </div>

        {/* Preview Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* E-Cover Preview */}
          <div className="flex flex-col items-center">
            {toolkit.ecoverUrl ? (
              <img 
                src={toolkit.ecoverUrl} 
                alt="E-Cover" 
                className="w-48 rounded-lg shadow-lg border border-border" 
              />
            ) : (
              <div className="w-48 h-64 bg-secondary rounded-lg flex items-center justify-center">
                <Image className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <Badge variant="secondary" className="mt-3">E-Cover Included</Badge>
          </div>
          
          {/* Toolkit Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">{toolkit.title}</h3>
              {toolkit.subtitle && (
                <p className="text-muted-foreground text-sm">{toolkit.subtitle}</p>
              )}
              <Badge className="mt-2">{toolkit.niche}</Badge>
            </div>
            
            {/* Components List */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Included Components:</p>
              {activeComponents.map((key) => {
                const Icon = componentIcons[key] || FileText;
                return (
                  <div key={key} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4 text-primary" />
                      <span>{componentLabels[key]}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
                      onClick={() => handleDownloadSingle(key)}
                      disabled={downloadingFile === key}
                    >
                      {downloadingFile === key ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                );
              })}
              
              {/* Sales Letter */}
              {toolkit.salesLetter && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>Sales Letter (HTML)</span>
                </div>
              )}
              
              {/* Upsell */}
              {toolkit.upsell && (
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="w-4 h-4 text-orange-500" />
                  <span>Upsell Page (${toolkit.upsell.price})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download Progress */}
        {isDownloading && downloadProgress && (
          <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{downloadProgress.step}</span>
              <span className="font-medium">{downloadProgress.current}/{downloadProgress.total}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Download Success */}
        {downloadComplete && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-medium">Download complete! Check your downloads folder.</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button 
            variant="hero" 
            size="lg" 
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Package...
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Download Complete Toolkit (ZIP)
              </>
            )}
          </Button>
        </div>

        {/* Complete Button */}
        {downloadComplete && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={onComplete}
              className="gap-2"
            >
              <Check className="w-5 h-5" />
              Mark as Complete & Close
            </Button>
          </div>
        )}

        {/* What's Included Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Package className="w-4 h-4" />
            What's in your ZIP file:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>📁 <strong>Main-Product/</strong> - All your PDFs (guide, worksheets, etc.)</li>
            <li>📁 <strong>Marketing/</strong> - E-cover image + Sales Letter HTML</li>
            {toolkit.upsell && (
              <li>📁 <strong>Upsell/</strong> - Upsell page template</li>
            )}
            <li>📄 <strong>README.txt</strong> - Quick start guide & launch tips</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolkitPreview;
