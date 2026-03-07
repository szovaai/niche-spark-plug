import jsPDF from "jspdf";
import { ToolkitContent, ToolkitComponents } from "@/types/toolkit";
import { sanitizeForPDF } from "./textSanitizer";

// PDF Styling Constants - Modern Premium Design (Story-Driven Guide Theme)
const PDF_STYLES = {
  // Primary ocean blue theme
  primaryColor: [0, 120, 212] as [number, number, number],
  accentColor: [236, 72, 153] as [number, number, number],
  secondaryColor: [56, 189, 248] as [number, number, number],
  
  // Text colors
  textColor: [15, 23, 42] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],
  textLight: [148, 163, 184] as [number, number, number],
  
  // Background colors
  bgLight: [248, 250, 252] as [number, number, number],
  bgCard: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  
  // Semantic colors
  successColor: [34, 197, 94] as [number, number, number],
  warningColor: [245, 158, 11] as [number, number, number],
  infoColor: [59, 130, 246] as [number, number, number],
  
  // Dark theme accents
  darkNavy: [15, 23, 42] as [number, number, number],
  
  fontSize: {
    hero: 36,
    title: 28,
    chapter: 22,
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

const pageWidth = 210;
const pageHeight = 297;
const contentWidth = pageWidth - PDF_STYLES.margins.left - PDF_STYLES.margins.right;

// Helper to add page numbers
const addPageNumber = (doc: jsPDF, pageNum: number, totalPages?: number) => {
  doc.setFontSize(PDF_STYLES.fontSize.tiny);
  doc.setTextColor(...PDF_STYLES.textLight);
  const pageText = totalPages ? `${pageNum} / ${totalPages}` : `${pageNum}`;
  doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: "center" });
};

// Helper to add footer
const addFooter = (doc: jsPDF, authorName?: string) => {
  doc.setDrawColor(...PDF_STYLES.primaryColor);
  doc.setLineWidth(0.2);
  doc.line(PDF_STYLES.margins.left, pageHeight - 18, pageWidth - PDF_STYLES.margins.right, pageHeight - 18);
  
  if (authorName) {
    doc.setFontSize(PDF_STYLES.fontSize.tiny);
    doc.setTextColor(...PDF_STYLES.textLight);
    doc.text(`© ${new Date().getFullYear()} ${authorName}`, PDF_STYLES.margins.left, pageHeight - 12);
  }
};

// Helper to add header
const addHeader = (doc: jsPDF, title: string, authorName?: string) => {
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

// Helper to check and add new page
const checkNewPage = (doc: jsPDF, y: number, requiredSpace: number = 30): number => {
  if (y > pageHeight - PDF_STYLES.margins.bottom - requiredSpace) {
    doc.addPage();
    return PDF_STYLES.margins.top + 10;
  }
  return y;
};

// Helper to wrap text
const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  return doc.splitTextToSize(sanitizeForPDF(text), maxWidth);
};

// Helper to draw modern card box
const drawModernCard = (doc: jsPDF, x: number, y: number, width: number, height: number, accentLeft: boolean = false) => {
  doc.setFillColor(230, 235, 240);
  doc.roundedRect(x + 1, y + 1, width, height, 2, 2, "F");
  
  doc.setFillColor(...PDF_STYLES.white);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 2, 2, "FD");
  
  if (accentLeft) {
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.roundedRect(x, y, 3, height, 2, 0, "F");
  }
};

// NEW: Draw Key Insight Box
const drawKeyInsightBox = (doc: jsPDF, text: string, y: number): number => {
  const lines = wrapText(doc, text, contentWidth - 25);
  const boxHeight = 18 + lines.length * 5;
  
  // Golden/amber background for insights
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, boxHeight, 3, 3, "FD");
  
  // Lightbulb icon indicator
  doc.setFillColor(245, 158, 11);
  doc.circle(PDF_STYLES.margins.left + 10, y + 9, 5, "F");
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setTextColor(255, 255, 255);
  doc.text("💡", PDF_STYLES.margins.left + 7, y + 11);
  
  doc.setFontSize(PDF_STYLES.fontSize.tiny);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9);
  doc.text("KEY INSIGHT", PDF_STYLES.margins.left + 20, y + 10);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFontSize(PDF_STYLES.fontSize.body);
  lines.forEach((line, i) => {
    doc.text(line, PDF_STYLES.margins.left + 10, y + 18 + (i * 5));
  });
  
  return y + boxHeight + 8;
};

// NEW: Draw Action Checklist Box
const drawActionChecklistBox = (doc: jsPDF, items: string[], y: number, title: string = "ACTION CHECKLIST"): number => {
  const itemHeight = 8;
  const boxHeight = 20 + items.length * itemHeight;
  
  // Green-tinted background for actions
  doc.setFillColor(220, 252, 231);
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, boxHeight, 3, 3, "FD");
  
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 101, 52);
  doc.text(`✓ ${title}`, PDF_STYLES.margins.left + 8, y + 12);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFontSize(PDF_STYLES.fontSize.body);
  
  items.forEach((item, i) => {
    const itemY = y + 22 + (i * itemHeight);
    
    // Checkbox
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.4);
    doc.roundedRect(PDF_STYLES.margins.left + 8, itemY - 4, 5, 5, 1, 1, "S");
    
    // Item text
    const itemText = item.replace(/^☐\s*/, '');
    doc.text(itemText, PDF_STYLES.margins.left + 18, itemY);
  });
  
  return y + boxHeight + 8;
};

// NEW: Draw Reflection Box
const drawReflectionBox = (doc: jsPDF, text: string, y: number): number => {
  const lines = wrapText(doc, text, contentWidth - 20);
  const boxHeight = 25 + lines.length * 5;
  
  // Purple/violet tinted background for reflection
  doc.setFillColor(243, 232, 255);
  doc.setDrawColor(147, 51, 234);
  doc.setLineWidth(0.5);
  doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, boxHeight, 3, 3, "FD");
  
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(107, 33, 168);
  doc.text("📝 REFLECTION", PDF_STYLES.margins.left + 8, y + 12);
  
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFontSize(PDF_STYLES.fontSize.body);
  lines.forEach((line, i) => {
    doc.text(line, PDF_STYLES.margins.left + 10, y + 22 + (i * 5));
  });
  
  return y + boxHeight + 8;
};

// NEW: Draw Your Next Moves Box
const drawNextMovesBox = (doc: jsPDF, text: string, y: number): number => {
  const lines = wrapText(doc, text, contentWidth - 20);
  const boxHeight = 18 + lines.length * 5;
  
  // Blue tinted background
  doc.setFillColor(219, 234, 254);
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, boxHeight, 3, 3, "FD");
  
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("➡️ YOUR NEXT MOVES", PDF_STYLES.margins.left + 8, y + 10);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFontSize(PDF_STYLES.fontSize.body);
  lines.forEach((line, i) => {
    doc.text(line, PDF_STYLES.margins.left + 10, y + 18 + (i * 5));
  });
  
  return y + boxHeight + 10;
};

// NEW: Draw Section Divider (1.1, 1.2 style)
const drawSectionDivider = (doc: jsPDF, sectionNumber: string, sectionTitle: string, y: number): number => {
  doc.setFillColor(...PDF_STYLES.primaryColor);
  doc.roundedRect(PDF_STYLES.margins.left, y, 20, 8, 2, 2, "F");
  
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(sectionNumber, PDF_STYLES.margins.left + 10, y + 5.5, { align: "center" });
  
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFontSize(PDF_STYLES.fontSize.subheading);
  doc.text(sectionTitle, PDF_STYLES.margins.left + 25, y + 5.5);
  
  return y + 15;
};

// NEW: Draw Comparison Table
const drawComparisonTable = (doc: jsPDF, headers: string[], rows: string[][], y: number): number => {
  const colWidth = contentWidth / headers.length;
  const rowHeight = 10;
  const tableHeight = 12 + rows.length * rowHeight;
  
  // Header row
  doc.setFillColor(...PDF_STYLES.primaryColor);
  doc.rect(PDF_STYLES.margins.left, y, contentWidth, 10, "F");
  
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  headers.forEach((header, i) => {
    doc.text(header, PDF_STYLES.margins.left + (i * colWidth) + colWidth / 2, y + 7, { align: "center" });
  });
  
  // Data rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFontSize(PDF_STYLES.fontSize.body);
  
  rows.forEach((row, rowIndex) => {
    const rowY = y + 12 + rowIndex * rowHeight;
    
    // Alternating row colors
    if (rowIndex % 2 === 0) {
      doc.setFillColor(...PDF_STYLES.bgCard);
      doc.rect(PDF_STYLES.margins.left, rowY - 2, contentWidth, rowHeight, "F");
    }
    
    row.forEach((cell, cellIndex) => {
      doc.text(cell, PDF_STYLES.margins.left + (cellIndex * colWidth) + colWidth / 2, rowY + 5, { align: "center" });
    });
  });
  
  // Table border
  doc.setDrawColor(...PDF_STYLES.textLight);
  doc.setLineWidth(0.3);
  doc.rect(PDF_STYLES.margins.left, y, contentWidth, tableHeight, "S");
  
  return y + tableHeight + 10;
};

// Callout box helper
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

// Generate Cover Page
const generateCoverPage = (
  doc: jsPDF,
  title: string,
  subtitle?: string,
  authorName?: string
) => {
  // Full page dark navy gradient background
  doc.setFillColor(...PDF_STYLES.darkNavy);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  // Decorative gradient circles
  doc.setFillColor(30, 64, 175);
  doc.circle(-30, 50, 120, "F");
  doc.setFillColor(79, 70, 229);
  doc.circle(pageWidth + 40, pageHeight - 80, 150, "F");
  
  // Pink accent circle
  doc.setFillColor(236, 72, 153);
  doc.circle(pageWidth - 30, 80, 40, "F");
  
  // Top accent bar
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
  
  // Divider
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
  
  // Author section
  if (authorName) {
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
  
  doc.setFontSize(PDF_STYLES.fontSize.tiny);
  doc.setTextColor(255, 255, 255);
  doc.text(`© ${new Date().getFullYear()}`, pageWidth / 2, pageHeight - 2, { align: "center" });
};

// NEW: Generate Chapter Opener Page
const generateChapterOpenerPage = (
  doc: jsPDF,
  chapterNumber: number,
  chapterTitle: string,
  chapterDescription?: string
) => {
  doc.addPage();
  
  // Full page subtle gradient
  doc.setFillColor(...PDF_STYLES.bgLight);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  // Top accent bar
  doc.setFillColor(...PDF_STYLES.primaryColor);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  // Chapter number circle
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth / 2, 60, 25, "F");
  doc.setDrawColor(...PDF_STYLES.primaryColor);
  doc.setLineWidth(3);
  doc.circle(pageWidth / 2, 60, 25, "S");
  
  doc.setFontSize(PDF_STYLES.fontSize.chapter);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(`${chapterNumber}`, pageWidth / 2, 68, { align: "center" });
  
  // Chapter title
  doc.setFontSize(PDF_STYLES.fontSize.title);
  doc.setTextColor(...PDF_STYLES.textColor);
  const titleLines = wrapText(doc, chapterTitle, contentWidth - 20);
  let y = 110;
  titleLines.forEach((line) => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 14;
  });
  
  // Decorative line
  doc.setDrawColor(...PDF_STYLES.accentColor);
  doc.setLineWidth(2);
  doc.line(pageWidth / 2 - 40, y + 5, pageWidth / 2 + 40, y + 5);
  y += 25;
  
  // Chapter description
  if (chapterDescription) {
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textMuted);
    doc.setFont("helvetica", "italic");
    const descLines = wrapText(doc, chapterDescription, contentWidth - 40);
    descLines.forEach((line) => {
      doc.text(line, pageWidth / 2, y, { align: "center" });
      y += 6;
    });
  }
  
  return y + 20;
};

// Generate Author Bio Last Page
const generateAuthorBioPage = (doc: jsPDF, authorName: string, authorBio?: string) => {
  doc.addPage();

  // Left sidebar accent
  doc.setFillColor(...PDF_STYLES.primaryColor);
  doc.rect(0, 0, 5, pageHeight, "F");

  let y = PDF_STYLES.margins.top + 20;

  // Section title
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("About the Author", PDF_STYLES.margins.left, y);
  y += 5;

  doc.setDrawColor(...PDF_STYLES.primaryColor);
  doc.setLineWidth(1.5);
  doc.line(PDF_STYLES.margins.left, y, PDF_STYLES.margins.left + 50, y);
  y += 15;

  // Author name
  doc.setFontSize(PDF_STYLES.fontSize.subheading + 2);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "bold");
  doc.text(authorName, PDF_STYLES.margins.left, y);
  y += 12;

  // Author bio
  if (authorBio) {
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textMuted);
    doc.setFont("helvetica", "normal");
    const bioLines = wrapText(doc, authorBio, contentWidth);
    bioLines.forEach(line => {
      doc.text(line, PDF_STYLES.margins.left, y);
      y += PDF_STYLES.lineHeight;
    });
  }

  y += 20;

  // Resources & Next Steps
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Resources & Next Steps", PDF_STYLES.margins.left, y);
  y += 12;

  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for reading! Here are your recommended next steps:", PDF_STYLES.margins.left, y);
  y += 12;

  const nextSteps = [
    "Complete the included worksheets and action checklists",
    "Join the community to share your progress and wins",
    "Visit our website for bonus resources and premium content",
    "Share this guide with someone who needs it",
  ];

  nextSteps.forEach((step, i) => {
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.circle(PDF_STYLES.margins.left + 4, y - 1.5, 3, "F");
    doc.setFontSize(PDF_STYLES.fontSize.tiny);
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}`, PDF_STYLES.margins.left + 4, y - 0.5, { align: "center" });

    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.text(step, PDF_STYLES.margins.left + 12, y);
    y += 10;
  });

  addFooter(doc, authorName);
};

// Generate Guide PDF with story-driven chapter structure
export const generateGuidePDF = (
  content: ToolkitContent["guide"],
  title: string,
  subtitle?: string,
  authorName?: string,
  authorBio?: string
): jsPDF => {
  const doc = new jsPDF();
  
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
  
  doc.setDrawColor(...PDF_STYLES.accentColor);
  doc.setLineWidth(0.5);
  doc.line(PDF_STYLES.margins.left, y, PDF_STYLES.margins.left + 60, y);
  y += 12;
  
  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "normal");
  
  content.sections.forEach((section, index) => {
    doc.setTextColor(...PDF_STYLES.primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}.`, PDF_STYLES.margins.left + 5, y);
    
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    doc.text(sanitizeForPDF(section.heading), PDF_STYLES.margins.left + 15, y);
    
    doc.setDrawColor(...PDF_STYLES.textLight);
    doc.setLineDashPattern([1, 2], 0);
    const textWidth = doc.getTextWidth(section.heading);
    doc.line(PDF_STYLES.margins.left + 18 + textWidth, y, pageWidth - PDF_STYLES.margins.right - 10, y);
    doc.setLineDashPattern([], 0);
    
    doc.text(`${index + 3}`, pageWidth - PDF_STYLES.margins.right - 5, y, { align: "right" });
    y += 10;
  });
  
  addFooter(doc, authorName);
  addPageNumber(doc, 2);
  
  // Content chapters
  let pageNum = 2;
  content.sections.forEach((section, index) => {
    // Chapter opener page
    generateChapterOpenerPage(doc, index + 1, section.heading);
    pageNum++;
    
    // Chapter content
    doc.addPage();
    pageNum++;
    addHeader(doc, title, authorName);
    y = PDF_STYLES.margins.top + 15;
    
    // Parse and format content with special elements
    const paragraphs = section.content.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach((paragraph) => {
      y = checkNewPage(doc, y, 20);
      if (y === PDF_STYLES.margins.top + 10) {
        pageNum++;
        addHeader(doc, title, authorName);
        y += 5;
      }
      
      // Check for special formatting markers
      const trimmedPara = paragraph.trim();
      
      // Section headers (1.1, 1.2, etc.)
      if (/^\d+\.\d+/.test(trimmedPara)) {
        const match = trimmedPara.match(/^(\d+\.\d+)\s*(.+)/);
        if (match) {
          y = drawSectionDivider(doc, match[1], match[2], y);
          return;
        }
      }
      
      // Key Insight boxes
      if (trimmedPara.toLowerCase().includes('key insight:') || trimmedPara.toLowerCase().includes('💡')) {
        const insightText = trimmedPara.replace(/key insight:|💡/gi, '').trim();
        y = drawKeyInsightBox(doc, insightText, y);
        return;
      }
      
      // Action Checklist
      if (trimmedPara.toLowerCase().includes('action checklist') || (trimmedPara.includes('☐') && trimmedPara.split('☐').length > 2)) {
        const items = trimmedPara.split('\n').filter(item => item.includes('☐') || /^[-•]\s/.test(item.trim()));
        if (items.length > 0) {
          y = drawActionChecklistBox(doc, items, y);
          return;
        }
      }
      
      // Reflection boxes
      if (trimmedPara.toLowerCase().includes('reflection:') || trimmedPara.includes('📝')) {
        const reflectionText = trimmedPara.replace(/reflection:|📝/gi, '').trim();
        y = drawReflectionBox(doc, reflectionText, y);
        return;
      }
      
      // Next Moves boxes
      if (trimmedPara.toLowerCase().includes('your next moves') || trimmedPara.includes('➡️')) {
        const nextText = trimmedPara.replace(/your next moves:?|➡️/gi, '').trim();
        y = drawNextMovesBox(doc, nextText, y);
        return;
      }
      
      // Pro Tip boxes
      if (trimmedPara.toLowerCase().includes('pro tip:') || trimmedPara.toLowerCase().includes('pro tip')) {
        const tipText = trimmedPara.replace(/pro tip:?/gi, '').trim();
        y = addCalloutBox(doc, tipText, "tip", y);
        return;
      }
      
      // Bullet points
      if (trimmedPara.startsWith('-') || trimmedPara.startsWith('•')) {
        const items = trimmedPara.split('\n').filter(i => i.trim());
        items.forEach(item => {
          y = checkNewPage(doc, y, 15);
          if (y === PDF_STYLES.margins.top + 10) {
            pageNum++;
            addHeader(doc, title, authorName);
          }
          
          doc.setFillColor(...PDF_STYLES.accentColor);
          doc.circle(PDF_STYLES.margins.left + 3, y - 1.5, 1.5, "F");
          
          const itemText = item.replace(/^[-•]\s*/, '');
          const itemLines = wrapText(doc, itemText, contentWidth - 12);
          doc.setFontSize(PDF_STYLES.fontSize.body);
          doc.setTextColor(...PDF_STYLES.textColor);
          doc.setFont("helvetica", "normal");
          itemLines.forEach((line, lineIndex) => {
            doc.text(line, PDF_STYLES.margins.left + 10, y + (lineIndex * PDF_STYLES.lineHeight));
          });
          y += itemLines.length * PDF_STYLES.lineHeight + 2;
        });
        return;
      }
      
      // Regular paragraph
      const contentLines = wrapText(doc, paragraph, contentWidth);
      doc.setFontSize(PDF_STYLES.fontSize.body);
      doc.setTextColor(...PDF_STYLES.textColor);
      doc.setFont("helvetica", "normal");
      contentLines.forEach((line) => {
        y = checkNewPage(doc, y, 10);
        if (y === PDF_STYLES.margins.top + 10) {
          pageNum++;
          addHeader(doc, title, authorName);
        }
        doc.text(line, PDF_STYLES.margins.left, y);
        y += PDF_STYLES.lineHeight;
      });
      y += 4;
    });
    
    addFooter(doc, authorName);
    addPageNumber(doc, pageNum);
  });
  
  // Author bio last page
  if (authorName) {
    generateAuthorBioPage(doc, authorName, authorBio);
  }
  
  return doc;
};

// Generate Worksheet PDF
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
    
    // Exercise header
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.roundedRect(PDF_STYLES.margins.left, y - 8, contentWidth, 18, 3, 3, "F");
    
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`✏️ Exercise ${index + 1}: ${exercise.title}`, PDF_STYLES.margins.left + 5, y + 2);
    y += 20;
    
    // Instructions
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
    
    // Fields
    doc.setFont("helvetica", "normal");
    exercise.fields.forEach((field, fieldIndex) => {
      y = checkNewPage(doc, y, 50);
      if (y === PDF_STYLES.margins.top + 10) {
        pageNum++;
        addHeader(doc, `${title} - Worksheet`, authorName);
        y += 10;
      }
      
      // Field label
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
      
      // Writing area with dotted fill lines
      doc.setDrawColor(...PDF_STYLES.textLight);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, 35, 2, 2, "FD");
      
      // Dotted response lines
      doc.setDrawColor(200, 205, 215);
      doc.setLineDashPattern([2, 2], 0);
      for (let i = 1; i <= 4; i++) {
        doc.line(PDF_STYLES.margins.left + 5, y + (i * 7), pageWidth - PDF_STYLES.margins.right - 5, y + (i * 7));
      }
      doc.setLineDashPattern([], 0);
      
      y += 43;
    });
    
    addFooter(doc, authorName);
    addPageNumber(doc, pageNum);
  });
  
  return doc;
};

// Generate Checklist PDF
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
  
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(`✅ ${content.title}`, PDF_STYLES.margins.left, y);
  y += 5;
  
  // Progress bar
  doc.setDrawColor(...PDF_STYLES.textLight);
  doc.setFillColor(...PDF_STYLES.bgCard);
  doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, 8, 2, 2, "FD");
  doc.setFontSize(PDF_STYLES.fontSize.tiny);
  doc.setTextColor(...PDF_STYLES.textLight);
  doc.text(`Track your progress: ${content.items.length} items to complete`, PDF_STYLES.margins.left + 5, y + 5);
  y += 18;
  
  // Items
  doc.setFontSize(PDF_STYLES.fontSize.body);
  doc.setTextColor(...PDF_STYLES.textColor);
  doc.setFont("helvetica", "normal");
  
  content.items.forEach((item, index) => {
    y = checkNewPage(doc, y, 18);
    if (y === PDF_STYLES.margins.top + 10) {
      pageNum++;
      addHeader(doc, `${title} - Checklist`, authorName);
      y += 10;
    }
    
    // Check if it's a phase header
    if (item.includes('═══') || item.includes('PHASE')) {
      y += 5;
      doc.setFillColor(...PDF_STYLES.primaryColor);
      doc.roundedRect(PDF_STYLES.margins.left, y - 3, contentWidth, 12, 2, 2, "F");
      doc.setFontSize(PDF_STYLES.fontSize.small);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      const cleanHeader = item.replace(/═/g, '').trim();
      doc.text(cleanHeader, PDF_STYLES.margins.left + 5, y + 5);
      y += 18;
      return;
    }
    
    // Regular item
    if (index % 2 === 0) {
      doc.setFillColor(...PDF_STYLES.bgCard);
      doc.rect(PDF_STYLES.margins.left, y - 5, contentWidth, 12, "F");
    }
    
    doc.setDrawColor(...PDF_STYLES.primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(PDF_STYLES.margins.left + 2, y - 4, 6, 6, 1, 1, "S");
    
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(...PDF_STYLES.textColor);
    doc.setFont("helvetica", "normal");
    const itemText = item.replace(/^☐\s*/, '');
    const itemLines = wrapText(doc, itemText, contentWidth - 15);
    itemLines.forEach((line, lineIndex) => {
      doc.text(line, PDF_STYLES.margins.left + 12, y + (lineIndex * PDF_STYLES.lineHeight));
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

// Generate Resource List PDF
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
  
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(`📚 ${content.title}`, PDF_STYLES.margins.left, y);
  y += 15;
  
  content.resources.forEach((resource, index) => {
    y = checkNewPage(doc, y, 35);
    if (y === PDF_STYLES.margins.top + 10) {
      pageNum++;
      addHeader(doc, `${title} - Resources`, authorName);
      y += 10;
    }
    
    const descLines = wrapText(doc, resource.description, contentWidth - 15);
    const cardHeight = 25 + (descLines.length * 5) + (resource.url ? 8 : 0);
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...PDF_STYLES.primaryColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, cardHeight, 3, 3, "FD");
    
    // Number badge
    doc.setFillColor(...PDF_STYLES.accentColor);
    doc.circle(PDF_STYLES.margins.left + 10, y + 10, 6, "F");
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}`, PDF_STYLES.margins.left + 10, y + 12, { align: "center" });
    
    // Name
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
    
    // URL
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

// Generate Templates PDF
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
    
    // Template header
    doc.setFillColor(...PDF_STYLES.primaryColor);
    doc.roundedRect(PDF_STYLES.margins.left, y - 8, contentWidth, 18, 3, 3, "F");
    
    doc.setFontSize(PDF_STYLES.fontSize.subheading);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`📝 Template ${index + 1}: ${template.name}`, PDF_STYLES.margins.left + 5, y + 2);
    y += 20;
    
    // Instructions
    doc.setFillColor(...PDF_STYLES.bgCard);
    doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, 12, 2, 2, "F");
    doc.setFontSize(PDF_STYLES.fontSize.small);
    doc.setTextColor(...PDF_STYLES.accentColor);
    doc.setFont("helvetica", "italic");
    doc.text("✨ Copy and customize this template for your needs", PDF_STYLES.margins.left + 5, y + 7);
    y += 18;
    
    // Template content
    doc.setDrawColor(...PDF_STYLES.primaryColor);
    doc.setLineWidth(0.3);
    
    const contentLines = wrapText(doc, template.content, contentWidth - 15);
    const boxHeight = Math.min(contentLines.length * 6 + 15, pageHeight - y - 50);
    
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, boxHeight, 2, 2, "FD");
    
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
    
    addFooter(doc, authorName);
    addPageNumber(doc, pageNum);
  });
  
  return doc;
};

// Generate Quiz PDF
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
  
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(...PDF_STYLES.primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(`🧠 ${content.title}`, PDF_STYLES.margins.left, y);
  y += 10;
  
  // Instructions
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
    if (y === PDF_STYLES.margins.top + 10) {
      pageNum++;
      addHeader(doc, `${title} - Quiz`, authorName);
      y += 10;
    }
    
    // Question number
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
    
    // Options
    doc.setFontSize(PDF_STYLES.fontSize.body);
    doc.setFont("helvetica", "normal");
    q.options.forEach((option, optIndex) => {
      const optionLabel = String.fromCharCode(65 + optIndex);
      
      doc.setDrawColor(...PDF_STYLES.primaryColor);
      doc.setLineWidth(0.5);
      doc.circle(PDF_STYLES.margins.left + 10, y - 1.5, 4, "S");
      
      doc.setTextColor(...PDF_STYLES.primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text(optionLabel, PDF_STYLES.margins.left + 10, y, { align: "center" });
      
      doc.setTextColor(...PDF_STYLES.textColor);
      doc.setFont("helvetica", "normal");
      doc.text(option, PDF_STYLES.margins.left + 20, y);
      y += 9;
    });
    
    y += 10;
  });
  
  // Answer Key
  doc.addPage();
  pageNum++;
  addHeader(doc, `${title} - Quiz`, authorName);
  y = PDF_STYLES.margins.top + 25;
  
  doc.setFillColor(...PDF_STYLES.accentColor);
  doc.roundedRect(PDF_STYLES.margins.left, y - 8, contentWidth, 20, 3, 3, "F");
  doc.setFontSize(PDF_STYLES.fontSize.heading);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("🔑 Answer Key", PDF_STYLES.margins.left + 10, y + 4);
  y += 25;
  
  doc.setFillColor(...PDF_STYLES.bgCard);
  doc.roundedRect(PDF_STYLES.margins.left, y, contentWidth, 12, 2, 2, "F");
  doc.setFontSize(PDF_STYLES.fontSize.small);
  doc.setTextColor(...PDF_STYLES.textMuted);
  doc.setFont("helvetica", "italic");
  doc.text("⚠️ Complete the quiz before checking your answers!", PDF_STYLES.margins.left + 5, y + 8);
  y += 20;
  
  // Answers grid
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

// Generate all PDFs
export const generateAllPDFs = async (
  title: string,
  subtitle: string | undefined,
  content: ToolkitContent,
  components: ToolkitComponents,
  authorName?: string
): Promise<{ name: string; pdf: jsPDF }[]> => {
  const pdfs: { name: string; pdf: jsPDF }[] = [];
  
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
