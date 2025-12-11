import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Video, Image, Pin, Mail, Lightbulb, Calendar,
  Copy, Check, ChevronDown, ChevronUp, Play, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchKit } from "@/types/launchKit";
import { toast } from "sonner";

interface LaunchKitDisplayProps {
  launchKit: LaunchKit;
}

const LaunchKitDisplay = ({ launchKit }: LaunchKitDisplayProps) => {
  const [activeSection, setActiveSection] = useState<string>("tiktok");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItems(new Set([...copiedItems, id]));
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopiedItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyToClipboard(text, id)}
      className="p-1.5 rounded-md hover:bg-secondary transition-colors"
      title="Copy to clipboard"
    >
      {copiedItems.has(id) ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );

  const sections = [
    { id: "tiktok", label: "TikTok Scripts", icon: Video, count: launchKit.tiktokScripts?.length || 0 },
    { id: "instagram", label: "Instagram", icon: Image, count: launchKit.instagramCarousels?.length || 0 },
    { id: "pinterest", label: "Pinterest", icon: Pin, count: launchKit.pinterestPins?.length || 0 },
    { id: "email", label: "Emails", icon: Mail, count: launchKit.emailTemplates?.length || 0 },
    { id: "hooks", label: "Power Hooks", icon: Lightbulb, count: launchKit.powerHooks?.length || 0 },
    { id: "calendar", label: "7-Day Plan", icon: Calendar, count: 7 },
  ];

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg overflow-x-auto">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === section.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <section.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{section.label}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {section.count}
            </span>
          </button>
        ))}
      </div>

      {/* TikTok Scripts */}
      {activeSection === "tiktok" && (
        <div className="space-y-3">
          {launchKit.tiktokScripts?.map((script, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-secondary/30 border border-border"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Script {index + 1}</span>
                </div>
                <CopyButton 
                  text={`HOOK:\n${script.hook}\n\nBODY:\n${script.body}\n\nCTA:\n${script.callToAction}`}
                  id={`tiktok-${index}`}
                />
              </div>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary font-medium mb-1">🎣 HOOK (First 3 seconds)</p>
                  <p className="text-sm">{script.hook}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">📝 BODY</p>
                  <p className="text-sm whitespace-pre-wrap">{script.body}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-accent/20 text-accent">
                    🎵 {script.soundSuggestion}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-secondary">
                    📢 CTA: {script.callToAction}
                  </span>
                </div>
                
                {script.textOverlays && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Text Overlays:</p>
                    <div className="flex flex-wrap gap-1">
                      {script.textOverlays.map((overlay, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-secondary">
                          {overlay}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Instagram Carousels */}
      {activeSection === "instagram" && (
        <div className="space-y-4">
          {launchKit.instagramCarousels?.map((carousel, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-secondary/30 border border-border"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Image className="w-5 h-5 text-accent" />
                  {carousel.title}
                </h4>
                <button
                  onClick={() => toggleExpanded(`carousel-${index}`)}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                >
                  {expandedItems.has(`carousel-${index}`) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {expandedItems.has(`carousel-${index}`) && (
                <div className="space-y-3">
                  <div className="grid gap-2">
                    {carousel.slides?.map((slide, slideIndex) => (
                      <div key={slideIndex} className="p-3 rounded-lg bg-card border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                            {slide.slideNumber}
                          </span>
                          <span className="font-medium text-sm">{slide.headline}</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">{slide.body}</p>
                        <p className="text-xs text-primary/70 ml-8 mt-1">💡 {slide.visualSuggestion}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs text-muted-foreground font-medium">Caption:</p>
                      <CopyButton text={carousel.caption} id={`caption-${index}`} />
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{carousel.caption}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {carousel.hashtags?.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        #{tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!expandedItems.has(`carousel-${index}`) && (
                <p className="text-sm text-muted-foreground">
                  {carousel.slides?.length || 0} slides • Click to expand
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pinterest Pins */}
      {activeSection === "pinterest" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {launchKit.pinterestPins?.map((pin, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-4 rounded-xl bg-secondary/30 border border-border"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm line-clamp-2">{pin.title}</h4>
                <CopyButton text={`${pin.title}\n\n${pin.description}`} id={`pin-${index}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">{pin.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-accent/20 text-accent">
                  📌 {pin.boardSuggestion}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {pin.keywords?.slice(0, 5).map((keyword, i) => (
                  <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                    {keyword}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Email Templates */}
      {activeSection === "email" && (
        <div className="space-y-4">
          {launchKit.emailTemplates?.map((email, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-secondary/30 border border-border"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    email.type === 'launch' ? 'bg-green-500/20 text-green-400' :
                    email.type === 'reminder' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {email.type === 'launch' ? '🚀 Launch' : 
                     email.type === 'reminder' ? '⏰ Reminder' : '🔥 Last Chance'}
                  </span>
                </div>
                <CopyButton 
                  text={`Subject: ${email.subjectLine}\n\n${email.body}\n\n[${email.callToAction}]`}
                  id={`email-${index}`}
                />
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Subject Line:</p>
                  <p className="font-medium">{email.subjectLine}</p>
                  <p className="text-xs text-muted-foreground mt-2">Preview: {email.previewText}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Body:</p>
                  <p className="text-sm whitespace-pre-wrap">{email.body}</p>
                </div>

                <div className="flex justify-center">
                  <span className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                    {email.callToAction}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Power Hooks */}
      {activeSection === "hooks" && (
        <div className="space-y-2">
          {launchKit.powerHooks?.map((hook, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="p-3 rounded-lg bg-secondary/30 border border-border flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    hook.platform === 'tiktok' ? 'bg-pink-500/20 text-pink-400' :
                    hook.platform === 'instagram' ? 'bg-purple-500/20 text-purple-400' :
                    hook.platform === 'pinterest' ? 'bg-red-500/20 text-red-400' :
                    hook.platform === 'email' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {hook.platform}
                  </span>
                  <span className="text-xs text-muted-foreground">{hook.angle}</span>
                </div>
                <p className="text-sm font-medium">{hook.hook}</p>
              </div>
              <CopyButton text={hook.hook} id={`hook-${index}`} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Launch Calendar */}
      {activeSection === "calendar" && (
        <div className="space-y-3">
          {launchKit.launchCalendar?.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${
                day.day === 1 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-secondary/30 border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                  day.day === 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}>
                  <span className="text-xs font-medium">Day</span>
                  <span className="text-lg font-bold">{day.day}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{day.date}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                      {day.platform}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{day.contentType}</p>
                  <p className="text-sm">{day.description}</p>
                  <p className="text-xs text-primary mt-2">⏰ Best time: {day.bestTime}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Copy All Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={() => {
            const allContent = JSON.stringify(launchKit, null, 2);
            navigator.clipboard.writeText(allContent);
            toast.success("Entire launch kit copied to clipboard!");
          }}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Entire Launch Kit (JSON)
        </Button>
      </div>
    </div>
  );
};

export default LaunchKitDisplay;
