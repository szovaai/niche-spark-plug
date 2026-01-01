import jsPDF from "jspdf";
import { ToolkitContent, ToolkitComponents } from "@/types/toolkit";
import { sanitizeForPDF } from "./textSanitizer";

// PDF Styling Constants - Modern Premium Design (Solana Ocean Glass Blue Theme)
const PDF_STYLES = {
  // Primary ocean blue theme
  primaryColor: [0, 120, 212] as [number, number, number], // Ocean Blue
  accentColor: [236, 72, 153] as [number, number, number], // Magenta/Pink accent
  secondaryColor: [56, 189, 248] as [number, number, number], // Light cyan
  
  // Text colors
  textColor: [15, 23, 42] as [number, number, number], // Slate 900
  textMuted: [100, 116, 139] as [number, number, number], // Slate 500
  textLight: [148, 163, 184] as [number, number, number], // Slate 400
  
  // Background colors
  bgLight: [248, 250, 252] as [number, number, number], // Slate 50
  bgCard: [241, 245, 249] as [number, number, number], // Slate 100
  white: [255, 255, 255] as [number, number, number],
  
  // Dark theme accents
  darkNavy: [15, 23, 42] as [number, number, number], // For headers
  
  fontSize: {
    hero: 36,
    title: 28,
    heading: 18,
    subheading: 13,
    body: 10.5,
    small: 9,
    tiny: 7.5,
  },
  margins: {
    top: 30,
    bottom: 25,
    left: 22,
    right: 22,
  },
  lineHeight: 5.5,
};

const pageWidth = 210; // A4 width in mm
const pageHeight = 297; // A4 height in mm
const contentWidth = pageWidth - PDF_STYLES.margins.left - PDF_STYLES.margins.right;

// Helper to add modern page numbers
const addPageNumber = (doc: jsPDF, pageNum: number, totalPages?: number) => {
  doc.setFontSize(PDF_STYLES.fontSize.tiny);
  doc.setTextColor(...PDF_STYLES.textLight);
  const pageText = totalPages ? `${pageNum} / ${totalPages}` : `${pageNum}`;
  doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: "center" });
};

// Helper to add minimal footer
const addFooter = (doc: jsPDF, authorName?: string) => {
  // Thin accent line
  doc.setDrawColor(...PDF_STYLES.primaryColor);
  doc.setLineWidth(0.2);
  doc.line(PDF_STYLES.margins.left, pageHeight - 18, pageWidth - PDF_STYLES.margins.right, pageHeight - 18);
  
  if (authorName) {
    doc.setFontSize(PDF_STYLES.fontSize.tiny);
    doc.setTextColor(...PDF_STYLES.textLight);
    doc.text(`© ${new Date().getFullYear()} ${authorName}`, PDF_STYLES.margins.left, pageHeight - 12);
  }
};

// Helper to add modern header bar
const addHeader = (doc: jsPDF, title: string, authorName?: string) => {
  // Clean top border
  doc.setFillColor(...PDF_STYLES.primaryColor);
  doc.rect(0, 0, pageWidth, 3, "F");
  
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), PDF_STYLES.margins.left, 14);
  
  if (authorName) {
    doc.setTextColor(...PDF_STYLES.textMuted);
    doc.setFont("helvetica", "normal");
    doc.text(authorName, pageWidth - PDF_STYLES.margins.right, 14, { align: "right" });
  }
};

// Helper to check and add new page if needed
const checkNewPage = (doc: jsPDF, y: number, requiredSpace: number = 30): number => {
  if (y > pageHeight - PDF_STYLES.margins.bottom - requiredSpace) {
    doc.addPage();
    return PDF_STYLES.margins.top + 10;
  }
  return y;
};

// Helper to wrap text and return lines (with sanitization)
const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  return doc.splitTextToSize(sanitizeForPDF(text), maxWidth);
};

// Helper to draw a modern card box
const drawModernCard = (doc: jsPDF, x: number, y: number, width: number, height: number, accentLeft: boolean = false) => {
  // Subtle shadow effect (light gray background offset)
  doc.setFillColor(230, 235, 240);
  doc.roundedRect(x + 1, y + 1, width, height, 2, 2, "F");
  
  // Main card
  doc.setFillColor(...PDF_STYLES.white);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 2, 2, "FD");
  
  // Left accent bar
  if (accentLeft) {
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.roundedRect(x, y, 3, height, 2, 0, "F");
  }
};

// Helper to add a callout box
const addCalloutBox = (doc: jsPDF, text: string, type: "tip" | "note" | "important", y: number): number => {
  const labels = { tip: "PRO TIP", note: "NOTE", important: "KEY POINT" };
  const colors = { 
    tip: PDF_STYLES.accentColor, 
    note: PDF_STYLES.secondaryColor, 
    important: PDF_STYLES.primaryColor 
  };
  
  const lines = wrapText(doc, text, contentWidth - 20);
  const boxHeight = 18 + lines.length * 5;
  
  drawModernCard(doc, PDF_STYLES.margins.left, y, contentWidth, boxHeight, true);
  
  // Override accent color based on type
  doc.setFillColor(...colors[type]);
  doc.roundedRect(PDF_STYLES.margins.left, y, 3, boxHeight, 2, 0, "F");
  
  doc.setFontSize(PDF_STYLES.fontSize.tiny);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors[type]);
  doc.text(labels[type], PDF_STYLES.margins.left + 10, y + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFontSize(PDF_STYLES.fontSize.body);
  lines.forEach((line, i) => {
    doc.text(line, PDF_STYLES.margins.left + 10, y + 15 + (i * 5));
  });
  
  return y + boxHeight + 8;
};

// Generate Modern Cover Page
const generateCoverPage = (
  doc: jsPDF,
  title: string,
  subtitle?: string,
  authorName?: string
) => {
  // Full page dark navy gradient background
  doc.setFillColor(...PDF_STYLES.darkNavy);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  // Decorative gradient overlay (simulated with shapes)
  doc.setFillColor(30, 64, 175); // Blue 800
  doc.circle(-30, 50, 120, "F");
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.circle(pageWidth + 40, pageHeight - 80, 150, "F");
  
  // Accent geometric shape
  doc.setFillColor(236, 72, 153, 40); // Pink with transparency simulated
  doc.circle(pageWidth - 30, 80, 40, "F");
  
  // Top accent line
  doc.setFillColor(...PDF_STYLES.secondaryColor);
  doc.rect(0, 0, pageWidth, 4, "F");
  
  // Main content card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(25, 85, pageWidth - 50, 130, 8, 8, "F");
  
  // Card border
  doc.setDrawColor(...PDF_STYLES.primaryColor);
  doc.setLineWidth(1);
  doc.roundedRect(25, 85, pageWidth - 50, 130, 8, 8, "S");
  
  // Title
  doc.setFontSize(PDF_STYLES.fontSize.hero);
  doc.setTextColor(...PDF_STYLES.darkNavy);
  doc.setFont("helvetica", "bold");
  
  const titleLines = wrapText(doc, title, contentWidth - 30);
  let y = 125;
  titleLines.forEach((line) => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 16;
  });
  
  // Divider line
  doc.setDrawColor(...PDF_STYLES.primaryColor);
  doc.setLineWidth(2);
  doc.line(pageWidth / 2 - 25, y + 5, pageWidth / 2 + 25, y + 5);
  y += 20;
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(...PDF_STYLES.textMuted);
    doc.setFont("helvetica", "normal");
    const subtitleLines = wrapText(doc, subtitle, contentWidth - 30);
    subtitleLines.forEach((line) => {
      doc.text(line, pageWidth / 2, y, { align: "center" });
      y += 7;
    });
  }
  
  // Author section at bottom
  if (authorName) {
    // Author card
    doc.setFillColor(...PDF_STYLES.white);
    doc.roundedRect(pageWidth / 2 - 45, 235, 90, 30, 4, 4, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(pageWidth / 2 - 45, 235, 90, 30, 4, 4, "S");
    
    doc.setFontSize(PDF_STYLES.fontSize.tiny);
    doc.setTextColor(...PDF_STYLES.textMuted);
    doc.text("CREATED BY", pageWidth / 2, 247, { align: "center" });
    
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "bold");
    doc.text(authorName, pageWidth / 2, 258, { align: "center" });
  }
  
  // Bottom accent bar
  doc.setFillColor(...PDF_STYLES.primaryColor);
  doc.rect(0, pageHeight - 8, pageWidth, 8, "F");
  
  // Year watermark
  doc.setFontSize(PDF_STYLES.fontSize.tiny);
  doc.setTextColor(255, 255, 255);
  doc.text(`© ${new Date().getFullYear()}`, pageWidth / 2, pageHeight - 2, { align: "center" });
};

// Generate Guide PDF with enhanced formatting
export const generateGuidePDF = (
  content: ToolkitContent["guide"],
  title: string,
  subtitle?: string,
  authorName?: string
): jsPDF => {
  const doc = new jsPDF();
  
  // Cover page
  generateCoverPage(doc, title, subtitle, authorName);
  
  if (!content) return doc;
  
  // Table of Contents
  doc.addPage();
  addHeader(doc, title, authorName);
  let y = PDF_STYLES.margins.top + 20;
  
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("📖 Table of Contents", PDF_STYLES.margins.left, y);
  y += 5;
  
  // Decorative line under TOC title
  doc.setDrawColor(...PDF_STYLES.accentColor);
  doc.setLineWidth(0.5);
  doc.line(PDF_STYLES.margins.left, y, PDF_STYLES.margins.left + 60, y);
  y += 12;
  
  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "normal");
  
  content.sections.forEach((section, index) => {
    // Chapter number in accent color
    doc.setTextColor(...PDF_STYLES.primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}.`, PDF_STYLES.margins.left + 5, y);
    
    // Chapter title - sanitized
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    doc.text(sanitizeForPDF(section.heading), PDF_STYLES.margins.left + 15, y);
    
    // Dotted line to page number
    doc.setDrawColor(...PDF_STYLES.textLight);
    doc.setLineDashPattern([1, 2], 0);
    const textWidth = doc.getTextWidth(section.heading);
    doc.line(PDF_STYLES.margins.left + 18 + textWidth, y, pageWidth - PDF_STYLES.margins.right - 10, y);
    doc.setLineDashPattern([], 0);
    
    // Page number
    doc.text(`${index + 3}`, pageWidth - PDF_STYLES.margins.right - 5, y, { align: "right" });
    y += 10;
  });
  
  addFooter(doc, authorName);
  addPageNumber(doc, 2);
  
  // Content sections
  let pageNum = 2;
  content.sections.forEach((section, index) => {
    doc.addPage();
    pageNum++;
    addHeader(doc, title, authorName);
    y = PDF_STYLES.margins.top + 25;
    
    // Chapter number badge
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.circle(PDF_STYLES.margins.left + 8, y - 3, 8, "F");
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}`, PDF_STYLES.margins.left + 8, y, { align: "center" });
    
    // Section heading - sanitized
    doc.setFontSize(PDF_STYLES.fontSize.heading);
    doc.setTextColor(...PDF_STYLES.primaryColor);
    doc.setFont("helvetica", "bold");
    const sanitizedHeading = sanitizeForPDF(section.heading);
    doc.text(sanitizedHeading, PDF_STYLES.margins.left + 20, y);
    y += 5;
    
    // Underline
    doc.setDrawColor(...PDF_STYLES.accentColor);
    doc.setLineWidth(0.5);
    doc.line(PDF_STYLES.margins.left + 20, y, PDF_STYLES.margins.left + 20 + doc.getTextWidth(sanitizedHeading), y);
    y += 15;
    
    // Section content with paragraph formatting
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    
    // Split content into paragraphs
    const paragraphs = section.content.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach((paragraph, pIndex) => {
      // Check if it's a bullet point or list item
      if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
        const items = paragraph.split('\n').filter(i => i.trim());
        items.forEach(item => {
          y = checkNewPage(doc, y, 15);
          if (y === PDF_STYLES.margins.top + 15) {
            pageNum++;
            addHeader(doc, title, authorName);
          }
          
          // Bullet point
          doc.setFillColor(...PDF_STYLES.accentColor);
          doc.circle(PDF_STYLES.margins.left + 3, y - 1.5, 1.5, "F");
          
          const itemText = item.replace(/^[-•]\s*/, '');
          const itemLines = wrapText(doc, itemText, contentWidth - 12);
          itemLines.forEach((line, lineIndex) => {
            doc.text(line, PDF_STYLES.margins.left + 10, y + (lineIndex * PDF_STYLES.lineHeight));
          });
          y += itemLines.length * PDF_STYLES.lineHeight + 2;
        });
      } else {
        // Regular paragraph
        const contentLines = wrapText(doc, paragraph, contentWidth);
        contentLines.forEach((line) => {
          y = checkNewPage(doc, y, 10);
          if (y === PDF_STYLES.margins.top + 15) {
            pageNum++;
            addHeader(doc, title, authorName);
          }
          doc.text(line, PDF_STYLES.margins.left, y);
          y += PDF_STYLES.lineHeight;
        });
        y += 4; // Paragraph spacing
      }
    });
    
    addFooter(doc, authorName);
    addPageNumber(doc, pageNum);
  });
  
  return doc;
};

// Generate Enhanced Worksheet PDF
export const generateWorksheetPDF = (
  content: ToolkitContent["worksheet"],
  title: string,
  authorName?: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title}`, "Interactive Worksheet", authorName);
  
  if (!content) return doc;
  
  let pageNum = 1;
  content.exercises.forEach((exercise, index) => {
    doc.addPage();
    pageNum++;
    addHeader(doc, `${title} - Worksheet`, authorName);
    let y = PDF_STYLES.margins.top + 25;
    
    // Exercise number with decorative background
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.roundedRect(PDF_STYLES.margins.left, y - 8, contentWidth, 18, 3, 3, "F");
    
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`✏️ Exercise ${index + 1}: ${exercise.title}`, PDF_STYLES.margins.left + 5, y + 2);
    y += 20;
    
    // Instructions box
    doc.setFillColor(...PDF_STYLES.bgCard);
    const instructionLines = wrapText(doc, exercise.instructions, contentWidth - 15);
    const instructionHeight = 15 + (instructionLines.length * 6);
    doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, instructionHeight, 2, 2, "F");
    
    doc.setFontSize(PDF_STYLES.fontSize.small);
    doc.setTextColor(...PDF_STYLES.accentColor);
    doc.setFont("helvetica", "bold");
    doc.text("📋 Instructions:", PDF_STYLES.margins.left + 5, y + 8);
    
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "italic");
    instructionLines.forEach((line, i) => {
      doc.text(line, PDF_STYLES.margins.left + 5, y + 16 + (i * 6));
    });
    y += instructionHeight + 10;
    
    // Fields (fill-in areas) with enhanced styling
    doc.setFont("helvetica", "normal");
    exercise.fields.forEach((field, fieldIndex) => {
      y = checkNewPage(doc, y, 50);
      if (y === PDF_STYLES.margins.top + 15) {
        pageNum++;
        addHeader(doc, `${title} - Worksheet`, authorName);
        y += 10;
      }
      
      // Field label with number
      doc.setFillColor(...PDF_STYLES.accentColor);
      doc.circle(PDF_STYLES.margins.left + 3, y, 3, "F");
      doc.setFontSize(PDF_STYLES.fontSize.tiny);
      doc.setTextColor(255, 255, 255);
      doc.text(`${fieldIndex + 1}`, PDF_STYLES.margins.left + 3, y + 1, { align: "center" });
      
      doc.setFontSize(PDF_STYLES.fontSize.body);
      doc.setTextColor(...PDF_STYLES.textColor);
      doc.setFont("helvetica", "bold");
      doc.text(`${field}:`, PDF_STYLES.margins.left + 10, y + 1);
      y += 10;
      
      // Writing area with box
      doc.setDrawColor(...PDF_STYLES.textLight);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, 30, 2, 2, "FD");
      
      // Faint lines inside the box
      doc.setDrawColor(230, 230, 235);
      for (let i = 1; i <= 3; i++) {
        doc.line(PDF_STYLES.margins.left + 5, y + (i * 7), pageWidth - PDF_STYLES.margins.right - 5, y + (i * 7));
      }
      
      y += 38;
    });
    
    addFooter(doc, authorName);
    addPageNumber(doc, pageNum);
  });
  
  return doc;
};

// Generate Enhanced Checklist PDF
export const generateChecklistPDF = (
  content: ToolkitContent["checklist"],
  title: string,
  authorName?: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title}`, "Action Checklist", authorName);
  
  if (!content) return doc;
  
  doc.addPage();
  addHeader(doc, `${title} - Checklist`, authorName);
  let y = PDF_STYLES.margins.top + 25;
  let pageNum = 2;
  
  // Checklist title with icon
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(`✅ ${content.title}`, PDF_STYLES.margins.left, y);
  y += 5;
  
  // Progress tracker bar
  doc.setDrawColor(...PDF_STYLES.textLight);
  doc.setFillColor(...PDF_STYLES.bgCard);
  doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, 8, 2, 2, "FD");
  doc.setFontSize(PDF_STYLES.fontSize.tiny);
  doc.setTextColor(...PDF_STYLES.textLight);
  doc.text(`Track your progress: ${content.items.length} items to complete`, PDF_STYLES.margins.left + 5, y + 5);
  y += 18;
  
  // Checklist items with enhanced checkboxes
  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "normal");
  
  content.items.forEach((item, index) => {
    y = checkNewPage(doc, y, 18);
    if (y === PDF_STYLES.margins.top + 15) {
      pageNum++;
      addHeader(doc, `${title} - Checklist`, authorName);
      y += 10;
    }
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(...PDF_STYLES.bgCard);
      doc.rect(PDF_STYLES.margins.left, y - 5, contentWidth, 12, "F");
    }
    
    // Stylish checkbox
    doc.setDrawColor(...PDF_STYLES.primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(PDF_STYLES.margins.left + 2, y - 4, 6, 6, 1, 1, "S");
    
    // Item number
    doc.setFontSize(PDF_STYLES.fontSize.tiny);
    doc.setTextColor(...PDF_STYLES.textLight);
    doc.text(`${index + 1}.`, PDF_STYLES.margins.left + 12, y);
    
    // Item text
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    const itemLines = wrapText(doc, item, contentWidth - 25);
    itemLines.forEach((line, lineIndex) => {
      doc.text(line, PDF_STYLES.margins.left + 20, y + (lineIndex * PDF_STYLES.lineHeight));
    });
    
    y += Math.max(itemLines.length * PDF_STYLES.lineHeight, 10) + 5;
  });
  
  // Completion section
  y += 10;
  y = checkNewPage(doc, y, 40);
  drawModernCard(doc, PDF_STYLES.margins.left, y, contentWidth, 35, true);
  doc.setFontSize(PDF_STYLES.fontSize.subheading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("🎉 Completion Notes", PDF_STYLES.margins.left + 10, y + 10);
  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textMuted);
  doc.setFont("helvetica", "italic");
  doc.text("Date completed: _______________", PDF_STYLES.margins.left + 10, y + 22);
  doc.text("Key takeaway: _______________________________________________", PDF_STYLES.margins.left + 10, y + 30);
  
  addFooter(doc, authorName);
  addPageNumber(doc, pageNum);
  
  return doc;
};

// Generate Enhanced Resource List PDF
export const generateResourceListPDF = (
  content: ToolkitContent["resourceList"],
  title: string,
  authorName?: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title}`, "Curated Resource List", authorName);
  
  if (!content) return doc;
  
  doc.addPage();
  addHeader(doc, `${title} - Resources`, authorName);
  let y = PDF_STYLES.margins.top + 25;
  let pageNum = 2;
  
  // Resource list title
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(`📚 ${content.title}`, PDF_STYLES.margins.left, y);
  y += 15;
  
  content.resources.forEach((resource, index) => {
    y = checkNewPage(doc, y, 35);
    if (y === PDF_STYLES.margins.top + 15) {
      pageNum++;
      addHeader(doc, `${title} - Resources`, authorName);
      y += 10;
    }
    
    // Resource card
    const descLines = wrapText(doc, resource.description, contentWidth - 15);
    const cardHeight = 25 + (descLines.length * 5) + (resource.url ? 8 : 0);
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...PDF_STYLES.primaryColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, cardHeight, 3, 3, "FD");
    
    // Resource number badge
    doc.setFillColor(...PDF_STYLES.accentColor);
    doc.circle(PDF_STYLES.margins.left + 10, y + 10, 6, "F");
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}`, PDF_STYLES.margins.left + 10, y + 12, { align: "center" });
    
    // Resource name
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(...PDF_STYLES.primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(resource.name, PDF_STYLES.margins.left + 22, y + 12);
    
    // Description
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    let descY = y + 22;
    descLines.forEach((line) => {
      doc.text(line, PDF_STYLES.margins.left + 10, descY);
      descY += 5;
    });
    
    // URL if available
    if (resource.url) {
      doc.setTextColor(...PDF_STYLES.accentColor);
      doc.setFontSize(PDF_STYLES.fontSize.small);
      doc.text(`🔗 ${resource.url}`, PDF_STYLES.margins.left + 10, descY + 3);
    }
    
    y += cardHeight + 8;
  });
  
  addFooter(doc, authorName);
  addPageNumber(doc, pageNum);
  
  return doc;
};

// Generate Enhanced Templates PDF
export const generateTemplatesPDF = (
  content: ToolkitContent["templates"],
  title: string,
  authorName?: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title}`, "Ready-to-Use Templates", authorName);
  
  if (!content) return doc;
  
  let pageNum = 1;
  content.templates.forEach((template, index) => {
    doc.addPage();
    pageNum++;
    addHeader(doc, `${title} - Templates`, authorName);
    let y = PDF_STYLES.margins.top + 25;
    
    // Template header with number
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.roundedRect(PDF_STYLES.margins.left, y - 8, contentWidth, 18, 3, 3, "F");
    
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`📝 Template ${index + 1}: ${template.name}`, PDF_STYLES.margins.left + 5, y + 2);
    y += 20;
    
    // Copy instruction
    doc.setFillColor(...PDF_STYLES.bgCard);
    doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, 12, 2, 2, "F");
    doc.setFontSize(PDF_STYLES.fontSize.small);
    doc.setTextColor(...PDF_STYLES.accentColor);
    doc.setFont("helvetica", "italic");
    doc.text("✨ Copy and customize this template for your needs", PDF_STYLES.margins.left + 5, y + 7);
    y += 18;
    
    // Template content in a styled box
    doc.setDrawColor(...PDF_STYLES.primaryColor);
    doc.setLineWidth(0.3);
    
    const contentLines = wrapText(doc, template.content, contentWidth - 15);
    const boxHeight = Math.min(contentLines.length * 6 + 15, pageHeight - y - 50);
    
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, boxHeight, 2, 2, "FD");
    
    // Left accent bar
    doc.setFillColor(...PDF_STYLES.accentColor);
    doc.rect(PDF_STYLES.margins.left, y, 3, boxHeight, "F");
    
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    
    let contentY = y + 10;
    contentLines.forEach((line) => {
      if (contentY < y + boxHeight - 5) {
        doc.text(line, PDF_STYLES.margins.left + 8, contentY);
        contentY += PDF_STYLES.lineHeight;
      }
    });
    
    // If content overflows, continue on next page
    if (contentLines.length * 6 > boxHeight - 15) {
      const remainingLines = contentLines.slice(Math.floor((boxHeight - 15) / 6));
      
      doc.addPage();
      pageNum++;
      addHeader(doc, `${title} - Templates`, authorName);
      y = PDF_STYLES.margins.top + 25;
      
      doc.setFontSize(PDF_STYLES.fontSize.small);
      doc.setTextColor(...PDF_STYLES.textMuted);
      doc.setFont("helvetica", "italic");
      doc.text(`(${template.name} continued)`, PDF_STYLES.margins.left, y);
      y += 10;
      
      const remainingBoxHeight = remainingLines.length * 6 + 15;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...PDF_STYLES.primaryColor);
      doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, remainingBoxHeight, 2, 2, "FD");
      doc.setFillColor(...PDF_STYLES.accentColor);
      doc.rect(PDF_STYLES.margins.left, y, 3, remainingBoxHeight, "F");
      
      doc.setFontSize(PDF_STYLES.fontSize.body);
      doc.setTextColor(...PDF_STYLES.textColor);
      doc.setFont("helvetica", "normal");
      
      contentY = y + 10;
      remainingLines.forEach((line) => {
        doc.text(line, PDF_STYLES.margins.left + 8, contentY);
        contentY += PDF_STYLES.lineHeight;
      });
    }
    
    addFooter(doc, authorName);
    addPageNumber(doc, pageNum);
  });
  
  return doc;
};

// Generate Enhanced Quiz PDF
export const generateQuizPDF = (
  content: ToolkitContent["quiz"],
  title: string,
  authorName?: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateCoverPage(doc, `${title}`, "Self-Assessment Quiz", authorName);
  
  if (!content) return doc;
  
  doc.addPage();
  addHeader(doc, `${title} - Quiz`, authorName);
  let y = PDF_STYLES.margins.top + 25;
  let pageNum = 2;
  
  // Quiz title and instructions
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(`🧠 ${content.title}`, PDF_STYLES.margins.left, y);
  y += 10;
  
  // Instructions box
  doc.setFillColor(...PDF_STYLES.bgCard);
  doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, 15, 2, 2, "F");
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setTextColor(...PDF_STYLES.textMuted);
  doc.setFont("helvetica", "italic");
  doc.text("Circle the best answer for each question. Check your answers at the end!", PDF_STYLES.margins.left + 5, y + 9);
  y += 25;
  
  // Questions
  content.questions.forEach((q, index) => {
    y = checkNewPage(doc, y, 50);
    if (y === PDF_STYLES.margins.top + 15) {
      pageNum++;
      addHeader(doc, `${title} - Quiz`, authorName);
      y += 10;
    }
    
    // Question number badge
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.circle(PDF_STYLES.margins.left + 6, y, 6, "F");
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}`, PDF_STYLES.margins.left + 6, y + 1.5, { align: "center" });
    
    // Question text
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "bold");
    const questionLines = wrapText(doc, q.question, contentWidth - 20);
    questionLines.forEach((line, lineIdx) => {
      doc.text(line, PDF_STYLES.margins.left + 16, y + 2 + (lineIdx * 7));
    });
    y += questionLines.length * 7 + 8;
    
    // Options with styled circles
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setFont("helvetica", "normal");
    q.options.forEach((option, optIndex) => {
      const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
      
      // Option circle
      doc.setDrawColor(...PDF_STYLES.primaryColor);
      doc.setLineWidth(0.5);
      doc.circle(PDF_STYLES.margins.left + 10, y - 1.5, 4, "S");
      
      // Option label
      doc.setTextColor(...PDF_STYLES.primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text(optionLabel, PDF_STYLES.margins.left + 10, y, { align: "center" });
      
      // Option text
      doc.setTextColor(...PDF_STYLES.textColor);
      doc.setFont("helvetica", "normal");
      doc.text(option, PDF_STYLES.margins.left + 20, y);
      y += 9;
    });
    
    y += 10;
  });
  
  // Answer Key on last page
  doc.addPage();
  pageNum++;
  addHeader(doc, `${title} - Quiz`, authorName);
  y = PDF_STYLES.margins.top + 25;
  
  // Answer key header
  doc.setFillColor(...PDF_STYLES.accentColor);
  doc.roundedRect(PDF_STYLES.margins.left, y - 8, contentWidth, 20, 3, 3, "F");
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("🔑 Answer Key", PDF_STYLES.margins.left + 10, y + 4);
  y += 25;
  
  // Warning to not peek
  doc.setFillColor(...PDF_STYLES.bgCard);
  doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, 12, 2, 2, "F");
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setTextColor(...PDF_STYLES.textMuted);
  doc.setFont("helvetica", "italic");
  doc.text("⚠️ Complete the quiz before checking your answers!", PDF_STYLES.margins.left + 5, y + 8);
  y += 20;
  
  // Answers in a grid layout
  doc.setFontSize(PDF_STYLES.fontSize.body);
  content.questions.forEach((q, index) => {
    const correctLetter = String.fromCharCode(65 + q.correctIndex);
    const col = index % 3;
    const row = Math.floor(index / 3);
    const xPos = PDF_STYLES.margins.left + (col * 55);
    const yPos = y + (row * 12);
    
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    doc.text(`${index + 1}.`, xPos, yPos);
    
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.circle(xPos + 12, yPos - 2, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(correctLetter, xPos + 12, yPos, { align: "center" });
  });
  
  // Score section
  const scoreY = y + Math.ceil(content.questions.length / 3) * 12 + 20;
  drawModernCard(doc, PDF_STYLES.margins.left, scoreY, contentWidth, 40, true);
  doc.setFontSize(PDF_STYLES.fontSize.subheading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("📊 Your Score", PDF_STYLES.margins.left + 10, scoreY + 12);
  
  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "normal");
  doc.text(`Correct answers: _____ / ${content.questions.length}`, PDF_STYLES.margins.left + 5, scoreY + 25);
  doc.text(`Percentage: _____%`, PDF_STYLES.margins.left + 5, scoreY + 35);
  
  addFooter(doc, authorName);
  addPageNumber(doc, pageNum);
  
  return doc;
};

// Generate all PDFs for a toolkit
export const generateAllPDFs = async (
  title: string,
  subtitle: string | undefined,
  content: ToolkitContent,
  components: ToolkitComponents,
  authorName?: string
): Promise<{ name: string; pdf: jsPDF }[]> => {
  const pdfs: { name: string; pdf: jsPDF }[] = [];
  
  // Always generate the main guide
  if (content.guide) {
    pdfs.push({
      name: "Guide.pdf",
      pdf: generateGuidePDF(content.guide, title, subtitle, authorName),
    });
  }
  
  if (components.worksheet && content.worksheet) {
    pdfs.push({
      name: "Worksheet.pdf",
      pdf: generateWorksheetPDF(content.worksheet, title, authorName),
    });
  }
  
  if (components.checklist && content.checklist) {
    pdfs.push({
      name: "Checklist.pdf",
      pdf: generateChecklistPDF(content.checklist, title, authorName),
    });
  }
  
  if (components.resourceList && content.resourceList) {
    pdfs.push({
      name: "Resource-List.pdf",
      pdf: generateResourceListPDF(content.resourceList, title, authorName),
    });
  }
  
  if (components.templates && content.templates) {
    pdfs.push({
      name: "Templates.pdf",
      pdf: generateTemplatesPDF(content.templates, title, authorName),
    });
  }
  
  if (components.quiz && content.quiz) {
    pdfs.push({
      name: "Quiz.pdf",
      pdf: generateQuizPDF(content.quiz, title, authorName),
    });
  }
  
  return pdfs;
};
