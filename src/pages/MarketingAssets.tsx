import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check, Mail, MessageSquare, Image, FileText, Video, Inbox } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const MarketingAssets = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchProjects();
    else setLoading(false);
  }, [user]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("launch_projects")
      .select("id, name, step4_marketing")
      .not("step4_marketing", "is", null)
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout title="Marketing Assets">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Marketing Asset Library</h1>
          <p className="text-muted-foreground text-sm">All your promotional content across projects.</p>
        </div>

        {loading ? (
          <Skeleton className="h-40" />
        ) : projects.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No marketing assets yet. Generate them from the AI Launch Wizard.</p>
          </CardContent></Card>
        ) : (
          <Tabs defaultValue="emails">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="emails" className="gap-1 text-xs"><Mail className="w-3 h-3" /> Emails</TabsTrigger>
              <TabsTrigger value="posts" className="gap-1 text-xs"><MessageSquare className="w-3 h-3" /> Posts</TabsTrigger>
              <TabsTrigger value="pins" className="gap-1 text-xs"><Image className="w-3 h-3" /> Pins</TabsTrigger>
              <TabsTrigger value="blog" className="gap-1 text-xs"><FileText className="w-3 h-3" /> Blog</TabsTrigger>
              <TabsTrigger value="video" className="gap-1 text-xs"><Video className="w-3 h-3" /> Video</TabsTrigger>
            </TabsList>

            <TabsContent value="emails" className="space-y-3">
              {projects.map(p => {
                const m = p.step4_marketing as any;
                return m?.emails?.map((email: any, i: number) => {
                  const key = `${p.id}-email-${i}`;
                  return (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div><span className="text-xs text-muted-foreground">{p.name}</span><h4 className="font-semibold text-sm">{email.subject}</h4></div>
                          <Button variant="ghost" size="sm" onClick={() => copyText(`Subject: ${email.subject}\n\n${email.body}`, key)} className="gap-1">
                            {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{email.body}</p>
                      </CardContent>
                    </Card>
                  );
                });
              })}
            </TabsContent>

            <TabsContent value="posts" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                {projects.flatMap(p => {
                  const m = p.step4_marketing as any;
                  return (m?.socialPosts || []).map((post: string, i: number) => {
                    const key = `${p.id}-post-${i}`;
                    return (
                      <Card key={key}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div><span className="text-xs text-muted-foreground">{p.name}</span><p className="text-sm mt-1">{post}</p></div>
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => copyText(post, key)}>
                              {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  });
                })}
              </div>
            </TabsContent>

            <TabsContent value="pins" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                {projects.flatMap(p => {
                  const m = p.step4_marketing as any;
                  return (m?.pinterestPins || []).map((pin: string, i: number) => {
                    const key = `${p.id}-pin-${i}`;
                    return (
                      <Card key={key}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div><span className="text-xs text-muted-foreground">{p.name}</span><p className="text-sm mt-1">{pin}</p></div>
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => copyText(pin, key)}>
                              {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  });
                })}
              </div>
            </TabsContent>

            <TabsContent value="blog" className="space-y-3">
              {projects.map(p => {
                const m = p.step4_marketing as any;
                if (!m?.blogArticle) return null;
                const key = `${p.id}-blog`;
                return (
                  <Card key={key}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{p.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyText(m.blogArticle, key)} className="gap-1">
                          {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">{m.blogArticle}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="video" className="space-y-3">
              {projects.map(p => {
                const m = p.step4_marketing as any;
                if (!m?.videoScript) return null;
                const key = `${p.id}-video`;
                return (
                  <Card key={key}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{p.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyText(m.videoScript, key)} className="gap-1">
                          {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">{m.videoScript}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketingAssets;
