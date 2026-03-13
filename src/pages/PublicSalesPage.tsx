import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function PublicSalesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      // Track view
      await supabase.rpc("increment_page_views", { page_slug: slug });

      const { data, error } = await supabase
        .from("published_pages")
        .select("page_html, page_title, is_published")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        document.title = data.page_title || "Sales Page";
        setHtml(data.page_html || "<p>This page has no content yet.</p>");
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
        <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground">This sales page doesn't exist or has been unpublished.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}
