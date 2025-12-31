import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Copy, Check, Video, Instagram, Mail, Calendar,
  Loader2, Sparkles, Hash, MessageSquare, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LaunchAccelerator } from "@/types/launchAccelerator";
import { toast } from "sonner";

interface LaunchAcceleratorDisplayProps {
  accelerator: LaunchAccelerator | null;
  loading?: boolean;
  onGenerate?: () => void;
}

const LaunchAcceleratorDisplay = ({ accelerator, loading, onGenerate }: LaunchAcceleratorDisplayProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field, size = "sm" }: { text: string; field: string; size?: "sm" | "icon" }) => (
    <Button
      variant="ghost"
      size={size}
      onClick={() => copyToClipboard(text, field)}
      className="h-8 px-2"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );

  if (!accelerator && !loading) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Launch Content Yet</h3>
        <p className="text-muted-foreground mb-4">
          Generate TikTok scripts, Instagram posts, and a 7-day launch calendar
        </p>
        {onGenerate && (
          <Button onClick={onGenerate} variant="glow">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Launch Accelerator
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
        <h3 className="text-lg font-semibold mb-2">Creating Your Launch Kit...</h3>
        <p className="text-muted-foreground">Generating social content, scripts, and promo calendar</p>
      </div>
    );
  }

  if (!accelerator) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Tabs defaultValue="tiktok" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tiktok" className="text-xs sm:text-sm">
            <Video className="w-3 h-3 mr-1" /> TikTok
          </TabsTrigger>
          <TabsTrigger value="instagram" className="text-xs sm:text-sm">
            <Instagram className="w-3 h-3 mr-1" /> Instagram
          </TabsTrigger>
          <TabsTrigger value="emails" className="text-xs sm:text-sm">
            <Mail className="w-3 h-3 mr-1" /> Emails
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs sm:text-sm">
            <Calendar className="w-3 h-3 mr-1" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="hooks" className="text-xs sm:text-sm">
            <MessageSquare className="w-3 h-3 mr-1" /> Hooks
          </TabsTrigger>
        </TabsList>

        {/* TikTok Scripts Tab */}
        <TabsContent value="tiktok" className="space-y-4">
          {accelerator.tiktokScripts?.map((script, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    Script {i + 1}
                    <Badge variant="secondary" className="text-xs">{script.duration}</Badge>
                    <Badge variant="outline" className="text-xs">{script.style}</Badge>
                  </CardTitle>
                  <CopyButton 
                    text={`HOOK: ${script.hook}\n\nBODY: ${script.body}\n\nCTA: ${script.cta}`} 
                    field={`tiktok-${i}`} 
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs font-medium text-red-400 mb-1">🎯 HOOK (First 3 seconds)</p>
                  <p className="text-sm">{script.hook}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">📝 BODY</p>
                  <p className="text-sm">{script.body}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs font-medium text-green-400 mb-1">👉 CTA</p>
                  <p className="text-sm">{script.cta}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* TikTok Hashtags */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="w-4 h-4" /> TikTok Hashtags
                </CardTitle>
                <CopyButton text={accelerator.hashtags?.tiktok?.join(" ") || ""} field="tiktok-hashtags" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {accelerator.hashtags?.tiktok?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => copyToClipboard(tag, `tt-tag-${i}`)}>
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram" className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Posts</h4>
          {accelerator.instagram?.posts?.map((post, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Post {i + 1}
                    <Badge variant="outline" className="ml-2 text-xs">{post.type}</Badge>
                  </CardTitle>
                  <CopyButton text={`${post.caption}\n\n${post.hashtags?.join(" ")}`} field={`ig-post-${i}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Caption</p>
                  <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
                </div>
                {post.slides && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Carousel Slides</p>
                    <div className="space-y-2">
                      {post.slides.map((slide, si) => (
                        <div key={si} className="p-2 rounded bg-secondary/50 text-sm">
                          <span className="text-primary font-medium">Slide {si + 1}:</span> {slide}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {post.hashtags?.map((tag, ti) => (
                    <Badge key={ti} variant="secondary" className="text-xs">#{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <h4 className="font-medium text-sm text-muted-foreground mt-6">Story Sequence</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accelerator.instagram?.stories?.map((story, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Story {story.slide}</Badge>
                    <CopyButton text={story.content} field={`story-${i}`} size="icon" />
                  </div>
                  <p className="text-sm">{story.content}</p>
                  {story.cta && (
                    <p className="text-xs text-primary mt-2">👆 {story.cta}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="space-y-4">
          {accelerator.emails?.map((email, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Email {i + 1} - Day {email.sendDay}
                  </CardTitle>
                  <CopyButton 
                    text={`Subject: ${email.subject}\n\nPreview: ${email.preview}\n\n${email.body}`} 
                    field={`email-${i}`} 
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-xs font-medium text-primary mb-1">Subject Line</p>
                  <p className="text-sm font-medium">{email.subject}</p>
                </div>
                <div className="p-2 rounded bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Preview: {email.preview}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>
                  <p className="text-sm whitespace-pre-wrap">{email.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-3">
            {accelerator.promoCalendar?.map((day, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{day.day}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{day.platform}</Badge>
                          <Badge variant="secondary">{day.contentType}</Badge>
                        </div>
                        <p className="text-sm font-medium">{day.task}</p>
                        {day.hook && (
                          <p className="text-xs text-muted-foreground mt-1">Hook: "{day.hook}"</p>
                        )}
                      </div>
                    </div>
                    <CopyButton text={day.task} field={`cal-${i}`} size="icon" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Hooks Tab */}
        <TabsContent value="hooks" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">🎯 Viral Hooks Library</CardTitle>
              <p className="text-sm text-muted-foreground">Reuse these across all your content</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {accelerator.hooks?.map((hook, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-sm flex-1">{hook}</p>
                  <CopyButton text={hook} field={`hook-${i}`} size="icon" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Instagram Hashtags</CardTitle>
                  <CopyButton text={accelerator.hashtags?.instagram?.map(t => `#${t}`).join(" ") || ""} field="ig-hashtags" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {accelerator.hashtags?.instagram?.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">#{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Pinterest Keywords</CardTitle>
                  <CopyButton text={accelerator.hashtags?.pinterest?.join(", ") || ""} field="pin-keywords" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {accelerator.hashtags?.pinterest?.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default LaunchAcceleratorDisplay;
