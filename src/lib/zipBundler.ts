import JSZip from "jszip";
import { saveAs } from "file-saver";
import { generateAllPDFs } from "./pdfGenerator";
import { generateSalesLetterHTML, generateUpsellHTML } from "./salesLetterExport";
import { generateReadme } from "./readmeGenerator";
import { ToolkitContent, ToolkitComponents, ToolkitUpsell } from "@/types/toolkit";
import { EmailSequence14Day, EMAIL_FOCUS_CONFIG } from "@/types/emailSequence";

export interface ToolkitData {
  title: string;
  subtitle?: string;
  niche: string;
  targetAudience?: string;
  authorName?: string;
  authorTagline?: string;
  authorBio?: string;
  logoUrl?: string | null;
  ecoverUrl?: string | null;
  components: ToolkitComponents;
  content: ToolkitContent;
  salesLetter?: string;
  upsell?: ToolkitUpsell | null;
  emailSequence?: EmailSequence14Day | null;
}

export interface BundleProgress {
  step: string;
  current: number;
  total: number;
}

// Helper to fetch image and convert to blob
const fetchImageAsBlob = async (url: string): Promise<Blob | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    return await response.blob();
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

// Helper to sanitize filename
const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .substring(0, 50);
};

export const createToolkitZip = async (
  toolkit: ToolkitData,
  onProgress?: (progress: BundleProgress) => void
): Promise<void> => {
  const zip = new JSZip();
  const totalSteps = 6; // Added email sequence step
  let currentStep = 0;

  const updateProgress = (step: string) => {
    currentStep++;
    onProgress?.({ step, current: currentStep, total: totalSteps });
  };

  try {
    // Create folders
    const mainFolder = zip.folder("Main-Product");
    const marketingFolder = zip.folder("Marketing");
    const upsellFolder = toolkit.upsell ? zip.folder("Upsell") : null;

    // Step 1: Generate PDFs
    updateProgress("Generating PDFs...");
    const pdfs = await generateAllPDFs(
      toolkit.title,
      toolkit.subtitle,
      toolkit.content,
      toolkit.components,
      toolkit.authorName
    );

    // Add PDFs to main folder
    for (const { name, pdf } of pdfs) {
      const pdfBlob = pdf.output("blob");
      mainFolder?.file(name, pdfBlob);
    }

    // Step 2: Add e-cover
    updateProgress("Processing e-cover...");
    if (toolkit.ecoverUrl) {
      const ecoverBlob = await fetchImageAsBlob(toolkit.ecoverUrl);
      if (ecoverBlob) {
        marketingFolder?.file("ecover.png", ecoverBlob);
      }
    }

    // Step 3: Generate sales letter HTML
    updateProgress("Creating sales letter...");
    if (toolkit.salesLetter) {
      const salesLetterHTML = generateSalesLetterHTML({
        title: toolkit.title,
        subtitle: toolkit.subtitle,
        salesLetter: toolkit.salesLetter,
        niche: toolkit.niche,
        targetAudience: toolkit.targetAudience,
      });
      marketingFolder?.file("Sales-Letter.html", salesLetterHTML);
    }

    // Step 4: Generate upsell page if exists
    updateProgress("Adding upsell materials...");
    if (toolkit.upsell && upsellFolder) {
      const upsellHTML = generateUpsellHTML(toolkit.title, toolkit.upsell);
      upsellFolder.file("Upsell-Page.html", upsellHTML);
    }

    // Step 5: Add email sequence if exists
    updateProgress("Adding email sequence...");
    if (toolkit.emailSequence) {
      const emailContent = generateEmailSequenceExport(toolkit.emailSequence);
      marketingFolder?.file("Email-Sequence.txt", emailContent.plainText);
      marketingFolder?.file("Email-Sequence.csv", emailContent.csv);
      marketingFolder?.file("Email-Sequence.html", emailContent.html);
    }

    // Step 6: Generate README
    updateProgress("Finalizing package...");
    const readme = generateReadme({
      title: toolkit.title,
      subtitle: toolkit.subtitle,
      niche: toolkit.niche,
      targetAudience: toolkit.targetAudience,
      authorName: toolkit.authorName,
      components: toolkit.components,
      hasUpsell: !!toolkit.upsell,
      hasEmailSequence: !!toolkit.emailSequence,
    });
    zip.file("README-Launch.txt", readme);

    // Generate and download the ZIP file
    const zipBlob = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });

    const filename = `${sanitizeFilename(toolkit.title)}-toolkit.zip`;
    saveAs(zipBlob, filename);

  } catch (error) {
    console.error("Error creating toolkit ZIP:", error);
    throw error;
  }
};

// Export individual PDF
export const downloadSinglePDF = async (
  pdfType: keyof ToolkitComponents | "guide",
  toolkit: ToolkitData
): Promise<void> => {
  const { generateGuidePDF, generateWorksheetPDF, generateChecklistPDF, 
          generateResourceListPDF, generateTemplatesPDF, generateQuizPDF } = await import("./pdfGenerator");
  
  let pdf;
  let filename;

  switch (pdfType) {
    case "guide":
      pdf = generateGuidePDF(toolkit.content.guide, toolkit.title, toolkit.subtitle, toolkit.authorName);
      filename = `${sanitizeFilename(toolkit.title)}-guide.pdf`;
      break;
    case "worksheet":
      pdf = generateWorksheetPDF(toolkit.content.worksheet, toolkit.title, toolkit.authorName);
      filename = `${sanitizeFilename(toolkit.title)}-worksheet.pdf`;
      break;
    case "checklist":
      pdf = generateChecklistPDF(toolkit.content.checklist, toolkit.title, toolkit.authorName);
      filename = `${sanitizeFilename(toolkit.title)}-checklist.pdf`;
      break;
    case "resourceList":
      pdf = generateResourceListPDF(toolkit.content.resourceList, toolkit.title, toolkit.authorName);
      filename = `${sanitizeFilename(toolkit.title)}-resources.pdf`;
      break;
    case "templates":
      pdf = generateTemplatesPDF(toolkit.content.templates, toolkit.title, toolkit.authorName);
      filename = `${sanitizeFilename(toolkit.title)}-templates.pdf`;
      break;
    case "quiz":
      pdf = generateQuizPDF(toolkit.content.quiz, toolkit.title, toolkit.authorName);
      filename = `${sanitizeFilename(toolkit.title)}-quiz.pdf`;
      break;
    default:
      throw new Error(`Unknown PDF type: ${pdfType}`);
  }

  if (pdf) {
    pdf.save(filename);
  }
};

// Generate email sequence export in multiple formats
const generateEmailSequenceExport = (sequence: EmailSequence14Day): { plainText: string; csv: string; html: string } => {
  // Plain Text Format
  const plainText = `
===============================================
14-DAY EMAIL SEQUENCE
Offer: ${sequence.offerName}
Target Audience: ${sequence.targetAudience}
===============================================

${sequence.emails.map((email, i) => {
  const focusConfig = EMAIL_FOCUS_CONFIG[email.focus];
  return `
-------------------------------------------
DAY ${email.day}: ${email.focus.toUpperCase().replace(/-/g, ' ')}
Purpose: ${focusConfig?.purpose || 'N/A'}
-------------------------------------------

SUBJECT: ${email.subject}
PREVIEW: ${email.previewText}

${email.openingHook}

${email.storyAnalogy}

${email.lessonTwist}

${email.offerBridge}

${email.cta}

${email.ps ? `P.S. ${email.ps}` : ''}
`;
}).join('\n')}

===============================================
Generated by DigiStream Toolkit Creator
===============================================
`.trim();

  // CSV Format
  const csvHeader = 'Day,Focus,Subject,Preview Text,Opening Hook,Story/Analogy,Lesson/Twist,Offer Bridge,CTA,PS';
  const csvRows = sequence.emails.map(email => {
    const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    return [
      email.day,
      escapeCsv(email.focus),
      escapeCsv(email.subject),
      escapeCsv(email.previewText),
      escapeCsv(email.openingHook),
      escapeCsv(email.storyAnalogy),
      escapeCsv(email.lessonTwist),
      escapeCsv(email.offerBridge),
      escapeCsv(email.cta),
      escapeCsv(email.ps || '')
    ].join(',');
  });
  const csv = [csvHeader, ...csvRows].join('\n');

  // HTML Format
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>14-Day Email Sequence - ${sequence.offerName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; line-height: 1.6; padding: 40px 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: #a1a1aa; margin-bottom: 2rem; }
    .email-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .email-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .day-badge { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; }
    .focus-badge { background: #27272a; color: #a1a1aa; padding: 4px 12px; border-radius: 20px; font-size: 0.875rem; }
    .email-subject { font-size: 1.25rem; font-weight: 600; color: #f4f4f5; margin-bottom: 8px; }
    .email-preview { color: #71717a; font-size: 0.875rem; margin-bottom: 16px; font-style: italic; }
    .email-section { margin-bottom: 16px; }
    .section-label { font-size: 0.75rem; text-transform: uppercase; color: #8b5cf6; margin-bottom: 4px; letter-spacing: 0.05em; }
    .email-content { color: #d4d4d8; white-space: pre-wrap; }
    .cta { background: #27272a; padding: 16px; border-radius: 8px; border-left: 3px solid #8b5cf6; }
    .ps { color: #a1a1aa; font-style: italic; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>14-Day Email Sequence</h1>
    <p class="subtitle">${sequence.offerName} | ${sequence.targetAudience}</p>
    
    ${sequence.emails.map(email => `
    <div class="email-card">
      <div class="email-header">
        <span class="day-badge">Day ${email.day}</span>
        <span class="focus-badge">${email.focus.replace(/-/g, ' ')}</span>
      </div>
      <div class="email-subject">📧 ${email.subject}</div>
      <div class="email-preview">${email.previewText}</div>
      
      <div class="email-section">
        <div class="section-label">Opening Hook</div>
        <div class="email-content">${email.openingHook}</div>
      </div>
      
      <div class="email-section">
        <div class="section-label">Story / Analogy</div>
        <div class="email-content">${email.storyAnalogy}</div>
      </div>
      
      <div class="email-section">
        <div class="section-label">Lesson / Twist</div>
        <div class="email-content">${email.lessonTwist}</div>
      </div>
      
      <div class="email-section">
        <div class="section-label">Offer Bridge</div>
        <div class="email-content">${email.offerBridge}</div>
      </div>
      
      <div class="cta">
        <div class="section-label">Call to Action</div>
        <div class="email-content">${email.cta}</div>
      </div>
      
      ${email.ps ? `<div class="ps">P.S. ${email.ps}</div>` : ''}
    </div>
    `).join('')}
  </div>
</body>
</html>
`.trim();

  return { plainText, csv, html };
};
