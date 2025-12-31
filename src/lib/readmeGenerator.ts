import { ToolkitComponents } from "@/types/toolkit";

export interface ReadmeData {
  title: string;
  subtitle?: string;
  niche: string;
  targetAudience?: string;
  components: ToolkitComponents;
  hasUpsell: boolean;
}

export const generateReadme = (data: ReadmeData): string => {
  const { title, subtitle, niche, targetAudience, components, hasUpsell } = data;
  
  const componentList: string[] = [];
  if (components.guide) componentList.push("📖 Main Guide (Guide.pdf)");
  if (components.worksheet) componentList.push("📝 Worksheet (Worksheet.pdf)");
  if (components.checklist) componentList.push("✅ Checklist (Checklist.pdf)");
  if (components.resourceList) componentList.push("🔗 Resource List (Resource-List.pdf)");
  if (components.templates) componentList.push("📋 Templates (Templates.pdf)");
  if (components.quiz) componentList.push("❓ Quiz/Assessment (Quiz.pdf)");
  
  return `
================================================================================
                              ${title.toUpperCase()}
================================================================================
${subtitle ? `\n${subtitle}\n` : ''}

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
   Choose your selling platform (WarriorPlus, JVZoo, Gumroad, etc.)
   and upload:
   - The product files (PDFs) as your deliverable
   - The e-cover for your sales listing
   - Your customized sales page content

4. SET YOUR PRICE
   Based on the value you're providing:
   - Basic toolkit: $7-17
   - Standard toolkit with multiple components: $17-37
   - Premium toolkit with all components: $37-67

5. LAUNCH!
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
