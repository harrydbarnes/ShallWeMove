/**
 * Types representing a UK property listing (portal extraction and manual inputs).
 * Strictly in British English: postcode, council tax, tenure, ground rent, service charge, etc.
 */

export type TenureType = 'freehold' | 'leasehold' | 'share_of_freehold' | 'commonhold' | 'unknown';

export type PropertyType =
  | 'detached'
  | 'semi-detached'
  | 'terraced'
  | 'end_of_terrace'
  | 'flat'
  | 'maisonette'
  | 'bungalow'
  | 'cottage'
  | 'townhouse'
  | 'park_home'
  | 'other';

export type CouncilTaxBand = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'unknown';

export type EpcRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'unknown';

export type LoftStatus =
  | 'not_mentioned'
  | 'boarded'
  | 'boarded_with_ladder_light'
  | 'converted_with_building_regs';

export type GarageType = 'none' | 'single' | 'double' | 'integral' | 'detached';

export type GardenOrientation =
  | 'south'
  | 'south_west'
  | 'west'
  | 'east'
  | 'north'
  | 'unknown'
  | 'none';

export type ChainStatus = 'chain_free' | 'no_onward_chain' | 'chain_in_progress' | 'unknown';

export type FieldStatus = 'found' | 'inferred' | 'missing';

export interface FieldExtractionSummary {
  fieldName: string;
  label: string;
  status: FieldStatus;
  evidence?: string;
  source?: 'page_model' | 'json_ld' | 'text_heuristics' | 'text_analyser' | 'user_input';
}

export interface NearestStation {
  name: string;
  distanceMiles: number;
  type?: 'national_rail' | 'london_underground' | 'overground' | 'dlr' | 'tram' | 'station';
}

export interface NearestSchool {
  name: string;
  distanceMiles: number;
  type?: string; // Primary, Secondary, etc.
  ofstedRating?: 'Outstanding' | 'Good' | 'Requires Improvement' | 'Inadequate' | 'Not inspected' | string;
}

export interface PropertyPhoto {
  url: string;
  caption?: string;
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  changePercent?: number;
  qualifier?: string;
}

export interface DetectedFeature {
  key: string;
  label: string;
  detected: boolean;
  value?: string | number | boolean;
  evidence?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AgentInfo {
  name: string;
  branchName?: string;
  phone?: string;
  displayAddress?: string;
  logoUrl?: string;
}

export interface Property {
  id: string;
  rightmoveId?: string;
  zooplaId?: string;
  url?: string;
  source: 'bookmarklet' | 'paste' | 'manual' | 'sample';
  addedAt: string;
  updatedAt: string;

  // Address and Geography
  displayAddress: string;
  postcode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Pricing
  price: number;
  priceQualifier?: string; // "Guide Price", "Offers in Region of", "Fixed Price"
  originalPrice?: number;
  reduced: boolean;
  reductionPercentage?: number;
  priceHistory: PriceHistoryEntry[];

  // Dates & Market Activity
  listingDate?: string;
  daysOnMarket?: number;

  // Tenure & Charges
  tenure: TenureType;
  leaseYearsRemaining?: number;
  groundRentAnnual?: number;
  groundRentReviewPeriod?: string;
  serviceChargeAnnual?: number;
  sharedOwnershipPercentage?: number;

  // Council Tax & EPC
  councilTaxBand: CouncilTaxBand;
  councilTaxAnnual?: number;
  epcRating: EpcRating;
  epcCurrentScore?: number;
  epcPotentialScore?: number;

  // Physical Dimensions & Accommodation
  propertyType: PropertyType;
  propertyStyle?: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  floorAreaSqFt?: number;
  floorAreaSqM?: number;
  plotSizeSqFt?: number;
  plotSizeAcres?: number;

  // Key Features & Full Text
  keyFeatures: string[];
  descriptionText: string;

  // Media
  photos: PropertyPhoto[];
  floorplans: PropertyPhoto[];

  // Utilities & Specifications
  heatingType?: string; // Gas central, heat pump, electric, etc.
  glazingType?: string; // Double glazing, triple glazing, sash, etc.
  broadbandSpeed?: string; // Standard, Superfast, Ultrafast
  floodRisk?: string; // Very Low, Low, Medium, High

  // External / Garden & Parking
  parkingSpaces: number;
  garageType: GarageType;
  hasDriveway: boolean;
  hasEvCharger: boolean;
  gardenOrientation: GardenOrientation;
  hasGarden: boolean;
  hasPatioOrDecking: boolean;
  hasOutbuilding: boolean; // Garden office, summerhouse, workshop

  // Interior Room Features
  hasEnSuite: boolean;
  hasUtilityRoom: boolean;
  hasDownstairsWc: boolean;
  hasHomeOfficeOrStudy: boolean;
  hasOpenPlanKitchen: boolean;
  loftStatus: LoftStatus;

  // Condition & Energy
  hasNewBoiler: boolean;
  hasSolarPanels: boolean;
  hasUnderfloorHeating: boolean;
  needsModernisation: boolean;
  chainStatus: ChainStatus;

  // Local Amenities
  nearestStations: NearestStation[];
  nearestSchools: NearestSchool[];

  // Agent
  agent?: AgentInfo;

  // Text Analyser Evidence Map
  detectedFeatures: DetectedFeature[];

  // Extraction Tracking
  extractionSummary: FieldExtractionSummary[];
}

/**
 * Current House Profile extensions
 */
export interface CurrentHouseCosts {
  monthlyMortgageOrRent: number;
  monthlyCouncilTax: number;
  monthlyEnergy: number; // Gas + Electricity
  monthlyWater: number;
  monthlyServiceCharge: number;
  monthlyGroundRent: number;
  monthlyInsurance: number;
}

export interface CurrentHouseProfile extends Property {
  isCurrentHouse: true;
  profileName: string; // e.g. "Our current 2-bed in Acton"
  estimatedCurrentValue: number;
  outstandingMortgage: number;
  currentInterestRate?: number;
  monthlyCosts: CurrentHouseCosts;
  thingsWeLove: string[];
  frustrations: string[];
}
