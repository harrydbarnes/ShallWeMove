/**
 * Text Heuristic Parser for copied listing text.
 * Parses plain text copied directly from a Rightmove listing page.
 */

import { Property, FieldExtractionSummary, CouncilTaxBand, EpcRating } from '../../types/property';
import { parsePrice, normalisePropertyType, normaliseTenure } from './pageModelParser';
import { analysePropertyText } from '../analyser/textAnalyser';

export function parseCopiedText(rawText: string, source: Property['source'] = 'paste'): Property {
  const summary: FieldExtractionSummary[] = [];
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Price extraction (looks for £[0-9,]+)
  let price = 0;
  let priceQualifier: string | undefined;
  const priceMatch = rawText.match(/£\s*([0-9,]+)/);
  if (priceMatch) {
    price = parsePrice(priceMatch[1]);
  }

  const qualifierMatch = rawText.match(/\b(guide price|offers in (?:excess of|region of)|fixed price|shared ownership)\b/i);
  if (qualifierMatch) {
    priceQualifier = qualifierMatch[0];
  }

  summary.push({
    fieldName: 'price',
    label: 'Asking Price',
    status: price > 0 ? 'found' : 'missing',
    source: 'text_heuristics',
  });

  // 2. Bedrooms & Bathrooms extraction
  let bedrooms = 0;
  let bathrooms = 0;
  const bedsMatch = rawText.match(/(\d+)\s*(?:bed|bedroom)/i);
  if (bedsMatch) bedrooms = parseInt(bedsMatch[1], 10);

  const bathsMatch = rawText.match(/(\d+)\s*(?:bath|bathroom)/i);
  if (bathsMatch) bathrooms = parseInt(bathsMatch[1], 10);

  summary.push({
    fieldName: 'bedrooms',
    label: 'Bedrooms',
    status: bedrooms > 0 ? 'found' : 'missing',
    source: 'text_heuristics',
  });

  summary.push({
    fieldName: 'bathrooms',
    label: 'Bathrooms',
    status: bathrooms > 0 ? 'found' : 'missing',
    source: 'text_heuristics',
  });

  // 3. Postcode & Address
  let postcode: string | undefined;
  const ukPostcodeRegex = /\b([A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2})\b/i;
  const postcodeMatch = rawText.match(ukPostcodeRegex);
  if (postcodeMatch) {
    postcode = postcodeMatch[1].toUpperCase();
  }

  // Address heuristic: lines that contain commas, or line preceding or following price/property type
  let displayAddress = 'Address not specified';
  for (const line of lines) {
    if (line.includes(',') && !line.toLowerCase().includes('bedroom') && !line.includes('£')) {
      displayAddress = line;
      break;
    }
  }

  summary.push({
    fieldName: 'displayAddress',
    label: 'Address',
    status: displayAddress !== 'Address not specified' ? 'found' : 'missing',
    source: 'text_heuristics',
  });

  // 4. Property Type
  let propertyType = normalisePropertyType(rawText);

  // 5. Tenure & Leasehold
  let tenure = normaliseTenure(rawText);
  let leaseYears: number | undefined;
  const leaseMatch = rawText.match(/(\d+)\s*years?(?:\s*remaining|\s*on lease|\s*lease)/i);
  if (leaseMatch) {
    leaseYears = parseInt(leaseMatch[1], 10);
  }

  // 6. Council Tax Band
  let councilTaxBand: CouncilTaxBand = 'unknown';
  const taxMatch = rawText.match(/council tax band\s*[:\-]?\s*([A-I])\b/i);
  if (taxMatch) {
    councilTaxBand = taxMatch[1].toUpperCase() as CouncilTaxBand;
  }

  // 7. EPC Rating
  let epcRating: EpcRating = 'unknown';
  const epcMatch = rawText.match(/epc\s*(?:rating|band)?\s*[:\-]?\s*([A-G])\b/i);
  if (epcMatch) {
    epcRating = epcMatch[1].toUpperCase() as EpcRating;
  }

  // 8. Key Features & Description segmentation
  const keyFeatures: string[] = [];
  let inKeyFeatures = false;
  let inDescription = false;
  const descLines: string[] = [];

  for (const line of lines) {
    const l = line.toLowerCase();
    if (l.includes('key features') || l.includes('key property features')) {
      inKeyFeatures = true;
      inDescription = false;
      continue;
    }
    if (l.includes('property description') || l.includes('full description') || l.includes('about this property')) {
      inKeyFeatures = false;
      inDescription = true;
      continue;
    }

    if (inKeyFeatures) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        keyFeatures.push(line.replace(/^[•\-\*]\s*/, ''));
      } else if (line.length > 5 && !line.includes(':')) {
        keyFeatures.push(line);
      }
    } else if (inDescription) {
      descLines.push(line);
    }
  }

  const descriptionText = descLines.length > 0 ? descLines.join('\n\n') : rawText;

  // 9. Run Text Analyser
  const analysis = analysePropertyText(descriptionText, keyFeatures);

  const property: Property = {
    id: `prop_text_${Date.now()}`,
    source,
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    displayAddress,
    postcode,
    price,
    priceQualifier,
    reduced: false,
    priceHistory: [],

    tenure,
    leaseYearsRemaining: leaseYears,

    councilTaxBand,
    epcRating,

    propertyType,
    bedrooms: bedrooms || 2, // fallback reasonable default for manual review
    bathrooms: bathrooms || 1,
    receptions: 1,

    keyFeatures,
    descriptionText,
    photos: [],
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

  return property;
}
