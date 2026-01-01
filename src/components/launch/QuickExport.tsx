import { useState } from "react";
import { Copy, Download, FileText, Mail, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToolkitLaunchData, LaunchPlatform } from "@/types/launch";
import { formatForPlatform, generateSalesPageHtml } from "@/lib/launchExport";
import { createToolkitZip, ToolkitData } from "@/lib/zipBundler";
import { toast } from "sonner";

interface QuickExportProps {
  toolkit: ToolkitLaunchData;
  platform: LaunchPlatform | null;
}

export const QuickExport = ({ toolkit, platform }: QuickExportProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = async (content: string, label: string, key: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedItem(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const toolkitData: ToolkitData = {
        title: toolkit.title,
        subtitle: toolkit.subtitle,
        niche: toolkit.niche,
        targetAudience: toolkit.targetAudience,
        ecoverUrl: toolkit.ecoverUrl,
        components: toolkit.components as any,
        content: toolkit.content as any,
        salesLetter: toolkit.salesLetter,
      };
      
      await createToolkitZip(toolkitData);
      toast.success("Toolkit ZIP downloaded successfully!");
    } catch (error) {
      console.error("Error downloading ZIP:", error);
      toast.error("Failed to download ZIP");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSalesPage = () => {
    const html = generateSalesPageHtml(
      toolkit.title,
      toolkit.salesLetter || '',
      toolkit.ecoverUrl,
      '[YOUR_CHECKOUT_URL]'
    );
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolkit.title.toLowerCase().replace(/\s+/g, '-')}-sales-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sales page HTML downloaded!");
  };

  const formattedSalesLetter = toolkit.salesLetter && platform
    ? formatForPlatform(toolkit.salesLetter, platform)
    : toolkit.salesLetter || '';

  const platformName = platform 
    ? platform.charAt(0).toUpperCase() + platform.slice(1) 
    : 'your platform';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Quick Export</h2>
        <p className="text-sm text-muted-foreground">
          Download and copy everything you need
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Download All Files */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Download All Files</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get your complete toolkit as a ZIP file
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleDownloadZip}
                disabled={isDownloading}
              >
                {isDownloading ? "Downloading..." : "Download ZIP"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Copy Sales Letter */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Copy Sales Letter</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Formatted for {platformName}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => handleCopy(formattedSalesLetter, 'Sales letter', 'sales')}
                disabled={!toolkit.salesLetter}
              >
                {copiedItem === 'sales' ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Download Sales Page HTML */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <ExternalLink className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Download Sales Page</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ready-to-host HTML file
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleDownloadSalesPage}
                disabled={!toolkit.salesLetter}
              >
                <Download className="w-3 h-3 mr-1" />
                Download HTML
              </Button>
            </div>
          </div>
        </Card>

        {/* Copy Product Title */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Copy Product Title</h3>
              <p className="text-sm text-muted-foreground mt-1">
                "{toolkit.title}"
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => handleCopy(toolkit.title, 'Product title', 'title')}
              >
                {copiedItem === 'title' ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Title
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
