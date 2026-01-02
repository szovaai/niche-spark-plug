import { SalesPageData, SalesPageTemplate } from "@/types/salesPage";
import { CSS_VARIABLES, PAGE_TOKENS } from "./salesPageTokens";

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

// ============================================================
// PREMIUM 18-SECTION TEMPLATE (Buyer Traffic Blueprint Style)
// ============================================================

const generatePremiumDarkTemplate = (data: SalesPageData): string => {
  const { title, niche, price, targetAudience, checkoutUrl = '#pricing' } = data;
  const year = new Date().getFullYear();
  
  // Calculate launch deadline (7 days from now)
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  const deadlineStr = deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${data.seo?.metaTitle || title}</title>
  <meta name="description" content="${data.seo?.metaDescription || data.hero.subhead}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${data.seo?.metaTitle || title}" />
  <meta property="og:description" content="${data.seo?.metaDescription || data.hero.subhead}" />
  <meta property="og:type" content="product" />
  ${data.seo?.ogImage ? `<meta property="og:image" content="${data.seo.ogImage}" />` : ''}
  
  <!-- Product Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "${title}",
    "description": "${data.hero.subhead.replace(/"/g, '\\"')}",
    "brand": { "@type": "Brand", "name": "DigiStream" },
    "offers": {
      "@type": "Offer",
      "price": "${price}",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  }
  </script>
  
  <!-- FAQ Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      ${data.faqs.items.map(faq => `{
        "@type": "Question",
        "name": "${faq.q.replace(/"/g, '\\"')}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${faq.a.replace(/"/g, '\\"')}"
        }
      }`).join(',\n      ')}
    ]
  }
  </script>
  
  <style>
    ${CSS_VARIABLES}
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: var(--font-ui);
      background: var(--c-ink);
      color: var(--c-mist);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    /* ===== PROMO BAR ===== */
    .promo-bar {
      background: linear-gradient(135deg, var(--c-navy) 0%, var(--c-ink) 100%);
      border-bottom: 1px solid var(--c-border);
      padding: 12px 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .promo-bar .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .promo-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .promo-text {
      font-size: 13px;
      color: var(--c-slate);
    }
    
    .pill {
      display: inline-block;
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      color: var(--c-glow);
      padding: 4px 12px;
      border-radius: var(--r-pill);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .promo-cta {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .promo-cta a {
      color: var(--c-accent);
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
    }
    
    .promo-cta a:hover {
      text-decoration: underline;
    }
    
    /* ===== HERO ===== */
    .hero {
      padding: 80px 0 60px;
      text-align: center;
      background: radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
    }
    
    .hero-eyebrow {
      display: inline-block;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      color: var(--c-glow);
      padding: 8px 20px;
      border-radius: var(--r-pill);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 24px;
    }
    
    h1 {
      font-family: var(--font-display);
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 800;
      line-height: 1.1;
      color: var(--c-white);
      margin-bottom: 20px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .hero-subhead {
      font-size: 18px;
      color: var(--c-slate);
      max-width: 650px;
      margin: 0 auto 28px;
      line-height: 1.6;
    }
    
    .price-box {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .price-strike {
      color: var(--c-slate);
      text-decoration: line-through;
      font-size: 16px;
    }
    
    .price-now {
      font-family: var(--font-display);
      font-size: 42px;
      font-weight: 800;
      color: var(--c-white);
    }
    
    .cta-cluster {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, var(--c-accent) 0%, var(--c-purple) 100%);
      color: var(--c-white);
      font-weight: 700;
      font-size: 16px;
      padding: 16px 32px;
      border-radius: var(--r-btn);
      text-decoration: none;
      box-shadow: var(--shadow-button);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(124, 92, 255, 0.45);
    }
    
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: 1px solid var(--c-border);
      color: var(--c-mist);
      font-weight: 600;
      font-size: 15px;
      padding: 14px 28px;
      border-radius: var(--r-btn);
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s;
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--c-accent);
    }
    
    .trust-line {
      font-size: 13px;
      color: var(--c-slate);
    }
    
    .trust-line span {
      margin: 0 8px;
    }
    
    /* ===== TRUST PILLS ===== */
    .trust-pills {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;
      padding: 24px 0;
      border-top: 1px solid var(--c-border);
      border-bottom: 1px solid var(--c-border);
    }
    
    .trust-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(34, 211, 238, 0.08);
      border: 1px solid rgba(34, 211, 238, 0.15);
      color: var(--c-glow);
      padding: 8px 16px;
      border-radius: var(--r-pill);
      font-size: 13px;
      font-weight: 500;
    }
    
    /* ===== CARDS ===== */
    .card {
      background: var(--c-dark-card);
      border: 1px solid var(--c-border);
      border-radius: var(--r-card);
      padding: 32px;
      margin: 32px 0;
    }
    
    .card-light {
      background: rgba(255, 255, 255, 0.03);
    }
    
    .card-glow {
      box-shadow: var(--shadow-glow);
    }
    
    /* ===== SECTION TITLES ===== */
    h2 {
      font-family: var(--font-display);
      font-size: clamp(24px, 4vw, 32px);
      font-weight: 700;
      color: var(--c-white);
      margin-bottom: 16px;
    }
    
    h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--c-white);
      margin-bottom: 12px;
    }
    
    p {
      color: var(--c-mist);
      margin-bottom: 16px;
      line-height: 1.7;
    }
    
    .muted {
      color: var(--c-slate);
    }
    
    /* ===== STORY SECTION ===== */
    .story-section {
      padding: 60px 0;
    }
    
    .story-card {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
      border-left: 4px solid var(--c-accent);
    }
    
    .story-card blockquote {
      font-style: italic;
      color: var(--c-glow);
      font-size: 18px;
      margin: 20px 0;
      padding-left: 16px;
      border-left: 2px solid var(--c-glow);
    }
    
    /* ===== BEFORE/AFTER ===== */
    .before-after {
      padding: 60px 0;
    }
    
    .before-after-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    
    @media (min-width: 768px) {
      .before-after-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .before-card {
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.15);
      border-radius: var(--r-card);
      padding: 28px;
    }
    
    .before-card h3 {
      color: #ef4444;
    }
    
    .after-card {
      background: rgba(34, 197, 94, 0.06);
      border: 1px solid rgba(34, 197, 94, 0.15);
      border-radius: var(--r-card);
      padding: 28px;
    }
    
    .after-card h3 {
      color: var(--c-success);
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 16px 0;
    }
    
    li {
      position: relative;
      padding-left: 28px;
      margin-bottom: 12px;
      color: var(--c-mist);
      line-height: 1.5;
    }
    
    li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: var(--c-accent);
      font-weight: 700;
    }
    
    .before-card li::before {
      content: "✗";
      color: #ef4444;
    }
    
    /* ===== STATS SECTION ===== */
    .stats-section {
      padding: 60px 0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-top: 24px;
    }
    
    @media (min-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    .stat-card {
      background: var(--c-dark-card);
      border: 1px solid var(--c-border);
      border-radius: var(--r-card);
      padding: 24px;
      text-align: center;
    }
    
    .stat-kicker {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 800;
      color: var(--c-accent);
      margin-bottom: 8px;
    }
    
    .stat-body {
      font-size: 14px;
      color: var(--c-slate);
      line-height: 1.5;
    }
    
    .stats-note {
      text-align: center;
      font-size: 14px;
      color: var(--c-slate);
      font-style: italic;
      margin-top: 24px;
    }
    
    /* ===== MECHANISM / TIMELINE ===== */
    .mechanism-section {
      padding: 60px 0;
    }
    
    .timeline {
      margin: 32px 0;
    }
    
    .timeline-item {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .timeline-marker {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--c-accent) 0%, var(--c-purple) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--c-white);
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .timeline-content {
      flex: 1;
      padding-top: 8px;
    }
    
    .timeline-title {
      font-weight: 700;
      color: var(--c-white);
      margin-bottom: 6px;
      font-size: 17px;
    }
    
    .timeline-body {
      color: var(--c-slate);
      font-size: 15px;
      line-height: 1.6;
    }
    
    /* ===== FIRST HOUR / CHECKLIST ===== */
    .first-hour-section {
      padding: 60px 0;
    }
    
    .checklist-card {
      background: linear-gradient(135deg, rgba(34, 211, 238, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
    }
    
    .checklist {
      margin: 24px 0;
    }
    
    .checklist li {
      padding: 12px 0 12px 36px;
      border-bottom: 1px solid var(--c-border);
    }
    
    .checklist li:last-child {
      border-bottom: none;
    }
    
    .checklist li::before {
      content: "☐";
      color: var(--c-glow);
      font-size: 18px;
    }
    
    /* ===== SIGNALS ===== */
    .signals-section {
      padding: 60px 0;
    }
    
    .signals-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 24px;
    }
    
    .signal-card {
      background: var(--c-dark-card);
      border: 1px solid var(--c-border);
      border-radius: var(--r-card);
      padding: 20px 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    
    .signal-icon {
      width: 36px;
      height: 36px;
      background: rgba(34, 211, 238, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--c-glow);
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .signal-text {
      font-size: 15px;
      color: var(--c-mist);
      font-style: italic;
    }
    
    /* ===== SCRIPTS ===== */
    .scripts-section {
      padding: 60px 0;
    }
    
    .script-card {
      background: var(--c-ink);
      border: 1px solid var(--c-border);
      border-radius: var(--r-card);
      padding: 24px;
      margin-bottom: 16px;
    }
    
    .script-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--c-accent);
      margin-bottom: 12px;
    }
    
    .script-text {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
      color: var(--c-mist);
      line-height: 1.7;
      background: rgba(0, 0, 0, 0.3);
      padding: 16px;
      border-radius: var(--r-input);
    }
    
    /* ===== OFFER STACK ===== */
    .offer-section {
      padding: 80px 0;
      background: linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.03) 100%);
    }
    
    .offer-card {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
    
    .offer-list {
      margin: 32px 0;
    }
    
    .offer-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 0;
      border-bottom: 1px solid var(--c-border);
    }
    
    .offer-item:last-child {
      border-bottom: none;
    }
    
    .offer-name {
      font-weight: 600;
      color: var(--c-white);
      margin-bottom: 4px;
    }
    
    .offer-desc {
      font-size: 14px;
      color: var(--c-slate);
    }
    
    .offer-value {
      font-weight: 600;
      color: var(--c-slate);
      text-decoration: line-through;
      white-space: nowrap;
    }
    
    .offer-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: var(--r-input);
      margin: 24px 0;
    }
    
    .offer-total-label {
      font-size: 18px;
      color: var(--c-slate);
    }
    
    .offer-total-value {
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 800;
      color: var(--c-white);
    }
    
    .offer-bonus {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: var(--r-input);
      padding: 16px 20px;
      margin: 24px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .offer-bonus-icon {
      font-size: 24px;
    }
    
    .offer-bonus-text {
      font-size: 15px;
      color: var(--c-success);
    }
    
    .offer-cta {
      text-align: center;
      margin-top: 32px;
    }
    
    /* ===== PROOF ===== */
    .proof-section {
      padding: 60px 0;
    }
    
    .proof-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 24px;
    }
    
    @media (min-width: 768px) {
      .proof-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    .proof-tile {
      background: var(--c-dark-card);
      border: 1px solid var(--c-border);
      border-radius: var(--r-card);
      padding: 24px;
    }
    
    .proof-quote {
      font-style: italic;
      color: var(--c-mist);
      font-size: 15px;
      line-height: 1.6;
    }
    
    /* ===== PATH ===== */
    .path-section {
      padding: 60px 0;
    }
    
    .path-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-top: 32px;
    }
    
    @media (min-width: 768px) {
      .path-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    .path-card {
      background: var(--c-dark-card);
      border: 1px solid var(--c-border);
      border-radius: var(--r-card);
      padding: 28px;
      text-align: center;
    }
    
    .path-number {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--c-accent) 0%, var(--c-purple) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--c-white);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 20px;
      margin: 0 auto 16px;
    }
    
    .path-title {
      font-weight: 700;
      color: var(--c-white);
      margin-bottom: 8px;
    }
    
    .path-body {
      font-size: 14px;
      color: var(--c-slate);
    }
    
    /* ===== FIT FILTER ===== */
    .fit-section {
      padding: 60px 0;
    }
    
    .fit-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      margin-top: 24px;
    }
    
    @media (min-width: 768px) {
      .fit-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .fit-yes {
      background: rgba(34, 197, 94, 0.06);
      border: 1px solid rgba(34, 197, 94, 0.15);
      border-radius: var(--r-card);
      padding: 28px;
    }
    
    .fit-yes h3 {
      color: var(--c-success);
    }
    
    .fit-no {
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.15);
      border-radius: var(--r-card);
      padding: 28px;
    }
    
    .fit-no h3 {
      color: #ef4444;
    }
    
    .fit-no li::before {
      content: "✗";
      color: #ef4444;
    }
    
    /* ===== GUARANTEE ===== */
    .guarantee-section {
      padding: 60px 0;
    }
    
    .guarantee-card {
      background: linear-gradient(135deg, rgba(34, 211, 238, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
      text-align: center;
    }
    
    .guarantee-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .guarantee-title {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      color: var(--c-white);
      margin-bottom: 16px;
    }
    
    .guarantee-body {
      max-width: 600px;
      margin: 0 auto;
      color: var(--c-mist);
    }
    
    /* ===== FAQ ===== */
    .faq-section {
      padding: 60px 0;
    }
    
    .faq-list {
      margin-top: 32px;
    }
    
    .faq-item {
      border-bottom: 1px solid var(--c-border);
    }
    
    .faq-question {
      width: 100%;
      text-align: left;
      padding: 20px 0;
      background: none;
      border: none;
      color: var(--c-white);
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .faq-question:hover {
      color: var(--c-accent);
    }
    
    .faq-toggle {
      font-size: 20px;
      color: var(--c-accent);
      transition: transform 0.2s;
    }
    
    .faq-answer {
      padding: 0 0 20px;
      color: var(--c-slate);
      line-height: 1.7;
      display: none;
    }
    
    .faq-item.active .faq-answer {
      display: block;
    }
    
    .faq-item.active .faq-toggle {
      transform: rotate(45deg);
    }
    
    /* ===== FINAL CTA ===== */
    .final-cta-section {
      padding: 80px 0;
      text-align: center;
      background: radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
    }
    
    .final-cta-card {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid rgba(59, 130, 246, 0.25);
    }
    
    /* ===== FOOTER ===== */
    .footer {
      padding: 40px 0;
      text-align: center;
      border-top: 1px solid var(--c-border);
    }
    
    .footer-legal {
      font-size: 13px;
      color: var(--c-slate);
      margin-bottom: 16px;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
    }
    
    .footer-links a {
      color: var(--c-slate);
      font-size: 13px;
      text-decoration: none;
    }
    
    .footer-links a:hover {
      color: var(--c-accent);
    }
    
    /* ===== DIVIDER ===== */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, var(--c-border) 50%, transparent 100%);
      margin: 0;
    }
    
    /* ===== GLOW EFFECTS ===== */
    .glow-line {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, var(--c-accent) 50%, transparent 100%);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
    
    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
        animation: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- PROMO BAR -->
  <div class="promo-bar">
    <div class="container">
      <div class="promo-left">
        <span class="promo-text">${data.promo.left}</span>
        ${data.promo.pills.map(pill => `<span class="pill">${pill}</span>`).join('')}
      </div>
      <div class="promo-cta">
        <span class="promo-text">Launch pricing ends ${deadlineStr}</span>
        <a href="${checkoutUrl}">→ Get the Toolkit for $${price}</a>
      </div>
    </div>
  </div>
  
  <!-- HERO -->
  <section class="hero">
    <div class="container">
      <span class="hero-eyebrow">${data.hero.eyebrow}</span>
      <h1>${data.hero.headline}</h1>
      <p class="hero-subhead">${data.hero.subhead}</p>
      <div class="price-box">
        <span class="price-strike">${data.hero.priceLine.split('—')[0]?.trim() || 'Normally $97'}</span>
        <span class="price-now">$${price}</span>
      </div>
      <div class="cta-cluster">
        <a href="${checkoutUrl}" class="btn-primary">Get Instant Access</a>
        <a href="#inside" class="btn-secondary">See What's Inside</a>
      </div>
      <p class="trust-line">${data.hero.trustLine}</p>
    </div>
  </section>
  
  <!-- TRUST PILLS -->
  <div class="trust-pills">
    <div class="container" style="display:flex;justify-content:center;flex-wrap:wrap;gap:12px;">
      ${data.trustPills.map(pill => `<span class="trust-pill">✓ ${pill}</span>`).join('')}
    </div>
  </div>
  
  <!-- STORY -->
  <section class="story-section">
    <div class="container">
      <div class="card story-card">
        <h2>${data.story.title}</h2>
        ${data.story.body.split('\n\n').map(p => `<p>${p}</p>`).join('')}
      </div>
    </div>
  </section>
  
  <div class="divider"></div>
  
  <!-- BEFORE/AFTER -->
  <section class="before-after">
    <div class="container">
      <h2 style="text-align:center;">${data.beforeAfter.title}</h2>
      <div class="before-after-grid">
        <div class="before-card">
          <h3>${data.beforeAfter.beforeTitle}</h3>
          <ul>
            ${data.beforeAfter.before.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="after-card">
          <h3>${data.beforeAfter.afterTitle}</h3>
          <ul>
            ${data.beforeAfter.after.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </section>
  
  <div class="glow-line"></div>
  
  <!-- STATS -->
  <section class="stats-section">
    <div class="container">
      <h2 style="text-align:center;">${data.stats.title}</h2>
      <div class="stats-grid">
        ${data.stats.stats.map(stat => `
          <div class="stat-card">
            <div class="stat-kicker">${stat.kicker}</div>
            <div class="stat-body">${stat.body}</div>
          </div>
        `).join('')}
      </div>
      ${data.stats.note ? `<p class="stats-note">${data.stats.note}</p>` : ''}
    </div>
  </section>
  
  <div class="divider"></div>
  
  <!-- MECHANISM -->
  <section class="mechanism-section">
    <div class="container">
      <h2 style="text-align:center;">${data.mechanism.title}</h2>
      ${data.mechanism.intro ? `<p style="text-align:center;max-width:600px;margin:0 auto 32px;">${data.mechanism.intro}</p>` : ''}
      <div class="timeline">
        ${data.mechanism.steps.map((step, i) => `
          <div class="timeline-item">
            <div class="timeline-marker">${i + 1}</div>
            <div class="timeline-content">
              <div class="timeline-title">${step.title}</div>
              <p class="timeline-body">${step.body}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  
  <div class="divider"></div>
  
  <!-- FIRST HOUR -->
  <section class="first-hour-section">
    <div class="container">
      <div class="card checklist-card">
        <h2>${data.firstHour.title}</h2>
        <ul class="checklist">
          ${data.firstHour.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>
  </section>
  
  <!-- SIGNALS -->
  <section class="signals-section">
    <div class="container">
      <h2 style="text-align:center;">${data.signals.title}</h2>
      <div class="signals-grid">
        ${data.signals.signals.map(signal => `
          <div class="signal-card">
            <div class="signal-icon">🔍</div>
            <div class="signal-text">${signal}</div>
          </div>
        `).join('')}
      </div>
      ${data.signals.note ? `<p class="stats-note">${data.signals.note}</p>` : ''}
    </div>
  </section>
  
  <div class="divider"></div>
  
  <!-- SCRIPTS -->
  <section class="scripts-section">
    <div class="container">
      <h2 style="text-align:center;">${data.scripts.title}</h2>
      ${data.scripts.cards.map(script => `
        <div class="script-card">
          <div class="script-label">${script.label}</div>
          <div class="script-text">${script.text}</div>
        </div>
      `).join('')}
      ${data.scripts.note ? `<p class="stats-note">${data.scripts.note}</p>` : ''}
    </div>
  </section>
  
  <div class="glow-line"></div>
  
  <!-- OFFER STACK -->
  <section class="offer-section" id="inside">
    <div class="container">
      <div class="card offer-card card-glow">
        <h2 style="text-align:center;">${data.offerStack.title}</h2>
        <div class="offer-list">
          ${data.offerStack.items.map(item => `
            <div class="offer-item">
              <div>
                <div class="offer-name">${item.name}</div>
                <div class="offer-desc">${item.desc}</div>
              </div>
              <div class="offer-value">${item.value}</div>
            </div>
          `).join('')}
        </div>
        <div class="offer-total">
          <span class="offer-total-label">${data.offerStack.totalValue}</span>
          <span class="offer-total-value">${data.offerStack.todayPrice}</span>
        </div>
        ${data.offerStack.bonus ? `
          <div class="offer-bonus">
            <span class="offer-bonus-icon">🎁</span>
            <span class="offer-bonus-text">${data.offerStack.bonus}</span>
          </div>
        ` : ''}
        <div class="offer-cta">
          <a href="${checkoutUrl}" class="btn-primary">Get Instant Access — $${price}</a>
          <p class="trust-line" style="margin-top:16px;">${data.hero.trustLine}</p>
        </div>
      </div>
    </div>
  </section>
  
  <!-- PROOF -->
  <section class="proof-section">
    <div class="container">
      <h2 style="text-align:center;">${data.proof.title}</h2>
      <div class="proof-grid">
        ${data.proof.tiles.map(tile => `
          <div class="proof-tile">
            <p class="proof-quote">"${tile}"</p>
          </div>
        `).join('')}
      </div>
      ${data.proof.note ? `<p class="stats-note">${data.proof.note}</p>` : ''}
    </div>
  </section>
  
  <div class="divider"></div>
  
  <!-- PATH -->
  <section class="path-section">
    <div class="container">
      <h2 style="text-align:center;">${data.path.title}</h2>
      <div class="path-grid">
        ${data.path.steps.map((step, i) => `
          <div class="path-card">
            <div class="path-number">${i + 1}</div>
            <div class="path-title">${step.title}</div>
            <p class="path-body">${step.body}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  
  <div class="glow-line"></div>
  
  <!-- FIT FILTER -->
  <section class="fit-section">
    <div class="container">
      <h2 style="text-align:center;">${data.fitFilter.title}</h2>
      <div class="fit-grid">
        <div class="fit-yes">
          <h3>✓ This is for you if...</h3>
          <ul>
            ${data.fitFilter.yes.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="fit-no">
          <h3>✗ This is NOT for you if...</h3>
          <ul>
            ${data.fitFilter.no.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </section>
  
  <div class="divider"></div>
  
  <!-- GUARANTEE -->
  <section class="guarantee-section" id="pricing">
    <div class="container">
      <div class="card guarantee-card">
        <div class="guarantee-icon">🛡️</div>
        <h3 class="guarantee-title">${data.guarantee.title}</h3>
        <p class="guarantee-body">${data.guarantee.body}</p>
      </div>
    </div>
  </section>
  
  <!-- FAQ -->
  <section class="faq-section">
    <div class="container">
      <h2 style="text-align:center;">${data.faqs.title}</h2>
      <div class="faq-list">
        ${data.faqs.items.map(faq => `
          <div class="faq-item">
            <button class="faq-question" onclick="this.parentElement.classList.toggle('active')">
              <span>${faq.q}</span>
              <span class="faq-toggle">+</span>
            </button>
            <div class="faq-answer">${faq.a}</div>
          </div>
        `).join('')}
      </div>
      ${data.faqs.note ? `<p class="stats-note" style="margin-top:32px;">${data.faqs.note}</p>` : ''}
    </div>
  </section>
  
  <div class="glow-line"></div>
  
  <!-- FINAL CTA -->
  <section class="final-cta-section">
    <div class="container">
      <div class="card final-cta-card">
        <h2>${data.finalCta.title}</h2>
        <div class="price-box" style="margin:24px 0;">
          <span class="price-now">${data.finalCta.price}</span>
        </div>
        <a href="${checkoutUrl}" class="btn-primary">Get Instant Access Now</a>
        <p class="trust-line" style="margin-top:20px;">${data.finalCta.trustLine}</p>
      </div>
    </div>
  </section>
  
  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <p class="footer-legal">${data.footer.legal}</p>
      <div class="footer-links">
        <a href="#">Contact</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
};

// Legacy templates for backwards compatibility
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
    ul { padding-left: 0; margin:14px 0; list-style:none; }
    li { margin:10px 0; line-height:1.5; color:#dbe5ff; padding-left:28px; position:relative; }
    li::before { content:"✓"; position:absolute; left:0; color:#3aa0ff; font-weight:700; }
    .cta-box { text-align:center; padding:30px 20px; margin:30px 0; }
    .btn { background: linear-gradient(135deg,#3aa0ff 0%,#7c5cff 100%); color:#fff; text-decoration:none; padding:16px 32px; border-radius:12px; font-weight:700; font-size:17px; display:inline-block; box-shadow: 0 8px 30px rgba(124,92,255,.35); transition: transform .2s, box-shadow .2s; }
    .btn:hover { transform:translateY(-2px); box-shadow: 0 12px 40px rgba(124,92,255,.45); }
    .price { font-size:36px; font-weight:800; color:#ffffff; margin:8px 0; }
    .price-note { font-size:13px; color:#9db0ff; margin-top:8px; }
    .section-title { font-weight:800; color:#ffffff; margin:0 0 8px; font-size:22px; }
    .callout { border-left: 4px solid #7c5cff; padding-left: 16px; margin:16px 0; }
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
    strong { color:#ffffff; }
  </style>
</head>
<body>
  <div class="wrap">
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
    <div class="content-section">
      ${salesLetter}
    </div>
    <div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(58,160,255,.08),rgba(124,92,255,.08));">
      <h2>Ready to Get Started?</h2>
      <p style="max-width:500px;margin:12px auto 20px;">Get instant access to ${title} and start seeing results.</p>
      <p class="price">$${price}</p>
      <a href="#" class="btn">Get Instant Access Now</a>
      <p class="price-note">Instant access • 100% digital delivery</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${title}. All rights reserved.</p>
      <p style="margin-top:10px;"><a href="#">Contact</a> &bull; <a href="#">Privacy Policy</a> &bull; <a href="#">Terms</a></p>
    </div>
  </div>
</body>
</html>`;
};

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

// Legacy generator for backwards compatibility
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

// NEW: Generate from structured SalesPageData
export const generatePremiumSalesPageHTML = (data: SalesPageData, template: SalesPageTemplate = 'premium-dark'): string => {
  switch (template) {
    case 'premium-dark':
    default:
      return generatePremiumDarkTemplate(data);
  }
};

// Upsell template
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

// Utility functions
export const openLivePreview = (html: string): void => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

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

// Create default SalesPageData from toolkit info
export const createDefaultSalesPageData = (
  title: string,
  niche: string,
  targetAudience: string,
  price: number,
  components: string[],
  thesis?: string
): SalesPageData => {
  const year = new Date().getFullYear();
  
  return {
    title,
    niche,
    price,
    targetAudience,
    
    promo: {
      left: `${niche} • Digital Toolkit`,
      pills: ['Instant Access', 'Beginner Friendly'],
    },
    
    hero: {
      eyebrow: `${niche} • For ${targetAudience}`,
      headline: title,
      subhead: thesis || `The complete system to master ${niche} — step by step.`,
      priceLine: `Normally $97 — Today only $${price}`,
      trustLine: 'Instant download • Beginner friendly • 100% digital delivery',
    },
    
    trustPills: ['No paid ads', 'Beginner-friendly', 'Instant access', 'Full system'],
    
    story: {
      title: 'A Quick Story (Why This Exists)',
      body: `Most people struggle with ${niche.toLowerCase()} because they're following outdated advice or trying to piece together scattered information.\n\nThis toolkit exists to give you a clear, proven system that actually works — without the overwhelm.`,
    },
    
    beforeAfter: {
      title: 'What Changes When You Use This',
      beforeTitle: 'Before',
      before: ['Scattered information', 'No clear path', 'Slow progress', 'Frustration and overwhelm'],
      afterTitle: 'After',
      after: ['Clear step-by-step system', 'Proven framework', 'Faster results', 'Confidence and clarity'],
    },
    
    stats: {
      title: 'Why This Approach Works',
      stats: [
        { kicker: 'Complete', body: 'Everything you need in one place' },
        { kicker: 'Proven', body: 'Based on what actually works' },
        { kicker: 'Practical', body: 'Actionable steps, not theory' },
      ],
      note: 'Built for real results, not just information.',
    },
    
    mechanism: {
      title: 'How It Works',
      steps: [
        { title: 'Learn the Framework', body: 'Understand the core system' },
        { title: 'Follow the Steps', body: 'Work through the action plan' },
        { title: 'Implement Daily', body: 'Apply what you learn consistently' },
        { title: 'See Results', body: 'Watch your progress compound' },
      ],
    },
    
    firstHour: {
      title: 'What You\'ll Do in the First Hour',
      items: [
        'Complete the quick-start checklist',
        'Set up your foundation',
        'Begin the first module',
        'Take your first action step',
      ],
    },
    
    signals: {
      title: 'Signs You\'re Ready for This',
      signals: [
        `You want to master ${niche.toLowerCase()}`,
        'You\'re tired of scattered, incomplete information',
        'You want a clear system to follow',
        'You\'re ready to take action',
        'You value your time and want efficiency',
      ],
      note: 'If any of these resonate, this toolkit is for you.',
    },
    
    scripts: {
      title: 'Ready-to-Use Templates Included',
      cards: components.slice(0, 3).map((comp, i) => ({
        label: comp,
        text: `Everything you need for ${comp.toLowerCase()} — just fill in the blanks and go.`,
      })),
    },
    
    offerStack: {
      title: 'What\'s Inside',
      items: components.map((comp, i) => ({
        name: comp,
        value: `$${19 + i * 10}`,
        desc: `Complete ${comp.toLowerCase()} to accelerate your progress`,
      })),
      totalValue: `Total Value: $${components.length * 30 + 67}`,
      todayPrice: `Today: $${price}`,
      bonus: 'Launch Bonus: Quick-Start Templates',
    },
    
    proof: {
      title: 'What Others Are Saying',
      tiles: [
        'Finally, a clear system that makes sense!',
        'The templates saved me hours of work.',
        'Best investment I\'ve made for my progress.',
      ],
      note: '(Results may vary based on individual effort)',
    },
    
    path: {
      title: 'Your 3-Day Quick Start Path',
      steps: [
        { title: 'Day 1: Foundation', body: 'Complete the setup and core training' },
        { title: 'Day 2: Action', body: 'Implement the first strategies' },
        { title: 'Day 3: Momentum', body: 'Build on your progress and scale' },
      ],
    },
    
    fitFilter: {
      title: 'Is This Right for You?',
      yes: [
        `You want to improve in ${niche.toLowerCase()}`,
        'You\'re willing to put in the work',
        'You want a proven system to follow',
      ],
      no: [
        'You\'re looking for a magic bullet',
        'You won\'t take action on what you learn',
        'You expect results without effort',
      ],
    },
    
    guarantee: {
      title: '7-Day Risk-Free Guarantee',
      body: 'Try the entire toolkit for 7 days. If you don\'t feel it\'s right for you, email us for a fast refund. No hoops, no hassle.',
    },
    
    faqs: {
      title: 'Frequently Asked Questions',
      items: [
        { q: 'How is this delivered?', a: 'Instant digital download. You\'ll get access immediately after purchase.' },
        { q: 'Who is this for?', a: `Anyone who wants to master ${niche.toLowerCase()} with a clear, proven system.` },
        { q: 'How long does it take?', a: 'Most people complete the core training in a few hours, then implement over 3-7 days.' },
        { q: 'What if it doesn\'t work for me?', a: 'We offer a 7-day money-back guarantee. Just email us.' },
        { q: 'Is this beginner-friendly?', a: 'Yes! Everything is explained step-by-step with no prior experience required.' },
      ],
    },
    
    finalCta: {
      title: 'Ready to Get Started?',
      price: `$${price} — One-time`,
      trustLine: 'Instant download • Beginner friendly • 100% digital delivery',
    },
    
    footer: {
      legal: `© ${year} ${title}. All rights reserved.`,
    },
  };
};
