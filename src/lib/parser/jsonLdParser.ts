/**
 * Parser for Schema.org JSON-LD structured data embedded in property pages.
 */

import { Property, FieldExtractionSummary } from '../../types/property';
import { parsePrice, normalisePropertyType, normaliseTenure } from './pageModelParser';
import { analysePropertyText } from '../analyser/textAnalyser';

export interface JsonLdParseResult {
  property: Property;
  summary: FieldExtractionSummary[];
}

export function parseJsonLd(jsonObj: unknown, source: Property['source'] = 'paste'): JsonLdParseResult | null {
  if (!jsonObj || typeof jsonObj !== 'object') return null;

  // Handle @graph arrays or direct objects
  let data = jsonObj as Record<string, unknown>;
  if (Array.isArray(data['@graph'])) {
    const listing = data['@graph'].find(
      (item: Record<string, unknown>) =>
        item['@type'] === 'RealEstateListing' ||
        item['@type'] === 'SingleFamilyResidence' ||
        item['@type'] === 'Apartment' ||
        item['@type'] === 'Product' ||
        item['offers']
    );
    if (listing) {
      data = listing as Record<string, unknown>;
    }
  }

  const summary: FieldExtractionSummary[] = [];

  // Address
  let displayAddress = 'Address not stated';
  let postcode: string | undefined;
  if (data.address && typeof data.address === 'object') {
    const addr = data.address as Record<string, unknown>;
    const street = addr.streetAddress ? String(addr.streetAddress) : '';
    const locality = addr.addressLocality ? String(addr.addressLocality) : '';
    postcode = addr.postalCode ? String(addr.postalCode) : undefined;
    displayAddress = [street, locality, postcode].filter(Boolean).join(', ') || displayAddress;
  } else if (typeof data.name === 'string') {
    displayAddress = data.name;
  }

  summary.push({
    fieldName: 'displayAddress',
    label: 'Address',
    status: displayAddress !== 'Address not stated' ? 'found' : 'missing',
    source: 'json_ld',
  });

  // Price
  let price = 0;
  if (data.offers && typeof data.offers === 'object') {
    const offers = data.offers as Record<string, unknown>;
    price = parsePrice(offers.price);
  } else if (data.price) {
    price = parsePrice(data.price);
  }

  summary.push({
    fieldName: 'price',
    label: 'Asking Price',
    status: price > 0 ? 'found' : 'missing',
    source: 'json_ld',
  });

  // Beds & Baths
  const bedrooms = parseInt(String(data.numberOfBedrooms || 0), 10) || 0;
  const bathrooms = parseInt(String(data.numberOfBathroomsTotal || data.numberOfBathrooms || 0), 10) || 0;

  summary.push({
    fieldName: 'bedrooms',
    label: 'Bedrooms',
    status: bedrooms > 0 ? 'found' : 'missing',
    source: 'json_ld',
  });
  summary.push({
    fieldName: 'bathrooms',
    label: 'Bathrooms',
    status: bathrooms > 0 ? 'found' : 'missing',
    source: 'json_ld',
  });

  // Property Type
  const rawType = String(data['@type'] || '');
  const propertyType = normalisePropertyType(rawType);

  // Description
  const descriptionText = String(data.description || '');
  const analysis = analysePropertyText(descriptionText, []);

  // Photos
  const photos: { url: string; caption?: string }[] = [];
  if (data.image) {
    if (typeof data.image === 'string') {
      photos.push({ url: data.image });
    } else if (Array.isArray(data.image)) {
      for (const img of data.image) {
        if (typeof img === 'string') photos.push({ url: img });
        else if (typeof img === 'object' && img !== null && (img as Record<string, unknown>).url) {
          photos.push({ url: String((img as Record<string, unknown>).url) });
        }
      }
    }
  }

  const property: Property = {
    id: `prop_ld_${Date.now()}`,
    source,
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    displayAddress,
    postcode,
    price,
    reduced: false,
    priceHistory: [],

    tenure: normaliseTenure(String(data.tenure || '')),
    councilTaxBand: 'unknown',
    epcRating: 'unknown',

    propertyType,
    bedrooms,
    bathrooms,
    receptions: 1,

    keyFeatures: [],
    descriptionText,
    photos,
    floorplans: [],

    parkingSpaces: analysis.parkingSpacesInferred || (analysis.hasDriveway ? 1 : 0),
    garageType: analysis.garageType,
    hasDriveway: analysis.hasDriveway,
    hasEvCharger: analysis.hasEvCharger,
    gardenOrientation: analysis.gardenOrientation,
    hasGarden: analysis.gardenOrientation !== 'none',
    hasPatioOrDecking: analysis.hasPatioOrDecking,
    hasOutbuilding: analysis.hasOutbuilding,

    hasEnSuite: analysis.hasEnSuite,
    hasUtilityRoom: analysis.hasUtilityRoom,
    hasDownstairsWc: analysis.hasDownstairsWc,
    hasHomeOfficeOrStudy: analysis.hasHomeOfficeOrStudy,
    hasOpenPlanKitchen: analysis.hasOpenPlanKitchen,
    loftStatus: analysis.loftStatus,

    hasNewBoiler: analysis.hasNewBoiler,
    hasSolarPanels: analysis.hasSolarPanels,
    hasUnderfloorHeating: analysis.hasUnderfloorHeating,
    needsModernisation: analysis.needsModernisation,
    chainStatus: analysis.chainStatus,

    nearestStations: [],
    nearestSchools: [],
    detectedFeatures: analysis.allDetections,
    extractionSummary: summary,
  };

  return { property, summary };
}
