import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Copy, Check, Palette, Type, Layout, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CANVA_TEMPLATES,
  MOCKUP_RESOURCES,
  FONT_PAIRINGS,
  COLOR_PALETTES,
  getTemplatesForProductType,
  getMockupsForProductType,
  getFontsForStyle,
  getPalettesForStyle,
} from "@/data/templateResources";
import { toast } from "sonner";

interface TemplateLibraryProps {
  productType?: string;
  styleVibe?: string;
}

const TemplateLibrary = ({ productType, styleVibe }: TemplateLibraryProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyColors = async (colors: string[]) => {
    await navigator.clipboard.writeText(colors.join(", "));
    toast.success("Colors copied!");
  };

  const copyFonts = async (heading: string, body: string) => {
    await navigator.clipboard.writeText(`Heading: ${heading}\nBody: ${body}`);
    toast.success("Font pairing copied!");
  };

  // Filter based on props or show all
  const templates = productType ? getTemplatesForProductType(productType) : CANVA_TEMPLATES;
  const mockups = productType ? getMockupsForProductType(productType) : MOCKUP_RESOURCES;
  const fonts = styleVibe ? getFontsForStyle(styleVibe) : FONT_PAIRINGS;
  const palettes = styleVibe ? getPalettesForStyle(styleVibe) : COLOR_PALETTES;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Template Library</h3>
        <p className="text-sm text-muted-foreground">
          Curated resources to speed up your product creation
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="text-xs sm:text-sm">
            <Layout className="w-3 h-3 mr-1" /> Templates
          </TabsTrigger>
          <TabsTrigger value="mockups" className="text-xs sm:text-sm">
            <Image className="w-3 h-3 mr-1" /> Mockups
          </TabsTrigger>
          <TabsTrigger value="fonts" className="text-xs sm:text-sm">
            <Type className="w-3 h-3 mr-1" /> Fonts
          </TabsTrigger>
          <TabsTrigger value="colors" className="text-xs sm:text-sm">
            <Palette className="w-3 h-3 mr-1" /> Colors
          </TabsTrigger>
        </TabsList>

        {/* Canva Templates */}
        <TabsContent value="templates" className="space-y-3">
          {templates.map((template, i) => (
            <motion.a
              key={template.id}
              href={template.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{template.name}</h4>
                  {template.isPro && (
                    <Badge variant="secondary" className="text-xs">Pro</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <div className="flex gap-1 mt-2">
                  {template.productTypes.slice(0, 3).map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.a>
          ))}
        </TabsContent>

        {/* Mockup Resources */}
        <TabsContent value="mockups" className="space-y-3">
          {mockups.map((mockup, i) => (
            <motion.a
              key={mockup.id}
              href={mockup.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{mockup.name}</h4>
                  {mockup.isPro && (
                    <Badge className="text-xs bg-accent/20 text-accent">Premium</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{mockup.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.a>
          ))}
        </TabsContent>

        {/* Font Pairings */}
        <TabsContent value="fonts" className="space-y-3">
          {fonts.map((font, i) => (
            <motion.div
              key={font.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg bg-card border border-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{font.name}</h4>
                    <Badge variant="outline" className="text-xs">{font.styleVibe}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold" style={{ fontFamily: font.headingFont }}>
                      {font.headingFont} (Heading)
                    </p>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: font.bodyFont }}>
                      {font.bodyFont} (Body Text)
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyFonts(font.headingFont, font.bodyFont)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        {/* Color Palettes */}
        <TabsContent value="colors" className="space-y-3">
          {palettes.map((palette, i) => (
            <motion.div
              key={palette.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg bg-card border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{palette.name}</h4>
                    <Badge variant="outline" className="text-xs">{palette.styleVibe}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Best for: {palette.usage}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyColors(palette.colors)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {palette.colors.map((color, j) => (
                  <div
                    key={j}
                    className="flex-1 h-12 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      navigator.clipboard.writeText(color);
                      toast.success(`Copied ${color}`);
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {palette.colors.map((color, j) => (
                  <div key={j} className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground font-mono">{color}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default TemplateLibrary;
