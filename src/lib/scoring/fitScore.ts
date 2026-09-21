/**
 * Weighted Fit Score and Deal Breaker evaluation engine.
 * Transparent, item-by-item calculation with evidence citation.
 */

import { Property } from '../../types/property';
import { WantCriterion, WantEvaluation, FitScoreResult, WantImportance } from '../../types/wants';

export const IMPORTANCE_WEIGHTS: Record<WantImportance, number> = {
  deal_breaker: 5,
  must_have: 5,
  important: 3,
  nice_to_have: 1,
  dont_care: 0,
};

const EPC_ORDER: Record<string, number> = {
  A: 7,
  B: 6,
  C: 5,
  D: 4,
  E: 3,
  F: 2,
  G: 1,
  unknown: 0,
};

/**
 * Evaluates a single criterion against a property.
 */
export function evaluateCriterion(criterion: WantCriterion, property: Property): WantEvaluation {
  const weight = IMPORTANCE_WEIGHTS[criterion.importance];
  const maxPoints = weight;

  if (criterion.importance === 'dont_care') {
    return {
      criterionId: criterion.id,
      title: criterion.title,
      importance: criterion.importance,
      weight: 0,
      status: 'met',
      isDealBreakerHit: false,
      pointsEarned: 0,
      maxPoints: 0,
      detail: 'Ignored (marked as Don’t care).',
    };
  }

  let met = false;
  let unknown = false;
  let evidence: string | undefined;
  let detail = '';

  const propValue = (property as unknown as Record<string, unknown>)[criterion.fieldKey];

  // Specific evaluations based on fieldKey and valueType
  if (criterion.fieldKey === 'epcRating') {
    if (!property.epcRating || property.epcRating === 'unknown') {
      unknown = true;
      detail = 'EPC rating is not recorded for this property.';
    } else if (criterion.targetValue === 'C_or_above') {
      met = EPC_ORDER[property.epcRating] >= EPC_ORDER['C'];
      detail = `EPC is Band ${property.epcRating} (requires C or above).`;
    } else if (criterion.targetValue === 'B_or_above') {
      met = EPC_ORDER[property.epcRating] >= EPC_ORDER['B'];
      detail = `EPC is Band ${property.epcRating} (requires B or above).`;
    } else {
      met = EPC_ORDER[property.epcRating] >= (EPC_ORDER[String(criterion.targetValue)] || 0);
      detail = `EPC is Band ${property.epcRating}.`;
    }
  } else if (criterion.fieldKey === 'gardenOrientation') {
    if (criterion.targetValue === 'south_or_west') {
      met = ['south', 'south_west', 'west'].includes(property.gardenOrientation);
      const detection = property.detectedFeatures.find((d) => d.key === 'garden_orientation');
      evidence = detection?.evidence;
      detail = met
        ? `Garden is ${property.gardenOrientation.replace('_', '-')}-facing.`
        : property.gardenOrientation === 'unknown'
        ? 'Garden orientation unconfirmed in listing.'
        : `Garden is ${property.gardenOrientation}-facing (not south/west).`;
      if (property.gardenOrientation === 'unknown') unknown = true;
    } else {
      met = property.gardenOrientation === criterion.targetValue;
      detail = `Garden orientation: ${property.gardenOrientation}.`;
    }
  } else if (criterion.fieldKey === 'loftStatus') {
    const detection = property.detectedFeatures.find((d) => d.key === 'loft_status');
    evidence = detection?.evidence;
    if (criterion.targetValue === 'converted_with_building_regs') {
      met = property.loftStatus === 'converted_with_building_regs';
      detail = met
        ? 'Loft is converted with building regulations approval.'
        : 'Loft is not recorded as converted with building regulations.';
    } else if (criterion.targetValue === 'boarded_or_converted') {
      met = property.loftStatus !== 'not_mentioned';
      detail = met
        ? `Loft status: ${property.loftStatus.replace(/_/g, ' ')}.`
        : 'Loft storage not mentioned in listing.';
    } else {
      met = property.loftStatus !== 'not_mentioned';
      detail = `Loft status: ${property.loftStatus.replace(/_/g, ' ')}.`;
    }
  } else if (criterion.fieldKey === 'customKeywords' || criterion.valueType === 'text_match') {
    const keywordsStr = String(criterion.targetValue || '');
    const keywords = keywordsStr.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
    const textToSearch = `${property.keyFeatures.join(' ')} ${property.descriptionText}`.toLowerCase();

    const matchedKw = keywords.find((kw) => textToSearch.includes(kw));
    if (matchedKw) {
      met = true;
      detail = `Matched keyword "${matchedKw}" in listing description.`;
      // Find sentence with keyword
      const idx = textToSearch.indexOf(matchedKw);
      evidence = property.descriptionText.slice(Math.max(0, idx - 40), Math.min(property.descriptionText.length, idx + 80)).trim();
    } else {
      met = false;
      detail = `Could not find keywords ("${keywords.join(', ')}") in listing.`;
    }
  } else if (criterion.valueType === 'min_number') {
    const val = typeof propValue === 'number' ? propValue : 0;
    const target = Number(criterion.targetValue) || 0;
    if (propValue === undefined || propValue === null) {
      unknown = true;
      detail = `${criterion.title}: data unconfirmed.`;
    } else {
      met = val >= target;
      detail = `Has ${val} (target: at least ${target}).`;
    }
  } else if (criterion.valueType === 'max_number') {
    const val = typeof propValue === 'number' ? propValue : 0;
    const target = Number(criterion.targetValue) || 0;
    if (propValue === undefined || propValue === null) {
      unknown = true;
      detail = `${criterion.title}: data unconfirmed.`;
    } else {
      met = val <= target;
      detail = `Has ${val} (target: maximum ${target}).`;
    }
  } else if (criterion.valueType === 'boolean') {
    met = propValue === true;
    const feature = property.detectedFeatures.find((f) => f.key === criterion.fieldKey);
    evidence = feature?.evidence;
    detail = met ? 'Confirmed present in listing.' : 'Not confirmed in listing.';
  } else {
    met = String(propValue) === String(criterion.targetValue);
    detail = `Value is ${String(propValue)} (target: ${String(criterion.targetValue)}).`;
  }

  const isDealBreakerHit = criterion.importance === 'deal_breaker' && !met && !unknown;
  const status = unknown ? 'unknown' : met ? 'met' : 'failed';
  const pointsEarned = met ? maxPoints : 0;

  return {
    criterionId: criterion.id,
    title: criterion.title,
    importance: criterion.importance,
    weight,
    status,
    isDealBreakerHit,
    pointsEarned,
    maxPoints,
    evidence,
    detail,
  };
}

/**
 * Calculates overall Fit Score (0 - 100) and evaluation summary.
 */
export function calculateFitScore(
  property: Property,
  wants: WantCriterion[],
  baselineProperty?: Property
): FitScoreResult {
  const activeWants = wants.filter((w) => w.importance !== 'dont_care');
  const evaluations = activeWants.map((w) => evaluateCriterion(w, property));

  let totalEarned = 0;
  let totalPossible = 0;
  const dealBreakersTriggered: string[] = [];

  let mustHavesMetCount = 0;
  let mustHavesTotalCount = 0;
  let niceToHavesMetCount = 0;
  let niceToHavesTotalCount = 0;

  for (const evalResult of evaluations) {
    totalPossible += evalResult.maxPoints;
    totalEarned += evalResult.pointsEarned;

    if (evalResult.importance === 'deal_breaker') {
      if (evalResult.isDealBreakerHit) {
        dealBreakersTriggered.push(evalResult.title);
      }
    }

    if (evalResult.importance === 'must_have') {
      mustHavesTotalCount++;
      if (evalResult.status === 'met') mustHavesMetCount++;
    }

    if (evalResult.importance === 'nice_to_have') {
      niceToHavesTotalCount++;
      if (evalResult.status === 'met') niceToHavesMetCount++;
    }
  }

  let overallScore = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

  // If deal breaker is triggered, cap overall score or mark deal breaker
  const isDealBreakerHit = dealBreakersTriggered.length > 0;

  // Baseline comparison if provided (e.g. current house)
  let baselineScore: number | undefined;
  let scoreDelta: number | undefined;

  if (baselineProperty) {
    const baselineEvaluations = activeWants.map((w) => evaluateCriterion(w, baselineProperty));
    const baselineEarned = baselineEvaluations.reduce((acc, e) => acc + e.pointsEarned, 0);
    const baselinePossible = baselineEvaluations.reduce((acc, e) => acc + e.maxPoints, 0);
    baselineScore = baselinePossible > 0 ? Math.round((baselineEarned / baselinePossible) * 100) : 0;
    scoreDelta = overallScore - baselineScore;
  }

  // Generate plain English verdict
  let plainEnglishVerdict = '';
  if (isDealBreakerHit) {
    plainEnglishVerdict = `Deal breaker triggered: ${dealBreakersTriggered.join(', ')}. Not recommended.`;
  } else if (scoreDelta !== undefined) {
    if (scoreDelta >= 20) {
      plainEnglishVerdict = 'Substantial upgrade over your current home across major priorities.';
    } else if (scoreDelta > 0) {
      plainEnglishVerdict = 'Moderate improvement over your current home, with some compromises.';
    } else if (scoreDelta === 0) {
      plainEnglishVerdict = 'Comparable fit to your current home with minimal net improvement.';
    } else {
      plainEnglishVerdict = 'Scores lower than your current home against your stated priorities.';
    }
  } else {
    if (overallScore >= 80) {
      plainEnglishVerdict = 'Excellent fit across almost all your requirements.';
    } else if (overallScore >= 60) {
      plainEnglishVerdict = 'Good fit overall with a few minor compromises.';
    } else {
      plainEnglishVerdict = 'Misses several important priorities.';
    }
  }

  return {
    propertyId: property.id,
    overallScore,
    baselineScore,
    scoreDelta,
    isDealBreakerHit,
    dealBreakersTriggered,
    mustHavesMetCount,
    mustHavesTotalCount,
    niceToHavesMetCount,
    niceToHavesTotalCount,
    evaluations,
    plainEnglishVerdict,
  };
}
