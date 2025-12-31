export interface SalesLetterData {
  title: string;
  subtitle?: string;
  salesLetter: string;
  niche: string;
  targetAudience?: string;
}

export const generateSalesLetterHTML = (data: SalesLetterData): string => {
  const { title, subtitle, salesLetter, niche } = data;
  
  // Convert markdown-style formatting to HTML
  const formattedContent = salesLetter
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Sales Page</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.8;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .sales-page {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #8b5cf6 0%, #14b8a6 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 16px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .header .subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
    }
    
    .content {
      padding: 50px 40px;
    }
    
    .content p {
      margin-bottom: 20px;
      font-size: 1.1rem;
    }
    
    .content h1, .content h2, .content h3 {
      color: #8b5cf6;
      margin: 30px 0 15px 0;
    }
    
    .content h1 {
      font-size: 2rem;
    }
    
    .content h2 {
      font-size: 1.5rem;
    }
    
    .content h3 {
      font-size: 1.25rem;
    }
    
    .content strong {
      color: #14b8a6;
    }
    
    .cta-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 50px 40px;
      text-align: center;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6 0%, #14b8a6 100%);
      color: white;
      font-size: 1.25rem;
      font-weight: 700;
      padding: 20px 50px;
      border-radius: 50px;
      text-decoration: none;
      box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 50px rgba(139, 92, 246, 0.5);
    }
    
    .footer {
      background: #1a1a2e;
      color: #888;
      padding: 30px 40px;
      text-align: center;
      font-size: 0.9rem;
    }
    
    .badge {
      display: inline-block;
      background: #14b8a6;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    
    /* Customize placeholders */
    .placeholder {
      background: #fffbeb;
      border: 2px dashed #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      font-style: italic;
      color: #92400e;
    }
    
    @media (max-width: 600px) {
      .header h1 {
        font-size: 1.75rem;
      }
      
      .content, .cta-section, .footer {
        padding: 30px 20px;
      }
      
      .cta-button {
        padding: 15px 30px;
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="sales-page">
      <div class="header">
        <span class="badge">${niche}</span>
        <h1>${title}</h1>
        ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
      </div>
      
      <div class="content">
        <p>${formattedContent}</p>
      </div>
      
      <div class="cta-section">
        <p style="font-size: 1.5rem; font-weight: 700; color: #333; margin-bottom: 25px;">
          Ready to Transform Your Results?
        </p>
        <a href="#" class="cta-button">
          ⚡ Get Instant Access Now ⚡
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 0.9rem;">
          <!-- CUSTOMIZE: Add your price, guarantee, and bonuses here -->
          <span class="placeholder">
            [Add your pricing, money-back guarantee, and bonus offers here]
          </span>
        </p>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${title}. All rights reserved.</p>
        <p style="margin-top: 10px;">
          <!-- CUSTOMIZE: Add your contact and legal links -->
          <a href="#" style="color: #8b5cf6;">Contact</a> | 
          <a href="#" style="color: #8b5cf6;">Privacy Policy</a> | 
          <a href="#" style="color: #8b5cf6;">Terms of Service</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.8;
      color: #333;
      background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    
    .upsell-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.3);
      max-width: 600px;
      overflow: hidden;
    }
    
    .upsell-header {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .wait-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .upsell-header h1 {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .upsell-body {
      padding: 40px;
      text-align: center;
    }
    
    .price-box {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 15px;
      padding: 30px;
      margin: 30px 0;
    }
    
    .price {
      font-size: 3rem;
      font-weight: 800;
      color: #ee5a24;
    }
    
    .price-label {
      color: #666;
      font-size: 1rem;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #ee5a24 0%, #ff6b6b 100%);
      color: white;
      font-size: 1.2rem;
      font-weight: 700;
      padding: 18px 45px;
      border-radius: 50px;
      text-decoration: none;
      box-shadow: 0 10px 30px rgba(238, 90, 36, 0.4);
      transition: all 0.3s ease;
    }
    
    .cta-button:hover {
      transform: scale(1.05);
    }
    
    .no-thanks {
      display: block;
      margin-top: 20px;
      color: #999;
      font-size: 0.9rem;
      text-decoration: underline;
    }
    
    .features {
      text-align: left;
      margin: 25px 0;
    }
    
    .feature {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .feature-check {
      width: 24px;
      height: 24px;
      background: #14b8a6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 12px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="upsell-card">
    <div class="upsell-header">
      <span class="wait-badge">🔥 Wait! Special Offer 🔥</span>
      <h1>${upsell.title}</h1>
    </div>
    
    <div class="upsell-body">
      <p style="font-size: 1.1rem; color: #555; margin-bottom: 20px;">
        ${upsell.description}
      </p>
      
      ${upsell.salesPage ? `<div style="margin: 20px 0;">${upsell.salesPage}</div>` : ''}
      
      <div class="price-box">
        <p class="price-label">One-Time Investment</p>
        <p class="price">$${upsell.price}</p>
        <p style="color: #14b8a6; font-weight: 600;">Limited Time Offer!</p>
      </div>
      
      <div class="features">
        <div class="feature">
          <span class="feature-check">✓</span>
          <span>Instant digital delivery</span>
        </div>
        <div class="feature">
          <span class="feature-check">✓</span>
          <span>Lifetime access included</span>
        </div>
        <div class="feature">
          <span class="feature-check">✓</span>
          <span>30-day money back guarantee</span>
        </div>
      </div>
      
      <a href="#" class="cta-button">
        Yes! Add This To My Order
      </a>
      
      <a href="#" class="no-thanks">
        No thanks, I'll pass on this special offer
      </a>
    </div>
  </div>
</body>
</html>`;
};
