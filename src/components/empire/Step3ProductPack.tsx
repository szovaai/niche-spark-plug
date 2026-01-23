import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, Sparkles, Loader2, Check, ChevronRight, 
  DollarSign, Zap, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmpireProject, ProductPack, SheetSchema } from "@/types/empire";

interface Step3ProductPackProps {
  project: Partial<EmpireProject>;
  onUpdate: (updates: Partial<EmpireProject>) => void;
  onNext: () => void;
}

export const Step3ProductPack = ({ project, onUpdate, onNext }: Step3ProductPackProps) => {
  const { toast } = useToast();
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [problemDescription, setProblemDescription] = useState("");

  const productBrief = project.step3_product_brief as ProductPack | null;
  const sheetSchema = project.step3_sheet_schema as SheetSchema | null;

  const handleGenerateProduct = async () => {
    if (!project.step1_final_niche) {
      toast({
        title: "Select a niche first",
        description: "Go back to Step 1 and select your niche.",
        variant: "destructive",
      });
      return;
    }

    setLoadingProduct(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-product", {
        body: { 
          niche: project.step1_final_niche, 
          problemDescription: problemDescription || `Help people with ${project.step1_final_niche}`,
        },
      });

      if (error) throw error;

      onUpdate({ 
        step3_product_brief: data,
        step3_selected_product: data.product_name,
        step3_price_range: data.price_range,
      });
      toast({ title: "Product concept generated!" });
    } catch (error: any) {
      console.error("Product generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleGenerateSchema = async () => {
    if (!productBrief) {
      toast({
        title: "Generate a product first",
        variant: "destructive",
      });
      return;
    }

    setLoadingSchema(true);
    try {
      const { data, error } = await supabase.functions.invoke("empire-generate-product", {
        body: { 
          type: "schema",
          productName: productBrief.product_name,
          productPromise: productBrief.product_promise,
        },
      });

      if (error) throw error;

      onUpdate({ 
        step3_sheet_schema: { tabs: data.tabs },
        step3_manual_text: data.manual_text,
      });
      toast({ title: "Sheet schema generated!" });
    } catch (error: any) {
      console.error("Schema generation error:", error);
      toast({
        title: "Generation failed",
        variant: "destructive",
      });
    } finally {
      setLoadingSchema(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Context Display */}
      <div className="p-3 bg-secondary/50 rounded-lg flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Niche:</span>
        <Badge variant="secondary">{project.step1_final_niche || "Not selected"}</Badge>
        <span className="text-muted-foreground ml-2">Brand:</span>
        <Badge variant="secondary">{project.step2_selected_brand || "Not selected"}</Badge>
      </div>

      {/* Product Pack Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-primary" />
            Product Pack Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              What problem does your product solve?
            </label>
            <Textarea
              placeholder="Describe the main problem you want to solve for your audience...&#10;&#10;Example: Help busy professionals organize their daily tasks and track progress toward their goals without complex apps."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleGenerateProduct} disabled={loadingProduct} className="w-full gap-2">
            {loadingProduct ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating product concept...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Product Pack Concept</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Product Brief Display */}
      {productBrief && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl gradient-text">{productBrief.product_name}</CardTitle>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {productBrief.price_range}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Promise</h4>
                <p className="font-medium">{productBrief.product_promise}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Why People Buy NOW</h4>
                <p className="text-sm">{productBrief.urgency_reason}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">What's Inside</h4>
                <div className="flex flex-wrap gap-2">
                  {productBrief.elements.map((element, i) => (
                    <Badge key={i} variant="outline" className="gap-1">
                      <Zap className="w-3 h-3" />
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Build Steps</h4>
                <ol className="space-y-1">
                  {productBrief.build_steps.map((step, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Sheet Schema Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Sheet / System Schema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGenerateSchema} disabled={loadingSchema} className="w-full gap-2">
                {loadingSchema ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating schema...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Sheet Schema & Manual</>
                )}
              </Button>

              {sheetSchema && (
                <Tabs defaultValue={sheetSchema.tabs[0]?.name || "tab-0"} className="mt-4">
                  <TabsList className="w-full flex-wrap h-auto gap-1">
                    {sheetSchema.tabs.map((tab, i) => (
                      <TabsTrigger key={i} value={tab.name} className="text-sm">
                        {tab.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {sheetSchema.tabs.map((tab, i) => (
                    <TabsContent key={i} value={tab.name} className="mt-4">
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">{tab.purpose}</p>
                        <div className="space-y-2">
                          {tab.columns.map((col, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm">
                              <Badge variant="outline" className="shrink-0">{col.name}</Badge>
                              <span className="text-muted-foreground">{col.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}

              {project.step3_manual_text && (
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-2">User Manual</h4>
                  <div className="prose prose-sm prose-invert max-w-none text-muted-foreground whitespace-pre-line">
                    {project.step3_manual_text}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Continue Button */}
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your product:</p>
                  <p className="font-bold text-lg">{productBrief.product_name}</p>
                </div>
                <Button onClick={onNext} className="ml-auto gap-2">
                  Continue to Launch
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
