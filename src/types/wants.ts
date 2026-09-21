/**
 * Types representing user priorities, wants, and deal breakers.
 */

export type WantImportance = 'deal_breaker' | 'must_have' | 'important' | 'nice_to_have' | 'dont_care';

export type WantGroup = 'general' | 'current_house' | 'custom';

export type WantValueType = 'boolean' | 'min_number' | 'max_number' | 'enum' | 'text_match';

export interface WantCriterion {
  id: string;
  group: WantGroup;
  title: string;
  description?: string;
  importance: WantImportance;
  valueType: WantValueType;
  targetValue?: string | number | boolean;
  fieldKey: string; // Mapping to Property field or detected feature key
  autoSuggested?: boolean;
  suggestionReason?: string; // e.g. "Suggested because your current house only has 1 bathroom"
  customKeywords?: string[]; // for custom free-text wants
}

export interface WantEvaluation {
  criterionId: string;
  title: string;
  importance: WantImportance;
  weight: number;
  status: 'met' | 'failed' | 'unknown';
  isDealBreakerHit: boolean;
  pointsEarned: number;
  maxPoints: number;
  evidence?: string;
  detail: string; // Explanatory plain English message
}

export interface FitScoreResult {
  propertyId: string;
  overallScore: number; // 0 - 100
  baselineScore?: number; // Current house score for comparison
  scoreDelta?: number; // New house score minus baseline
  isDealBreakerHit: boolean;
  dealBreakersTriggered: string[];
  mustHavesMetCount: number;
  mustHavesTotalCount: number;
  niceToHavesMetCount: number;
  niceToHavesTotalCount: number;
  evaluations: WantEvaluation[];
  plainEnglishVerdict: string;
}
