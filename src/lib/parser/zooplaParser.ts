import { CouncilTaxBand, EpcRating, FieldExtractionSummary, Property } from '../../types/property';
import { normalisePropertyType, normaliseTenure } from './pageModelParser';
import { parseCopiedText } from './textHeuristicParser';

export interface ZooplaPayload {
  kind: 'shall-we-move-zoopla';
  url: string;
  heading: string;
  text: string;
}

export function isZooplaPayload(value: unknown): value is ZooplaPayload {
  return !!value && typeof value === 'object' &&
    (value as ZooplaPayload).kind === 'shall-we-move-zoopla' &&
    typeof (value as ZooplaPayload).text === 'string';
}

export function looksLikeZooplaText(text: string): boolean {
  return /zoopla\.co\.uk\/for-sale\/details\/\d+/i.test(text) ||
    (/\bzoopla\b/i.test(text) && /\bbed(?:room)?\s+.+?for sale\b/i.test(text)) ||
    (/\bbed(?:room)?\s+.+?for sale\b/i.test(text) && /about this property/i.test(text) && /more information/i.test(text));
}

function pageTextFromHtml(html: string): string {
  return html
    .replace(/<(script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(?:h[1-6]|p|li|div|section|main|article|span|dt|dd)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|pound|quot|apos);/gi, (entity) => ({
      '&nbsp;': ' ', '&amp;': '&', '&pound;': '£', '&quot;': '"', '&apos;': "'",
    }[entity.toLowerCase()] || entity))
    .replace(/&#(\d+);/g, (_, number: string) => String.fromCharCode(Number(number)));
}

function money(text: string, label: string): number | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`${escaped}[^£\\n]{0,55}£\\s*([\\d,]+(?:\\.\\d{1,2})?)`, 'i'));
  return match ? Number(match[1].replace(/,/g, '')) : undefined;
}

/** Parse only facts visible on a Zoopla listing; missing facts remain missing. */
export function parseZoopla(input: string | ZooplaPayload, source: Property['source'] = 'paste'): Property {
  const payload = typeof input === 'string' ? undefined : input;
  const text = typeof input === 'string' ? (/^\s*</.test(input) ? pageTextFromHtml(input) : input) : input.text;
  const url = payload?.url || text.match(/https?:\/\/(?:www\.)?zoopla\.co\.uk\/for-sale\/details\/\d+\/?/i)?.[0];
  const heading = (payload?.heading || text.match(/\b\d+\s+bed(?:room)?\s+[^\n]{0,120}?\s+for sale\s*\n?\s*[^\n]+/i)?.[0] || '').replace(/\s+/g, ' ').trim();
  const titleMatch = heading.match(/^(\d+)\s+bed(?:room)?\s+(.+?)\s+for sale\s+(.+)$/i);
  const headingIndex = text.search(/\b\d+\s+bed(?:room)?\s+[^\n]{0,120}?\s+for sale/i);
  const address = titleMatch?.[3]?.trim() || 'Address not stated';
  const nearHeading = headingIndex >= 0 ? text.slice(Math.max(0, headingIndex - 250), headingIndex + 500) : text.slice(0, 1000);
  const priceMatch = nearHeading.match(/£\s*([\d,]{4,})/);
  const price = priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : 0;
  const count = (kind: string): number => {
    const match = nearHeading.match(new RegExp(`(\\d+)\\s*${kind}s?\\b`, 'i'));
    return match ? Number(match[1]) : 0;
  };
  const bedrooms = titleMatch ? Number(titleMatch[1]) : count('bed');
  const bathrooms = count('bath');
  const receptions = count('reception');
  const about = text.split(/about this property/i)[1]?.split(/more information|zoopla tools|property details/i)[0]?.trim() || '';
  const base = parseCopiedText(`${heading}\n${about}`, source);
  const tenureMatch = text.match(/\b(?:share of freehold|freehold|leasehold|commonhold)\b/i);
  const leaseMatch = text.match(/years? remaining on lease\s*[:\-]?\s*(\d+)/i) ||
    text.match(/tenure\s*[:\-]?\s*leasehold\s*\(\s*(\d+)\s*years?/i) ||
    text.match(/leasehold\s*\(\s*(\d+)\s*years?\s*\)/i);
  const areaMatch = text.match(/\b([\d,]+(?:\.\d+)?)\s*(?:sq\s*ft|sqft|square feet)\b/i);
  const taxMatch = text.match(/council tax(?: band)?\s*[:\-]?\s*(?:band\s*)?([A-I])\b/i);
  const epcMatch = text.match(/\bepc\s*(?:rating|band)?\s*[:\-]?\s*([A-G])\b/i);
  const postcode = address.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i)?.[0].toUpperCase();
  const zooplaId = url?.match(/\/details\/(\d+)/)?.[1];
  const summary: FieldExtractionSummary[] = [
    ['displayAddress', 'Address', address !== 'Address not stated'],
    ['price', 'Asking price', price > 0],
    ['bedrooms', 'Bedrooms', bedrooms > 0],
    ['bathrooms', 'Bathrooms', bathrooms > 0],
    ['receptions', 'Receptions', receptions > 0],
    ['tenure', 'Tenure', !!tenureMatch],
    ['floorAreaSqFt', 'Floor area', !!areaMatch],
    ['councilTaxBand', 'Council tax band', !!taxMatch],
    ['epcRating', 'EPC rating', !!epcMatch],
    ['serviceChargeAnnual', 'Annual service charge', money(text, 'service charge') !== undefined],
    ['groundRentAnnual', 'Annual ground rent', money(text, 'ground rent') !== undefined],
  ].map(([fieldName, label, found]) => ({ fieldName: String(fieldName), label: String(label), status: found ? 'found' : 'missing', source: 'text_heuristics' }));

  return {
    ...base,
    id: zooplaId ? `prop_zoopla_${zooplaId}` : `prop_zoopla_${Date.now()}`,
    zooplaId,
    url,
    displayAddress: address,
    postcode,
    price,
    priceQualifier: nearHeading.match(/\b(offers over|guide price|offers in excess of|fixed price)\b/i)?.[0],
    propertyType: normalisePropertyType(titleMatch?.[2]),
    tenure: normaliseTenure(tenureMatch?.[0]),
    leaseYearsRemaining: leaseMatch ? Number(leaseMatch[1]) : undefined,
    serviceChargeAnnual: money(text, 'service charge'),
    groundRentAnnual: money(text, 'ground rent'),
    councilTaxBand: (taxMatch?.[1]?.toUpperCase() || 'unknown') as CouncilTaxBand,
    epcRating: (epcMatch?.[1]?.toUpperCase() || 'unknown') as EpcRating,
    bedrooms,
    bathrooms,
    receptions,
    floorAreaSqFt: areaMatch ? Number(areaMatch[1].replace(/,/g, '')) : undefined,
    floorAreaSqM: areaMatch ? Math.round(Number(areaMatch[1].replace(/,/g, '')) / 10.7639 * 10) / 10 : undefined,
    descriptionText: about,
    hasGarden: /\bgarden\b/i.test(about),
    extractionSummary: summary,
  };
}
