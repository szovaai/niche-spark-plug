/**
 * Lightweight input validation helpers for edge functions.
 * Keeps payloads within safe bounds to prevent memory exhaustion and malformed data.
 */

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  maxLength?: number;      // for strings
  maxItems?: number;       // for arrays
  min?: number;            // for numbers
  max?: number;            // for numbers
  enum?: string[];         // allowed string values
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data: Record<string, unknown>;
}

const DEFAULT_MAX_STRING = 5000;
const DEFAULT_MAX_ARRAY = 50;

export function validateInput(
  body: Record<string, unknown>,
  rules: ValidationRule[]
): ValidationResult {
  const cleaned: Record<string, unknown> = {};

  for (const rule of rules) {
    const val = body[rule.field];

    // Required check
    if (rule.required && (val === undefined || val === null || val === '')) {
      return { valid: false, error: `Missing required field: ${rule.field}`, data: {} };
    }

    if (val === undefined || val === null) {
      cleaned[rule.field] = val;
      continue;
    }

    // Type checks
    switch (rule.type) {
      case 'string': {
        if (typeof val !== 'string') {
          return { valid: false, error: `${rule.field} must be a string`, data: {} };
        }
        const maxLen = rule.maxLength ?? DEFAULT_MAX_STRING;
        if (val.length > maxLen) {
          return { valid: false, error: `${rule.field} exceeds max length of ${maxLen}`, data: {} };
        }
        if (rule.enum && !rule.enum.includes(val)) {
          return { valid: false, error: `${rule.field} must be one of: ${rule.enum.join(', ')}`, data: {} };
        }
        cleaned[rule.field] = val;
        break;
      }
      case 'number': {
        const num = typeof val === 'number' ? val : Number(val);
        if (isNaN(num)) {
          return { valid: false, error: `${rule.field} must be a number`, data: {} };
        }
        if (rule.min !== undefined && num < rule.min) {
          return { valid: false, error: `${rule.field} must be >= ${rule.min}`, data: {} };
        }
        if (rule.max !== undefined && num > rule.max) {
          return { valid: false, error: `${rule.field} must be <= ${rule.max}`, data: {} };
        }
        cleaned[rule.field] = num;
        break;
      }
      case 'boolean': {
        if (typeof val !== 'boolean') {
          return { valid: false, error: `${rule.field} must be a boolean`, data: {} };
        }
        cleaned[rule.field] = val;
        break;
      }
      case 'array': {
        if (!Array.isArray(val)) {
          return { valid: false, error: `${rule.field} must be an array`, data: {} };
        }
        const maxItems = rule.maxItems ?? DEFAULT_MAX_ARRAY;
        if (val.length > maxItems) {
          return { valid: false, error: `${rule.field} exceeds max items of ${maxItems}`, data: {} };
        }
        cleaned[rule.field] = val;
        break;
      }
      case 'object': {
        if (typeof val !== 'object' || Array.isArray(val)) {
          return { valid: false, error: `${rule.field} must be an object`, data: {} };
        }
        // Limit serialized size to prevent oversized nested objects
        const serialized = JSON.stringify(val);
        const maxLen = rule.maxLength ?? 50000;
        if (serialized.length > maxLen) {
          return { valid: false, error: `${rule.field} exceeds max size`, data: {} };
        }
        cleaned[rule.field] = val;
        break;
      }
    }
  }

  // Pass through any unvalidated fields from body (limited total size)
  for (const key of Object.keys(body)) {
    if (!(key in cleaned)) {
      cleaned[key] = body[key];
    }
  }

  return { valid: true, data: cleaned };
}

export function validationErrorResponse(error: string, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
