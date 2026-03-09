import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Check, X,
  Wand2, Zap, Target, DollarSign, Users, Search, Brain,
  Package, Mail, Megaphone, FileText, ClipboardList, BarChart3,
  ShieldCheck, Key, Rocket, Eye, HelpCircle, ChevronDown, Timer, Upload, MousePointerClick,
  Play, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const SectionDivider = () => (
  <div className="w-full flex justify-center py-4">
    <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
  </div>
);

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="font-semibold text-foreground pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
};

const getProgressText = (pct: number) => {
  if (pct < 25) return "Discover how LaunchStack AI works";
  if (pct < 50) return "See what LaunchStack AI builds for you";
  if (pct < 75) return "See how the launch system works";
  return "You're almost there — see the launch price below";
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  const handleCTA = () => navigate(user ? "/wizard" : "/auth");

  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      setScrollProgress(Math.min(pct, 100));
      setShowFloatingBar(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToPricing = () => {
    const el = document.getElementById("pricing-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ===== SCROLL PROGRESS BAR ===== */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-secondary/30">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <div className="bg-background/80 backdrop-blur-sm border-b border-border/30">
          <p className="text-[10px] text-muted-foreground text-center py-0.5 px-4 truncate">
            {getProgressText(scrollProgress)}
          </p>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 pt-24">
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,182,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,182,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">The 60-Minute Launch System</span>
          </motion.div>

          <motion.p {...fadeIn} transition={{ delay: 0.05 }} className="text-sm md:text-base uppercase tracking-widest text-primary font-semibold mb-4">
            Attention: Digital Product Creators, Course Sellers & Info Marketers
          </motion.p>

          <motion.h1 {...fadeIn} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text glow-text">Launch Your First Digital Product Tonight</span>
            <span className="text-foreground"> — Without Writing A Word</span>
          </motion.h1>

          <motion.p {...fadeIn} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            DigiLaunchKit uses the 60-Minute Launch Method to automatically build your product, funnel, bonuses, emails and affiliate kit. Pick a topic. Click build. Launch your product.
          </motion.p>

          {/* Three-line tagline */}
          <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="flex flex-col items-center gap-1 mb-8">
            {["Build your product.", "Build your funnel.", "Build your launch."].map((line, i) => (
              <p key={i} className="text-base md:text-lg font-semibold text-foreground">{line}</p>
            ))}
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
              <Wand2 className="w-5 h-5" />
              Get Instant Access Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Power bullets */}
          <motion.div {...fadeIn} transition={{ delay: 0.35 }} className="flex flex-col items-center gap-2 mt-6 max-w-md mx-auto">
            {[
              "Generate a complete product launch in under 60 minutes",
              "No writing, no funnels, no complicated tools",
              "Built for WarriorPlus-style launches",
              "Perfect for beginners",
            ].map((line, i) => (
              <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                {line}
              </span>
            ))}
          </motion.div>

          {/* Asset checklist — concrete outputs */}
          <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-14 max-w-2xl mx-auto">
            {[
              "✔ Full Ebook Generated",
              "✔ Sales Page Written",
              "✔ Bonuses Created",
              "✔ Email Sequence Ready",
              "✔ Affiliate Kit Built",
              "✔ Product Graphics",
              "✔ Launch Timeline",
              "✔ Complete Launch Kit",
            ].map((item, i) => (
              <div key={i} className="text-xs text-primary font-medium text-left py-1">
                {item}
              </div>
            ))}
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.5 }} className="mt-8">
            <p className="text-xs text-muted-foreground">Research → Product → Funnel → Launch Kit — built automatically in minutes.</p>
          </motion.div>
        </div>
      </section>

      {/* ===== SEE IT IN ACTION — VISUAL FLOW ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Watch DigiLaunchKit Build A Complete Product Launch In 60 Seconds</h2>
            <p className="text-muted-foreground">See exactly how an idea turns into a product, funnel, emails, and launch kit — automatically.</p>
          </motion.div>

          {/* Visual Flow: Idea → Product → Sales Page → Emails → Launch Kit */}
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Research",
                label: "Input",
                inputText: '"AI Local Lead Generation"',
                outputTitle: "AI Local Lead Machine",
                outputLines: [
                  "Audience: beginners wanting fast income",
                  "Mechanism: AI Local Client Method",
                  'Angle: land your first $500 client',
                ],
              },
              {
                step: "2",
                title: "Product",
                label: "Generated Ebook",
                inputText: "AI Local Lead Machine",
                outputTitle: "Complete Digital Product",
                outputLines: [
                  "7 Chapters with examples & action steps",
                  "Worksheets for each chapter",
                  "Outreach scripts & service templates",
                  "Cheat sheets & quick-start guide",
                ],
              },
              {
                step: "3",
                title: "Sales Funnel",
                label: "Generated Headline",
                inputText: null,
                outputTitle: null,
                outputLines: [],
                customContent: (
                  <div className="p-5 rounded-xl bg-secondary/50 border border-border/50 text-left">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Generated Sales Page Hook</p>
                    <p className="text-foreground font-bold text-lg leading-snug mb-1">You're Still Buying Courses?</p>
                    <p className="text-foreground font-bold text-lg leading-snug mb-1">Stop.</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">Start Getting Paid $500 This Week Helping Local Businesses Generate Leads With AI.</p>
                  </div>
                ),
              },
              {
                step: "4",
                title: "Emails",
                label: "Generated Email",
                inputText: null,
                outputTitle: null,
                outputLines: [],
                customContent: (
                  <div className="p-5 rounded-xl bg-secondary/50 border border-border/50 text-left">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Launch Email #1</p>
                    <p className="text-foreground font-semibold mb-2">Subject: Make $500 This Week?</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">Local businesses are desperate for leads. Now beginners are getting paid to help them using simple AI tools…</p>
                  </div>
                ),
              },
              {
                step: "5",
                title: "Launch Kit",
                label: "Complete Package",
                inputText: null,
                outputTitle: "Ready To Deploy",
                outputLines: [
                  "Sales page & opt-in page",
                  "Thank you page & delivery",
                  "Affiliate promo kit & JV page",
                  "7-day launch timeline",
                  "Bonus stack with perceived value",
                  "Complete Launch-In-A-Box ZIP",
                ],
              },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <div className="flex gap-4 items-start">
                  {/* Step number + connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{item.step}</span>
                    </div>
                    {i < 4 && <div className="w-0.5 h-6 bg-primary/20 mt-1" />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Step {item.step} — {item.title}</p>
                    {(item as any).customContent ? (
                      (item as any).customContent
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {item.inputText && (
                          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                            <p className="text-xs text-muted-foreground font-medium mb-1">{item.label}</p>
                            <p className="text-sm font-semibold text-foreground">{item.inputText}</p>
                          </div>
                        )}
                        <div className={`p-4 rounded-xl bg-primary/5 border border-primary/20 ${!item.inputText ? "sm:col-span-2" : ""}`}>
                          {item.outputTitle && <p className="text-xs text-primary font-medium mb-2">{item.outputTitle}</p>}
                          <ul className="space-y-1">
                            {item.outputLines.map((line, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Differentiator line */}
          <motion.div {...fadeIn} className="mt-12 text-center">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-foreground font-bold text-lg">Most AI tools write content.</p>
              <p className="gradient-text font-bold text-lg">DigiLaunchKit builds the entire business around it.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== THE PROBLEM ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">Dear Fellow Digital Entrepreneur,</p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              How many times have you had a product idea — a genuinely good one — and then watched it die a slow death in a Google Doc graveyard because the launch itself felt like climbing Everest barefoot?
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You needed a sales page. Then an email sequence. Then ad copy. Then an affiliate page so JV partners would actually promote the thing. Then a funnel. Then a checklist so you didn't miss anything. And somewhere in the middle of all that… you ran out of steam.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Or worse — you paid a copywriter $3,000, waited six weeks, got back copy that sounded like a robot wrote it, and still had to rewrite half of it yourself.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8 font-medium text-foreground">
              Most digital products don't fail because the idea was bad. They fail because the creator never made it through the launch process.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-8">
            <p className="text-foreground font-semibold mb-2">The gap between "great idea" and "money in the bank" isn't talent.</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              It's the sheer volume of moving parts standing between you and your first sale — and the brutal reality that most of us were never taught how to build a launch system from scratch.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT NOBODY ADMITS ===== */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h2 {...fadeIn} className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Here's What Nobody In This Industry Wants To Admit...
          </motion.h2>
          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The gurus selling you $2,000 courses on "how to launch digital products" show you the funnel diagram, the email framework, the ad angles. But they leave you alone with a blank screen, a blinking cursor, and the crushing pressure of generating 30+ individual assets from scratch.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4 font-medium text-foreground">And the AI "solutions" you've tried?</p>
            <div className="space-y-3 mb-8">
              {[
                "ChatGPT gives you generic drivel that sounds like a corporate press release",
                'Other "AI copywriting tools" spit out disconnected pieces with no strategy behind them',
                "Funnel builders make you a pretty page but have no idea what to put on it",
                "Research takes days — combing through WarriorPlus, ClickBank, Reddit — just to find if your idea is worth building",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-foreground font-semibold text-center text-lg">That ends today.</p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== YOUR FIRST LAUNCH IN 60 MINUTES ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Simple 4-Step Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your First Launch In 60 Minutes</h2>
            <p className="text-muted-foreground">No experience needed. No writing required. Just follow the steps.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", icon: MousePointerClick, title: "Enter Your Topic", desc: "Tell DigiLaunchKit your niche, audience, and product idea in plain English." },
              { step: "2", icon: Wand2, title: "AI Builds Everything", desc: "Product, sales page, bonuses, emails, affiliate kit — generated automatically." },
              { step: "3", icon: Package, title: "Export Launch Kit", desc: "Download your complete Launch-In-A-Box ZIP with every asset organized and ready." },
              { step: "4", icon: Rocket, title: "Deploy & Sell", desc: "Upload to WarriorPlus, ClickBank, or Gumroad and start taking sales tonight." },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors relative overflow-hidden">
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{item.step}</span>
                  </div>
                  <CardContent className="p-6 pt-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== INTRODUCING ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Introducing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text glow-text">DigiLaunchKit AI</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              The World's First AI Operating System Built Specifically for Launching Digital Products on WarriorPlus, ClickBank, Gumroad, JVZoo, and Etsy
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              It's not a copywriting tool. It's not a funnel builder. It's not a research tool.
              It's all three — working together as a single, guided launch system that takes you from blank-page panic to a fully-built, ready-to-sell digital product launch in under 60 minutes.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-10">
            {[
              "AI asks 5 simple questions about your niche",
              "Generates 3 unique mechanisms for your offer",
              "Builds everything in one clean dashboard",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-left p-3 rounded-lg bg-secondary/30 border border-border/50">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT GETS BUILT ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Complete Launch Package</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Here's Everything DigiLaunchKit AI Builds For You</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Target,
                title: "Product Concept Engine",
                items: [
                  "AI-generated product title, subtitle, and unique mechanism",
                  "Full product outline with chapter/module structure",
                ],
              },
              {
                icon: FileText,
                title: "Sales Funnel Copy Library",
                items: [
                  "Complete sales page — headline, bullets, proof, guarantee, CTA",
                  "Upsell and downsell page copy — OTO 1, OTO 2",
                  "Thank you page copy and buyer onboarding sequence",
                ],
              },
              {
                icon: Mail,
                title: "Email Launch Sequence",
                items: [
                  "5-email pre-launch and post-launch sequence",
                  "Subject lines, body copy, and CTAs — written in your voice",
                ],
              },
              {
                icon: Megaphone,
                title: "Ad Copy & Social Assets",
                items: [
                  "5 Facebook/Instagram ad variations with hooks and CTAs",
                  "10 social media posts ready to schedule",
                  "Pinterest pin descriptions optimized for discovery",
                ],
              },
              {
                icon: Users,
                title: "Affiliate Kit Generator",
                items: [
                  "Complete JV page copy with commission structure and promo angles",
                  "Affiliate email swipes your partners can deploy in minutes",
                  "Bonus page headlines and promotional angles",
                ],
              },
              {
                icon: ClipboardList,
                title: "Launch Checklist",
                items: [
                  "Day-by-day launch timeline so nothing falls through the cracks",
                  "Pre-launch, launch day, and post-launch task sequence",
                ],
              },
            ].map((section, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.08 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg">{section.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== STEAL THIS LAUNCH ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Nobody Else Has This</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Steal This Launch</h2>
          </motion.div>
          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Paste any WarriorPlus, ClickBank, Gumroad, JVZoo, or Etsy product URL into DigiLaunchKit AI, click Analyze, and the AI will:
            </p>
            <div className="space-y-3 mb-6">
              {[
                "Reverse-engineer the entire launch strategy — offer angle, mechanism, price, funnel structure",
                "Identify the gaps and weaknesses in their approach",
                "Build you a superior, differentiated counter-launch — same market, better positioning",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground">
                This isn't copying. This is competitive intelligence at a level that used to require hiring a $500/hour consultant and waiting two weeks for a report. <strong className="text-foreground">Now it takes 90 seconds.</strong>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== RESEARCH AGENT ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Before You Even Have An Idea</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Launch Research Agent</h2>
            <p className="text-muted-foreground">
              Discover profitable product ideas before you build anything. Four research modes for four different situations:
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { title: "Pain Point Discovery", desc: "Find real audience frustrations and turn them into product ideas with built-in demand" },
              { title: "Demand-Led Research", desc: "Discover what's already selling so you can build a better version, not a blind guess" },
              { title: "Competitor Gap Analysis", desc: "Find the holes in competitors' products that customers are complaining about" },
              { title: "Asset-First Research", desc: "Already have knowledge or content? Find the fastest path to monetizing what you have" },
            ].map((mode, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-1 text-sm">{mode.title}</h3>
                  <p className="text-xs text-muted-foreground">{mode.desc}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <motion.p {...fadeIn} className="text-center text-foreground font-semibold">
            Stop building products nobody wants. Start building the products your market is already screaming for.
          </motion.p>
        </div>
      </section>

      <SectionDivider />

      {/* ===== LAUNCH SCORE ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Launch Score Advisor</h2>
            <p className="text-muted-foreground mb-6">Your AI Strategist On Demand</p>
          </motion.div>

          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Before you spend a single hour building, DigiLaunchKit's Launch Score Advisor analyzes your idea and scores it across four critical dimensions:
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: BarChart3, label: "Market Demand" },
                { icon: Search, label: "Competition Level" },
                { icon: DollarSign, label: "Monetization Potential" },
                { icon: Target, label: "Offer Strength" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <item.icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground">
                Most people only discover their idea was weak <strong className="text-foreground">after</strong> they've spent three months building it. The Launch Score Advisor tells you in three minutes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT THIS REPLACES ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What This Replaces</h2>
            <p className="text-muted-foreground">See why creators are switching to DigiLaunchKit.</p>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <X className="w-5 h-5 text-destructive" />
                  Without DigiLaunchKit
                </h3>
                <ul className="space-y-3">
                  {[
                    "Weeks creating your product",
                    "Hiring copywriters ($3,000+)",
                    "Building funnels from scratch",
                    "Writing emails one by one",
                    "Designing graphics yourself",
                    "Planning launches with spreadsheets",
                    "Guessing what will sell",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* With */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  With DigiLaunchKit
                </h3>
                <ul className="space-y-3">
                  {[
                    "Enter your topic",
                    "Click build",
                    "Product generated in minutes",
                    "Sales page written automatically",
                    "Email sequence created instantly",
                    "Graphics and affiliate kit included",
                    "Launch your product tonight",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHO IT'S FOR / NOT FOR ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeIn} className="text-3xl md:text-4xl font-bold mb-10 text-center">Who This Is For (and Who It's Not)</motion.h2>

          <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> This IS For You If…</h3>
                <ul className="space-y-3">
                  {[
                    "Digital product creators who want to launch faster without sacrificing quality",
                    "Affiliate marketers who want to create their own products and stop sharing commissions",
                    "Coaches and consultants who want to productize expertise without hiring a $5,000 copywriter",
                    "Course creators tired of spending more time on the launch than the course itself",
                    "Complete beginners who have a good idea but no idea where to start",
                    "Experienced sellers who want to cut launch time from weeks to hours",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><X className="w-5 h-5 text-destructive" /> This is NOT For You If…</h3>
                <ul className="space-y-3">
                  {[
                    "You're looking for a magic button that requires zero effort",
                    "You don't believe in digital products as a business model",
                    "You want to sell junk — DigiLaunchKit helps you build real offers for real markets",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT MAKES IT DIFFERENT ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">What Makes This Different</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Most AI tools are general-purpose. They were built to write emails, blog posts, and social media captions. When you try to use them for a digital product launch, you get disconnected, generic pieces that still require a skilled marketer to assemble.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              DigiLaunchKit AI was built from the ground up for <strong className="text-foreground">one thing: launching digital products.</strong> Every prompt, every framework, every output was engineered specifically for the WarriorPlus/ClickBank/Gumroad ecosystem.
            </p>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
              <p className="text-foreground font-semibold">This is the difference between a Swiss Army knife and a scalpel.</p>
              <p className="text-sm text-muted-foreground mt-1">One does a lot of things adequately. The other does one thing perfectly.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== BUILT FOR WARRIORPLUS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Purpose-Built</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Built For WarriorPlus Launches</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
              {[
                "Optimized $17 front-end funnels",
                "Affiliate promo kit included",
                "JV page generated automatically",
                "Launch email swipes included",
                "Bonus stack builder",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT YOU CAN BUILD ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Can Build With DigiLaunchKit</h2>
            <p className="text-muted-foreground mb-8">Stop thinking about one product. Start thinking about an entire business.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
              {[
                "AI Side Hustle Course",
                "Affiliate Marketing Guide",
                "Local Lead Generation Blueprint",
                "AI Content Agency Starter",
                "Digital Marketing Templates",
                "Coaching Program Kit",
                "SaaS Launch Playbook",
                "Freelance Business Bundle",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== TEMPLATES + BYOK ===== */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div {...fadeIn}>
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Pre-Built Launch Templates</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Not sure what niche to start in? Five templates ready to customize and deploy:</p>
            <ul className="space-y-2">
              {[
                "Affiliate Marketing — passive income guides",
                "AI Tools & Automation — leverage AI courses",
                "Fitness & Wellness — 30-day transformation programs",
                "Productivity Systems — second brain products",
                "Side Hustle Blueprint — 2026 economy guides",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeIn}>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">BYOK: Control Your AI Costs</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your own OpenAI, Anthropic (Claude), or DeepSeek API keys and use DigiLaunchKit at your own cost structure, with no middleman markup.
            </p>
            <p className="text-sm text-muted-foreground">
              For power users and agencies, run at scale without worrying about platform limits. For everyone else, the app works out of the box with no API key required.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT THIS BUILDS FOR YOU ===== */}
      <section id="pricing-section" className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What DigiLaunchKit Builds For You</h2>
            <p className="text-muted-foreground">In about 60 minutes, your entire launch is ready.</p>
          </motion.div>

          <motion.div {...fadeIn} className="space-y-3 mb-10">
            {[
              { asset: "Digital Product (ebook or guide)", emoji: "📚" },
              { asset: "High-Converting Sales Page", emoji: "📄" },
              { asset: "Bonus Stack (3+ bonuses)", emoji: "🎁" },
              { asset: "5-Email Launch Sequence", emoji: "📧" },
              { asset: "Affiliate Promo Kit & JV Page", emoji: "🤝" },
              { asset: "Product Bundle Graphics", emoji: "🎨" },
              { asset: "Ad Copy & Social Media Posts", emoji: "📣" },
              { asset: "Day-by-Day Launch Timeline", emoji: "📅" },
              { asset: "Complete Launch-In-A-Box ZIP", emoji: "📦" },
              { asset: "Deployable Funnel Website", emoji: "🌐" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <span className="text-lg shrink-0">{item.emoji}</span>
                <span className="text-sm font-medium">{item.asset}</span>
              </div>
            ))}
          </motion.div>

          {/* Itemized Value Stack */}
          <motion.div {...fadeIn} className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-8">
            <h3 className="text-lg font-bold text-center mb-2">Typical Cost Of Building A Product Launch:</h3>
            <p className="text-center text-sm text-muted-foreground mb-6">Here's what you'd normally pay for each piece…</p>
            <div className="space-y-2 mb-6">
              {[
                { item: "Product creation", value: "$297" },
                { item: "Sales page copy", value: "$197" },
                { item: "Email launch sequence", value: "$97" },
                { item: "Affiliate promo kit", value: "$97" },
                { item: "Funnel setup", value: "$197" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/30">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {row.item}
                  </span>
                  <span className="text-sm text-muted-foreground font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 pt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-4xl font-black text-foreground line-through decoration-destructive/60">$885+</p>
              <p className="text-sm text-muted-foreground font-medium">DigiLaunchKit does it automatically.</p>
              <p className="text-sm text-muted-foreground">Today:</p>
              <p className="text-5xl font-black gradient-text">$37</p>
            </div>
            <div className="text-center mt-6">
              <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
                <Wand2 className="w-5 h-5" />
                Get Instant Access Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== GUARANTEE ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The "Launch Or It's Free" Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Use DigiLaunchKit AI. Run the Launch Wizard. Generate your assets. If after using this system you don't have a complete, ready-to-publish digital product launch in your hands — or if for any reason you're not satisfied — contact us within 30 days and we'll refund every penny. No questions. No hoops. No guilt trip.
            </p>
            <p className="text-foreground font-semibold">
              The only way you don't get results is if you don't use it.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== INVESTMENT ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Here's What This Investment Looks Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Professional Copywriter", cost: "$3,000 – $10,000", time: "4–8 weeks" },
                { label: "Launch Consultant", cost: "$5,000 – $25,000", time: "Strategy only" },
                { label: "Funnel Builder", cost: "$1,500 – $5,000", time: "Before copy" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-destructive font-bold mt-1">{item.cost}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8">
              DigiLaunchKit AI replaces all of that. Today, during this launch window, you can get access for a one-time investment that is a fraction of what a single freelancer would charge for a single asset.
            </p>
            <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
              <Wand2 className="w-5 h-5" />
              Get Instant Access Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== FINAL WORD ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">A Final Word Before You Decide</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              There are two kinds of digital entrepreneurs.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The first kind spends the next six months doing what they've always done — wrestling with blank pages, paying for tools that don't talk to each other, half-finishing launches that never see the light of day.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The second kind clicks a button today, runs the wizard tonight, and wakes up tomorrow with a complete, professional-grade digital product launch ready to upload to WarriorPlus before lunch.
            </p>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center mb-8">
              <p className="text-foreground font-semibold">
                The information in your head right now is worth real money to real people who desperately need what you know.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The only thing standing between you and that first sale is a launch system that works. You're looking at it.
              </p>
            </div>
            <div className="text-center">
              <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
                <Wand2 className="w-5 h-5" />
                Yes — Give Me Instant Access Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <motion.div {...fadeIn} className="space-y-3">
            <FAQItem
              q="Do I need any technical skills to use DigiLaunchKit AI?"
              a="None. If you can type and click a mouse, you can use DigiLaunchKit. The entire system is guided — it tells you what to enter at every step."
            />
            <FAQItem
              q="What kind of products can I launch with this?"
              a="eBooks, video courses, membership sites, coaching programs, software tools, templates, planners, swipe files, affiliate marketing guides — anything sold as a digital product on WarriorPlus, ClickBank, Gumroad, JVZoo, or Etsy."
            />
            <FAQItem
              q="Does this actually work for complete beginners?"
              a="Yes. In fact, beginners often get more from DigiLaunchKit than experienced marketers because they haven't spent years building bad habits. The system guides you through every decision."
            />
            <FAQItem
              q="What if my niche isn't covered in the templates?"
              a="The templates are starting points, not limitations. The AI Launch Wizard works for any niche — you enter your own topic and audience, and the system builds around your specific market."
            />
            <FAQItem
              q="Is there a monthly fee?"
              a="Not at this launch price. Today's offer is a one-time payment for permanent access. When we move to our standard pricing model, it will be a recurring subscription. Lock in now and you're grandfathered in for life."
            />
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            DigiLaunchKit AI
          </span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate("/wizard")} className="hover:text-foreground transition-colors">
              Launch Wizard
            </button>
            <button onClick={() => navigate("/steal")} className="hover:text-foreground transition-colors">
              Steal a Launch
            </button>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">
              Pricing
            </button>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 DigiLaunchKit AI</p>
        </div>
      </footer>

      {/* ===== FLOATING BUY BAR ===== */}
      {showFloatingBar && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-primary/20 shadow-[0_-4px_30px_hsl(var(--primary)/0.15)]"
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-foreground">DigiLaunchKit AI</p>
              <p className="text-xs text-muted-foreground">60-Minute Digital Product Launch System</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
              <span className="text-lg font-black gradient-text">$37</span>
              <Button variant="hero" size="sm" onClick={scrollToPricing} className="dual-glow">
                <Rocket className="w-4 h-4" />
                Get Instant Access
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
