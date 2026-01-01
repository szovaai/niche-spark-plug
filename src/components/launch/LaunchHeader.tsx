import { Check, Package, FileText, Image, Mail, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LaunchChecklist, ToolkitLaunchData } from "@/types/launch";

interface LaunchHeaderProps {
  toolkit: ToolkitLaunchData;
  checklist: LaunchChecklist;
}

export const LaunchHeader = ({ toolkit, checklist }: LaunchHeaderProps) => {
  const checklistItems = [
    { key: 'hasGuide', label: 'Guide', icon: FileText, done: checklist.hasGuide },
    { key: 'hasBonuses', label: 'Bonuses', icon: Package, done: checklist.hasBonuses },
    { key: 'hasCover', label: 'Cover', icon: Image, done: checklist.hasCover },
    { key: 'hasSalesLetter', label: 'Sales Copy', icon: Mail, done: checklist.hasSalesLetter },
    { key: 'hasProductName', label: 'Title', icon: FileText, done: checklist.hasProductName },
  ];

  const completedCount = checklistItems.filter(item => item.done).length;
  const isReady = completedCount >= 4;

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-card/50 rounded-xl border border-border/50">
      {/* Cover Preview */}
      <div className="flex-shrink-0">
        {toolkit.ecoverUrl ? (
          <img
            src={toolkit.ecoverUrl}
            alt={toolkit.title}
            className="w-32 h-40 object-cover rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-32 h-40 bg-muted rounded-lg flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{toolkit.title}</h1>
          <Badge 
            variant={isReady ? "default" : "secondary"}
            className={isReady ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
          >
            {isReady ? "Ready to Launch" : "Almost Ready"}
          </Badge>
        </div>
        
        {toolkit.subtitle && (
          <p className="text-muted-foreground mb-3">{toolkit.subtitle}</p>
        )}

        <div className="text-sm text-muted-foreground mb-4">
          <span className="text-foreground font-medium">{toolkit.niche}</span>
          {toolkit.targetAudience && (
            <> • For {toolkit.targetAudience}</>
          )}
        </div>

        {/* Mini Checklist */}
        <div className="flex flex-wrap gap-2">
          {checklistItems.map((item) => (
            <div
              key={item.key}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                item.done
                  ? "bg-green-500/20 text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {item.done ? (
                <Check className="w-3 h-3" />
              ) : (
                <item.icon className="w-3 h-3" />
              )}
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
