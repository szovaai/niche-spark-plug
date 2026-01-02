import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, RefreshCw, Download, Check, Sparkles, Layers, Minimize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { COMPONENT_VISUALS, getComponentNames } from "@/lib/ecoverComponents";
import { getLayoutPreview } from "@/lib/ecoverLayout";
import { ECOVER_STYLES, DEPTH_MODES, type DepthMode } from "@/lib/ecoverStyles";

interface ToolkitComponents {
  guide?: boolean;
  worksheet?: boolean;
  checklist?: boolean;
  resourceList?: boolean;
  templates?: boolean;
  quiz?: boolean;
}

interface ToolkitContent {
  guide?: { sections?: unknown[] };
  worksheet?: { exercises?: unknown[] };
  checklist?: { items?: unknown[] };
  resourceList?: { items?: unknown[] };
  templates?: { items?: unknown[] };
  quiz?: { questions?: unknown[] };
}

interface EcoverBundleGeneratorProps {
  title: string;
  components: ToolkitComponents;
  content: ToolkitContent;
  onEcoverGenerated: (url: string) => void;
  existingEcover?: string | null;
}

/**
 * Component-aware eCover Bundle Generator
 * RULE: Only completed components appear in the generated image
 */
const EcoverBundleGenerator = ({ 
  title, 
  components, 
  content,
  onEcoverGenerated, 
  existingEcover 
}: EcoverBundleGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ecoverUrl, setEcoverUrl] = useState(existingEcover || "");
  const [selectedStyle, setSelectedStyle] = useState("premium-dark");
  const [depthMode, setDepthMode] = useState<DepthMode>("stacked");

  // Determine which components are BOTH enabled AND have content
  const completedComponents = useMemo(() => {
    const completed: string[] = [];
    
    if (components.guide && content.guide?.sections && content.guide.sections.length > 0) {
      completed.push('guide');
    }
    if (components.worksheet && content.worksheet?.exercises && content.worksheet.exercises.length > 0) {
      completed.push('worksheet');
    }
    if (components.checklist && content.checklist?.items && content.checklist.items.length > 0) {
      completed.push('checklist');
    }
    if (components.resourceList && content.resourceList?.items && content.resourceList.items.length > 0) {
      completed.push('resourceList');
    }
    if (components.templates && content.templates?.items && content.templates.items.length > 0) {
      completed.push('templates');
    }
    if (components.quiz && content.quiz?.questions && content.quiz.questions.length > 0) {
      completed.push('quiz');
    }
    
    return completed;
  }, [components, content]);

  // Get layout preview based on completed component count
  const layoutPreview = useMemo(() => {
    return getLayoutPreview(completedComponents.length);
  }, [completedComponents.length]);

  const generateEcover = async () => {
    if (completedComponents.length === 0) {
      toast.error("Complete at least one component before generating the eCover.");
      return;
    }

    setIsGenerating(true);
    toast.info(`Generating bundle eCover with ${completedComponents.length} component(s)...`);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-ecover", {
        body: {
          productTitle: title,
          selectedComponents: completedComponents,
          stylePreset: selectedStyle,
          depthMode: depthMode
        }
      });

      if (error) {
        console.error("Ecover generation error:", error);
        toast.error("Failed to generate eCover. Please try again.");
        return;
      }

      if (data?.imageUrl) {
        setEcoverUrl(data.imageUrl);
        onEcoverGenerated(data.imageUrl);
        toast.success(`eCover generated with ${data.componentsRendered?.length || completedComponents.length} components!`);
      } else {
        toast.error("No image returned. Please try again.");
      }
    } catch (err) {
      console.error("Ecover error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!ecoverUrl) return;
    
    const link = document.createElement('a');
    link.href = ecoverUrl;
    link.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-ecover.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentStyle = ECOVER_STYLES.find(s => s.id === selectedStyle) || ECOVER_STYLES[0];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="w-5 h-5 text-primary" />
          eCover Bundle Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          What you select = what appears. Only completed components are rendered.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Component Status Grid */}
        <div>
          <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
            Component Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COMPONENT_VISUALS.map((visual) => {
              const isEnabled = components[visual.id as keyof ToolkitComponents];
              const isCompleted = completedComponents.includes(visual.id);
              const IconComponent = visual.icon;
              
              return (
                <div 
                  key={visual.id}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${isCompleted 
                      ? 'bg-primary/10 border-primary/30' 
                      : isEnabled 
                        ? 'bg-secondary/50 border-border/50' 
                        : 'bg-muted/30 border-border/30 opacity-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className={`w-4 h-4 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">{visual.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <Badge variant="default" className="text-xs bg-primary/20 text-primary border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    ) : isEnabled ? (
                      <Badge variant="secondary" className="text-xs">
                        Not started
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs opacity-50">
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layout Preview */}
        <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Layout Preview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedComponents.length === 0 
                  ? "Complete components to enable generation"
                  : layoutPreview.name
                }
              </p>
            </div>
            {completedComponents.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {layoutPreview.description}
              </Badge>
            )}
          </div>
          
          {completedComponents.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {getComponentNames(completedComponents).map((name, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Style Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Visual Style</Label>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ECOVER_STYLES.map(style => (
                  <SelectItem key={style.id} value={style.id}>
                    <div className="flex flex-col">
                      <span>{style.name}</span>
                      <span className="text-xs text-muted-foreground">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Depth Mode</Label>
            <div className="flex items-center gap-4 h-10">
              <div className="flex items-center gap-2">
                <Minimize2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Minimal</span>
              </div>
              <Switch
                checked={depthMode === 'stacked'}
                onCheckedChange={(checked) => setDepthMode(checked ? 'stacked' : 'minimal')}
              />
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Stacked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="relative">
          <div className="w-full aspect-[3/2] rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/30 overflow-hidden">
            <AnimatePresence mode="wait">
              {ecoverUrl ? (
                <motion.img 
                  key="ecover"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  src={ecoverUrl} 
                  alt="Generated eCover" 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 text-muted-foreground"
                >
                  <Image className="w-16 h-16 opacity-30" />
                  <p className="text-sm">
                    {completedComponents.length === 0 
                      ? "Complete components to generate"
                      : "Click Generate to create your bundle eCover"
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="hero" 
            onClick={generateEcover} 
            disabled={isGenerating || completedComponents.length === 0}
            className="flex-1 gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating (~60s)...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {ecoverUrl ? "Regenerate Bundle eCover" : "Generate Bundle eCover"}
              </>
            )}
          </Button>

          {ecoverUrl && (
            <Button 
              variant="outline" 
              onClick={downloadImage}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
        </div>

        {/* Success State */}
        {ecoverUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-green-400"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">
              Bundle eCover ready with {completedComponents.length} component{completedComponents.length !== 1 ? 's' : ''}!
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default EcoverBundleGenerator;
