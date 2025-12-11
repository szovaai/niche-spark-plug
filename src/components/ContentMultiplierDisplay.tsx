import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Instagram, Video, Youtube, FileText, Mail, 
  LayoutGrid, Image, Gift, Copy, Check, Calendar,
  Loader2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentMultiplierOutput } from "@/types/contentMultiplier";
import { ProductBlueprint } from "@/types/niche";
import { PersonalizationData } from "@/types/personalization";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentMultiplierDisplayProps {
  blueprint: ProductBlueprint;
  personalization: PersonalizationData;
  nicheName: string;
}

const ContentMultiplierDisplay = ({ 
  blueprint, 
  personalization, 
  nicheName 
}: ContentMultiplierDisplayProps) => {
  const [content, setContent] = useState<ContentMultiplierOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("instagram");

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content-multiplier", {
        body: {
          blueprint,
          personalization,
          nicheName,
        },
      });

      if (error) throw error;
      setContent(data);
      toast.success("Content pack generated!");
    } catch (err) {
      console.error("Error generating content:", err);
      toast.error("Failed to generate content pack");
    } finally {
      setLoading(false);
    }
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="p-4 rounded-full bg-primary/10">
          <LayoutGrid className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Content Multiplier Engine</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Transform your product into a complete 30-day marketing campaign with 
            20 IG posts, 10 TikTok scripts, blog posts, emails, and more.
          </p>
        </div>
        <Button onClick={generateContent} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate 30-Day Content Pack
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Stats Bar */}
      <div className="flex flex-wrap gap-2 p-3 bg-secondary/30 rounded-lg text-xs">
        <span className="flex items-center gap-1">
          <Instagram className="w-3 h-3" /> {content.instagramPosts.length} Posts
        </span>
        <span className="flex items-center gap-1">
          <Video className="w-3 h-3" /> {content.tiktokScripts.length} TikToks
        </span>
        <span className="flex items-center gap-1">
          <Youtube className="w-3 h-3" /> {content.youtubeShorts.length} Shorts
        </span>
        <span className="flex items-center gap-1">
          <Mail className="w-3 h-3" /> {content.emailSequence.length} Emails
        </span>
        <span className="flex items-center gap-1">
          <LayoutGrid className="w-3 h-3" /> {content.carousels.length} Carousels
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1">
          <TabsTrigger value="instagram" className="text-xs py-1.5">
            <Instagram className="w-3 h-3 mr-1" /> IG
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="text-xs py-1.5">
            <Video className="w-3 h-3 mr-1" /> TikTok
          </TabsTrigger>
          <TabsTrigger value="youtube" className="text-xs py-1.5">
            <Youtube className="w-3 h-3 mr-1" /> Shorts
          </TabsTrigger>
          <TabsTrigger value="blog" className="text-xs py-1.5">
            <FileText className="w-3 h-3 mr-1" /> Blog
          </TabsTrigger>
          <TabsTrigger value="email" className="text-xs py-1.5">
            <Mail className="w-3 h-3 mr-1" /> Email
          </TabsTrigger>
          <TabsTrigger value="carousel" className="text-xs py-1.5">
            <LayoutGrid className="w-3 h-3 mr-1" /> Carousel
          </TabsTrigger>
          <TabsTrigger value="infographic" className="text-xs py-1.5">
            <Image className="w-3 h-3 mr-1" /> Info
          </TabsTrigger>
          <TabsTrigger value="leadmagnet" className="text-xs py-1.5">
            <Gift className="w-3 h-3 mr-1" /> Lead
          </TabsTrigger>
        </TabsList>

        {/* Instagram Posts */}
        <TabsContent value="instagram" className="max-h-96 overflow-y-auto space-y-3">
          {content.instagramPosts.map((post) => (
            <div key={post.id} className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-primary/20 px-2 py-0.5 rounded">
                  Day {post.postingDay} • {post.type}
                </span>
                <button
                  onClick={() => copyToClipboard(post.caption + "\n\n" + post.hashtags.join(" "), `ig-${post.id}`)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {copiedField === `ig-${post.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <p className="text-sm mb-2">{post.caption}</p>
              <p className="text-xs text-primary">{post.hashtags.slice(0, 10).join(" ")}</p>
            </div>
          ))}
        </TabsContent>

        {/* TikTok Scripts */}
        <TabsContent value="tiktok" className="max-h-96 overflow-y-auto space-y-3">
          {content.tiktokScripts.map((script) => (
            <div key={script.id} className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-accent">🎬 Script #{script.id}</span>
                <button
                  onClick={() => copyToClipboard(`HOOK: ${script.hook}\n\nSCRIPT: ${script.script}\n\nCTA: ${script.cta}`, `tt-${script.id}`)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {copiedField === `tt-${script.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <p className="text-xs text-yellow-400 mb-1">Hook: {script.hook}</p>
              <p className="text-sm mb-2">{script.script}</p>
              <p className="text-xs text-green-400">CTA: {script.cta}</p>
              {script.soundSuggestion && (
                <p className="text-xs text-muted-foreground mt-1">🎵 {script.soundSuggestion}</p>
              )}
            </div>
          ))}
        </TabsContent>

        {/* YouTube Shorts */}
        <TabsContent value="youtube" className="max-h-96 overflow-y-auto space-y-3">
          {content.youtubeShorts.map((short) => (
            <div key={short.id} className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{short.title}</span>
                <button
                  onClick={() => copyToClipboard(`TITLE: ${short.title}\n\nHOOK: ${short.hook}\n\nSCRIPT: ${short.script}\n\nCTA: ${short.cta}`, `yt-${short.id}`)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {copiedField === `yt-${short.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <p className="text-xs text-yellow-400 mb-1">Hook: {short.hook}</p>
              <p className="text-sm">{short.script}</p>
            </div>
          ))}
        </TabsContent>

        {/* Blog Post */}
        <TabsContent value="blog" className="max-h-96 overflow-y-auto">
          <div className="p-3 bg-secondary/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{content.blogPost.title}</h4>
              <button
                onClick={() => copyToClipboard(
                  `# ${content.blogPost.title}\n\n${content.blogPost.introduction}\n\n${content.blogPost.sections.map(s => `## ${s.heading}\n\n${s.content}`).join("\n\n")}\n\n${content.blogPost.conclusion}`,
                  "blog"
                )}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {copiedField === "blog" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy All
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{content.blogPost.metaDescription}</p>
            <div className="border-t border-border pt-2">
              <p className="text-sm mb-3">{content.blogPost.introduction}</p>
              {content.blogPost.sections.map((section, i) => (
                <div key={i} className="mb-3">
                  <h5 className="text-sm font-medium text-primary mb-1">{section.heading}</h5>
                  <p className="text-sm text-muted-foreground">{section.content}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {content.blogPost.seoKeywords.map((kw, i) => (
                <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded">{kw}</span>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Email Sequence */}
        <TabsContent value="email" className="max-h-96 overflow-y-auto space-y-3">
          {content.emailSequence.map((email) => (
            <div key={email.day} className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-primary/20 px-2 py-0.5 rounded">Day {email.day}</span>
                <button
                  onClick={() => copyToClipboard(`Subject: ${email.subject}\nPreview: ${email.previewText}\n\n${email.body}\n\n${email.cta}`, `email-${email.day}`)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {copiedField === `email-${email.day}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <p className="text-sm font-medium mb-1">📧 {email.subject}</p>
              <p className="text-xs text-muted-foreground mb-2">{email.previewText}</p>
              <p className="text-sm">{email.body}</p>
              <p className="text-xs text-green-400 mt-2">CTA: {email.cta}</p>
            </div>
          ))}
        </TabsContent>

        {/* Carousels */}
        <TabsContent value="carousel" className="max-h-96 overflow-y-auto space-y-3">
          {content.carousels.map((carousel) => (
            <div key={carousel.id} className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{carousel.title}</span>
                <button
                  onClick={() => copyToClipboard(carousel.slides.map(s => `Slide ${s.slideNumber}: ${s.text}`).join("\n\n") + "\n\nCaption: " + carousel.caption, `carousel-${carousel.id}`)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {copiedField === `carousel-${carousel.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <div className="space-y-2">
                {carousel.slides.map((slide) => (
                  <div key={slide.slideNumber} className="p-2 bg-card rounded text-xs">
                    <span className="text-primary font-medium">Slide {slide.slideNumber}:</span> {slide.text}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Caption: {carousel.caption}</p>
            </div>
          ))}
        </TabsContent>

        {/* Infographics */}
        <TabsContent value="infographic" className="max-h-96 overflow-y-auto space-y-3">
          {content.infographics.map((info) => (
            <div key={info.id} className="p-3 bg-secondary/30 rounded-lg">
              <h4 className="font-medium text-sm mb-2">{info.title}</h4>
              {info.sections.map((section, i) => (
                <div key={i} className="mb-2">
                  <p className="text-xs font-medium text-primary">{section.heading}</p>
                  <ul className="text-xs text-muted-foreground">
                    {section.points.map((point, j) => (
                      <li key={j}>• {point}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-xs text-muted-foreground italic">📐 {info.designNotes}</p>
            </div>
          ))}
        </TabsContent>

        {/* Lead Magnet */}
        <TabsContent value="leadmagnet" className="max-h-96 overflow-y-auto">
          <div className="p-3 bg-secondary/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{content.leadMagnet.title}</h4>
              <span className="text-xs bg-accent/20 px-2 py-0.5 rounded">{content.leadMagnet.format}</span>
            </div>
            <p className="text-sm text-muted-foreground">{content.leadMagnet.description}</p>
            <div>
              <p className="text-xs font-medium mb-1">Content Outline:</p>
              <ul className="text-sm space-y-1">
                {content.leadMagnet.contentOutline.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">{i + 1}.</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-green-400">CTA: {content.leadMagnet.ctaText}</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Content Calendar Preview */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">30-Day Content Calendar</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {content.contentCalendar.slice(0, 14).map((item) => (
            <div
              key={`${item.day}-${item.platform}`}
              className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center text-xs"
              title={`Day ${item.day}: ${item.platform} - ${item.contentType}`}
            >
              {item.day}
            </div>
          ))}
          <div className="w-8 h-8 rounded bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground">
            +{content.contentCalendar.length - 14}
          </div>
        </div>
      </div>

      {/* Regenerate Button */}
      <Button
        variant="outline"
        onClick={generateContent}
        disabled={loading}
        className="w-full gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        Regenerate Content Pack
      </Button>
    </motion.div>
  );
};

export default ContentMultiplierDisplay;
