/**
 * Sample Current House Profile and Realistic Rightmove Listings.
 */

import { CurrentHouseProfile, Property } from '../../types/property';
import { parseListingInput } from './index';

import fixture1 from '../../tests/fixtures/01-victorian-semi.json';
import fixture2 from '../../tests/fixtures/02-modern-leasehold-flat.json';
import fixture3 from '../../tests/fixtures/03-detached-family-home.json';
import fixture4 from '../../tests/fixtures/04-period-conversion-flat.json';
import fixture5 from '../../tests/fixtures/05-brand-new-build.json';

export const SAMPLE_CURRENT_HOUSE: CurrentHouseProfile = {
  id: 'current_house_sample',
  isCurrentHouse: true,
  profileName: 'Our 2-Bed Terrace in Oxford',
  source: 'manual',
  addedAt: '2024-01-15T09:00:00Z',
  updatedAt: '2024-01-15T09:00:00Z',

  displayAddress: '28 Stanley Road, Oxford, OX4 1QZ',
  postcode: 'OX4 1QZ',
  price: 375000,
  estimatedCurrentValue: 385000,
  outstandingMortgage: 185000,
  currentInterestRate: 3.8,
  reduced: false,
  priceHistory: [],

  tenure: 'freehold',
  councilTaxBand: 'C',
  councilTaxAnnual: 1980,
  epcRating: 'D',
  epcCurrentScore: 62,

  propertyType: 'terraced',
  bedrooms: 2,
  bathrooms: 1,
  receptions: 1,
  floorAreaSqFt: 780,
  floorAreaSqM: 72.5,

  parkingSpaces: 0,
  garageType: 'none',
  hasDriveway: false,
  hasEvCharger: false,
  gardenOrientation: 'north',
  hasGarden: true,
  hasPatioOrDecking: true,
  hasOutbuilding: false,

  hasEnSuite: false,
  hasUtilityRoom: false,
  hasDownstairsWc: false,
  hasHomeOfficeOrStudy: false,
  hasOpenPlanKitchen: false,
  loftStatus: 'boarded',

  hasNewBoiler: false,
  hasSolarPanels: false,
  hasUnderfloorHeating: false,
  needsModernisation: false,
  chainStatus: 'unknown',

  keyFeatures: [
    'Victorian 2-bedroom mid-terrace house',
    'Enclosed rear patio garden',
    'Boarded loft storage with ladder',
    'On-street resident permit parking (CPZ)',
    'Original character fireplaces and sash windows'
  ],
  descriptionText: 'A delightful 2-bedroom mid-terrace Victorian home with boarded loft storage and north-facing courtyard garden. On-street resident permit parking.',

  photos: [
    { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000', caption: 'Front Exterior' }
  ],
  floorplans: [],

  monthlyCosts: {
    monthlyMortgageOrRent: 940,
    monthlyCouncilTax: 165,
    monthlyEnergy: 160,
    monthlyWater: 35,
    monthlyServiceCharge: 0,
    monthlyGroundRent: 0,
    monthlyInsurance: 30,
  },

  thingsWeLove: [
    'Original Victorian character, stripped pine floors, and high ceilings',
    'Friendly neighbours and active community street WhatsApp',
    'Walking distance to local bakery, independent grocer, and South Park'
  ],

  frustrations: [
    'No off-street parking - parking can be very tricky on Friday evenings',
    'North-facing garden gets almost no sun after 3pm in summer',
    'Cramped kitchen with no room for a proper dining table',
    'Need a dedicated 3rd bedroom for a permanent work-from-home office',
    'Only 1 bathroom with no downstairs guest toilet'
  ],

  nearestStations: [
    { name: 'Oxford Central', distanceMiles: 1.8 }
  ],
  nearestSchools: [
    { name: 'St Mary & St John Primary', distanceMiles: 0.3, ofstedRating: 'Good' }
  ],

  detectedFeatures: [
    { key: 'loft_status', label: 'Loft Status', detected: true, value: 'boarded', confidence: 'high' }
  ],
  extractionSummary: [],
};

export function getSampleListings(): Property[] {
  const p1 = parseListingInput(fixture1, 'sample').property;
  const p2 = parseListingInput(fixture2, 'sample').property;
  const p3 = parseListingInput(fixture3, 'sample').property;
  const p4 = parseListingInput(fixture4, 'sample').property;
  const p5 = parseListingInput(fixture5, 'sample').property;

  return [p1, p2, p3, p4, p5];
}
