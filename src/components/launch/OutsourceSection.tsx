import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Copy, 
  ExternalLink,
  Layers,
  Globe,
  ShoppingBag,
  CreditCard,
  Rocket,
  Lightbulb
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { LaunchPlatform, OutsourceProvider } from "@/types/launch";
import { 
  OUTSOURCE_PROVIDERS, 
  OUTSOURCE_TASKS, 
  DO_NOT_OUTSOURCE, 
  FIVERR_MESSAGE_TEMPLATE,
  getFiverrSearchUrl,
  getRecommendedProviders
} from "@/data/outsourceProviders";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Globe,
  ShoppingBag,
  CreditCard,
  Rocket,
};

interface OutsourceSectionProps {
  platform: LaunchPlatform | null;
}

export const OutsourceSection = ({ platform }: OutsourceSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const recommendedProviders = getRecommendedProviders(platform);

  const copyMessage = () => {
    navigator.clipboard.writeText(FIVERR_MESSAGE_TEMPLATE);
    toast.success("Message copied to clipboard!");
  };

  const openFiverr = (provider: OutsourceProvider) => {
    window.open(getFiverrSearchUrl(provider.searchTerms), '_blank');
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-dashed border-2 border-amber-500/30 bg-amber-500/5">
        <CollapsibleTrigger asChild>
          <div className="p-6 cursor-pointer hover:bg-accent/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Don't Want to Do This Yourself?</h3>
                  <p className="text-sm text-muted-foreground">
                    Outsource Your Launch (Fast & Affordable)
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6 px-6 space-y-6">
            {/* Intro */}
            <p className="text-muted-foreground">
              You already have the assets. They just need to be uploaded and connected.
              Expect to be live within 24–72 hours for $25–$100.
            </p>

            {/* What to Outsource */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                What to Outsource (Exactly)
              </h4>
              <div className="grid gap-2">
                {OUTSOURCE_TASKS.map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{task.task}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">
                This is simple execution work, not development.
              </p>
            </div>

            {/* Provider Cards */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                💼 Where to Hire (Fiverr Recommended)
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedProviders.map(provider => {
                  const Icon = iconMap[provider.icon] || Rocket;
                  return (
                    <Card key={provider.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">{provider.title}</h5>
                            <p className="text-xs text-muted-foreground">{provider.bestFor}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Search for:</p>
                          <p className="text-xs text-foreground">"{provider.searchTerms[0]}"</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Look for:</p>
                          <ul className="text-xs text-foreground space-y-0.5">
                            {provider.lookFor.slice(0, 2).map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm font-semibold text-primary">{provider.typicalCost}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openFiverr(provider)}
                            className="gap-1"
                          >
                            Search
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Copy-Paste Message */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                📝 Copy-Paste Message for Fiverr
              </h4>
              <div className="relative">
                <pre className="text-xs bg-secondary/50 rounded-lg p-4 whitespace-pre-wrap font-mono border">
                  {FIVERR_MESSAGE_TEMPLATE}
                </pre>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={copyMessage}
                  className="absolute top-2 right-2 gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
              </div>
            </div>

            {/* What NOT to Outsource */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-amber-600">
                ⚠️ What NOT to Outsource
              </h4>
              <div className="grid gap-2">
                {DO_NOT_OUTSOURCE.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">
                You already did the valuable part inside DigiStream.
              </p>
            </div>

            {/* Final Advice */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">🎯 Final Advice</h4>
              <p className="text-sm text-muted-foreground">
                If this is your first product: Outsource it once, watch what they do, learn the process.
                Next time, you'll do it yourself — or outsource even faster.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <span className="text-lg">1️⃣</span>
                  <p className="text-xs font-medium mt-1">Do it yourself</p>
                  <p className="text-xs text-muted-foreground">(free)</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <span className="text-lg">2️⃣</span>
                  <p className="text-xs font-medium mt-1">Use a platform</p>
                  <p className="text-xs text-muted-foreground">(easy)</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <span className="text-lg">3️⃣</span>
                  <p className="text-xs font-medium mt-1">Outsource it</p>
                  <p className="text-xs text-muted-foreground">(fastest)</p>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground pt-2">
                All roads lead to: A real product, online, accepting payments. 🚀
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
