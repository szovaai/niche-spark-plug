import { SalesPageData, SalesPageTemplate } from "@/types/salesPage";
import { CSS_VARIABLES, PAGE_TOKENS, KENNEDY_CSS } from "./salesPageTokens";

export type PageTemplate = 'kennedy' | 'saas' | 'simple';

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
// PREMIUM KENNEDY DIRECT-RESPONSE LETTER TEMPLATE
// ============================================================

const generatePremiumKennedyTemplate = (data: SalesPageData): string => {
  const { title, niche, price, targetAudience, checkoutUrl = '#pricing' } = data;
  const year = new Date().getFullYear();
  
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  const deadlineStr = deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${data.seo?.metaTitle || title}</title>
  <meta name="description" content="${data.seo?.metaDescription || data.hero.subhead}" />
  ${data.seo?.ogImage ? `<meta property="og:image" content="${data.seo.ogImage}" />` : ''}
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "${title}",
    "description": "${data.hero.subhead.replace(/"/g, '\\"')}",
    "offers": {
      "@type": "Offer",
      "price": "${price}",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  }
  </script>
  
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
    ${KENNEDY_CSS}
  </style>
</head>
<body>

<div class="page-wrapper">

  <!-- URGENCY BAR -->
  <div class="urgency-bar">
    ⚠ ${data.promo.pills[0] || 'Launch Pricing'} — Offer Ends ${deadlineStr}
  </div>

  <!-- LETTER HEADER -->
  <div class="letter-header">
    <p class="from-desk">An Urgent Letter To:</p>
    <p class="sender">${targetAudience || `${niche} enthusiasts who are ready to take action`}</p>
  </div>

  <!-- HEADLINE -->
  <div class="headline-box">
    <span class="pre-headline">${data.hero.eyebrow}</span>
    <h1>"${data.hero.headline}"</h1>
    <p class="deck">${data.hero.subhead}</p>
  </div>

  <!-- SALUTATION -->
  <div class="salutation">
    <p class="date-line">${todayStr}</p>
    <p>Dear Fellow Entrepreneur,</p>
  </div>

  <!-- BODY COPY -->
  <div class="body-copy">

    <!-- STORY -->
    ${data.story.body.split('\n\n').map(p => `<p>${p}</p>`).join('\n    ')}

    <div class="pull-quote">
      "${data.story.title}"
    </div>

    <hr class="section-break">

    <!-- BEFORE/AFTER -->
    <h2>${data.beforeAfter.title}</h2>

    <div class="two-col">
      <div class="col-box red-top">
        <h4>${data.beforeAfter.beforeTitle}</h4>
        <ul>
          ${data.beforeAfter.before.map(item => `<li>${item}</li>`).join('\n          ')}
        </ul>
      </div>
      <div class="col-box green-top">
        <h4>${data.beforeAfter.afterTitle}</h4>
        <ul>
          ${data.beforeAfter.after.map(item => `<li>${item}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>

    <hr class="section-break">

    <!-- MECHANISM -->
    <h2>${data.mechanism.title}</h2>
    ${data.mechanism.intro ? `<p>${data.mechanism.intro}</p>` : ''}

    <ul class="fascinations">
      ${data.mechanism.steps.map(step => `<li><strong>${step.title}</strong> — ${step.body}</li>`).join('\n      ')}
    </ul>

    <hr class="section-break">

    <!-- FIRST HOUR -->
    <h2>${data.firstHour.title}</h2>

    <ul class="check-list">
      ${data.firstHour.items.map(item => `<li>${item}</li>`).join('\n      ')}
    </ul>

    <hr class="section-break">

    <!-- SIGNALS -->
    <h2>${data.signals.title}</h2>

    <div class="box red-border">
      <span class="box-headline">Signs You're Ready</span>
      <ul class="fascinations">
        ${data.signals.signals.map(signal => `<li>${signal}</li>`).join('\n        ')}
      </ul>
    </div>
    ${data.signals.note ? `<p><em>${data.signals.note}</em></p>` : ''}

    <hr class="section-break">

    <!-- SCRIPTS / TEMPLATES -->
    ${data.scripts.cards.length > 0 ? `
    <h2>${data.scripts.title}</h2>
    ${data.scripts.cards.map(script => `
    <div class="box">
      <span class="box-headline">${script.label}</span>
      <p>${script.text}</p>
    </div>
    `).join('')}
    ${data.scripts.note ? `<p><em>${data.scripts.note}</em></p>` : ''}
    <hr class="section-break">
    ` : ''}

    <!-- PROOF / TESTIMONIALS -->
    <h2>${data.proof.title}</h2>

    ${data.proof.tiles.map(tile => `
    <div class="testimonial-block">
      <p class="quote-text">"${tile}"</p>
      <p class="attribution"><strong>Verified User</strong></p>
    </div>
    `).join('')}
    ${data.proof.note ? `<p><em>${data.proof.note}</em></p>` : ''}

    <hr class="section-break">

    <!-- FIT FILTER -->
    <h2>${data.fitFilter.title}</h2>

    <div class="two-col">
      <div class="col-box green-top">
        <h4>This Is For You If:</h4>
        <ul>
          ${data.fitFilter.yes.map(item => `<li>${item}</li>`).join('\n          ')}
        </ul>
      </div>
      <div class="col-box red-top">
        <h4>This Is NOT For You If:</h4>
        <ul>
          ${data.fitFilter.no.map(item => `<li>${item}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>

    <hr class="section-break">

    <!-- OFFER STACK -->
    <h2 class="center">${data.offerStack.title}</h2>

    ${data.offerStack.items.map((item, i) => `
    <div class="bonus-row">
      <div class="bonus-num">${i + 1}</div>
      <div class="bonus-content">
        <strong>${item.name}</strong>
        <p>${item.desc}</p>
      </div>
      <div class="bonus-value">${item.value}</div>
    </div>
    `).join('')}

    <div class="box" style="text-align: center; margin-top: 8px;">
      <p style="font-family: var(--font-mono); font-size: 13px; color: var(--light-gray); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;">${data.offerStack.totalValue}</p>
    </div>

    <hr class="section-break">

    <!-- ORDER BOX -->
    <div class="order-box" id="pricing">
      <p class="product-label">${title}</p>
      <p class="was-price">${data.hero.priceLine.split('—')[0]?.trim() || 'Regular Price: $97'}</p>
      <p class="now-price">$${price}</p>
      <p class="price-context">One-time payment. No monthly fees. No recurring charges. Instant access.</p>
      ${data.offerStack.bonus ? `<div class="total-value-line">🎁 ${data.offerStack.bonus}</div>` : ''}
      <a href="${checkoutUrl}" class="cta-btn">
        Yes — I Want Instant Access Now<br>
        <span style="font-size: 12px; font-weight: normal;">At The Special Price Of Just $${price} →</span>
      </a>
      <p class="cta-sub-text">🔒 256-bit SSL encryption · Processed securely · Instant delivery</p>
    </div>

    <!-- GUARANTEE -->
    <div class="guarantee-section">
      <div class="guarantee-seal">🛡️</div>
      <div class="guarantee-content">
        <h3>${data.guarantee.title}</h3>
        <p>${data.guarantee.body}</p>
      </div>
    </div>

    <hr class="section-break">

    <!-- FAQ -->
    <h2>Frequently Asked Questions</h2>

    ${data.faqs.items.map(faq => `
    <div class="faq-item">
      <h4>${faq.q}</h4>
      <p>${faq.a}</p>
    </div>
    `).join('')}

    <hr class="section-break">

    <!-- FINAL CLOSE -->
    <div class="pull-quote">
      ${data.finalCta.title}
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${checkoutUrl}" class="cta-btn" style="max-width: 480px; display: inline-block;">
        Claim Your Access Now →<br>
        <span style="font-size: 12px;">$${price} One-Time · ${data.guarantee.title} · Instant Access</span>
      </a>
    </div>

    <hr class="section-break">

    <!-- PS SECTION -->
    <div class="ps-section">
      <p><strong>P.S.</strong> — If you skipped to the bottom, here's the short version: ${title} gives you everything you need to master ${niche.toLowerCase()}. One-time price of $${price}. ${data.guarantee.title}. <a href="${checkoutUrl}" style="color: var(--red);">Click here to get access now.</a></p>
      <p><strong>P.P.S.</strong> — This is a launch price. It will not be available at this level permanently. If the value makes sense to you, now is the time.</p>
    </div>

  </div><!-- end body-copy -->

  <!-- FOOTER -->
  <footer>
    <p style="margin-bottom: 12px;">
      <a href="#">Privacy Policy</a> &nbsp;·&nbsp;
      <a href="#">Terms of Service</a> &nbsp;·&nbsp;
      <a href="#">Earnings Disclaimer</a> &nbsp;·&nbsp;
      <a href="#">Refund Policy</a> &nbsp;·&nbsp;
      <a href="#">Contact Support</a>
    </p>
    <p style="margin-bottom: 16px;">© ${year} ${title}</p>
    <p style="max-width: 560px; margin: 0 auto; font-size: 11px; line-height: 1.8; color: #666;">
      EARNINGS DISCLAIMER: Results stated or implied are not typical. Individual results will vary based on effort, experience, market conditions, and numerous other factors outside our control.
    </p>
  </footer>

</div><!-- end page-wrapper -->

</body>
</html>`;
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
