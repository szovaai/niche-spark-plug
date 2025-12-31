import { ToolkitComponents } from "@/types/toolkit";

export interface ReadmeData {
  title: string;
  subtitle?: string;
  niche: string;
  targetAudience?: string;
  authorName?: string;
  components: ToolkitComponents;
  hasUpsell: boolean;
}

export const generateReadme = (data: ReadmeData): string => {
  const { title, subtitle, niche, targetAudience, authorName, components, hasUpsell } = data;
  
  const componentList: string[] = [];
  if (components.guide) componentList.push("📖 Main Guide (Guide.pdf)");
  if (components.worksheet) componentList.push("📝 Worksheet (Worksheet.pdf)");
  if (components.checklist) componentList.push("✅ Checklist (Checklist.pdf)");
  if (components.resourceList) componentList.push("🔗 Resource List (Resource-List.pdf)");
  if (components.templates) componentList.push("📋 Templates (Templates.pdf)");
  if (components.quiz) componentList.push("❓ Quiz/Assessment (Quiz.pdf)");
  
  const authorSection = authorName ? `
Created by: ${authorName}
` : '';

  return `
================================================================================
                              ${title.toUpperCase()}
================================================================================
${subtitle ? `\n${subtitle}\n` : ''}
${authorSection}
Created with DigiStream Toolkit Creator
Generated on: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

================================================================================
                              TOOLKIT CONTENTS
================================================================================

This toolkit package includes the following components:

MAIN PRODUCT FOLDER:
${componentList.map(c => `  ${c}`).join('\n')}

MARKETING FOLDER:
  🖼️  E-Cover (ecover.png) - Use for sales pages and promotions
  📧  Sales Letter (Sales-Letter.html) - Ready-to-use sales page template

${hasUpsell ? `UPSELL FOLDER:
  💰  Upsell Page (Upsell-Page.html) - One-time offer template
` : ''}

================================================================================
                        🚀 48-HOUR LAUNCH CHECKLIST
================================================================================

Follow this step-by-step plan to get your first sale within 48 hours:

HOUR 0-2: FINAL PREP
  □ Review all PDFs - fix any typos or awkward phrasing
  □ Customize the sales letter with your voice
  □ Set your price point (see pricing guide below)
  □ Prepare 3 bonus items or "fast action" incentives

HOUR 2-4: PLATFORM SETUP  
  □ Create/login to your selling platform account
  □ Upload product files and e-cover
  □ Write SEO-optimized title and description
  □ Set up payment processing
  □ Test the purchase flow yourself

HOUR 4-8: MARKETING ASSETS
  □ Create 3 social media posts announcing the launch
  □ Write 2 emails for your list (teaser + launch day)
  □ Make a simple Pinterest pin with the e-cover
  □ Draft a "behind the scenes" story for Instagram

HOUR 8-24: SOFT LAUNCH
  □ Post to 2-3 Facebook groups (where allowed)
  □ Share on Reddit in relevant subreddits
  □ Email your personal network
  □ Post first social media teaser

HOUR 24-48: FULL LAUNCH
  □ Send main launch email to your list
  □ Go live on all social platforms
  □ Engage with every comment and DM
  □ Offer a 48-hour launch discount
  □ Reach out to 3 potential affiliates

================================================================================
                              PRICING GUIDE
================================================================================

Based on what's included in your toolkit, here's the recommended pricing:

BUDGET TIER ($7-$12)
• 1-2 components
• Quick win for impulse buyers
• Great for building your customer list

VALUE TIER ($17-$27)
• 3-4 components
• Sweet spot for most digital products
• Strong perceived value vs. price

PREMIUM TIER ($37-$67)
• 5+ components
• Includes worksheets, templates, and extras
• Position as comprehensive solution

${hasUpsell ? `
PRO TIP: Your upsell is included! Use this to increase average order value
by 40-60%. Price your upsell at 1.5-2x your main product price.
` : ''}

================================================================================
                              QUICK START GUIDE
================================================================================

1. REVIEW YOUR CONTENT
   Open each PDF file and review the content. Make any personal touches
   or customizations to match your brand voice.

2. SET UP YOUR SALES PAGE
   Open Sales-Letter.html in a browser to preview your sales page.
   Edit the HTML file to add your:
   - Pricing information
   - Payment button/link
   - Guarantee details
   - Contact information

3. UPLOAD YOUR FILES
   Choose your selling platform (WarriorPlus, JVZoo, Gumroad, Etsy, etc.)
   and upload:
   - The product files (PDFs) as your deliverable
   - The e-cover for your sales listing
   - Your customized sales page content

4. LAUNCH!
   Submit your product for review and start promoting!

================================================================================
                              MARKETPLACE TIPS
================================================================================

FOR WARRIORPLUS/JVZOO:
• Use a compelling headline from your sales letter
• Set up proper affiliate commissions (50-75% recommended)
• Create a simple thank you/download page
• Consider adding a bump offer or upsell

FOR GUMROAD/SELF-HOSTED:
• Upload all files as a ZIP or individually
• Use the e-cover as your product image
• Copy your sales letter content to your product page
• Set up email delivery for instant access

FOR ETSY/DIGITAL PRODUCTS:
• Optimize your title with relevant keywords
• Use the e-cover and create mockup images
• Include detailed product descriptions
• Offer bundle discounts for multiple products

================================================================================
                              NICHE INFORMATION
================================================================================

Niche/Topic: ${niche}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

================================================================================
                              SUPPORT & LEGAL
================================================================================

This toolkit was created using AI-assisted content generation.
You have full rights to sell, modify, and distribute this content.

Recommended: Review all content before publishing to ensure accuracy
and alignment with your brand.

Need help? Visit DigiStream for tutorials and support.

================================================================================
                              LICENSE INFORMATION
================================================================================

You are granted the following rights:
✓ Sell this product as your own
✓ Modify and customize all content
✓ Use in any marketplace or platform
✓ Bundle with other products
✓ Give away as a lead magnet (with modifications)

Please do not:
✗ Resell the toolkit template itself
✗ Claim the AI-generated content as 100% original
✗ Use for any illegal or unethical purposes

================================================================================

Thank you for using DigiStream Toolkit Creator!
We wish you success with your digital product launch! 🚀

================================================================================
`;
};
