import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  Megaphone, 
  History,
  Download,
  FileDown,
  Copy,
  RotateCcw,
  ChevronLeft,
  Package,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type TabId = "dashboard" | "content" | "cover" | "marketing" | "history";

interface ToolkitNavbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onDownloadPdf?: () => void;
  onDownloadTxt?: () => void;
  onDownloadZip?: () => void;
  onCopyAll?: () => void;
  onReset?: () => void;
  toolkitTitle?: string;
  isDownloading?: boolean;
  downloadProgress?: string;
}

const tabs = [
  { id: "dashboard" as TabId, label: "Dashboard", icon: LayoutDashboard },
  { id: "content" as TabId, label: "Content Writer", icon: FileText },
  { id: "cover" as TabId, label: "Cover Creator", icon: Image },
  { id: "marketing" as TabId, label: "Marketing Kit", icon: Megaphone },
  { id: "history" as TabId, label: "History", icon: History },
];

const ToolkitNavbar = ({
  activeTab,
  onTabChange,
  onDownloadPdf,
  onDownloadTxt,
  onDownloadZip,
  onCopyAll,
  onReset,
  toolkitTitle = "Untitled Toolkit",
  isDownloading = false,
  downloadProgress = ""
}: ToolkitNavbarProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my-toolkits")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground truncate max-w-[300px]">
              {toolkitTitle}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isDownloading ? downloadProgress : "Toolkit Builder"}
            </p>
          </div>
        </div>

        {/* Download Actions */}
        <div className="flex items-center gap-2">
          {/* Primary: Download ZIP Bundle */}
          <Button
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Download ZIP</span>
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="hidden sm:flex gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadTxt}
            disabled={isDownloading}
            className="hidden sm:flex gap-2"
          >
            <FileDown className="w-4 h-4" />
            TXT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyAll}
            disabled={isDownloading}
            className="hidden md:flex gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy All
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            disabled={isDownloading}
            className="text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolkitNavbar;
export type { TabId };
