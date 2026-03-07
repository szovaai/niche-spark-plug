// Kennedy Direct-Response Sales Letter Design Tokens

export const PAGE_TOKENS = {
  colors: {
    cream: "#f5f0e8",
    darkCream: "#ede8dc",
    ink: "#1a1208",
    red: "#c0000a",
    darkRed: "#8b0000",
    gold: "#8b6914",
    gray: "#555555",
    lightGray: "#999999",
    border: "#d4c9b0",
    green: "#2a7a2a",
    white: "#ffffff",
    outerBg: "#2c2416",
  },
  fonts: {
    display: "'Playfair Display', Georgia, serif",
    body: "'Libre Baskerville', Georgia, serif",
    mono: "'Special Elite', monospace",
  },
  typeScale: {
    h1: { size: 40, line: 48, mobileSize: 26, mobileLine: 34, weight: 900 },
    h2: { size: 28, line: 35, weight: 900 },
    h3: { size: 20, line: 28, weight: 700 },
    body: { size: 17, line: 31, weight: 400 },
    small: { size: 14, line: 22, weight: 400 },
    micro: { size: 12, line: 18, weight: 400 },
  },
  space: [4, 8, 12, 16, 20, 24, 32, 40, 48, 60],
  radius: {
    card: 0,
    button: 0,
    input: 0,
    pill: 0,
  },
  shadows: {
    page: "0 0 80px rgba(0,0,0,0.7)",
    card: "none",
    button: "none",
  },
} as const;

// CSS Variables for injection into Kennedy-style HTML
export const CSS_VARIABLES = `
:root {
  --cream: ${PAGE_TOKENS.colors.cream};
  --dark-cream: ${PAGE_TOKENS.colors.darkCream};
  --ink: ${PAGE_TOKENS.colors.ink};
  --red: ${PAGE_TOKENS.colors.red};
  --dark-red: ${PAGE_TOKENS.colors.darkRed};
  --gold: ${PAGE_TOKENS.colors.gold};
  --gray: ${PAGE_TOKENS.colors.gray};
  --light-gray: ${PAGE_TOKENS.colors.lightGray};
  --border: ${PAGE_TOKENS.colors.border};
  --green: ${PAGE_TOKENS.colors.green};
  
  --font-display: ${PAGE_TOKENS.fonts.display};
  --font-body: ${PAGE_TOKENS.fonts.body};
  --font-mono: ${PAGE_TOKENS.fonts.mono};
}
`;

// Full Kennedy-style CSS for export
export const KENNEDY_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Special+Elite&display=swap');

${CSS_VARIABLES}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #2c2416;
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.85;
  color: var(--ink);
}

.page-wrapper {
  max-width: 720px;
  margin: 0 auto;
  background: var(--cream);
  box-shadow: 0 0 80px rgba(0,0,0,0.7);
  position: relative;
}

.urgency-bar {
  background: var(--red);
  color: #fff;
  text-align: center;
  padding: 10px 20px;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.letter-header {
  background: var(--dark-cream);
  border-bottom: 3px double var(--border);
  padding: 32px 60px 24px;
  text-align: center;
}

.letter-header .from-desk {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 8px;
}

.letter-header .sender {
  font-family: var(--font-display);
  font-size: 15px;
  color: var(--ink);
  font-style: italic;
}

.headline-box {
  padding: 48px 60px 40px;
  border-bottom: 1px solid var(--border);
}

.pre-headline {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 20px;
  display: block;
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 900;
  line-height: 1.2;
  color: var(--ink);
  margin-bottom: 24px;
}

h1 .red { color: var(--red); }
h1 .underline { text-decoration: underline; text-decoration-color: var(--red); }

.deck {
  font-size: 18px;
  color: var(--gray);
  font-style: italic;
  line-height: 1.7;
  border-left: 4px solid var(--red);
  padding-left: 20px;
}

.salutation {
  padding: 40px 60px 0;
  font-size: 17px;
  color: var(--ink);
}

.body-copy {
  padding: 20px 60px 40px;
}

.body-copy p {
  margin-bottom: 20px;
  color: var(--ink);
}

.body-copy p.indent {
  text-indent: 2em;
}

strong { font-weight: 700; }

.caps {
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  font-size: 0.95em;
}

u { text-decoration-color: var(--red); }
.red-text { color: var(--red); font-weight: 700; }
.gold-text { color: var(--gold); }

h2 {
  font-family: var(--font-display);
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 900;
  color: var(--red);
  margin: 40px 0 16px;
  line-height: 1.25;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

h2.center { text-align: center; }

h3 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
  margin: 32px 0 12px;
  font-style: italic;
}

.pull-quote {
  border-top: 2px solid var(--red);
  border-bottom: 2px solid var(--red);
  padding: 20px 0;
  margin: 32px 0;
  text-align: center;
  font-family: var(--font-display);
  font-size: 20px;
  font-style: italic;
  color: var(--red);
  line-height: 1.5;
}

.box {
  border: 2px solid var(--ink);
  padding: 24px 28px;
  margin: 28px 0;
  background: #fff;
}

.box.red-border {
  border-color: var(--red);
  border-width: 3px;
}

.box p { margin-bottom: 12px; }
.box p:last-child { margin-bottom: 0; }

.box-headline {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--red);
  margin-bottom: 12px;
  display: block;
}

.fascinations {
  list-style: none;
  margin: 20px 0;
}

.fascinations li {
  padding: 8px 0 8px 28px;
  position: relative;
  border-bottom: 1px dotted var(--border);
  font-size: 16px;
  color: var(--ink);
  line-height: 1.6;
}

.fascinations li::before {
  content: '►';
  position: absolute;
  left: 0;
  color: var(--red);
  font-size: 12px;
  top: 11px;
}

.check-list {
  list-style: none;
  margin: 16px 0;
}

.check-list li {
  padding: 7px 0 7px 30px;
  position: relative;
  border-bottom: 1px solid var(--border);
  font-size: 16px;
  line-height: 1.6;
}

.check-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--red);
  font-weight: 700;
  font-size: 16px;
}

.divider {
  text-align: center;
  margin: 32px 0;
  color: var(--border);
  font-size: 18px;
  letter-spacing: 12px;
}

.section-break {
  border: none;
  border-top: 1px solid var(--border);
  margin: 40px 0;
}

.testimonial-block {
  background: #fff;
  border: 1px solid var(--border);
  border-left: 5px solid var(--red);
  padding: 24px 28px;
  margin: 24px 0;
}

.testimonial-block .quote-text {
  font-style: italic;
  font-size: 16px;
  color: var(--ink);
  margin-bottom: 14px;
  line-height: 1.75;
}

.testimonial-block .attribution {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--gold);
  text-transform: uppercase;
}

.feature-table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  font-size: 15px;
}

.feature-table th {
  background: var(--ink);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 12px 16px;
  text-align: left;
}

.feature-table th.highlight-col {
  background: var(--red);
}

.feature-table td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--ink);
  vertical-align: middle;
  font-size: 15px;
}

.feature-table td.highlight-col {
  background: #fff8f0;
  font-weight: 700;
  color: var(--red);
}

.feature-table tr:nth-child(even) td {
  background: var(--dark-cream);
}

.feature-table tr:nth-child(even) td.highlight-col {
  background: #fff0e8;
}

.yes { color: var(--green); font-weight: 700; }
.no { color: var(--red); }

.bonus-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px dotted var(--border);
}

.bonus-num {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: var(--red);
  min-width: 36px;
  line-height: 1.2;
}

.bonus-content { flex: 1; }

.bonus-content strong {
  display: block;
  font-size: 16px;
  margin-bottom: 4px;
  color: var(--ink);
}

.bonus-content p {
  font-size: 14px;
  color: var(--gray);
  margin-bottom: 0;
  line-height: 1.6;
}

.bonus-value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--gold);
  white-space: nowrap;
  padding-top: 4px;
}

.order-box {
  background: #fff;
  border: 3px solid var(--red);
  padding: 40px 36px;
  margin: 32px 0;
  text-align: center;
}

.order-box .product-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 12px;
}

.order-box .was-price {
  font-size: 18px;
  color: var(--light-gray);
  text-decoration: line-through;
  margin-bottom: 4px;
}

.order-box .now-price {
  font-family: var(--font-display);
  font-size: 80px;
  font-weight: 900;
  color: var(--red);
  line-height: 1;
  margin-bottom: 8px;
}

.order-box .price-context {
  font-size: 14px;
  color: var(--gray);
  font-style: italic;
  margin-bottom: 28px;
}

.order-box .total-value-line {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--green);
  background: #f0fff0;
  border: 1px solid #cce8cc;
  padding: 10px 20px;
  display: inline-block;
  margin-bottom: 28px;
  letter-spacing: 0.05em;
}

.cta-btn {
  display: block;
  background: var(--red);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 20px 32px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  width: 100%;
  transition: background 0.2s;
  line-height: 1.4;
}

.cta-btn:hover { background: var(--dark-red); }

.cta-sub-text {
  font-size: 13px;
  color: var(--light-gray);
  font-style: italic;
  margin-top: 12px;
}

.guarantee-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  background: var(--dark-cream);
  border: 2px solid var(--border);
  padding: 32px 28px;
  margin: 32px 0;
}

.guarantee-seal {
  font-size: 64px;
  flex-shrink: 0;
  line-height: 1;
}

.guarantee-content h3,
.guarantee-copy h3 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
  color: var(--ink);
  text-transform: uppercase;
  margin: 0 0 10px 0;
  font-style: normal;
}

.guarantee-content p,
.guarantee-copy p {
  font-size: 15px;
  color: var(--gray);
  margin-bottom: 0;
  line-height: 1.75;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 20px 0;
}

.col-box {
  padding: 20px;
  border: 1px solid var(--border);
}

.col-box.green-top { border-top: 4px solid var(--green); }
.col-box.red-top { border-top: 4px solid var(--red); }

.col-box h4 {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.col-box.green-top h4 { color: var(--green); }
.col-box.red-top h4 { color: var(--red); }

.col-box ul {
  list-style: none;
  font-size: 14px;
  line-height: 1.7;
}

.col-box ul li {
  padding: 4px 0;
  border-bottom: 1px dotted var(--border);
  padding-left: 18px;
  position: relative;
}

.col-box.green-top ul li::before { content: '✓'; position: absolute; left: 0; color: var(--green); font-weight: 700; }
.col-box.red-top ul li::before { content: '✗'; position: absolute; left: 0; color: var(--red); font-weight: 700; }

.faq-item {
  border-bottom: 1px solid var(--border);
  padding: 20px 0;
}

.faq-item h4 {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 8px;
  font-style: italic;
}

.faq-item p {
  font-size: 15px;
  color: var(--gray);
  margin-bottom: 0;
  line-height: 1.75;
}

.ps-section p {
  font-style: italic;
  color: var(--gray);
  font-size: 15px;
  margin-bottom: 16px;
  line-height: 1.8;
}

.ps-section strong { font-style: normal; color: var(--ink); }

.signature {
  font-family: var(--font-display);
  font-size: 32px;
  font-style: italic;
  color: var(--ink);
  margin: 24px 0 8px;
  line-height: 1.2;
}

.signature-name {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
}

.date-line {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--light-gray);
  margin-bottom: 24px;
  letter-spacing: 0.05em;
}

footer {
  background: var(--ink);
  color: #888;
  text-align: center;
  padding: 32px 40px;
  font-size: 12px;
  line-height: 1.8;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
}

footer a { color: #aaa; text-decoration: none; }

@media (max-width: 640px) {
  .letter-header, .headline-box, .body-copy, .salutation { padding-left: 24px; padding-right: 24px; }
  .two-col { grid-template-columns: 1fr; }
  .order-box .now-price { font-size: 60px; }
  .guarantee-section { flex-direction: column; }
}
`;
