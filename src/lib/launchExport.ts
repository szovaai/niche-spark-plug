import { LaunchPlatform } from "@/types/launch";

// Strip HTML tags for platforms that don't support HTML
const stripHtml = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Format sales letter for Gumroad (supports Markdown)
export const formatForGumroad = (salesLetter: string): string => {
  // Gumroad supports basic Markdown
  let formatted = stripHtml(salesLetter);
  
  // Convert common patterns to Markdown
  formatted = formatted
    .replace(/^#\s+/gm, '# ')  // Keep headers
    .replace(/^\*\*(.+)\*\*$/gm, '**$1**')  // Bold
    .replace(/^•\s*/gm, '- ')  // Bullets to dashes
    .trim();

  return formatted;
};

// Format for WarriorPlus (HTML supported)
export const formatForWarriorPlus = (salesLetter: string): string => {
  // WarriorPlus supports HTML, return as-is with some cleanup
  return salesLetter
    .replace(/\n/g, '<br>')
    .trim();
};

// Format for Digistore24 (HTML supported)
export const formatForDigistore24 = (salesLetter: string): string => {
  // Similar to WarriorPlus
  return salesLetter
    .replace(/\n/g, '<br>')
    .trim();
};

// Format for Systeme.io (HTML supported in editor)
export const formatForSysteme = (salesLetter: string): string => {
  // Systeme uses a visual editor but can paste HTML
  return salesLetter.trim();
};

// Plain text format for general use
export const formatPlainText = (salesLetter: string): string => {
  return stripHtml(salesLetter);
};

// Get formatted sales letter based on platform
export const formatForPlatform = (
  salesLetter: string, 
  platform: LaunchPlatform
): string => {
  switch (platform) {
    case 'gumroad':
      return formatForGumroad(salesLetter);
    case 'warriorplus':
      return formatForWarriorPlus(salesLetter);
    case 'digistore24':
      return formatForDigistore24(salesLetter);
    case 'systeme':
      return formatForSysteme(salesLetter);
    case 'custom':
    default:
      return salesLetter;
  }
};

// Generate checkout button HTML for self-hosted pages
export const generateCheckoutButtonHtml = (
  platform: 'stripe' | 'paypal',
  url: string,
  buttonText: string = "Buy Now"
): string => {
  const buttonStyle = `
    display: inline-block;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    font-size: 18px;
    font-weight: bold;
    padding: 16px 48px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s;
  `.replace(/\s+/g, ' ').trim();

  return `
<a href="${url}" 
   style="${buttonStyle}"
   onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 10px 30px rgba(139,92,246,0.4)'"
   onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'"
   target="_blank"
   rel="noopener noreferrer">
  ${buttonText}
</a>
  `.trim();
};

// Generate a simple HTML sales page template
export const generateSalesPageHtml = (
  title: string,
  salesLetter: string,
  coverUrl?: string,
  checkoutUrl?: string
): string => {
  const cleanSalesLetter = salesLetter || '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: linear-gradient(180deg, #0a0a0a 0%, #18181b 100%); 
      color: #e5e5e5; 
      line-height: 1.8; 
    }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .cover { text-align: center; margin-bottom: 40px; }
    .cover img { max-width: 400px; width: 100%; border-radius: 12px; box-shadow: 0 20px 50px rgba(139,92,246,0.3); }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; }
    h2 { font-size: 1.75rem; margin: 2rem 0 1rem; color: #f4f4f5; }
    p { margin-bottom: 1rem; color: #d4d4d8; }
    ul, ol { margin: 1rem 0 1rem 2rem; }
    li { margin-bottom: 0.5rem; }
    .cta { text-align: center; margin: 40px 0; }
    .cta a { 
      display: inline-block; 
      background: linear-gradient(135deg, #8b5cf6, #6366f1); 
      color: white; 
      font-size: 1.25rem; 
      font-weight: bold; 
      padding: 16px 48px; 
      border-radius: 8px; 
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta a:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(139,92,246,0.4); }
    .content { background: #18181b; padding: 40px; border-radius: 16px; border: 1px solid #27272a; }
    @media (max-width: 600px) {
      h1 { font-size: 1.75rem; }
      .content { padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${coverUrl ? `<div class="cover"><img src="${coverUrl}" alt="${title}"></div>` : ''}
    
    <h1>${title}</h1>
    
    <div class="content">
      ${cleanSalesLetter}
    </div>
    
    ${checkoutUrl ? `
    <div class="cta">
      <a href="${checkoutUrl}" target="_blank" rel="noopener noreferrer">
        🚀 Get Instant Access Now
      </a>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `.trim();
};
