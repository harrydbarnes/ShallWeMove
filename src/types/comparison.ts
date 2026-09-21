/**
 * Types for property comparison views and shortlist rankings.
 */

import { Property } from './property';
import { FitScoreResult } from './wants';

export type ComparisonStatus = 'better' | 'worse' | 'equal' | 'info';

export interface ComparisonAttribute {
  id: string;
  category: 'Space & Layout' | 'Outdoor & Parking' | 'Financial & Running Costs' | 'Location & Transport' | 'Condition & Specification' | 'Tenure & Terms';
  label: string;
  currentValueDisplay: string;
  newValueDisplay: string;
  status: ComparisonStatus;
  isDifferent: boolean;
  isWanted: boolean; // matched by user's wants list
  userImportance?: string;
  detail?: string;
}

export interface HeadlineMetrics {
  priceDifferenceGbp: number;
  priceDifferencePercent: number;
  monthlyCostDifferenceGbp: number;
  floorAreaDifferenceSqFt: number;
  floorAreaDifferenceSqM: number;
  floorAreaDifferencePercent: number;
  pricePerSqFtCurrent: number;
  pricePerSqFtNew: number;
  pricePerSqFtDifferenceGbp: number;
}

export interface ComparisonSummary {
  currentProperty: Property;
  newProperty: Property;
  fitScore: FitScoreResult;
  headlineMetrics: HeadlineMetrics;
  attributes: ComparisonAttribute[];
}
