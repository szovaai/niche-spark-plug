import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOOLKIT_TEMPLATES, ToolkitTemplate } from "@/data/toolkitTemplates";

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelect: (template: ToolkitTemplate) => void;
}

const TemplateSelector = ({ selectedTemplate, onSelect }: TemplateSelectorProps) => {
  // Sort templates: blank (Start from Scratch) first, then the rest
  const sortedTemplates = [...TOOLKIT_TEMPLATES].sort((a, b) => {
    if (a.id === "blank") return -1;
    if (b.id === "blank") return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
        <p className="text-muted-foreground">
          Start with a pre-built template or create from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={template.id === "blank" ? "sm:col-span-2 lg:col-span-1" : ""}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 h-full hover:shadow-md hover:border-accent/50 ${
                selectedTemplate === template.id
                  ? "border-accent ring-2 ring-accent/20 bg-accent/5"
                  : ""
              } ${
                template.id === "blank"
                  ? "border-dashed border-2 bg-gradient-to-br from-accent/5 to-primary/5"
                  : ""
              }`}
              onClick={() => onSelect(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      {template.id !== "blank" && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {Object.values(template.components).filter(Boolean).length} components
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                </div>

                {/* Category badge for non-blank templates */}
                {template.id !== "blank" && (
                  <Badge variant="outline" className="text-xs text-muted-foreground mb-2">
                    {template.category}
                  </Badge>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>

                {template.id !== "blank" && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.components.guide && (
                      <Badge variant="outline" className="text-xs">Guide</Badge>
                    )}
                    {template.components.worksheet && (
                      <Badge variant="outline" className="text-xs">Worksheet</Badge>
                    )}
                    {template.components.checklist && (
                      <Badge variant="outline" className="text-xs">Checklist</Badge>
                    )}
                    {template.components.templates && (
                      <Badge variant="outline" className="text-xs">Templates</Badge>
                    )}
                    {template.components.quiz && (
                      <Badge variant="outline" className="text-xs">Quiz</Badge>
                    )}
                  </div>
                )}

                {template.id === "blank" && (
                  <div className="mt-3 flex items-center gap-2 text-accent">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Full customization</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
