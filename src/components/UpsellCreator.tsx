import { useState } from "react";
import { Gift, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface UpsellCreatorProps {
  title: string;
  niche: string;
  onUpsellCreated: (upsell: any) => void;
  existingUpsell?: any;
}

const UpsellCreator = ({ title, onUpsellCreated, existingUpsell }: UpsellCreatorProps) => {
  const [includeUpsell, setIncludeUpsell] = useState(!!existingUpsell);
  const [upsellTitle, setUpsellTitle] = useState(existingUpsell?.title || `${title} - Premium Edition`);
  const [upsellPrice, setUpsellPrice] = useState(existingUpsell?.price || 27);

  const handleToggle = (checked: boolean) => {
    setIncludeUpsell(checked);
    if (!checked) {
      onUpsellCreated(null);
    }
  };

  const handleSave = () => {
    onUpsellCreated({ type: "premium", title: upsellTitle, price: upsellPrice });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold gradient-text">Add an Upsell (Optional)</h2>
          <p className="text-muted-foreground mt-2">Increase your revenue with a premium upsell offer.</p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <p className="font-medium">Include Upsell Product</p>
            <p className="text-sm text-muted-foreground">Offer a premium version for more revenue</p>
          </div>
          <Switch checked={includeUpsell} onCheckedChange={handleToggle} />
        </div>

        {includeUpsell && (
          <div className="space-y-4 pt-4">
            <div>
              <Label>Upsell Title</Label>
              <Input value={upsellTitle} onChange={(e) => setUpsellTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input type="number" value={upsellPrice} onChange={(e) => setUpsellPrice(Number(e.target.value))} className="mt-1" />
            </div>
            <Button variant="hero" onClick={handleSave} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Save Upsell
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpsellCreator;
