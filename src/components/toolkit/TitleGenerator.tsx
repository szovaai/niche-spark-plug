import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Check, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TitleOption {
  category: string;
  title: string;
  subtitle: string;
}

interface TitleGeneratorProps {
  niche: string;
  targetAudience?: string;
  thesis?: string;
  currentTitle: string;
  onTitleSelect: (title: string, subtitle: string) => void;
}

const categoryLabels: Record<string, string> = {
  method: "The [X] Method",
  timeline: "[Number] Days to...",
  adjective: "The [Adj] Blueprint",
  transformation: "From [Pain] to [Gain]",
  audience: "[Audience]'s Guide",
};

const TitleGenerator = ({
  niche,
  targetAudience,
  thesis,
  currentTitle,
  onTitleSelect,
}: TitleGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [titles, setTitles] = useState<TitleOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");

  const generateTitles = async () => {
    if (!niche) {
      toast.error("Please enter a niche first");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-toolkit-title", {
        body: {
          niche,
          targetAudience,
          thesis,
          transformation: `helping ${targetAudience || 'readers'} achieve their goals through ${niche}`,
        },
      });

      if (error) throw error;

      if (data?.titles) {
        setTitles(data.titles);
        setSelectedIndex(null);
        setIsOpen(true);
      }
    } catch (err) {
      console.error("Error generating titles:", err);
      toast.error("Failed to generate titles. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    const selected = titles[index];
    setCustomTitle(selected.title);
    setCustomSubtitle(selected.subtitle);
  };

  const handleApply = () => {
    if (customTitle.trim()) {
      onTitleSelect(customTitle.trim(), customSubtitle.trim());
      setIsOpen(false);
      toast.success("Title updated!");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={generateTitles}
          disabled={isGenerating || !niche}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Catchy Titles
            </>
          )}
        </Button>
        {currentTitle && (
          <Badge variant="secondary" className="text-xs">
            Current: {currentTitle.substring(0, 30)}...
          </Badge>
        )}
      </div>

      <AnimatePresence>
        {isOpen && titles.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Choose a Title</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateTitles}
                    disabled={isGenerating}
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                <div className="grid gap-2">
                  {titles.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleSelect(index)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedIndex === index
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-background"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {categoryLabels[option.category] || option.category}
                              </Badge>
                              {selectedIndex === index && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="font-semibold text-foreground">{option.title}</p>
                            <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {selectedIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pt-3 border-t border-border"
                  >
                    <p className="text-xs text-muted-foreground">
                      Customize your selection:
                    </p>
                    <Input
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Title"
                      className="font-semibold"
                    />
                    <Input
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      placeholder="Subtitle"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleApply} className="flex-1">
                        Use This Title
                      </Button>
                      <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TitleGenerator;