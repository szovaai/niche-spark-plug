import JSZip from "jszip";
import { saveAs } from "file-saver";
import { generateAllPDFs } from "./pdfGenerator";
import { generateSalesLetterHTML, generateUpsellHTML } from "./salesLetterExport";
import { generateReadme } from "./readmeGenerator";
import { ToolkitContent, ToolkitComponents, ToolkitUpsell } from "@/types/toolkit";

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
  const totalSteps = 5;
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

    // Step 5: Generate README
    updateProgress("Finalizing package...");
    const readme = generateReadme({
      title: toolkit.title,
      subtitle: toolkit.subtitle,
      niche: toolkit.niche,
      targetAudience: toolkit.targetAudience,
      authorName: toolkit.authorName,
      components: toolkit.components,
      hasUpsell: !!toolkit.upsell,
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
