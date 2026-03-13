import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Copy, ExternalLink, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PublishSalesPageButtonProps {
  projectId: string;
  projectName: string;
  salesPageHtml?: string;
  salesPageData?: any;
}

export default function PublishSalesPageButton({
  projectId,
  projectName,
  salesPageHtml,
  salesPageData,
}: PublishSalesPageButtonProps) {
  const { user } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState(
    projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
  );

  const publish = async () => {
    if (!user) {
      toast.error("Sign in to publish");
      return;
    }
    if (!salesPageHtml && !salesPageData) {
      toast.error("Generate a sales page first before publishing");
      return;
    }

    setPublishing(true);
    try {
      const finalSlug = slug || `page-${Date.now()}`;

      const { data: existing } = await supabase
        .from("published_pages")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("published_pages")
          .update({
            slug: finalSlug,
            page_title: projectName,
            page_html: salesPageHtml || "",
            page_data: salesPageData || {},
            is_published: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("published_pages").insert({
          user_id: user.id,
          project_id: projectId,
          slug: finalSlug,
          page_title: projectName,
          page_html: salesPageHtml || "",
          page_data: salesPageData || {},
        });
      }

      const url = `${window.location.origin}/p/${finalSlug}`;
      setPublishedUrl(url);
      toast.success("Sales page published!");
    } catch (e: any) {
      toast.error(e.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const copyUrl = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      toast.success("URL copied!");
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">Publish Sales Page</h4>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <span>{window.location.origin}/p/</span>
            </div>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="my-product"
              className="h-8 text-sm"
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={publish} disabled={publishing} size="sm" variant="hero" className="gap-1.5 self-end">
                {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                {publishing ? "Publishing…" : "Publish"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Make your AI-generated sales page live at a shareable URL</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {publishedUrl && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-xs">
            <span className="flex-1 truncate font-mono">{publishedUrl}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyUrl}>
                  <Copy className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Copy URL</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(publishedUrl, "_blank")}>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Open in new tab</p></TooltipContent>
            </Tooltip>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
