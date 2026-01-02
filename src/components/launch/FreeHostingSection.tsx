import { useState } from "react";
import { 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Cloud, 
  Triangle, 
  Github, 
  Shield, 
  Code, 
  Upload, 
  Server, 
  Zap,
  Sparkles,
  CheckCircle2,
  Copy
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FREE_HOSTING_PLATFORMS, FreeHostingPlatform } from "@/data/freeHostingPlatforms";
import { HostingPickerQuiz } from "./HostingPickerQuiz";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cloud,
  Triangle,
  Github,
  Shield,
  Code,
  Upload,
  Server,
  Zap,
};

interface PlatformCardProps {
  platform: FreeHostingPlatform;
  isExpanded: boolean;
  onToggle: () => void;
}

const PlatformCard = ({ platform, isExpanded, onToggle }: PlatformCardProps) => {
  const IconComponent = iconMap[platform.icon] || Globe;

  const copySteps = () => {
    const text = platform.quickSteps.map((step, i) => `${i + 1}. ${step}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success("Steps copied to clipboard!");
  };

  return (
    <Card className={`transition-all duration-200 ${isExpanded ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : 'hover:bg-muted/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{platform.name}</h4>
                <Badge variant={platform.difficulty === 'beginner' ? 'default' : 'secondary'} className="text-xs">
                  {platform.difficulty === 'beginner' ? 'Easy' : 'Intermediate'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{platform.bestFor}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-3">{platform.description}</p>
        
        <div className="mt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Free tier:</span> {platform.freeTier}
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggle}
            className="flex-1"
          >
            {isExpanded ? 'Hide Steps' : 'View Steps'}
            {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
          <Button 
            size="sm" 
            onClick={() => window.open(platform.setupUrl, '_blank')}
            className="flex-1"
          >
            Open <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Quick Start Steps
              </h5>
              <Button variant="ghost" size="sm" onClick={copySteps} className="h-7 px-2">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            <ol className="space-y-2">
              {platform.quickSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
            {platform.supportsCustomDomain && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-500">
                <CheckCircle2 className="w-3 h-3" />
                Supports custom domains
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const FreeHostingSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  const togglePlatform = (id: string) => {
    setExpandedPlatform(expandedPlatform === id ? null : id);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-dashed border-2 border-blue-500/30 bg-blue-500/5">
        <CollapsibleTrigger asChild>
          <CardContent className="p-6 cursor-pointer hover:bg-blue-500/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Host Your Sales Page for Free
                    <Badge variant="outline" className="text-blue-500 border-blue-500/50">
                      8 Options
                    </Badge>
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    No coding required — just upload your HTML and get a live link
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 px-6 pb-6">
            {/* Hosting Picker Quiz */}
            <div className="mb-6">
              <HostingPickerQuiz />
            </div>

            <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-primary/10 border border-blue-500/20">
              <p className="text-sm text-muted-foreground">
                Or browse all platforms below — all are <span className="text-foreground font-medium">100% free to start</span>.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {FREE_HOSTING_PLATFORMS.map(platform => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  isExpanded={expandedPlatform === platform.id}
                  onToggle={() => togglePlatform(platform.id)}
                />
              ))}
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <h4 className="font-medium flex items-center gap-2 text-amber-500 mb-2">
                <Sparkles className="w-4 h-4" />
                Pro Tip
              </h4>
              <p className="text-sm text-muted-foreground">
                Start with <strong className="text-foreground">Netlify Drop</strong> or <strong className="text-foreground">Tiiny.host</strong> — 
                they're literally drag-and-drop. Takes 30 seconds, no account required for testing. 
                Once you're ready for a custom domain, upgrade to Vercel or Cloudflare Pages.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
