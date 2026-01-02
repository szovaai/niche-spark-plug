export type PageTemplate = 'warriorplus' | 'saas' | 'simple';

export interface SalesLetterData {
  title: string;
  subtitle?: string;
  salesLetter: string;
  niche: string;
  targetAudience?: string;
  price?: number;
  template?: PageTemplate;
}

// WarriorPlus-style dark theme template
const warriorPlusTemplate = (data: SalesLetterData): string => {
  const { title, subtitle, salesLetter, niche, targetAudience, price = 17 } = data;
  
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background:#0b0f19; color:#e9eefc; line-height:1.6; }
    .wrap { max-width: 920px; margin: 0 auto; padding: 28px 18px 60px; }
    .card { background:#101a33; border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:22px 28px; margin:20px 0; }
    .pill { display:inline-block; background:rgba(124,92,255,.14); border:1px solid rgba(124,92,255,.35); color:#d8d2ff; padding:6px 14px; border-radius:999px; font-size:12px; letter-spacing:.3px; text-transform:uppercase; font-weight:600; }
    h1 { font-size:clamp(28px, 5vw, 42px); line-height:1.15; margin:18px 0 12px; font-weight:800; }
    h2 { font-size:clamp(20px, 4vw, 26px); margin:0 0 14px; font-weight:700; color:#ffffff; }
    h3 { font-size:18px; margin:0 0 10px; font-weight:600; color:#e9eefc; }
    p { color:#cdd7ff; line-height:1.65; font-size:16px; margin:12px 0; }
    .muted { color:#9db0ff; }
    .hero { text-align:center; padding:40px 0; }
    .grid { display:grid; grid-template-columns: 1fr; gap:14px; }
    @media(min-width: 700px){ .grid { grid-template-columns: 1fr 1fr; } }
    ul { padding-left: 0; margin:14px 0; list-style:none; }
    li { margin:10px 0; line-height:1.5; color:#dbe5ff; padding-left:28px; position:relative; }
    li::before { content:"✓"; position:absolute; left:0; color:#3aa0ff; font-weight:700; }
    .cta-box { text-align:center; padding:30px 20px; margin:30px 0; }
    .btn { background: linear-gradient(135deg,#3aa0ff 0%,#7c5cff 100%); color:#fff; text-decoration:none; padding:16px 32px; border-radius:12px; font-weight:700; font-size:17px; display:inline-block; box-shadow: 0 8px 30px rgba(124,92,255,.35); transition: transform .2s, box-shadow .2s; }
    .btn:hover { transform:translateY(-2px); box-shadow: 0 12px 40px rgba(124,92,255,.45); }
    .btn-secondary { background: transparent; border:1px solid rgba(255,255,255,.25); color:#e9eefc; text-decoration:none; padding:12px 24px; border-radius:10px; font-weight:600; font-size:15px; display:inline-block; margin-left:12px; }
    .price { font-size:36px; font-weight:800; color:#ffffff; margin:8px 0; }
    .price-note { font-size:13px; color:#9db0ff; margin-top:8px; }
    .section-title { font-weight:800; color:#ffffff; margin:0 0 8px; font-size:22px; }
    .hr { height:1px; background:rgba(255,255,255,.08); margin:24px 0; }
    .callout { border-left: 4px solid #7c5cff; padding-left: 16px; margin:16px 0; }
    .tag { font-weight:700; color:#ffffff; }
    .timeline { margin:20px 0; }
    .timeline-item { display:flex; gap:16px; margin:14px 0; }
    .timeline-marker { width:36px; height:36px; background:linear-gradient(135deg,#3aa0ff,#7c5cff); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:14px; flex-shrink:0; }
    .timeline-content { flex:1; }
    .timeline-title { font-weight:700; color:#ffffff; margin-bottom:4px; }
    .two-col { display:grid; grid-template-columns:1fr; gap:20px; }
    @media(min-width:700px){ .two-col { grid-template-columns:1fr 1fr; } }
    .fit-yes { background:rgba(58,160,255,.08); border:1px solid rgba(58,160,255,.2); border-radius:12px; padding:20px; }
    .fit-no { background:rgba(255,107,107,.06); border:1px solid rgba(255,107,107,.15); border-radius:12px; padding:20px; }
    .fit-yes h3 { color:#3aa0ff; }
    .fit-no h3 { color:#ff6b6b; }
    .footer { text-align:center; padding:40px 20px; color:#6b7aa1; font-size:13px; }
    .footer a { color:#7c5cff; text-decoration:none; }
    .content-section { margin:30px 0; }
    .content-section h2 { color:#ffffff; }
    .content-section p { color:#cdd7ff; }
    .content-section ul { margin:16px 0; }
    strong { color:#ffffff; }
    em { color:#d8d2ff; }
  </style>
</head>
<body>
  <div class="wrap">
    <!-- Hero Section -->
    <div class="hero">
      <span class="pill">${niche}${targetAudience ? ` • For ${targetAudience}` : ''}</span>
      <h1>${title}</h1>
      ${subtitle ? `<p style="font-size:18px;color:#cdd7ff;max-width:600px;margin:16px auto;">${subtitle}</p>` : ''}
      <div class="cta-box" style="padding:20px 0;">
        <p class="price">$${price}</p>
        <a href="#" class="btn">Get Instant Access</a>
        <p class="price-note">Instant download • Beginner friendly</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-section">
      ${salesLetter}
    </div>

    <!-- Final CTA -->
    <div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(58,160,255,.08),rgba(124,92,255,.08));">
      <h2>Ready to Get Started?</h2>
      <p style="max-width:500px;margin:12px auto 20px;">Get instant access to ${title} and start seeing results.</p>
      <p class="price">$${price}</p>
      <a href="#" class="btn">Get Instant Access Now</a>
      <p class="price-note">Instant access • 100% digital delivery</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${title}. All rights reserved.</p>
      <p style="margin-top:10px;">
        <a href="#">Contact</a> &bull; 
        <a href="#">Privacy Policy</a> &bull; 
        <a href="#">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

// Clean SaaS-style light theme template
const saasTemplate = (data: SalesLetterData): string => {
  const { title, subtitle, salesLetter, niche, price = 17 } = data;
  
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#ffffff; color:#1a1a2e; line-height:1.7; }
    .wrap { max-width: 720px; margin: 0 auto; padding: 60px 24px 80px; }
    h1 { font-size:clamp(32px, 5vw, 48px); line-height:1.1; margin:0 0 20px; font-weight:700; color:#1a1a2e; }
    h2 { font-size:24px; margin:40px 0 16px; font-weight:600; color:#1a1a2e; }
    p { color:#4a5568; font-size:17px; margin:16px 0; }
    .badge { display:inline-block; background:#f0f4ff; color:#4f46e5; padding:6px 12px; border-radius:6px; font-size:13px; font-weight:600; margin-bottom:16px; }
    ul { padding-left:24px; margin:20px 0; }
    li { margin:12px 0; color:#4a5568; }
    .cta-section { background:#f8fafc; border-radius:16px; padding:40px; text-align:center; margin:40px 0; }
    .btn { background:#4f46e5; color:#fff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:600; font-size:16px; display:inline-block; }
    .btn:hover { background:#4338ca; }
    .price { font-size:32px; font-weight:700; color:#1a1a2e; margin:8px 0 16px; }
    .footer { text-align:center; padding-top:40px; border-top:1px solid #e2e8f0; margin-top:60px; color:#94a3b8; font-size:14px; }
    strong { color:#1a1a2e; }
  </style>
</head>
<body>
  <div class="wrap">
    <span class="badge">${niche}</span>
    <h1>${title}</h1>
    ${subtitle ? `<p style="font-size:20px;color:#64748b;">${subtitle}</p>` : ''}
    
    ${salesLetter}

    <div class="cta-section">
      <h2 style="margin-top:0;">Get Started Today</h2>
      <p class="price">$${price}</p>
      <a href="#" class="btn">Get Instant Access</a>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${title}</p>
    </div>
  </div>
</body>
</html>`;
};

// Simple checkout-focused template
const simpleTemplate = (data: SalesLetterData): string => {
  const { title, salesLetter, price = 17 } = data;
  
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Georgia, serif; background:#fafafa; color:#222; line-height:1.8; }
    .wrap { max-width: 600px; margin: 0 auto; padding: 50px 20px; }
    h1 { font-size:28px; margin:0 0 24px; font-weight:normal; }
    h2 { font-size:22px; margin:30px 0 12px; font-weight:normal; }
    p { font-size:17px; margin:16px 0; color:#444; }
    ul { padding-left:20px; margin:20px 0; }
    li { margin:8px 0; }
    .cta { background:#222; color:#fff; text-decoration:none; padding:16px 32px; display:inline-block; margin:24px 0; font-family:sans-serif; font-size:15px; }
    .price { font-size:24px; font-weight:bold; margin:16px 0; }
    .footer { margin-top:60px; padding-top:20px; border-top:1px solid #ddd; font-size:13px; color:#888; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${title}</h1>
    ${salesLetter}
    <p class="price">$${price}</p>
    <a href="#" class="cta">Get Instant Access →</a>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>`;
};

export const generateSalesLetterHTML = (data: SalesLetterData): string => {
  const template = data.template || 'warriorplus';
  
  switch (template) {
    case 'saas':
      return saasTemplate(data);
    case 'simple':
      return simpleTemplate(data);
    case 'warriorplus':
    default:
      return warriorPlusTemplate(data);
  }
};

export const generateUpsellHTML = (
  title: string,
  upsell: { title: string; description: string; price: number; salesPage?: string }
): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${upsell.title} - Special Offer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background:#0b0f19; color:#e9eefc; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:40px 20px; }
    .upsell-card { background:#101a33; border:1px solid rgba(255,255,255,.08); border-radius:20px; max-width:550px; overflow:hidden; }
    .upsell-header { background:linear-gradient(135deg,#ff6b6b 0%,#ee5a24 100%); padding:35px 30px; text-align:center; }
    .wait-badge { display:inline-block; background:rgba(255,255,255,.2); padding:8px 20px; border-radius:30px; font-size:13px; font-weight:600; margin-bottom:16px; text-transform:uppercase; letter-spacing:1px; }
    .upsell-header h1 { font-size:26px; margin:0; }
    .upsell-body { padding:35px 30px; text-align:center; }
    .price-box { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:25px; margin:25px 0; }
    .price { font-size:42px; font-weight:800; color:#ffffff; }
    .price-label { color:#9db0ff; font-size:14px; margin-bottom:6px; }
    .btn { display:inline-block; background:linear-gradient(135deg,#ee5a24 0%,#ff6b6b 100%); color:#fff; font-size:17px; font-weight:700; padding:16px 40px; border-radius:12px; text-decoration:none; box-shadow:0 8px 25px rgba(238,90,36,.35); }
    .no-thanks { display:block; margin-top:18px; color:#6b7aa1; font-size:14px; text-decoration:underline; }
    .features { text-align:left; margin:20px 0; }
    .feature { display:flex; align-items:center; margin:10px 0; }
    .feature-check { width:22px; height:22px; background:#3aa0ff; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; margin-right:12px; font-size:12px; flex-shrink:0; }
  </style>
</head>
<body>
  <div class="upsell-card">
    <div class="upsell-header">
      <span class="wait-badge">🔥 Wait! Special Offer</span>
      <h1>${upsell.title}</h1>
    </div>
    <div class="upsell-body">
      <p style="color:#cdd7ff;margin-bottom:20px;">${upsell.description}</p>
      ${upsell.salesPage ? `<div style="margin:20px 0;color:#cdd7ff;">${upsell.salesPage}</div>` : ''}
      <div class="price-box">
        <p class="price-label">One-Time Investment</p>
        <p class="price">$${upsell.price}</p>
        <p style="color:#3aa0ff;font-weight:600;margin-top:8px;">Limited Time Offer!</p>
      </div>
      <div class="features">
        <div class="feature"><span class="feature-check">✓</span><span>Instant digital delivery</span></div>
        <div class="feature"><span class="feature-check">✓</span><span>Lifetime access included</span></div>
        <div class="feature"><span class="feature-check">✓</span><span>30-day money back guarantee</span></div>
      </div>
      <a href="#" class="btn">Yes! Add This To My Order</a>
      <a href="#" class="no-thanks">No thanks, I'll pass on this offer</a>
    </div>
  </div>
</body>
</html>`;
};

// Utility to open HTML in new tab for live preview
export const openLivePreview = (html: string): void => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// Download as file utility
export const downloadAsFile = (content: string, filename: string, mimeType: string = 'text/html'): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
