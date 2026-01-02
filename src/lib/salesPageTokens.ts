// DigiStream Sales Page Design Tokens
// Based on "Buyer Traffic Blueprint" Creative Brief

export const PAGE_TOKENS = {
  colors: {
    ink: "#0B1020",
    navy: "#0E1A3A",
    slate: "#64748B",
    mist: "#E6EEF8",
    white: "#FFFFFF",
    accent: "#3B82F6",
    glow: "#22D3EE",
    success: "#22C55E",
    warning: "#F59E0B",
    border: "rgba(148,163,184,0.22)",
    // Additional premium colors
    accentPink: "#EC4899",
    purple: "#8B5CF6",
    darkCard: "#101a33",
    darkBg: "#0b0f19",
  },
  fonts: {
    display: "'Sora', system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif",
    ui: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  typeScale: {
    h1: { size: 44, line: 52, mobileSize: 34, mobileLine: 42, weight: 700 },
    h2: { size: 32, line: 40, weight: 700 },
    h3: { size: 22, line: 30, weight: 650 },
    body: { size: 16, line: 26, weight: 450 },
    small: { size: 14, line: 22, weight: 450 },
    micro: { size: 12, line: 18, weight: 450 },
  },
  space: [4, 8, 12, 16, 24, 32, 48, 64, 80, 112],
  radius: {
    card: 20,
    button: 14,
    input: 12,
    pill: 999,
  },
  shadows: {
    soft: "0 12px 30px rgba(2,6,23,.22)",
    glow: "0 0 0 1px rgba(59,130,246,.30), 0 18px 60px rgba(34,211,238,.10)",
    card: "0 8px 30px rgba(0,0,0,.25)",
    button: "0 8px 30px rgba(124,92,255,.35)",
  },
} as const;

// CSS Variables for injection into HTML
export const CSS_VARIABLES = `
:root {
  --c-ink: ${PAGE_TOKENS.colors.ink};
  --c-navy: ${PAGE_TOKENS.colors.navy};
  --c-slate: ${PAGE_TOKENS.colors.slate};
  --c-mist: ${PAGE_TOKENS.colors.mist};
  --c-white: ${PAGE_TOKENS.colors.white};
  --c-accent: ${PAGE_TOKENS.colors.accent};
  --c-glow: ${PAGE_TOKENS.colors.glow};
  --c-success: ${PAGE_TOKENS.colors.success};
  --c-warning: ${PAGE_TOKENS.colors.warning};
  --c-border: ${PAGE_TOKENS.colors.border};
  --c-pink: ${PAGE_TOKENS.colors.accentPink};
  --c-purple: ${PAGE_TOKENS.colors.purple};
  --c-dark-card: ${PAGE_TOKENS.colors.darkCard};
  --c-dark-bg: ${PAGE_TOKENS.colors.darkBg};
  
  --font-display: ${PAGE_TOKENS.fonts.display};
  --font-ui: ${PAGE_TOKENS.fonts.ui};
  
  --r-card: ${PAGE_TOKENS.radius.card}px;
  --r-btn: ${PAGE_TOKENS.radius.button}px;
  --r-input: ${PAGE_TOKENS.radius.input}px;
  --r-pill: ${PAGE_TOKENS.radius.pill}px;
  
  --shadow-soft: ${PAGE_TOKENS.shadows.soft};
  --shadow-glow: ${PAGE_TOKENS.shadows.glow};
  --shadow-card: ${PAGE_TOKENS.shadows.card};
  --shadow-button: ${PAGE_TOKENS.shadows.button};
}
`;
