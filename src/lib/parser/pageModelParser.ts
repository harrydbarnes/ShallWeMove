/**
 * Parser for Rightmove window.PAGE_MODEL objects.
 */

import {
  Property,
  FieldExtractionSummary,
  PropertyType,
  TenureType,
  CouncilTaxBand,
  EpcRating,
  NearestStation,
  NearestSchool,
  PropertyPhoto,
} from '../../types/property';
import { analysePropertyText } from '../analyser/textAnalyser';

export interface ParseResult {
  property: Property;
  summary: FieldExtractionSummary[];
}

/**
 * Normalises raw string or number price into a clean integer GBP amount.
 */
export function parsePrice(rawPrice: unknown): number {
  if (typeof rawPrice === 'number') return Math.round(rawPrice);
  if (typeof rawPrice === 'string') {
    const cleaned = rawPrice.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Maps raw property type string into our strongly typed union.
 */
export function normalisePropertyType(rawType?: string): PropertyType {
  if (!rawType) return 'other';
  const t = rawType.toLowerCase();
  if (t.includes('semi-detached') || t.includes('semi detached')) return 'semi-detached';
  if (t.includes('end of terrace') || t.includes('end-of-terrace')) return 'end_of_terrace';
  if (t.includes('terraced') || t.includes('terrace')) return 'terraced';
  if (t.includes('detached')) return 'detached';
  if (t.includes('flat') || t.includes('apartment')) return 'flat';
  if (t.includes('maisonette')) return 'maisonette';
  if (t.includes('bungalow')) return 'bungalow';
  if (t.includes('cottage')) return 'cottage';
  if (t.includes('town house') || t.includes('townhouse')) return 'townhouse';
  return 'other';
}

/**
 * Maps raw tenure into our strongly typed union.
 */
export function normaliseTenure(rawTenure?: string): TenureType {
  if (!rawTenure) return 'unknown';
  const t = rawTenure.toLowerCase().replace(/_/g, ' ');
  if (t.includes('share of freehold')) return 'share_of_freehold';
  if (t.includes('freehold')) return 'freehold';
  if (t.includes('leasehold')) return 'leasehold';
  if (t.includes('commonhold')) return 'commonhold';
  return 'unknown';
}

export function parsePageModel(rawObj: unknown, source: Property['source'] = 'paste'): ParseResult {
  const summary: FieldExtractionSummary[] = [];

  // Locate propertyData block
  const root = rawObj as Record<string, unknown>;
  const data = (root.propertyData ||
    (root.model as Record<string, unknown>)?.propertyData ||
    root) as Record<string, unknown>;

  // Address
  const addressObj = (data.address || {}) as Record<string, unknown>;
  const displayAddress =
    String(addressObj.displayAddress || addressObj.streetAddress || data.displayAddress || 'Address not stated');
  const postcode = addressObj.postcode ? String(addressObj.postcode) : undefined;
  const latitude = typeof addressObj.latitude === 'number' ? addressObj.latitude : undefined;
  const longitude = typeof addressObj.longitude === 'number' ? addressObj.longitude : undefined;

  summary.push({
    fieldName: 'displayAddress',
    label: 'Address',
    status: displayAddress !== 'Address not stated' ? 'found' : 'missing',
    source: 'page_model',
  });

  // Price
  const pricesObj = (data.prices || {}) as Record<string, unknown>;
  const rawPrice = pricesObj.primaryPrice || data.price || data.listingPrice;
  const price = parsePrice(rawPrice);
  const priceQualifier = pricesObj.displayPriceQualifier ? String(pricesObj.displayPriceQualifier) : undefined;

  summary.push({
    fieldName: 'price',
    label: 'Asking Price',
    status: price > 0 ? 'found' : 'missing',
    source: 'page_model',
  });

  // Bedrooms & Bathrooms
  const bedrooms = typeof data.bedrooms === 'number' ? data.bedrooms : parseInt(String(data.bedrooms || 0), 10) || 0;
  const bathrooms = typeof data.bathrooms === 'number' ? data.bathrooms : parseInt(String(data.bathrooms || 0), 10) || 0;
  const receptions = typeof data.receptions === 'number' ? data.receptions : parseInt(String(data.receptions || 0), 10) || 0;

  summary.push({
    fieldName: 'bedrooms',
    label: 'Bedrooms',
    status: bedrooms > 0 ? 'found' : 'missing',
    source: 'page_model',
  });
  summary.push({
    fieldName: 'bathrooms',
    label: 'Bathrooms',
    status: bathrooms > 0 ? 'found' : 'missing',
    source: 'page_model',
  });

  // Property Type
  const rawPropType = String(data.propertySubType || data.propertyType || '');
  const propertyType = normalisePropertyType(rawPropType);
  summary.push({
    fieldName: 'propertyType',
    label: 'Property Type',
    status: rawPropType ? 'found' : 'missing',
    source: 'page_model',
  });

  // Tenure
  const tenureObj = (data.tenure || {}) as Record<string, unknown>;
  const rawTenure = String(tenureObj.tenureType || data.tenureType || data.tenure || '');
  const tenure = normaliseTenure(rawTenure);
  const leaseYears = typeof tenureObj.yearsRemainingOnLease === 'number'
    ? tenureObj.yearsRemainingOnLease
    : tenureObj.yearsRemainingOnLease
    ? parseInt(String(tenureObj.yearsRemainingOnLease), 10)
    : undefined;

  summary.push({
    fieldName: 'tenure',
    label: 'Tenure',
    status: tenure !== 'unknown' ? 'found' : 'missing',
    source: 'page_model',
  });

  if (tenure === 'leasehold') {
    summary.push({
      fieldName: 'leaseYearsRemaining',
      label: 'Lease Years Remaining',
      status: leaseYears !== undefined ? 'found' : 'missing',
      source: 'page_model',
    });
  }

  // Council Tax
  const councilTaxObj = (data.councilTax || {}) as Record<string, unknown>;
  const rawBand = String(councilTaxObj.councilTaxBand || data.councilTaxBand || '').toUpperCase();
  const validBands = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const councilTaxBand: CouncilTaxBand = validBands.includes(rawBand) ? (rawBand as CouncilTaxBand) : 'unknown';
  const councilTaxAnnual = typeof councilTaxObj.annualAmount === 'number' ? councilTaxObj.annualAmount : undefined;

  summary.push({
    fieldName: 'councilTaxBand',
    label: 'Council Tax Band',
    status: councilTaxBand !== 'unknown' ? 'found' : 'missing',
    source: 'page_model',
  });

  // EPC
  const epcObj = (data.energyPerformance || {}) as Record<string, unknown>;
  const rawEpc = String(epcObj.epcRating || data.epcRating || '').toUpperCase();
  const validEpc = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const epcRating: EpcRating = validEpc.includes(rawEpc) ? (rawEpc as EpcRating) : 'unknown';
  const epcCurrentScore = typeof epcObj.currentEnergyRating === 'number'
    ? epcObj.currentEnergyRating
    : parseInt(String(epcObj.currentEnergyRating || ''), 10) || undefined;

  summary.push({
    fieldName: 'epcRating',
    label: 'EPC Rating',
    status: epcRating !== 'unknown' ? 'found' : 'missing',
    source: 'page_model',
  });

  // Sizing / Floor Area
  const sizingObj = (data.sizing || {}) as Record<string, unknown>;
  let floorAreaSqFt: number | undefined;
  let floorAreaSqM: number | undefined;

  if (typeof sizingObj.maximumSizeSqFt === 'number') {
    floorAreaSqFt = sizingObj.maximumSizeSqFt;
  } else if (typeof data.floorAreaSqFt === 'number') {
    floorAreaSqFt = data.floorAreaSqFt;
  } else if (typeof sizingObj.displaySize === 'string') {
    const match = (sizingObj.displaySize as string).match(/([0-9,]+)\s*sq\s*ft/i);
    if (match) {
      floorAreaSqFt = parseInt(match[1].replace(/,/g, ''), 10);
    }
  }

  if (floorAreaSqFt) {
    floorAreaSqM = Math.round((floorAreaSqFt / 10.7639) * 10) / 10;
  }

  summary.push({
    fieldName: 'floorAreaSqFt',
    label: 'Floor Area',
    status: floorAreaSqFt !== undefined ? 'found' : 'missing',
    source: 'page_model',
  });

  // Key Features & Description
  const rawKeyFeatures = Array.isArray(data.keyFeatures) ? (data.keyFeatures as string[]) : [];
  const textObj = (data.text || {}) as Record<string, unknown>;
  const descriptionText = String(textObj.description || data.description || '');

  // Run Text Analyser to detect features structured data lacks
  const analysis = analysePropertyText(descriptionText, rawKeyFeatures);

  // Merge analysis into summary with evidence
  summary.push({
    fieldName: 'loftStatus',
    label: 'Loft Status',
    status: analysis.loftStatus !== 'not_mentioned' ? 'inferred' : 'missing',
    evidence: analysis.loftEvidence,
    source: 'text_analyser',
  });

  summary.push({
    fieldName: 'garageType',
    label: 'Garage Type',
    status: analysis.garageType !== 'none' ? 'inferred' : 'missing',
    evidence: analysis.garageEvidence,
    source: 'text_analyser',
  });

  summary.push({
    fieldName: 'gardenOrientation',
    label: 'Garden Orientation',
    status: analysis.gardenOrientation !== 'unknown' && analysis.gardenOrientation !== 'none' ? 'inferred' : 'missing',
    evidence: analysis.gardenOrientationEvidence,
    source: 'text_analyser',
  });

  summary.push({
    fieldName: 'parkingSpaces',
    label: 'Parking Capacity',
    status: analysis.hasDriveway || analysis.parkingSpacesInferred ? 'inferred' : 'missing',
    evidence: analysis.drivewayEvidence,
    source: 'text_analyser',
  });

  summary.push({
    fieldName: 'chainStatus',
    label: 'Chain Free Status',
    status: analysis.chainStatus !== 'unknown' ? 'inferred' : 'missing',
    evidence: analysis.chainStatusEvidence,
    source: 'text_analyser',
  });

  // Photos & Floorplans
  const photos: PropertyPhoto[] = [];
  const rawImages = Array.isArray(data.images) ? data.images : [];
  for (const img of rawImages) {
    if (typeof img === 'object' && img !== null) {
      const url = String((img as Record<string, unknown>).url || (img as Record<string, unknown>).srcUrl || '');
      const caption = String((img as Record<string, unknown>).caption || '');
      if (url) photos.push({ url, caption });
    }
  }

  const floorplans: PropertyPhoto[] = [];
  const rawFloorplans = Array.isArray(data.floorplans) ? data.floorplans : [];
  for (const fp of rawFloorplans) {
    if (typeof fp === 'object' && fp !== null) {
      const url = String((fp as Record<string, unknown>).url || '');
      const caption = String((fp as Record<string, unknown>).caption || 'Floorplan');
      if (url) floorplans.push({ url, caption });
    }
  }

  // Nearest Stations
  const nearestStations: NearestStation[] = [];
  const rawStations = Array.isArray(data.nearestStations) ? data.nearestStations : [];
  for (const st of rawStations) {
    if (typeof st === 'object' && st !== null) {
      const name = String((st as Record<string, unknown>).name || '');
      const dist = parseFloat(String((st as Record<string, unknown>).distance || 0));
      if (name) nearestStations.push({ name, distanceMiles: dist });
    }
  }

  // Nearest Schools
  const nearestSchools: NearestSchool[] = [];
  const rawSchools = Array.isArray(data.nearestSchools) ? data.nearestSchools : [];
  for (const sc of rawSchools) {
    if (typeof sc === 'object' && sc !== null) {
      const name = String((sc as Record<string, unknown>).name || '');
      const dist = parseFloat(String((sc as Record<string, unknown>).distance || 0));
      const ofsted = (sc as Record<string, unknown>).ofstedRating ? String((sc as Record<string, unknown>).ofstedRating) : undefined;
      if (name) nearestSchools.push({ name, distanceMiles: dist, ofstedRating: ofsted });
    }
  }

  // Agent
  const customerObj = (data.customer || {}) as Record<string, unknown>;
  const agent = customerObj.branchDisplayName
    ? {
        name: String(customerObj.branchDisplayName),
        phone: customerObj.contactTelephone ? String(customerObj.contactTelephone) : undefined,
      }
    : undefined;

  // History & Reductions
  const historyObj = (data.listingHistory || {}) as Record<string, unknown>;
  const reduced = String(historyObj.listingUpdateReason || '').toLowerCase().includes('reduced');
  const listingDate = historyObj.firstVisibleDate ? String(historyObj.firstVisibleDate) : undefined;

  const property: Property = {
    id: `prop_${data.id || Date.now()}`,
    rightmoveId: data.id ? String(data.id) : undefined,
    url: data.id ? `https://www.rightmove.co.uk/properties/${data.id}` : undefined,
    source,
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    displayAddress,
    postcode,
    coordinates: latitude && longitude ? { latitude, longitude } : undefined,

    price,
    priceQualifier,
    reduced,
    priceHistory: [],
    listingDate,

    tenure,
    leaseYearsRemaining: leaseYears,

    councilTaxBand,
    councilTaxAnnual,
    epcRating,
    epcCurrentScore,

    propertyType,
    bedrooms,
    bathrooms,
    receptions,
    floorAreaSqFt,
    floorAreaSqM,

    keyFeatures: rawKeyFeatures,
    descriptionText,

    photos,
    floorplans,

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

    nearestStations,
    nearestSchools,
    agent,
    detectedFeatures: analysis.allDetections,
    extractionSummary: summary,
  };

  return { property, summary };
}
