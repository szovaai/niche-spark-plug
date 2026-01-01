/**
 * Comprehensive text sanitization for PDF and export outputs
 * Strips control characters, normalizes quotes/dashes, and ensures clean UTF-8
 */

// Characters that should be replaced/normalized
const CHAR_REPLACEMENTS: [RegExp, string][] = [
  // Smart quotes → straight quotes
  [/[\\u2018\\u2019\\u201A\\u201B]/g, "'"],  // Single smart quotes
  [/[\\u201C\\u201D\\u201E\\u201F]/g, '"'],  // Double smart quotes
  
  // Dashes → standard dash
  [/[\\u2013\\u2014\\u2015]/g, "-"],  // En-dash, Em-dash, Horizontal bar
  
  // Bullets → standard bullet
  [/[\\u2022\\u2023\\u2043\\u204C\\u204D]/g, "•"],  // Various bullet characters
  
  // Ellipsis → three dots
  [/\\u2026/g, "..."],
  
  // Non-breaking spaces → regular space
  [/[\\u00A0\\u2007\\u202F]/g, " "],
  
  // Zero-width characters → remove
  [/[\\u200B\\u200C\\u200D\\uFEFF]/g, ""],
  
  // Common corrupted patterns from AI output → clean equivalents
  [/Ø=/g, ""],
  [/[ÜÚÝþ]/g, ""],
  [/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, ""], // Control characters
  
  // Fix broken encoding sequences
  [/â€™/g, "'"],
  [/â€œ/g, '"'],
  [/â€/g, '"'],
  [/â€\"/g, "-"],
  [/â€¢/g, "•"],
  [/Ã©/g, "é"],
  [/Ã¨/g, "è"],
  [/Ã /g, "à"],
  [/Ã¢/g, "â"],
  [/Ã®/g, "î"],
  [/Ã´/g, "ô"],
  [/Ã»/g, "û"],
  [/Ã§/g, "ç"],
];

/**
 * Sanitizes text by normalizing characters and removing control characters
 */
export const sanitizeText = (text: string): string => {
  if (!text) return "";
  
  let result = text;
  
  // Apply all replacements
  for (const [pattern, replacement] of CHAR_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  
  // Normalize multiple spaces to single space (but preserve newlines)
  result = result.replace(/[^\\S\\n]+/g, " ");
  
  // Trim each line
  result = result.split('\\n').map(line => line.trim()).join('\\n');
  
  // Remove excessive blank lines (more than 2 consecutive)
  result = result.replace(/\\n{4,}/g, '\\n\\n\\n');
  
  return result.trim();
};

/**
 * Sanitizes text specifically for PDF rendering
 * More aggressive - removes characters that Helvetica font can't render
 */
export const sanitizeForPDF = (text: string): string => {
  let result = sanitizeText(text);
  
  // Replace any remaining non-ASCII characters that Helvetica can't render
  // Keep common Latin-1 supplement characters (accents, etc.)
  result = result.replace(/[^\\x20-\\x7E\\u00A0-\\u00FF•–—''""…✓✔✕✖→←↑↓★☆♦♣♠♥]/g, "");
  
  // Normalize special check/cross marks to simple versions
  result = result.replace(/✔/g, "✓");
  result = result.replace(/[✕✖]/g, "x");
  
  // Ensure checkmarks and bullets work properly
  result = result.replace(/☑/g, "✓");
  result = result.replace(/☐/g, "[ ]");
  
  // Clean up any double spaces that might have resulted
  result = result.replace(/  +/g, " ");
  
  return result;
};

/**
 * Recursively sanitizes all string values in an object or array
 */
export const sanitizeContent = (content: unknown): unknown => {
  if (typeof content === "string") {
    return sanitizeText(content);
  }
  if (Array.isArray(content)) {
    return content.map(sanitizeContent);
  }
  if (content && typeof content === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(content)) {
      sanitized[key] = sanitizeContent(value);
    }
    return sanitized;
  }
  return content;
};

/**
 * Sanitizes AI output before returning from edge functions
 * Lighter version - just fixes encoding issues
 */
export const sanitizeAIOutput = (text: string): string => {
  if (!text) return "";
  
  return text
    // Smart quotes → straight quotes
    .replace(/[\\u2018\\u2019\\u201A\\u201B]/g, "'")
    .replace(/[\\u201C\\u201D\\u201E\\u201F]/g, '"')
    // Dashes
    .replace(/[\\u2013\\u2014\\u2015]/g, "-")
    // Zero-width and control characters
    .replace(/[\\u200B\\u200C\\u200D\\uFEFF]/g, "")
    .replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, "")
    // Common mojibake patterns
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€\"/g, "-")
    .replace(/â€¢/g, "•")
    // Corrupted patterns
    .replace(/Ø=/g, "")
    .replace(/[ÜÚÝþ]/g, "");
};
