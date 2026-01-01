import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  RefreshCw, 
  Copy, 
  Check,
  Mail,
  FileText,
  DollarSign,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MarketingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: "pending" | "generating" | "complete";
  content?: string;
  wordCount?: number;
}

interface MarketingKitDashboardProps {
  salesLetter?: string;
  emailSequence?: { subject: string; body: string }[];
  upsell?: { title: string; description: string; price: number };
  onRegenerateSalesLetter: () => void;
  onRegenerateEmailSequence: () => void;
  onRegenerateUpsell: () => void;
  isGenerating?: { salesLetter?: boolean; emailSequence?: boolean; upsell?: boolean };
}

const MarketingKitDashboard = ({
  salesLetter,
  emailSequence,
  upsell,
  onRegenerateSalesLetter,
  onRegenerateEmailSequence,
  onRegenerateUpsell,
  isGenerating = {},
}: MarketingKitDashboardProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (content: string, sectionId: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(sectionId);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const sections: MarketingSection[] = [
    {
      id: "salesLetter",
      title: "Sales Letter",
      description: "Proprietary Salesletter Framework",
      icon: FileText,
      status: salesLetter ? "complete" : isGenerating.salesLetter ? "generating" : "pending",
      content: salesLetter,
      wordCount: salesLetter ? salesLetter.split(/\s+/).length : 0,
    },
    {
      id: "emailSequence",
      title: "14-Day Email Sequence",
      description: "Pre-sale and follow-up emails",
      icon: Mail,
      status: emailSequence?.length ? "complete" : isGenerating.emailSequence ? "generating" : "pending",
      wordCount: emailSequence?.reduce((sum, e) => sum + e.body.split(/\s+/).length, 0) || 0,
    },
    {
      id: "upsell",
      title: "Upsell Offer",
      description: "Premium upsell product idea",
      icon: DollarSign,
      status: upsell ? "complete" : isGenerating.upsell ? "generating" : "pending",
    },
    {
      id: "launchPlaybook",
      title: "48-Hour Launch Playbook",
      description: "Step-by-step launch checklist",
      icon: Rocket,
      status: "complete",
    },
  ];

  const statusConfig = {
    pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
    generating: { label: "Generating...", className: "bg-primary/20 text-primary animate-pulse" },
    complete: { label: "Complete", className: "bg-green-500/20 text-green-400" },
  };

  const handleRegenerate = (sectionId: string) => {
    switch (sectionId) {
      case "salesLetter":
        onRegenerateSalesLetter();
        break;
      case "emailSequence":
        onRegenerateEmailSequence();
        break;
      case "upsell":
        onRegenerateUpsell();
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {sections.map((section) => (
          <Card key={section.id} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  section.status === "complete"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <section.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{section.title}</p>
                <Badge className={cn("text-xs", statusConfig[section.status].className)}>
                  {statusConfig[section.status].label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className={cn(
              "border border-border rounded-lg transition-all",
              expandedSection === section.id ? "bg-card" : "bg-card/50"
            )}
          >
            {/* Header */}
            <button
              onClick={() =>
                setExpandedSection(expandedSection === section.id ? null : section.id)
              }
              className="w-full flex items-center gap-4 p-4"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  section.status === "complete"
                    ? "bg-primary/20"
                    : "bg-muted"
                )}
              >
                {section.status === "complete" ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <section.icon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {section.description}
                </p>
              </div>

              {section.wordCount && section.wordCount > 0 && (
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {section.wordCount.toLocaleString()} words
                </span>
              )}

              <Badge className={cn("shrink-0", statusConfig[section.status].className)}>
                {statusConfig[section.status].label}
              </Badge>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (section.content) {
                      handleCopy(section.content, section.id);
                    }
                  }}
                  disabled={!section.content}
                  className="h-8 w-8"
                >
                  {copied === section.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerate(section.id);
                  }}
                  disabled={section.status === "generating"}
                  className="h-8 w-8"
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      section.status === "generating" && "animate-spin"
                    )}
                  />
                </Button>
              </div>

              {expandedSection === section.id ? (
                <ChevronUp className="w-5 h-5 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 shrink-0" />
              )}
            </button>

            {/* Expanded Content */}
            {expandedSection === section.id && (
              <div className="px-4 pb-4 border-t border-border">
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  {section.id === "salesLetter" && salesLetter && (
                    <div
                      className="prose prose-invert max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: salesLetter }}
                    />
                  )}
                  
                  {section.id === "emailSequence" && emailSequence && emailSequence.length > 0 && (
                    <div className="space-y-4">
                      {emailSequence.slice(0, 3).map((email, index) => (
                        <div key={index} className="p-3 bg-background/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Day {index + 1}</p>
                          <p className="font-medium text-sm">{email.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {email.body}
                          </p>
                        </div>
                      ))}
                      {emailSequence.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{emailSequence.length - 3} more emails
                        </p>
                      )}
                    </div>
                  )}

                  {section.id === "upsell" && upsell && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">{upsell.title}</h4>
                      <p className="text-sm text-muted-foreground">{upsell.description}</p>
                      <p className="text-lg font-bold text-primary">${upsell.price}</p>
                    </div>
                  )}

                  {section.id === "launchPlaybook" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          1
                        </div>
                        <span className="text-sm">Finalize all product files</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          2
                        </div>
                        <span className="text-sm">Upload to marketplace</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          3
                        </div>
                        <span className="text-sm">Set up email automation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          4
                        </div>
                        <span className="text-sm">Launch promotion</span>
                      </div>
                    </div>
                  )}

                  {!section.content && section.id !== "launchPlaybook" && section.id !== "emailSequence" && section.id !== "upsell" && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Not generated yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerate(section.id)}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Generate Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketingKitDashboard;
