import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { Step1Product, Step2Content, Step3Funnel, Step4Marketing, Step5Checklist } from "@/types/launchWizard";
import type { ProductAssets } from "@/types/productAssets";

export interface LaunchBoxData {
  product: Step1Product;
  content: Step2Content | null;
  funnel: Step3Funnel | null;
  marketing: Step4Marketing | null;
  checklist: Step5Checklist | null;
  assets: ProductAssets;
  niche: string;
  price: number;
  authorName?: string;
}

export interface LaunchBoxProgress {
  step: string;
  current: number;
  total: number;
}

const sanitizeFilename = (name: string): string =>
  name.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_").substring(0, 50);

const wrapText = (label: string, text: string): string =>
  `${"=".repeat(50)}\n${label}\n${"=".repeat(50)}\n\n${text}\n`;

export const createLaunchBoxZip = async (
  data: LaunchBoxData,
  onProgress?: (p: LaunchBoxProgress) => void
): Promise<void> => {
  const zip = new JSZip();
  const total = 7;
  let step = 0;
  const advance = (label: string) => { step++; onProgress?.({ step: label, current: step, total }); };

  const productName = sanitizeFilename(data.product.title);

  // === PRODUCT folder ===
  advance("Building product files...");
  const productFolder = zip.folder("PRODUCT");
  if (data.content) {
    // Ebook outline
    const ebookContent = [
      `${data.product.title}\n${data.product.subtitle}\n`,
      `CONCEPT:\n${data.product.concept}\n`,
      `UNIQUE MECHANISM: ${data.product.uniqueMechanism}\n`,
      "\n--- TABLE OF CONTENTS ---\n",
      ...(data.content.chapters?.map((ch, i) =>
        `\nCHAPTER ${i + 1}: ${ch.title}\n${"-".repeat(40)}\n${ch.summary}\n\n` +
        (ch.moduleGoal ? `MODULE GOAL: ${ch.moduleGoal}\n\n` : "") +
        (ch.hook ? `HOOK:\n${ch.hook}\n\n` : "") +
        (ch.coreConcept ? `CORE CONCEPT:\n${ch.coreConcept}\n\n` : "") +
        (ch.keyPoints?.length ? `KEY POINTS:\n${ch.keyPoints.map(kp => `• ${kp}`).join("\n")}\n\n` : "") +
        (ch.actionPlan?.length ? `ACTION PLAN:\n${ch.actionPlan.map(ap => `${ap.step}: ${ap.action} — ${ap.why}`).join("\n")}\n\n` : "") +
        (ch.realExample ? `REAL EXAMPLE:\n${ch.realExample}\n\n` : "") +
        (ch.commonMistakes?.length ? `COMMON MISTAKES:\n${ch.commonMistakes.map(m => `❌ ${m}`).join("\n")}\n\n` : "") +
        (ch.actionStep ? `⚡ ACTION STEP: ${ch.actionStep}\n\n` : "") +
        (ch.moduleSummary?.length ? `SUMMARY:\n${ch.moduleSummary.map(s => `✓ ${s}`).join("\n")}\n` : "")
      ) || []),
    ].join("\n");
    productFolder?.file(`${productName}_Ebook.txt`, ebookContent);

    // Workbook (action steps + worksheets)
    const workbookContent = [
      `${data.product.title} — WORKBOOK\n${"=".repeat(50)}\n`,
      ...(data.content.chapters?.map((ch, i) =>
        `\nWORKSHEET ${i + 1}: ${ch.title}\n${"-".repeat(40)}\n` +
        (ch.actionStep ? `\nIMPLEMENTATION TASK:\n${ch.actionStep}\n` : "") +
        (ch.actionPlan?.length ? `\nSTEPS:\n${ch.actionPlan.map(ap => `☐ ${ap.action}`).join("\n")}\n` : "") +
        `\nNOTES:\n${"_".repeat(40)}\n${"_".repeat(40)}\n${"_".repeat(40)}\n`
      ) || []),
    ].join("\n");
    productFolder?.file(`${productName}_Workbook.txt`, workbookContent);

    // Cheat Sheets (key points per chapter)
    const cheatSheetContent = [
      `${data.product.title} — CHEAT SHEETS\n${"=".repeat(50)}\n`,
      ...(data.content.chapters?.map((ch, i) =>
        `\n📌 CHAPTER ${i + 1}: ${ch.title}\n` +
        (ch.keyPoints?.map(kp => `  → ${kp}`).join("\n") || "") + "\n" +
        (ch.actionStep ? `  ⚡ Quick Win: ${ch.actionStep}\n` : "")
      ) || []),
    ].join("\n");
    productFolder?.file(`${productName}_CheatSheets.txt`, cheatSheetContent);

    // Description
    productFolder?.file(`${productName}_Description.txt`, data.content.description || "");
  }

  // === BONUSES folder ===
  advance("Packaging bonuses...");
  const bonusFolder = zip.folder("BONUSES");
  if (data.content?.bonuses?.length) {
    data.content.bonuses.forEach((bonus, i) => {
      const bonusName = sanitizeFilename(bonus.split(":")[0] || `Bonus_${i + 1}`);
      bonusFolder?.file(`${bonusName}.txt`, bonus);
    });
  }

  // === FUNNEL folder ===
  advance("Assembling funnel copy...");
  const funnelFolder = zip.folder("FUNNEL");
  if (data.funnel) {
    funnelFolder?.file("SalesPageCopy.txt", wrapText("SALES PAGE COPY", data.funnel.salesPage || ""));
    funnelFolder?.file("OptinPageCopy.txt", wrapText("OPT-IN PAGE COPY", data.funnel.optInPage || ""));
    funnelFolder?.file("ThankYouPage.txt", wrapText("THANK YOU PAGE", data.funnel.thankYouPage || ""));
    funnelFolder?.file("BonusPage.txt", wrapText("BONUS PAGE", data.funnel.bonusPage || ""));
    funnelFolder?.file("CheckoutCopy.txt", wrapText("CHECKOUT COPY", data.funnel.checkoutCopy || ""));
    if (data.funnel.orderBump) funnelFolder?.file("OrderBumpCopy.txt", wrapText("ORDER BUMP", data.funnel.orderBump));
    if (data.funnel.upsellOffer) funnelFolder?.file("UpsellPageCopy.txt", wrapText("UPSELL OFFER", data.funnel.upsellOffer));

    // Offer stack summary
    if (data.funnel.offerStack) {
      const os = data.funnel.offerStack;
      const stackText = [
        "OFFER STACK SUMMARY",
        "=".repeat(50),
        `\nCore Product: ${os.coreProduct.name} — $${os.coreProduct.value} value`,
        ...(os.bonuses?.map(b => `Bonus: ${b.name} — $${b.value} value (${b.description})`) || []),
        `\nTotal Value: $${os.totalValue}`,
        `Asking Price: $${os.askingPrice}`,
        `\n${os.stackCopy}`,
      ].join("\n");
      funnelFolder?.file("OfferStack.txt", stackText);
    }
  }

  // === AFFILIATE folder ===
  advance("Creating affiliate kit...");
  const affiliateFolder = zip.folder("AFFILIATE");
  if (data.marketing?.affiliateKit) {
    const ak = data.marketing.affiliateKit;
    affiliateFolder?.file("JVPage.txt", wrapText("JV RECRUITMENT PAGE", ak.jvPageCopy || ""));

    const swipeText = ak.emailSwipes?.map((s, i) =>
      `--- SWIPE ${i + 1} ---\nSUBJECT: ${s.subject}\n\n${s.body}\n`
    ).join("\n") || "";
    affiliateFolder?.file("AffiliateEmails.txt", wrapText("AFFILIATE EMAIL SWIPES", swipeText));

    if (ak.promoAngles?.length) {
      affiliateFolder?.file("PromoAngles.txt", wrapText("PROMOTION ANGLES",
        ak.promoAngles.map((a, i) => `${i + 1}. ${a}`).join("\n")
      ));
    }
  }

  // Social media posts as promo tweets
  if (data.marketing?.socialPosts?.length) {
    affiliateFolder?.file("SocialPosts.txt", wrapText("SOCIAL MEDIA POSTS",
      data.marketing.socialPosts.map((p, i) => `--- POST ${i + 1} ---\n${p}`).join("\n\n")
    ));
  }

  // === MARKETING folder ===
  advance("Adding marketing assets...");
  const marketingFolder = zip.folder("MARKETING");
  if (data.marketing) {
    // Emails
    if (data.marketing.emails?.length) {
      const emailText = data.marketing.emails.map((e, i) =>
        `--- EMAIL ${i + 1} ---\nSUBJECT: ${e.subject}\n\n${e.body}\n`
      ).join("\n");
      marketingFolder?.file("EmailSwipes.txt", wrapText("LAUNCH EMAIL SEQUENCE", emailText));
    }

    // Ad copy
    if (data.marketing.adCopy?.length) {
      const adText = data.marketing.adCopy.map((a, i) =>
        `--- AD ${i + 1} (${a.hookAngle || "General"}) ---\nHEADLINE: ${a.headline}\n\n${a.primaryText}\n\nCTA: ${a.cta}\n`
      ).join("\n");
      marketingFolder?.file("AdCopy.txt", wrapText("AD COPY VARIATIONS", adText));
    }

    // Blog article
    if (data.marketing.blogArticle) {
      marketingFolder?.file("BlogArticle.txt", wrapText("BLOG ARTICLE", data.marketing.blogArticle));
    }

    // Video script
    if (data.marketing.videoScript) {
      marketingFolder?.file("VideoScript.txt", wrapText("VIDEO SCRIPT", data.marketing.videoScript));
    }

    // Pinterest
    if (data.marketing.pinterestPins?.length) {
      marketingFolder?.file("PinterestPins.txt", wrapText("PINTEREST PIN DESCRIPTIONS",
        data.marketing.pinterestPins.map((p, i) => `Pin ${i + 1}: ${p}`).join("\n\n")
      ));
    }
  }

  // === LAUNCH folder ===
  advance("Generating launch plan...");
  const launchFolder = zip.folder("LAUNCH");
  if (data.checklist?.steps?.length) {
    const byDay: Record<number, typeof data.checklist.steps> = {};
    data.checklist.steps.forEach(s => {
      const d = s.day || 1;
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(s);
    });
    const timelineText = Object.keys(byDay).map(Number).sort((a, b) => a - b).map(day =>
      `\n📅 DAY ${day}\n${"-".repeat(30)}\n` +
      byDay[day].map(s => `${s.completed ? "✅" : "☐"} ${s.title}\n   ${s.description}`).join("\n\n")
    ).join("\n");
    launchFolder?.file("LaunchTimeline.txt", wrapText("7-DAY LAUNCH TIMELINE", timelineText));

    const checklistText = data.checklist.steps.map(s =>
      `☐ ${s.title}`
    ).join("\n");
    launchFolder?.file("LaunchChecklist.txt", wrapText("LAUNCH CHECKLIST", checklistText));
  }

  // === README.txt ===
  advance("Finalizing your launch kit...");
  const readmeText = `${"=".repeat(60)}
  ${data.product.title}
  COMPLETE LAUNCH KIT
${"=".repeat(60)}

Congratulations! You've just generated a complete digital product launch system.

📂 WHAT'S IN THIS FOLDER
${"-".repeat(40)}

PRODUCT/
  → Your complete ebook content, workbook, and cheat sheets
  → Ready to format and sell

BONUSES/
  → Individual bonus content files
  → Add these to increase perceived value

FUNNEL/
  → Sales page copy, opt-in page, checkout, upsell, order bump
  → Paste directly into WarriorPlus, Systeme.io, or any page builder

AFFILIATE/
  → JV recruitment page copy
  → Ready-to-send affiliate email swipes
  → Social media promotional posts

MARKETING/
  → Launch email sequence (5 emails)
  → Ad copy variations for Facebook/Google
  → Blog article, video script, Pinterest pins

LAUNCH/
  → 7-day launch timeline
  → Quick-reference checklist

🚀 HOW TO LAUNCH ON WARRIORPLUS IN 15 MINUTES
${"-".repeat(40)}

1. Go to WarriorPlus.com → Vendor → Add Product
2. Product name: ${data.product.title}
3. Set price: $${data.price}
4. Set affiliate commission: 50-100% (for launch week)
5. Copy/paste sales page from FUNNEL/SalesPageCopy.txt
6. Upload your product files from PRODUCT/
7. Set up order bump from FUNNEL/OrderBumpCopy.txt
8. Add upsell from FUNNEL/UpsellPageCopy.txt
9. Create JV page from AFFILIATE/JVPage.txt
10. Send affiliate swipes from AFFILIATE/AffiliateEmails.txt
11. Schedule launch emails from MARKETING/EmailSwipes.txt
12. GO LIVE! 🎉

💡 PRO TIPS
${"-".repeat(40)}
• Format your ebook in Canva or Google Docs before uploading
• Use the cheat sheets as a lead magnet to build your list
• Send the affiliate email swipes to 5-10 JV partners before launch
• Post the social media content 3 days before your launch date

${"-".repeat(40)}
Generated by DigiLaunchKit AI — Your 60-Minute Launch Machine
${data.authorName ? `Author: ${data.authorName}` : ""}
Niche: ${data.niche}
Price: $${data.price}
`;

  zip.file("README.txt", readmeText);

  // Generate and save
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  saveAs(zipBlob, `${productName}_Launch_Kit.zip`);
};
