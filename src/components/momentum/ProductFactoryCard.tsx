import { motion } from "framer-motion";
import { Factory, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  projectCount: number;
}

export default function ProductFactoryCard({ projectCount }: Props) {
  const navigate = useNavigate();

  if (projectCount < 2) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-primary/5 to-transparent overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full" />
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent to-primary shrink-0">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  Product Factory Mode
                  <Sparkles className="w-4 h-4 text-accent" />
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You've launched {projectCount} products. Generate another from your best blueprint instantly.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/wizard")}
                className="gap-1.5"
              >
                <Factory className="w-3.5 h-3.5" />
                Create Next Product
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
