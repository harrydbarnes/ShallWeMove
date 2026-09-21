/**
 * Unified multi-strategy parser for Rightmove listings.
 * Accepts:
 * 1. Raw HTML page source
 * 2. window.PAGE_MODEL JSON string or object
 * 3. JSON-LD structured data
 * 4. URL hash encoded payload from bookmarklet
 * 5. Copied listing text
 *
 * Defensive against missing fields, never silently guesses.
 */

import { Property, FieldExtractionSummary } from '../../types/property';
import { parsePageModel, ParseResult } from './pageModelParser';
import { parseJsonLd } from './jsonLdParser';
import { parseCopiedText } from './textHeuristicParser';

export interface UnifiedParseResult {
  property: Property;
  summary: FieldExtractionSummary[];
  parseStrategy: 'page_model' | 'json_ld' | 'html_regex' | 'url_hash' | 'text_heuristics';
}

/**
 * Extracts a JSON object from text starting with an opening brace by tracking brace depth.
 */
function extractBalancedJsonObject(str: string, startIndex: number): string | null {
  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0) {
          return str.slice(startIndex, i + 1);
        }
      }
    }
  }

  return null;
}

/**
 * Attempts to extract window.PAGE_MODEL JSON from raw HTML.
 */
export function extractPageModelFromHtml(html: string): unknown | null {
  const markerRegex = /window\.PAGE_MODEL\s*=\s*\{/;
  const match = markerRegex.exec(html);
  if (match && match.index !== undefined) {
    const braceIndex = html.indexOf('{', match.index);
    if (braceIndex !== -1) {
      const jsonStr = extractBalancedJsonObject(html, braceIndex);
      if (jsonStr) {
        try {
          return JSON.parse(jsonStr);
        } catch {
          // continue fallback
        }
      }
    }
  }

  // Also check for <script id="__NEXT_DATA__"> or similar
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (nextDataMatch) {
    try {
      return JSON.parse(nextDataMatch[1]);
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Attempts to extract JSON-LD script content from HTML.
 */
export function extractJsonLdFromHtml(html: string): unknown | null {
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed['@type'] || parsed['@graph'] || parsed['offers']) {
        return parsed;
      }
    } catch {
      // ignore parsing error and continue
    }
  }
  return null;
}

/**
 * Master parser function for all input routes.
 */
export function parseListingInput(
  rawInput: string | unknown,
  source: Property['source'] = 'paste'
): UnifiedParseResult {
  // If already an object (e.g. from bookmarklet postMessage or deserialized JSON)
  if (typeof rawInput === 'object' && rawInput !== null) {
    const res = parsePageModel(rawInput, source);
    return {
      property: res.property,
      summary: res.summary,
      parseStrategy: 'page_model',
    };
  }

  const inputStr = String(rawInput || '').trim();

  // 1. Check for URL Hash payload (#data=...)
  if (inputStr.startsWith('#data=') || inputStr.startsWith('data=')) {
    try {
      const rawData = inputStr.replace(/^#?data=/, '');
      const decoded = decodeURIComponent(rawData);
      let jsonPayload;
      try {
        jsonPayload = JSON.parse(decoded);
      } catch {
        // Try base64
        const binaryStr = atob(decoded);
        jsonPayload = JSON.parse(binaryStr);
      }
      const res = parsePageModel(jsonPayload, 'bookmarklet');
      return {
        property: res.property,
        summary: res.summary,
        parseStrategy: 'url_hash',
      };
    } catch (e) {
      console.warn('Failed to parse URL hash data payload:', e);
    }
  }

  // 2. Check if input is a direct JSON string
  if (inputStr.startsWith('{') && inputStr.endsWith('}')) {
    try {
      const parsedJson = JSON.parse(inputStr);
      if (parsedJson['@type'] || parsedJson['@graph']) {
        const jsonLdRes = parseJsonLd(parsedJson, source);
        if (jsonLdRes) {
          return {
            property: jsonLdRes.property,
            summary: jsonLdRes.summary,
            parseStrategy: 'json_ld',
          };
        }
      }
      const res = parsePageModel(parsedJson, source);
      return {
        property: res.property,
        summary: res.summary,
        parseStrategy: 'page_model',
      };
    } catch {
      // Fall through to HTML / text parsing
    }
  }

  // 3. Check if input is HTML page source containing window.PAGE_MODEL
  if (inputStr.includes('window.PAGE_MODEL') || inputStr.includes('<!DOCTYPE') || inputStr.includes('<html')) {
    const extractedModel = extractPageModelFromHtml(inputStr);
    if (extractedModel) {
      const res = parsePageModel(extractedModel, source);
      return {
        property: res.property,
        summary: res.summary,
        parseStrategy: 'html_regex',
      };
    }

    // Try extracting JSON-LD from HTML
    const extractedLd = extractJsonLdFromHtml(inputStr);
    if (extractedLd) {
      const jsonLdRes = parseJsonLd(extractedLd, source);
      if (jsonLdRes) {
        return {
          property: jsonLdRes.property,
          summary: jsonLdRes.summary,
          parseStrategy: 'json_ld',
        };
      }
    }
  }

  // 4. Fallback to Text Heuristic Parser
  const textProperty = parseCopiedText(inputStr, source);
  return {
    property: textProperty,
    summary: textProperty.extractionSummary,
    parseStrategy: 'text_heuristics',
  };
}
