/**
 * Generates headline metrics and side-by-side comparison attributes.
 */

import { CurrentHouseProfile, Property } from '../../types/property';
import { WantCriterion } from '../../types/wants';
import { ComparisonAttribute, ComparisonSummary, HeadlineMetrics } from '../../types/comparison';
import { calculateFitScore } from './fitScore';
import { computeFinancialBreakdown } from '../finance/mortgageCalculator';
import { formatCurrency, formatDualArea } from '../utils/formatters';

export function generateComparisonSummary(
  currentHouse: CurrentHouseProfile,
  newProperty: Property,
  wants: WantCriterion[]
): ComparisonSummary {
  const fitScore = calculateFitScore(newProperty, wants, currentHouse);
  const finance = computeFinancialBreakdown(currentHouse, newProperty);

  // 1. Headline metrics
  const currentPrice = currentHouse.estimatedCurrentValue || currentHouse.price || 0;
  const priceDiff = newProperty.price - currentPrice;
  const priceDiffPct = currentPrice > 0 ? (priceDiff / currentPrice) * 100 : 0;

  const currentArea = currentHouse.floorAreaSqFt || 0;
  const newArea = newProperty.floorAreaSqFt || 0;
  const areaDiffSqFt = newArea && currentArea ? newArea - currentArea : 0;
  const areaDiffSqM = Math.round((areaDiffSqFt / 10.7639) * 10) / 10;
  const areaDiffPct = currentArea > 0 && newArea > 0 ? ((newArea - currentArea) / currentArea) * 100 : 0;

  const pricePerSqFtCurrent = currentPrice > 0 && currentArea > 0 ? Math.round(currentPrice / currentArea) : 0;
  const pricePerSqFtNew = newProperty.price > 0 && newArea > 0 ? Math.round(newProperty.price / newArea) : 0;
  const pricePerSqFtDiff = pricePerSqFtNew && pricePerSqFtCurrent ? pricePerSqFtNew - pricePerSqFtCurrent : 0;

  const headlineMetrics: HeadlineMetrics = {
    priceDifferenceGbp: priceDiff,
    priceDifferencePercent: Math.round(priceDiffPct * 10) / 10,
    monthlyCostDifferenceGbp: finance.monthlyDifference,
    floorAreaDifferenceSqFt: areaDiffSqFt,
    floorAreaDifferenceSqM: areaDiffSqM,
    floorAreaDifferencePercent: Math.round(areaDiffPct * 10) / 10,
    pricePerSqFtCurrent,
    pricePerSqFtNew,
    pricePerSqFtDifferenceGbp: pricePerSqFtDiff,
  };

  // 2. Side-by-side attributes
  const attributes: ComparisonAttribute[] = [];

  const wantsKeyMap = new Map(wants.map((w) => [w.fieldKey, w.importance]));

  // Helper to add attribute
  function addAttr(
    id: string,
    category: ComparisonAttribute['category'],
    label: string,
    currentVal: string,
    newVal: string,
    status: ComparisonAttribute['status'],
    fieldKey?: string,
    detail?: string
  ) {
    const isDifferent = currentVal.trim().toLowerCase() !== newVal.trim().toLowerCase();
    const userImportance = fieldKey ? wantsKeyMap.get(fieldKey) : undefined;
    attributes.push({
      id,
      category,
      label,
      currentValueDisplay: currentVal,
      newValueDisplay: newVal,
      status,
      isDifferent,
      isWanted: !!userImportance && userImportance !== 'dont_care',
      userImportance,
      detail,
    });
  }

  // General & Space
  addAttr(
    'bedrooms',
    'Space & Layout',
    'Bedrooms',
    `${currentHouse.bedrooms}`,
    `${newProperty.bedrooms}`,
    newProperty.bedrooms > currentHouse.bedrooms ? 'better' : newProperty.bedrooms < currentHouse.bedrooms ? 'worse' : 'equal',
    'bedrooms'
  );

  addAttr(
    'bathrooms',
    'Space & Layout',
    'Bathrooms',
    `${currentHouse.bathrooms}`,
    `${newProperty.bathrooms}`,
    newProperty.bathrooms > currentHouse.bathrooms ? 'better' : newProperty.bathrooms < currentHouse.bathrooms ? 'worse' : 'equal',
    'bathrooms'
  );

  addAttr(
    'receptions',
    'Space & Layout',
    'Reception Rooms',
    `${currentHouse.receptions}`,
    `${newProperty.receptions}`,
    newProperty.receptions > currentHouse.receptions ? 'better' : newProperty.receptions < currentHouse.receptions ? 'worse' : 'equal',
    'receptions'
  );

  addAttr(
    'floor_area',
    'Space & Layout',
    'Floor Area',
    formatDualArea(currentHouse.floorAreaSqFt, currentHouse.floorAreaSqM),
    formatDualArea(newProperty.floorAreaSqFt, newProperty.floorAreaSqM),
    (newProperty.floorAreaSqFt || 0) > (currentHouse.floorAreaSqFt || 0) ? 'better' : (newProperty.floorAreaSqFt || 0) < (currentHouse.floorAreaSqFt || 0) ? 'worse' : 'equal',
    'floorAreaSqFt'
  );

  addAttr(
    'property_type',
    'Space & Layout',
    'Property Type',
    currentHouse.propertyType.replace('_', ' '),
    newProperty.propertyType.replace('_', ' '),
    'info',
    'propertyType'
  );

  addAttr(
    'en_suite',
    'Space & Layout',
    'En Suite Bathroom',
    currentHouse.hasEnSuite ? 'Yes' : 'No',
    newProperty.hasEnSuite ? 'Yes' : 'No',
    newProperty.hasEnSuite && !currentHouse.hasEnSuite ? 'better' : !newProperty.hasEnSuite && currentHouse.hasEnSuite ? 'worse' : 'equal',
    'hasEnSuite'
  );

  addAttr(
    'utility_room',
    'Space & Layout',
    'Utility Room',
    currentHouse.hasUtilityRoom ? 'Yes' : 'No',
    newProperty.hasUtilityRoom ? 'Yes' : 'No',
    newProperty.hasUtilityRoom && !currentHouse.hasUtilityRoom ? 'better' : !newProperty.hasUtilityRoom && currentHouse.hasUtilityRoom ? 'worse' : 'equal',
    'hasUtilityRoom'
  );

  addAttr(
    'downstairs_wc',
    'Space & Layout',
    'Downstairs WC / Cloakroom',
    currentHouse.hasDownstairsWc ? 'Yes' : 'No',
    newProperty.hasDownstairsWc ? 'Yes' : 'No',
    newProperty.hasDownstairsWc && !currentHouse.hasDownstairsWc ? 'better' : !newProperty.hasDownstairsWc && currentHouse.hasDownstairsWc ? 'worse' : 'equal',
    'hasDownstairsWc'
  );

  addAttr(
    'home_office',
    'Space & Layout',
    'Study / Home Office',
    currentHouse.hasHomeOfficeOrStudy ? 'Yes' : 'No',
    newProperty.hasHomeOfficeOrStudy ? 'Yes' : 'No',
    newProperty.hasHomeOfficeOrStudy && !currentHouse.hasHomeOfficeOrStudy ? 'better' : !newProperty.hasHomeOfficeOrStudy && currentHouse.hasHomeOfficeOrStudy ? 'worse' : 'equal',
    'hasHomeOfficeOrStudy'
  );

  addAttr(
    'loft_status',
    'Space & Layout',
    'Loft Status',
    currentHouse.loftStatus.replace(/_/g, ' '),
    newProperty.loftStatus.replace(/_/g, ' '),
    newProperty.loftStatus === 'converted_with_building_regs' && currentHouse.loftStatus !== 'converted_with_building_regs' ? 'better' : 'info',
    'loftStatus'
  );

  // Outdoor & Parking
  addAttr(
    'parking_spaces',
    'Outdoor & Parking',
    'Parking Spaces',
    `${currentHouse.parkingSpaces}`,
    `${newProperty.parkingSpaces}`,
    newProperty.parkingSpaces > currentHouse.parkingSpaces ? 'better' : newProperty.parkingSpaces < currentHouse.parkingSpaces ? 'worse' : 'equal',
    'parkingSpaces'
  );

  addAttr(
    'garage',
    'Outdoor & Parking',
    'Garage',
    currentHouse.garageType.replace('_', ' '),
    newProperty.garageType.replace('_', ' '),
    newProperty.garageType !== 'none' && currentHouse.garageType === 'none' ? 'better' : 'info',
    'garageType'
  );

  addAttr(
    'ev_charger',
    'Outdoor & Parking',
    'EV Charger',
    currentHouse.hasEvCharger ? 'Installed' : 'None',
    newProperty.hasEvCharger ? 'Installed' : 'None',
    newProperty.hasEvCharger && !currentHouse.hasEvCharger ? 'better' : !newProperty.hasEvCharger && currentHouse.hasEvCharger ? 'worse' : 'equal',
    'hasEvCharger'
  );

  addAttr(
    'garden_orientation',
    'Outdoor & Parking',
    'Garden Orientation',
    currentHouse.gardenOrientation.replace('_', '-'),
    newProperty.gardenOrientation.replace('_', '-'),
    ['south', 'south_west'].includes(newProperty.gardenOrientation) && !['south', 'south_west'].includes(currentHouse.gardenOrientation) ? 'better' : 'info',
    'gardenOrientation'
  );

  // Financial & Running Costs
  addAttr(
    'asking_price',
    'Financial & Running Costs',
    'Property Price / Value',
    formatCurrency(currentPrice),
    formatCurrency(newProperty.price),
    'info'
  );

  addAttr(
    'total_monthly',
    'Financial & Running Costs',
    'Estimated Total Monthly Outgoings',
    formatCurrency(finance.currentMonthlyOutgoings) + '/mo',
    formatCurrency(finance.totalNewMonthlyOutgoings) + '/mo',
    finance.monthlyDifference <= 0 ? 'better' : 'worse'
  );

  addAttr(
    'council_tax',
    'Financial & Running Costs',
    'Council Tax Band',
    `Band ${currentHouse.councilTaxBand}`,
    `Band ${newProperty.councilTaxBand}`,
    'info'
  );

  addAttr(
    'epc_rating',
    'Financial & Running Costs',
    'EPC Rating',
    `Band ${currentHouse.epcRating}`,
    `Band ${newProperty.epcRating}`,
    newProperty.epcRating < currentHouse.epcRating ? 'better' : newProperty.epcRating > currentHouse.epcRating ? 'worse' : 'equal',
    'epcRating'
  );

  // Tenure & Terms
  addAttr(
    'tenure',
    'Tenure & Terms',
    'Tenure',
    currentHouse.tenure.replace(/_/g, ' '),
    newProperty.tenure.replace(/_/g, ' '),
    newProperty.tenure === 'freehold' && currentHouse.tenure === 'leasehold' ? 'better' : 'info',
    'tenure'
  );

  if (newProperty.tenure === 'leasehold' || currentHouse.tenure === 'leasehold') {
    addAttr(
      'lease_length',
      'Tenure & Terms',
      'Lease Remaining',
      currentHouse.leaseYearsRemaining ? `${currentHouse.leaseYearsRemaining} years` : 'N/A (Freehold)',
      newProperty.leaseYearsRemaining ? `${newProperty.leaseYearsRemaining} years` : 'Unstated',
      'info'
    );
  }

  addAttr(
    'chain_status',
    'Tenure & Terms',
    'Chain Status',
    'N/A (Current home)',
    newProperty.chainStatus.replace(/_/g, ' '),
    newProperty.chainStatus === 'no_onward_chain' ? 'better' : 'info',
    'chainStatus'
  );

  return {
    currentProperty: currentHouse,
    newProperty,
    fitScore,
    headlineMetrics,
    attributes,
  };
}
