import jsPDF from "jspdf";
import { ToolkitContent, ToolkitComponents } from "@/types/toolkit";

// PDF Styling Constants
const PDF_STYLES = {
  primaryColor: [139, 92, 246] as [number, number, number], // Purple
  accentColor: [20, 184, 166] as [number, number, number], // Teal
  textColor: [30, 30, 30] as [number, number, number],
  lightGray: [100, 100, 100] as [number, number, number],
  fontSize: {
    title: 28,
    heading: 18,
    subheading: 14,
    body: 11,
    small: 9,
  },
  margins: {
    top: 25,
    bottom: 25,
    left: 25,
    right: 25,
  },
  lineHeight: 6,
};

const pageWidth = 210; // A4 width in mm
const pageHeight = 297; // A4 height in mm
const contentWidth = pageWidth - PDF_STYLES.margins.left - PDF_STYLES.margins.right;

// Helper to add page numbers
const addPageNumber = (doc: jsPDF, pageNum: number) => {
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setTextColor(...PDF_STYLES.lightGray);
  doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
};

// Helper to add header
const addHeader = (doc: jsPDF, title: string) => {
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setTextColor(...PDF_STYLES.lightGray);
  doc.text(title, PDF_STYLES.margins.left, 15);
  doc.setDrawColor(...PDF_STYLES.primaryColor);
  doc.line(PDF_STYLES.margins.left, 18, pageWidth - PDF_STYLES.margins.right, 18);
};

// Helper to check and add new page if needed
const checkNewPage = (doc: jsPDF, y: number, requiredSpace: number = 30): number => {
  if (y > pageHeight - PDF_STYLES.margins.bottom - requiredSpace) {
    doc.addPage();
    return PDF_STYLES.margins.top + 10;
  }
  return y;
};

// Helper to wrap text and return lines
const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  return doc.splitTextToSize(text, maxWidth);
};

// Generate Cover Page
const generateCoverPage = (
  doc: jsPDF,
  title: string,
  subtitle?: string,
  brandName?: string
) => {
  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(250, 250, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  // Decorative top bar
  doc.setFillColor(...PDF_STYLES.primaryColor);
  doc.rect(0, 0, pageWidth, 8, "F");
  
  // Title
  doc.setFontSize(PDF_STYLES.fontSize.title);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  
  const titleLines = wrapText(doc, title, contentWidth);
  let y = 100;
  titleLines.forEach((line) => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 12;
  });
  
  // Subtitle
  if (subtitle) {
    y += 5;
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(...PDF_STYLES.lightGray);
    doc.setFont("helvetica", "normal");
    const subtitleLines = wrapText(doc, subtitle, contentWidth);
    subtitleLines.forEach((line) => {
      doc.text(line, pageWidth / 2, y, { align: "center" });
      y += 7;
    });
  }
  
  // Brand name at bottom
  if (brandName) {
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.accentColor);
    doc.text(brandName, pageWidth / 2, pageHeight - 40, { align: "center" });
  }
  
  // Decorative bottom bar
  doc.setFillColor(...PDF_STYLES.accentColor);
  doc.rect(0, pageHeight - 8, pageWidth, 8, "F");
};

// Generate Guide PDF
export const generateGuidePDF = (
  content: ToolkitContent["guide"],
  title: string,
  subtitle?: string
): jsPDF => {
  const doc = new jsPDF();
  
  // Cover page
  generateCoverPage(doc, title, subtitle);
  
  if (!content) return doc;
  
  // Table of Contents
  doc.addPage();
  let y = PDF_STYLES.margins.top;
  
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Table of Contents", PDF_STYLES.margins.left, y);
  y += 15;
  
  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "normal");
  
  content.sections.forEach((section, index) => {
    doc.text(`${index + 1}. ${section.heading}`, PDF_STYLES.margins.left + 5, y);
    y += 8;
  });
  
  // Content sections
  let pageNum = 2;
  content.sections.forEach((section, index) => {
    doc.addPage();
    pageNum++;
    addHeader(doc, title);
    y = PDF_STYLES.margins.top + 15;
    
    // Section heading
    doc.setFontSize(PDF_STYLES.fontSize.heading);
    doc.setTextColor(...PDF_STYLES.primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${section.heading}`, PDF_STYLES.margins.left, y);
    y += 12;
    
    // Section content
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    
    const contentLines = wrapText(doc, section.content, contentWidth);
    contentLines.forEach((line) => {
      y = checkNewPage(doc, y);
      if (y === PDF_STYLES.margins.top + 10) {
        pageNum++;
        addHeader(doc, title);
        y += 5;
      }
      doc.text(line, PDF_STYLES.margins.left, y);
      y += PDF_STYLES.lineHeight;
    });
    
    addPageNumber(doc, pageNum);
  });
  
  return doc;
};

// Generate Worksheet PDF
export const generateWorksheetPDF = (
  content: ToolkitContent["worksheet"],
  title: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title} - Worksheet`);
  
  if (!content) return doc;
  
  let pageNum = 1;
  content.exercises.forEach((exercise, index) => {
    doc.addPage();
    pageNum++;
    addHeader(doc, `${title} - Worksheet`);
    let y = PDF_STYLES.margins.top + 15;
    
    // Exercise title
    doc.setFontSize(PDF_STYLES.fontSize.heading);
    doc.setTextColor(...PDF_STYLES.primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`Exercise ${index + 1}: ${exercise.title}`, PDF_STYLES.margins.left, y);
    y += 12;
    
    // Instructions
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "italic");
    const instructionLines = wrapText(doc, exercise.instructions, contentWidth);
    instructionLines.forEach((line) => {
      doc.text(line, PDF_STYLES.margins.left, y);
      y += PDF_STYLES.lineHeight;
    });
    y += 10;
    
    // Fields (fill-in areas)
    doc.setFont("helvetica", "normal");
    exercise.fields.forEach((field) => {
      y = checkNewPage(doc, y, 40);
      if (y === PDF_STYLES.margins.top + 10) {
        pageNum++;
        addHeader(doc, `${title} - Worksheet`);
        y += 5;
      }
      
      doc.setFontSize(PDF_STYLES.fontSize.body);
      doc.setTextColor(...PDF_STYLES.textColor);
      doc.text(`${field}:`, PDF_STYLES.margins.left, y);
      y += 8;
      
      // Draw lines for writing
      doc.setDrawColor(...PDF_STYLES.lightGray);
      for (let i = 0; i < 3; i++) {
        doc.line(PDF_STYLES.margins.left, y, pageWidth - PDF_STYLES.margins.right, y);
        y += 10;
      }
      y += 5;
    });
    
    addPageNumber(doc, pageNum);
  });
  
  return doc;
};

// Generate Checklist PDF
export const generateChecklistPDF = (
  content: ToolkitContent["checklist"],
  title: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title} - Checklist`);
  
  if (!content) return doc;
  
  doc.addPage();
  addHeader(doc, `${title} - Checklist`);
  let y = PDF_STYLES.margins.top + 15;
  let pageNum = 2;
  
  // Checklist title
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(content.title, PDF_STYLES.margins.left, y);
  y += 15;
  
  // Checklist items
  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "normal");
  
  content.items.forEach((item) => {
    y = checkNewPage(doc, y, 15);
    if (y === PDF_STYLES.margins.top + 10) {
      pageNum++;
      addHeader(doc, `${title} - Checklist`);
      y += 5;
    }
    
    // Draw checkbox
    doc.setDrawColor(...PDF_STYLES.primaryColor);
    doc.rect(PDF_STYLES.margins.left, y - 4, 5, 5);
    
    // Item text
    const itemLines = wrapText(doc, item, contentWidth - 12);
    itemLines.forEach((line, lineIndex) => {
      doc.text(line, PDF_STYLES.margins.left + 10, y + (lineIndex * PDF_STYLES.lineHeight));
    });
    
    y += Math.max(itemLines.length * PDF_STYLES.lineHeight, 10) + 3;
  });
  
  addPageNumber(doc, pageNum);
  
  return doc;
};

// Generate Resource List PDF
export const generateResourceListPDF = (
  content: ToolkitContent["resourceList"],
  title: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title} - Resource List`);
  
  if (!content) return doc;
  
  doc.addPage();
  addHeader(doc, `${title} - Resources`);
  let y = PDF_STYLES.margins.top + 15;
  let pageNum = 2;
  
  // Resource list title
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(content.title, PDF_STYLES.margins.left, y);
  y += 15;
  
  content.resources.forEach((resource) => {
    y = checkNewPage(doc, y, 25);
    if (y === PDF_STYLES.margins.top + 10) {
      pageNum++;
      addHeader(doc, `${title} - Resources`);
      y += 5;
    }
    
    // Resource name
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(...PDF_STYLES.accentColor);
    doc.setFont("helvetica", "bold");
    doc.text(`• ${resource.name}`, PDF_STYLES.margins.left, y);
    y += 7;
    
    // Description
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    const descLines = wrapText(doc, resource.description, contentWidth - 10);
    descLines.forEach((line) => {
      doc.text(line, PDF_STYLES.margins.left + 5, y);
      y += PDF_STYLES.lineHeight;
    });
    
    // URL if available
    if (resource.url) {
      doc.setTextColor(...PDF_STYLES.primaryColor);
      doc.setFontSize(PDF_STYLES.fontSize.small);
      doc.text(resource.url, PDF_STYLES.margins.left + 5, y);
      y += 8;
    }
    
    y += 5;
  });
  
  addPageNumber(doc, pageNum);
  
  return doc;
};

// Generate Templates PDF
export const generateTemplatesPDF = (
  content: ToolkitContent["templates"],
  title: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title} - Templates`);
  
  if (!content) return doc;
  
  let pageNum = 1;
  content.templates.forEach((template, index) => {
    doc.addPage();
    pageNum++;
    addHeader(doc, `${title} - Templates`);
    let y = PDF_STYLES.margins.top + 15;
    
    // Template name
    doc.setFontSize(PDF_STYLES.fontSize.heading);
    doc.setTextColor(...PDF_STYLES.primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`Template ${index + 1}: ${template.name}`, PDF_STYLES.margins.left, y);
    y += 15;
    
    // Template content
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    
    const contentLines = wrapText(doc, template.content, contentWidth);
    contentLines.forEach((line) => {
      y = checkNewPage(doc, y);
      if (y === PDF_STYLES.margins.top + 10) {
        pageNum++;
        addHeader(doc, `${title} - Templates`);
        y += 5;
      }
      doc.text(line, PDF_STYLES.margins.left, y);
      y += PDF_STYLES.lineHeight;
    });
    
    addPageNumber(doc, pageNum);
  });
  
  return doc;
};

// Generate Quiz PDF
export const generateQuizPDF = (
  content: ToolkitContent["quiz"],
  title: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title} - Self-Assessment Quiz`);
  
  if (!content) return doc;
  
  doc.addPage();
  addHeader(doc, `${title} - Quiz`);
  let y = PDF_STYLES.margins.top + 15;
  let pageNum = 2;
  
  // Quiz title
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(content.title, PDF_STYLES.margins.left, y);
  y += 15;
  
  // Questions
  content.questions.forEach((q, index) => {
    y = checkNewPage(doc, y, 40);
    if (y === PDF_STYLES.margins.top + 10) {
      pageNum++;
      addHeader(doc, `${title} - Quiz`);
      y += 5;
    }
    
    // Question
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "bold");
    const questionLines = wrapText(doc, `${index + 1}. ${q.question}`, contentWidth);
    questionLines.forEach((line) => {
      doc.text(line, PDF_STYLES.margins.left, y);
      y += 7;
    });
    y += 3;
    
    // Options
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setFont("helvetica", "normal");
    q.options.forEach((option, optIndex) => {
      const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
      doc.setDrawColor(...PDF_STYLES.lightGray);
      doc.circle(PDF_STYLES.margins.left + 3, y - 1.5, 2);
      doc.text(`${optionLabel}. ${option}`, PDF_STYLES.margins.left + 10, y);
      y += 8;
    });
    
    y += 8;
  });
  
  // Answer Key on last page
  doc.addPage();
  pageNum++;
  addHeader(doc, `${title} - Quiz`);
  y = PDF_STYLES.margins.top + 15;
  
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Answer Key", PDF_STYLES.margins.left, y);
  y += 15;
  
  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "normal");
  
  content.questions.forEach((q, index) => {
    const correctLetter = String.fromCharCode(65 + q.correctIndex);
    doc.text(`${index + 1}. ${correctLetter}`, PDF_STYLES.margins.left, y);
    y += 8;
  });
  
  addPageNumber(doc, pageNum);
  
  return doc;
};

// Generate all PDFs for a toolkit
export const generateAllPDFs = async (
  title: string,
  subtitle: string | undefined,
  content: ToolkitContent,
  components: ToolkitComponents
): Promise<{ name: string; pdf: jsPDF }[]> => {
  const pdfs: { name: string; pdf: jsPDF }[] = [];
  
  // Always generate the main guide
  if (content.guide) {
    pdfs.push({
      name: "Guide.pdf",
      pdf: generateGuidePDF(content.guide, title, subtitle),
    });
  }
  
  if (components.worksheet && content.worksheet) {
    pdfs.push({
      name: "Worksheet.pdf",
      pdf: generateWorksheetPDF(content.worksheet, title),
    });
  }
  
  if (components.checklist && content.checklist) {
    pdfs.push({
      name: "Checklist.pdf",
      pdf: generateChecklistPDF(content.checklist, title),
    });
  }
  
  if (components.resourceList && content.resourceList) {
    pdfs.push({
      name: "Resource-List.pdf",
      pdf: generateResourceListPDF(content.resourceList, title),
    });
  }
  
  if (components.templates && content.templates) {
    pdfs.push({
      name: "Templates.pdf",
      pdf: generateTemplatesPDF(content.templates, title),
    });
  }
  
  if (components.quiz && content.quiz) {
    pdfs.push({
      name: "Quiz.pdf",
      pdf: generateQuizPDF(content.quiz, title),
    });
  }
  
  return pdfs;
};
