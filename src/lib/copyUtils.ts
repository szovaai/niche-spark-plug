import DOMPurify from 'dompurify';

/**
 * Banned phrases with replacements — applied as post-processing to all generated copy.
 */
const BANNED_PHRASES: [RegExp, string][] = [
  [/cost of a few coffees?/gi, 'less than a single freelancer hour'],
  [/game[ -]?changer/gi, 'proven advantage'],
  [/\brevolutionary\b/gi, 'proven'],
  [/unlock your potential/gi, 'get measurable results'],
  [/\bjourney\b/gi, 'process'],
  [/at the end of the day/gi, ''],
  [/in today'?s digital world/gi, ''],
  [/leverage the power of/gi, 'use'],
  [/dive into/gi, 'get into'],
  [/it'?s time to/gi, ''],
  [/without further ado/gi, ''],
  [/I hope this (email )?finds you well/gi, ''],
];

/**
 * Remove / replace banned cliché phrases from generated copy.
 */
export function filterBannedPhrases(text: string): string {
  if (!text) return '';
  let result = text;
  for (const [pattern, replacement] of BANNED_PHRASES) {
    result = result.replace(pattern, replacement);
  }
  // Clean up double spaces and leading/trailing whitespace on lines
  result = result.replace(/  +/g, ' ').replace(/^ +/gm, '').replace(/\n{3,}/g, '\n\n');
  return result;
}

/**
 * Convert markdown text to sanitized HTML.
 */
export function markdownToHTML(md: string): string {
  if (!md) return '';
  let html = md;
  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr />');
  // Unordered lists (handle consecutive lines starting with - or *)
  html = html.replace(/(?:^[\-\*]\s+.+$\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^[\-\*]\s+/, '')}</li>`
    ).join('');
    return `<ul>${items}</ul>`;
  });
  // Ordered lists
  html = html.replace(/(?:^\d+\.\s+.+$\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^\d+\.\s+/, '')}</li>`
    ).join('');
    return `<ol>${items}</ol>`;
  });
  // Paragraphs — wrap remaining plain lines
  html = html.replace(/^(?!<[huo]|<li|<hr)(.+)$/gm, '<p>$1</p>');
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p','h1','h2','h3','h4','h5','h6','ul','ol','li','strong','em','b','i','u','br','hr','div','span','a','blockquote','pre','code'],
    ALLOWED_ATTR: ['class','href','target','rel'],
  });
}

/**
 * Copy Quality Scoring — grades generated copy on a 0-100 scale.
 */
export interface CopyScore {
  total: number;
  genericPhrases: string[];
  missingSpecificity: boolean;
  missingMechanism: boolean;
  ctaStrength: 'weak' | 'medium' | 'strong';
  readabilityGrade: number;
  suggestions: string[];
  ready: boolean;
}

const GENERIC_PHRASES = [
  'game changer', 'revolutionary', 'unlock your potential', 'journey',
  'in today\'s digital world', 'leverage the power', 'dive into',
  'without further ado', 'cost of a few coffees', 'game-changing',
  'it\'s time to', 'at the end of the day', 'I hope this finds you well',
  'take your business to the next level', 'sky is the limit',
  'click here', 'buy now', 'learn more',
];

const STRONG_CTA_PATTERNS = [
  /yes\s*[—–-]\s*/i,
  /give me (instant )?access/i,
  /start (my|your|the)/i,
  /get (instant |immediate )?access/i,
  /claim (my|your)/i,
  /download (my|your|the)/i,
];

const MEDIUM_CTA_PATTERNS = [
  /get started/i,
  /sign up/i,
  /join now/i,
  /grab (your|this|it)/i,
];

export function scoreCopy(text: string, mechanismName?: string): CopyScore {
  if (!text) return { total: 0, genericPhrases: [], missingSpecificity: true, missingMechanism: true, ctaStrength: 'weak', readabilityGrade: 12, suggestions: ['No copy to score.'], ready: false };

  const lower = text.toLowerCase();
  const found: string[] = [];

  // 1. Generic phrases (–20 max)
  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) found.push(phrase);
  }
  const genericPenalty = Math.min(found.length * 5, 20);

  // 2. Specificity: headlines/first 500 chars should contain numbers or timeframes (–15)
  const first500 = text.slice(0, 500);
  const hasNumbers = /\d/.test(first500);
  const hasTimeframe = /(hour|day|week|minute|month|24|48|72|30|7|14|5)/i.test(first500);
  const missingSpecificity = !hasNumbers && !hasTimeframe;
  const specificityPenalty = missingSpecificity ? 15 : 0;

  // 3. Mechanism name present (–15)
  const missingMechanism = mechanismName ? !lower.includes(mechanismName.toLowerCase().slice(0, 20)) : false;
  const mechPenalty = missingMechanism ? 15 : 0;

  // 4. CTA strength (–10 for weak)
  let ctaStrength: 'weak' | 'medium' | 'strong' = 'weak';
  if (STRONG_CTA_PATTERNS.some(p => p.test(text))) ctaStrength = 'strong';
  else if (MEDIUM_CTA_PATTERNS.some(p => p.test(text))) ctaStrength = 'medium';
  const ctaPenalty = ctaStrength === 'weak' ? 10 : ctaStrength === 'medium' ? 5 : 0;

  // 5. Readability (approximate Flesch–Kincaid grade level)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgSentLen = sentences.length > 0 ? words.length / sentences.length : 20;
  const avgSyllPerWord = words.length > 0 ? syllables / words.length : 2;
  const readabilityGrade = Math.max(1, Math.min(16, Math.round(0.39 * avgSentLen + 11.8 * avgSyllPerWord - 15.59)));
  const readPenalty = readabilityGrade > 10 ? Math.min((readabilityGrade - 10) * 3, 15) : 0;

  const total = Math.max(0, 100 - genericPenalty - specificityPenalty - mechPenalty - ctaPenalty - readPenalty);

  const suggestions: string[] = [];
  if (found.length) suggestions.push(`Remove generic phrases: ${found.join(', ')}`);
  if (missingSpecificity) suggestions.push('Add specific numbers, timeframes, or results to your headline');
  if (missingMechanism) suggestions.push('Reference your named mechanism in the copy');
  if (ctaStrength === 'weak') suggestions.push('Upgrade CTA — use action-specific text like "Yes — Give Me Instant Access To [Product]"');
  if (ctaStrength === 'medium') suggestions.push('Strengthen CTA with product name and specific outcome');
  if (readabilityGrade > 10) suggestions.push(`Simplify language — current grade level ~${readabilityGrade}, aim for 7`);

  return {
    total,
    genericPhrases: found,
    missingSpecificity,
    missingMechanism,
    ctaStrength,
    readabilityGrade,
    suggestions,
    ready: total >= 75,
  };
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  const vowelGroups = w.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;
  if (w.endsWith('e') && count > 1) count--;
  return Math.max(1, count);
}
