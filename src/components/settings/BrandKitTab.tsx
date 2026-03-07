import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BrandKit {
  business_name: string;
  business_email: string;
  business_address: string;
  tagline: string;
  primary_color: string;
  secondary_color: string;
  font_pref: string;
  logo_url: string;
}

const EMPTY_KIT: BrandKit = {
  business_name: "",
  business_email: "",
  business_address: "",
  tagline: "",
  primary_color: "#6366f1",
  secondary_color: "#f59e0b",
  font_pref: "",
  logo_url: "",
};

interface Props {
  userId: string;
}

export default function BrandKitTab({ userId }: Props) {
  const [kit, setKit] = useState<BrandKit>(EMPTY_KIT);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadKit();
  }, [userId]);

  const loadKit = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("brand_kit")
      .eq("id", userId)
      .single();
    if (data?.brand_kit && typeof data.brand_kit === "object") {
      setKit({ ...EMPTY_KIT, ...(data.brand_kit as any) });
    }
    setLoaded(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ brand_kit: kit as any })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Brand Kit saved!");
    } catch (e: any) {
      toast.error("Failed to save Brand Kit");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof BrandKit, value: string) => setKit(prev => ({ ...prev, [key]: value }));

  if (!loaded) return null;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <CardTitle>Brand Kit</CardTitle>
        </div>
        <CardDescription>
          Set your brand details once — they auto-populate into all generated copy, legal pages, and exports.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={kit.business_name} onChange={e => update("business_name", e.target.value)} placeholder="Your Business LLC" />
          </div>
          <div className="space-y-2">
            <Label>Business Email</Label>
            <Input value={kit.business_email} onChange={e => update("business_email", e.target.value)} placeholder="hello@yourbrand.com" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Business Address</Label>
            <Input value={kit.business_address} onChange={e => update("business_address", e.target.value)} placeholder="123 Main St, City, State" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Brand Tagline</Label>
            <Input value={kit.tagline} onChange={e => update("tagline", e.target.value)} placeholder="Helping creators launch faster" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={kit.primary_color} onChange={e => update("primary_color", e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" />
              <Input value={kit.primary_color} onChange={e => update("primary_color", e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Secondary Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={kit.secondary_color} onChange={e => update("secondary_color", e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" />
              <Input value={kit.secondary_color} onChange={e => update("secondary_color", e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Font Preference</Label>
            <Input value={kit.font_pref} onChange={e => update("font_pref", e.target.value)} placeholder="Inter, Georgia, etc." />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Logo URL</Label>
          <Input value={kit.logo_url} onChange={e => update("logo_url", e.target.value)} placeholder="https://yourbrand.com/logo.png" />
          {kit.logo_url && (
            <div className="mt-2 w-16 h-16 rounded-lg border border-border overflow-hidden bg-background">
              <img src={kit.logo_url} alt="Logo preview" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Brand Kit
        </Button>
      </CardContent>
    </Card>
  );
}
