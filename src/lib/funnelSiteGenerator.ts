import type { Step3Funnel, SalesPageSections } from "@/types/launchWizard";

export type FunnelTemplate = "classic-im" | "minimal-creator" | "toolkit-launch";

export interface FunnelTemplateConfig {
  id: FunnelTemplate;
  label: string;
  description: string;
  preview: string; // emoji
}

export const FUNNEL_TEMPLATES: FunnelTemplateConfig[] = [
  { id: "classic-im", label: "Classic IM Launch", description: "Bold, high-converting WarriorPlus style with urgency bars and value stacking", preview: "🔥" },
  { id: "minimal-creator", label: "Minimal Creator", description: "Clean, modern typography with generous whitespace and soft CTAs", preview: "✨" },
  { id: "toolkit-launch", label: "Toolkit Launch", description: "Dark premium theme with gradient accents and product showcases", preview: "🚀" },
];

interface FunnelSiteConfig {
  productTitle: string;
  productSubtitle?: string;
  authorName?: string;
  contactEmail?: string;
  paymentLink?: string;
  price?: number;
  niche?: string;
  template?: FunnelTemplate;
}

const escapeHtml = (str: string) =>
  (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const nl2br = (str: string) => escapeHtml(str).replace(/\n/g, "<br>");

/* ============================================================
   TEMPLATE CSS
   ============================================================ */

function classicIMCSS(): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --cream:#f5f0e8;--ink:#1a1208;--red:#c0000a;--gold:#8b6914;
  --accent:#c0000a;--bg:#f5f0e8;--card:#fff;--border:#e0d8cc;
  --shadow:0 4px 24px rgba(0,0,0,.08);
}
body{font-family:'Georgia','Libre Baskerville',serif;background:var(--bg);color:var(--ink);line-height:1.7;font-size:17px}
a{color:var(--accent);text-decoration:none}
img{max-width:100%;height:auto}
.container{max-width:720px;margin:0 auto;padding:32px 20px}
.hero{text-align:center;padding:80px 20px 48px;background:linear-gradient(180deg,#fffdf5 0%,var(--bg) 100%)}
.hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2rem,5.5vw,3.2rem);line-height:1.15;margin-bottom:20px;color:var(--ink);letter-spacing:-0.02em}
.hero .subtitle{font-size:1.15rem;color:#555;max-width:580px;margin:0 auto 28px;line-height:1.6}
.cta-btn{display:inline-block;background:var(--accent);color:#fff;padding:18px 48px;border-radius:8px;font-size:1.15rem;font-weight:700;cursor:pointer;border:none;transition:all .2s;text-decoration:none;box-shadow:0 4px 16px rgba(192,0,10,.25);letter-spacing:0.01em}
.cta-btn:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(192,0,10,.35)}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:32px;margin:28px 0;box-shadow:var(--shadow)}
.section{padding:36px 0}
.section h2{font-family:'Playfair Display',Georgia,serif;font-size:1.7rem;margin-bottom:18px;color:var(--ink);letter-spacing:-0.01em}
.value-stack{border:2px solid var(--gold);border-radius:12px;padding:28px;margin:28px 0;background:#fffdf5}
.value-item{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)}
.value-item:last-child{border-bottom:none}
.value-item .name{font-weight:700}
.value-item .price{color:var(--gold);font-weight:700;font-size:1.05rem}
.total-row{display:flex;justify-content:space-between;padding:16px 0;font-size:1.3rem;font-weight:700;border-top:2px solid var(--gold);margin-top:12px}
.price-box{text-align:center;padding:40px;margin:28px 0;background:linear-gradient(135deg,#fffdf5,#fff8e8);border-radius:16px;border:2px solid var(--gold)}
.price-box .was{font-size:1.4rem;text-decoration:line-through;color:#888}
.price-box .now{font-size:2.8rem;font-weight:700;color:var(--accent);margin:8px 0}
.guarantee{background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #86efac;border-radius:12px;padding:28px;margin:28px 0;text-align:center}
.footer{text-align:center;padding:48px 20px;color:#888;font-size:.85rem;border-top:1px solid var(--border);margin-top:40px}
.bullet-list{list-style:none;padding:0}
.bullet-list li{padding:10px 0 10px 32px;position:relative;font-size:1.02rem}
.bullet-list li::before{content:"✓";position:absolute;left:0;color:var(--gold);font-weight:700;font-size:1.1rem}
.urgency-bar{background:linear-gradient(90deg,#c0000a,#e62020);color:#fff;text-align:center;padding:14px;font-weight:700;position:sticky;top:0;z-index:100;font-size:.95rem;letter-spacing:0.02em;box-shadow:0 2px 12px rgba(192,0,10,.3)}
.trust-strip{display:flex;justify-content:center;gap:24px;flex-wrap:wrap;padding:16px 0;margin:0 auto;max-width:600px}
.trust-pill{display:inline-flex;align-items:center;gap:6px;font-size:.85rem;color:#666;background:#fff;padding:6px 14px;border-radius:20px;border:1px solid var(--border)}
@media(max-width:640px){.container{padding:20px 16px}.hero{padding:48px 16px 28px}.hero h1{font-size:1.7rem}.cta-btn{padding:16px 32px;font-size:1rem}}
`;
}

function minimalCreatorCSS(): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#fafaf9;--ink:#18181b;--accent:#2563eb;--accent-hover:#1d4ed8;
  --card:#fff;--border:#e4e4e7;--muted:#71717a;
  --shadow:0 1px 3px rgba(0,0,0,.05);
}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink);line-height:1.7;font-size:16px;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}
img{max-width:100%;height:auto}
.container{max-width:640px;margin:0 auto;padding:32px 24px}
.hero{text-align:center;padding:96px 24px 56px;max-width:700px;margin:0 auto}
.hero h1{font-size:clamp(2rem,5vw,3rem);line-height:1.1;margin-bottom:20px;color:var(--ink);font-weight:800;letter-spacing:-0.035em}
.hero .subtitle{font-size:1.1rem;color:var(--muted);max-width:520px;margin:0 auto 32px;line-height:1.65}
.cta-btn{display:inline-block;background:var(--accent);color:#fff;padding:16px 40px;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer;border:none;transition:all .2s;text-decoration:none}
.cta-btn:hover{background:var(--accent-hover);transform:translateY(-1px);box-shadow:0 4px 16px rgba(37,99,235,.25)}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:32px;margin:24px 0;box-shadow:var(--shadow)}
.section{padding:32px 0}
.section h2{font-size:1.5rem;margin-bottom:16px;color:var(--ink);font-weight:700;letter-spacing:-0.02em}
.value-stack{border:1px solid var(--border);border-radius:14px;padding:24px;margin:24px 0;background:var(--card)}
.value-item{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)}
.value-item:last-child{border-bottom:none}
.value-item .name{font-weight:600;font-size:.95rem}
.value-item .price{color:var(--accent);font-weight:700}
.total-row{display:flex;justify-content:space-between;padding:14px 0;font-size:1.15rem;font-weight:700;border-top:2px solid var(--accent);margin-top:8px}
.price-box{text-align:center;padding:40px;margin:32px 0;background:var(--card);border-radius:16px;border:1px solid var(--border)}
.price-box .was{font-size:1.2rem;text-decoration:line-through;color:var(--muted)}
.price-box .now{font-size:2.5rem;font-weight:800;color:var(--ink);margin:8px 0;letter-spacing:-0.03em}
.guarantee{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:28px;margin:28px 0;text-align:center}
.footer{text-align:center;padding:48px 20px;color:var(--muted);font-size:.8rem;margin-top:40px}
.bullet-list{list-style:none;padding:0}
.bullet-list li{padding:8px 0 8px 28px;position:relative;color:#3f3f46}
.bullet-list li::before{content:"→";position:absolute;left:0;color:var(--accent);font-weight:700}
.urgency-bar{background:var(--accent);color:#fff;text-align:center;padding:12px;font-weight:600;position:sticky;top:0;z-index:100;font-size:.9rem}
.trust-strip{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;padding:20px 0;max-width:560px;margin:0 auto}
.trust-pill{font-size:.8rem;color:var(--muted);background:var(--card);padding:6px 14px;border-radius:8px;border:1px solid var(--border)}
@media(max-width:640px){.container{padding:20px 16px}.hero{padding:60px 16px 36px}.hero h1{font-size:1.8rem}}
`;
}

function toolkitLaunchCSS(): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0f1a;--ink:#e2e8f0;--accent:#6366f1;--accent-glow:#818cf8;
  --card:rgba(15,23,42,.8);--border:rgba(99,102,241,.2);--muted:#94a3b8;
  --shadow:0 4px 24px rgba(0,0,0,.3);
}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink);line-height:1.7;font-size:16px;-webkit-font-smoothing:antialiased}
a{color:var(--accent-glow);text-decoration:none}
img{max-width:100%;height:auto}
.container{max-width:700px;margin:0 auto;padding:32px 24px}
.hero{text-align:center;padding:100px 24px 60px;background:radial-gradient(ellipse at 50% 0%,rgba(99,102,241,.15) 0%,transparent 60%)}
.hero h1{font-size:clamp(2rem,5.5vw,3.4rem);line-height:1.1;margin-bottom:20px;font-weight:800;letter-spacing:-0.04em;background:linear-gradient(135deg,#e2e8f0,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero .subtitle{font-size:1.1rem;color:var(--muted);max-width:560px;margin:0 auto 32px;line-height:1.65}
.cta-btn{display:inline-block;background:linear-gradient(135deg,var(--accent),var(--accent-glow));color:#fff;padding:18px 48px;border-radius:12px;font-size:1.05rem;font-weight:700;cursor:pointer;border:none;transition:all .25s;text-decoration:none;box-shadow:0 0 32px rgba(99,102,241,.3)}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 0 48px rgba(99,102,241,.45)}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:32px;margin:28px 0;box-shadow:var(--shadow);backdrop-filter:blur(12px)}
.section{padding:36px 0}
.section h2{font-size:1.6rem;margin-bottom:18px;font-weight:700;letter-spacing:-0.02em;color:#f1f5f9}
.value-stack{border:1px solid var(--border);border-radius:16px;padding:28px;margin:28px 0;background:rgba(99,102,241,.05);backdrop-filter:blur(8px)}
.value-item{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(148,163,184,.1)}
.value-item:last-child{border-bottom:none}
.value-item .name{font-weight:600;font-size:.95rem}
.value-item .price{color:var(--accent-glow);font-weight:700}
.total-row{display:flex;justify-content:space-between;padding:16px 0;font-size:1.25rem;font-weight:700;border-top:2px solid var(--accent);margin-top:12px}
.price-box{text-align:center;padding:44px;margin:32px 0;background:radial-gradient(ellipse,rgba(99,102,241,.1),transparent);border-radius:20px;border:1px solid var(--border)}
.price-box .was{font-size:1.3rem;text-decoration:line-through;color:var(--muted)}
.price-box .now{font-size:3rem;font-weight:800;margin:8px 0;background:linear-gradient(135deg,#e2e8f0,var(--accent-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.guarantee{background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);border-radius:16px;padding:28px;margin:28px 0;text-align:center}
.footer{text-align:center;padding:48px 20px;color:var(--muted);font-size:.8rem;margin-top:40px;border-top:1px solid rgba(148,163,184,.1)}
.bullet-list{list-style:none;padding:0}
.bullet-list li{padding:10px 0 10px 32px;position:relative;color:var(--muted)}
.bullet-list li::before{content:"⚡";position:absolute;left:0;font-size:.9rem}
.urgency-bar{background:linear-gradient(90deg,var(--accent),var(--accent-glow));color:#fff;text-align:center;padding:14px;font-weight:600;position:sticky;top:0;z-index:100;font-size:.9rem;box-shadow:0 2px 16px rgba(99,102,241,.3)}
.trust-strip{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;padding:20px 0;max-width:600px;margin:0 auto}
.trust-pill{font-size:.8rem;color:var(--muted);background:rgba(255,255,255,.05);padding:6px 14px;border-radius:8px;border:1px solid var(--border);backdrop-filter:blur(4px)}
@media(max-width:640px){.container{padding:20px 16px}.hero{padding:60px 16px 36px}.hero h1{font-size:1.8rem}}
`;
}

function getTemplateCSS(template: FunnelTemplate): string {
  switch (template) {
    case "minimal-creator": return minimalCreatorCSS();
    case "toolkit-launch": return toolkitLaunchCSS();
    default: return classicIMCSS();
  }
}

function getFontLink(template: FunnelTemplate): string {
  if (template === "classic-im") {
    return `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet">`;
  }
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;
}

function wrapPage(title: string, template: FunnelTemplate, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
${getFontLink(template)}
<style>${getTemplateCSS(template)}</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function generateSalesPageHTML(funnel: Step3Funnel, config: FunnelSiteConfig): string {
  const s = funnel.salesPageSections;
  const price = config.price || 17;
  const payLink = config.paymentLink || "#checkout";
  const template = config.template || "classic-im";

  let body = "";

  // Urgency bar
  if (s?.urgencyClose) {
    body += `<div class="urgency-bar">🔥 Limited Time — Launch Pricing Available Now</div>`;
  }

  // Hero
  body += `<div class="hero">
<h1>${escapeHtml(s?.patternInterrupt || config.productTitle)}</h1>
<p class="subtitle">${escapeHtml(s?.bigPromise || config.productSubtitle || "")}</p>
<a href="${escapeHtml(payLink)}" class="cta-btn">Get Instant Access — Just $${price}</a>
</div>`;

  // Trust pills
  body += `<div class="trust-strip">
<span class="trust-pill">✓ Instant Download</span>
<span class="trust-pill">✓ Beginner Friendly</span>
<span class="trust-pill">✓ Money-Back Guarantee</span>
</div>`;

  body += `<div class="container">`;

  // Curiosity hook
  if (s?.curiosityHook) {
    body += `<div class="section"><p>${nl2br(s.curiosityHook)}</p></div>`;
  }

  // Problem
  if (s?.problemAgitation) {
    body += `<div class="section"><h2>Does This Sound Familiar?</h2><p>${nl2br(s.problemAgitation)}</p></div>`;
  }

  // Mechanism
  if (s?.mechanismIntro) {
    body += `<div class="card"><h2>Introducing: ${escapeHtml(config.productTitle)}</h2><p>${nl2br(s.mechanismIntro)}</p></div>`;
  }

  // System steps
  if (s?.systemSteps?.length) {
    body += `<div class="section"><h2>How It Works</h2><ul class="bullet-list">${s.systemSteps.map(st => `<li>${escapeHtml(st)}</li>`).join("")}</ul></div>`;
  }

  // Product breakdown
  if (s?.productBreakdown?.length) {
    body += `<div class="section"><h2>Here's Everything You Get</h2><div class="value-stack">`;
    s.productBreakdown.forEach(m => {
      body += `<div class="value-item"><span class="name">${escapeHtml(m.title)}</span><span class="price">$${m.value} value</span></div>`;
    });
    if (s.bonusStack?.length) {
      body += `<div style="padding:14px 0 6px;font-weight:700;color:${template === "toolkit-launch" ? "var(--accent-glow)" : "var(--accent)"}">PLUS These Bonuses:</div>`;
      s.bonusStack.forEach(b => {
        body += `<div class="value-item"><span class="name">🎁 ${escapeHtml(b.name)}</span><span class="price">$${b.value} value</span></div>`;
      });
    }
    const totalVal = [...(s.productBreakdown || []), ...(s.bonusStack || [])].reduce((a, b) => a + (b.value || 0), 0);
    body += `<div class="total-row"><span>Total Value</span><span>$${totalVal}</span></div></div></div>`;
  }

  // Testimonials
  if (s?.testimonials) {
    body += `<div class="card"><h2>What Others Are Saying</h2><p>${nl2br(s.testimonials)}</p></div>`;
  }

  // Objections
  if (s?.objectionHandling) {
    body += `<div class="section"><p>${nl2br(s.objectionHandling)}</p></div>`;
  }

  // Buyer signals
  if (s?.buyerSignals) {
    body += `<div class="section"><h2>Is This For You?</h2><p>${nl2br(s.buyerSignals)}</p></div>`;
  }

  // Implementation path
  if (s?.implementationPath) {
    body += `<div class="card"><h2>Your Quick-Start Plan</h2><p>${nl2br(s.implementationPath)}</p></div>`;
  }

  // Guarantee
  if (s?.guarantee) {
    body += `<div class="guarantee"><h2>🛡️ Our Guarantee</h2><p>${nl2br(s.guarantee)}</p></div>`;
  }

  // Price box + CTA
  body += `<div class="price-box">
<p class="was">Regular Price: $${Math.round(price * 20)}</p>
<p class="now">Today Only: $${price}</p>
<br><a href="${escapeHtml(payLink)}" class="cta-btn">${escapeHtml(s?.callToAction || `Yes — Give Me Instant Access For $${price}`)}</a>
</div>`;

  // Urgency
  if (s?.urgencyClose) {
    body += `<div class="section" style="text-align:center"><p>${nl2br(s.urgencyClose)}</p></div>`;
  }

  body += `</div><div class="footer"><p>&copy; ${new Date().getFullYear()} ${escapeHtml(config.authorName || "")}</p>
${config.contactEmail ? `<p>Contact: ${escapeHtml(config.contactEmail)}</p>` : ""}
<p><a href="bonus.html">Bonuses</a> | <a href="checkout.html">Order Now</a></p></div>`;

  return wrapPage(config.productTitle + " — Sales Page", template, body);
}

export function generateOptinPageHTML(funnel: Step3Funnel, config: FunnelSiteConfig): string {
  const template = config.template || "classic-im";
  const optinCopy = funnel.optInPage || "";
  const body = `<div class="hero">
<h1>Free Access</h1>
<p class="subtitle">${nl2br(optinCopy)}</p>
</div>
<div class="container">
<div class="card" style="text-align:center">
<h2>Enter Your Email to Get Started</h2>
<form style="margin-top:20px">
<input type="email" placeholder="Your best email..." style="width:100%;max-width:400px;padding:14px;border:1px solid ${template === "toolkit-launch" ? "rgba(99,102,241,.3)" : "var(--border)"};border-radius:8px;font-size:1rem;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;background:${template === "toolkit-launch" ? "rgba(255,255,255,.05)" : "#fff"};color:${template === "toolkit-launch" ? "#e2e8f0" : "inherit"}">
<button type="submit" class="cta-btn" style="width:100%;max-width:400px">Send Me Free Access</button>
</form>
<p style="margin-top:12px;font-size:.85rem;color:${template === "toolkit-launch" ? "#94a3b8" : "#888"}">We respect your privacy. Unsubscribe anytime.</p>
</div>
</div>
<div class="footer"><p>&copy; ${new Date().getFullYear()} ${escapeHtml(config.authorName || "")}</p></div>`;
  return wrapPage("Free Access — " + config.productTitle, template, body);
}

export function generateThankYouPageHTML(funnel: Step3Funnel, config: FunnelSiteConfig): string {
  const template = config.template || "classic-im";
  const body = `<div class="hero">
<h1>🎉 Thank You!</h1>
<p class="subtitle">Your order is confirmed.</p>
</div>
<div class="container">
<div class="card">
<h2>What Happens Next</h2>
<p>${nl2br(funnel.thankYouPage || "Check your email for instant access to your purchase.")}</p>
</div>
${funnel.upsellOffer ? `<div class="card" style="border-color:${template === "toolkit-launch" ? "var(--accent-glow)" : "var(--gold, var(--accent))"}">
<h2>⚡ Special One-Time Offer</h2>
<p>${nl2br(funnel.upsellOffer)}</p>
<div style="text-align:center;margin-top:16px">
<a href="${escapeHtml(config.paymentLink || "#")}" class="cta-btn">Upgrade Now</a>
</div>
</div>` : ""}
</div>
<div class="footer"><p>&copy; ${new Date().getFullYear()} ${escapeHtml(config.authorName || "")}</p></div>`;
  return wrapPage("Thank You — " + config.productTitle, template, body);
}

export function generateBonusPageHTML(funnel: Step3Funnel, config: FunnelSiteConfig): string {
  const template = config.template || "classic-im";
  const sections = funnel.salesPageSections;
  let bonusHtml = "";
  if (sections?.bonusStack?.length) {
    bonusHtml = sections.bonusStack.map((b, i) => `<div class="card">
<h2>🎁 Bonus #${i + 1}: ${escapeHtml(b.name)}</h2>
<p>${escapeHtml(b.description)}</p>
<p style="color:${template === "toolkit-launch" ? "var(--accent-glow)" : "var(--gold, var(--accent))"};font-weight:700">Value: $${b.value}</p>
</div>`).join("");
  }
  const body = `<div class="hero">
<h1>Your Exclusive Bonuses</h1>
<p class="subtitle">${escapeHtml(funnel.bonusPage || "Here's everything included with your purchase.")}</p>
</div>
<div class="container">${bonusHtml || `<div class="card"><p>${nl2br(funnel.bonusPage || "Bonuses included with your purchase.")}</p></div>`}
<div style="text-align:center;padding:32px 0">
<a href="${escapeHtml(config.paymentLink || "checkout.html")}" class="cta-btn">Claim Your Bonuses — Get Access Now</a>
</div>
</div>
<div class="footer"><p>&copy; ${new Date().getFullYear()} ${escapeHtml(config.authorName || "")}</p></div>`;
  return wrapPage("Bonuses — " + config.productTitle, template, body);
}

export function generateCheckoutPageHTML(funnel: Step3Funnel, config: FunnelSiteConfig): string {
  const template = config.template || "classic-im";
  const price = config.price || 17;
  const payLink = config.paymentLink || "#";
  const body = `<div class="container" style="padding-top:60px">
<div class="card" style="max-width:520px;margin:0 auto">
<h2 style="text-align:center">Complete Your Order</h2>
<p style="text-align:center;color:${template === "toolkit-launch" ? "var(--muted)" : "#555"};margin-bottom:24px">${escapeHtml(funnel.checkoutCopy || `Secure your copy of ${config.productTitle} today.`)}</p>
<div class="value-stack" style="margin-bottom:24px">
<div class="value-item"><span class="name">${escapeHtml(config.productTitle)}</span><span class="price">$${price}</span></div>
${funnel.orderBump ? `<div style="background:${template === "toolkit-launch" ? "rgba(99,102,241,.08)" : "#fffbe6"};border:1px dashed ${template === "toolkit-launch" ? "var(--accent)" : "var(--gold, var(--accent))"};border-radius:10px;padding:16px;margin:12px 0">
<label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer">
<input type="checkbox" style="margin-top:4px">
<div><strong>Yes! Add This:</strong><br><span style="font-size:.9rem">${escapeHtml(funnel.orderBump)}</span></div>
</label>
</div>` : ""}
</div>
<div style="text-align:center">
<a href="${escapeHtml(payLink)}" class="cta-btn" style="width:100%;display:block;text-align:center">Complete Purchase — $${price}</a>
<p style="margin-top:12px;font-size:.8rem;color:${template === "toolkit-launch" ? "var(--muted)" : "#888"}">🔒 Secure checkout. Instant digital delivery.</p>
</div>
</div>
</div>
<div class="footer"><p>&copy; ${new Date().getFullYear()} ${escapeHtml(config.authorName || "")}</p></div>`;
  return wrapPage("Checkout — " + config.productTitle, template, body);
}

export function generateReadmeTxt(config: FunnelSiteConfig): string {
  return `========================================
HOW TO GO LIVE IN 5 MINUTES
========================================

Your funnel site is ready to deploy! Here's how:

OPTION 1: Netlify Drop (Easiest — Free)
1. Go to https://app.netlify.com/drop
2. Drag this entire folder onto the page
3. Done! Your site is live.

OPTION 2: Any Web Host
1. Upload all files to your web hosting (FTP or file manager)
2. Make sure index.html is in the root directory
3. Your site is live at your domain

FILES INCLUDED:
- index.html     → Your sales page
- optin.html     → Opt-in / squeeze page
- thankyou.html  → Thank you / delivery page
- bonus.html     → Bonus showcase page
- checkout.html  → Checkout / order page

IMPORTANT:
- Update the payment link in checkout.html to your Gumroad, PayPal, or Stripe link
- Replace placeholder testimonials with real ones when available
- Test all links before promoting

Product: ${config.productTitle}
Author: ${config.authorName || "N/A"}
Template: ${config.template || "classic-im"}
Generated by DigiLaunchKit
========================================
`;
}

export interface FunnelSiteFiles {
  "index.html": string;
  "optin.html": string;
  "thankyou.html": string;
  "bonus.html": string;
  "checkout.html": string;
  "README.txt": string;
}

export function generateFunnelSite(funnel: Step3Funnel, config: FunnelSiteConfig): FunnelSiteFiles {
  return {
    "index.html": generateSalesPageHTML(funnel, config),
    "optin.html": generateOptinPageHTML(funnel, config),
    "thankyou.html": generateThankYouPageHTML(funnel, config),
    "bonus.html": generateBonusPageHTML(funnel, config),
    "checkout.html": generateCheckoutPageHTML(funnel, config),
    "README.txt": generateReadmeTxt(config),
  };
}
