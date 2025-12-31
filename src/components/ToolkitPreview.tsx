import { Download, Package, FileText, Image, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ToolkitPreviewProps {
  toolkit: any;
  toolkitId: string | null;
  onComplete: () => void;
}

const ToolkitPreview = ({ toolkit, onComplete }: ToolkitPreviewProps) => {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold gradient-text">Your Toolkit is Ready!</h2>
          <p className="text-muted-foreground mt-2">Review and download your complete product package.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {toolkit.ecoverUrl && (
            <div className="flex flex-col items-center">
              <img src={toolkit.ecoverUrl} alt="E-Cover" className="w-48 rounded-lg shadow-lg" />
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{toolkit.title}</h3>
            {toolkit.subtitle && <p className="text-muted-foreground">{toolkit.subtitle}</p>}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span>Main Guide</span>
              </div>
              {toolkit.components.worksheet && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-green-500" />
                  <span>Worksheet</span>
                </div>
              )}
              {toolkit.ecoverUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Image className="w-4 h-4 text-accent" />
                  <span>E-Cover</span>
                </div>
              )}
              {toolkit.salesLetter && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>Sales Letter</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button variant="hero" size="lg" onClick={onComplete} className="gap-2">
            <Download className="w-5 h-5" />
            Complete & Download ZIP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolkitPreview;
