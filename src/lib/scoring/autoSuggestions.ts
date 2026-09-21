/**
 * Auto-suggests Wants and Priorities tailored directly to the user's Current House profile.
 */

import { CurrentHouseProfile } from '../../types/property';
import { WantCriterion } from '../../types/wants';

export function generateAutoSuggestions(currentHouse: CurrentHouseProfile): WantCriterion[] {
  const suggestions: WantCriterion[] = [];

  // 1. Bedrooms suggestion
  if (currentHouse.bedrooms > 0) {
    const targetBeds = currentHouse.bedrooms + 1;
    suggestions.push({
      id: `suggest_beds_${targetBeds}`,
      group: 'current_house',
      title: `At least ${targetBeds} bedrooms`,
      description: `Upgrade from your current ${currentHouse.bedrooms} bedroom home`,
      importance: 'must_have',
      valueType: 'min_number',
      targetValue: targetBeds,
      fieldKey: 'bedrooms',
      autoSuggested: true,
      suggestionReason: `Your current home has ${currentHouse.bedrooms} ${currentHouse.bedrooms === 1 ? 'bedroom' : 'bedrooms'}.`,
    });
  }

  // 2. Floor Area suggestion
  if (currentHouse.floorAreaSqFt && currentHouse.floorAreaSqFt > 0) {
    const targetSqFt = Math.round(currentHouse.floorAreaSqFt * 1.2 / 50) * 50; // ~20% increase rounded to 50
    suggestions.push({
      id: `suggest_floor_area_${targetSqFt}`,
      group: 'current_house',
      title: `Bigger floor area (> ${targetSqFt} sq ft)`,
      description: `At least 20% more living space than your current ${currentHouse.floorAreaSqFt} sq ft`,
      importance: 'important',
      valueType: 'min_number',
      targetValue: targetSqFt,
      fieldKey: 'floorAreaSqFt',
      autoSuggested: true,
      suggestionReason: `Current floor area is ${currentHouse.floorAreaSqFt} sq ft.`,
    });
  }

  // 3. Parking suggestion
  if (currentHouse.parkingSpaces === 0 || !currentHouse.hasDriveway) {
    suggestions.push({
      id: 'suggest_off_street_parking',
      group: 'current_house',
      title: 'Dedicated off-street parking / driveway',
      description: 'Private vehicle parking right outside your home',
      importance: 'must_have',
      valueType: 'min_number',
      targetValue: 1,
      fieldKey: 'parkingSpaces',
      autoSuggested: true,
      suggestionReason: 'Your current home does not have private off-street parking.',
    });
  } else if (currentHouse.parkingSpaces === 1) {
    suggestions.push({
      id: 'suggest_second_parking_space',
      group: 'current_house',
      title: 'At least 2 parking spaces',
      description: 'Room for 2 household vehicles or visitors',
      importance: 'nice_to_have',
      valueType: 'min_number',
      targetValue: 2,
      fieldKey: 'parkingSpaces',
      autoSuggested: true,
      suggestionReason: 'Your current home only has 1 parking space.',
    });
  }

  // 4. Garden orientation suggestion
  if (
    currentHouse.gardenOrientation === 'north' ||
    currentHouse.gardenOrientation === 'east' ||
    currentHouse.gardenOrientation === 'none' ||
    !currentHouse.hasGarden
  ) {
    suggestions.push({
      id: 'suggest_sunny_garden',
      group: 'current_house',
      title: 'South or West facing sunny garden',
      description: 'Enjoy sunlight into late afternoon and summer evenings',
      importance: 'important',
      valueType: 'enum',
      targetValue: 'south_or_west',
      fieldKey: 'gardenOrientation',
      autoSuggested: true,
      suggestionReason: `Current home garden orientation is ${currentHouse.gardenOrientation === 'none' ? 'non-existent' : currentHouse.gardenOrientation}.`,
    });
  }

  // 5. En suite bathroom suggestion
  if (!currentHouse.hasEnSuite) {
    suggestions.push({
      id: 'suggest_en_suite',
      group: 'current_house',
      title: 'En suite bathroom to master bedroom',
      description: 'Dedicated private bathroom off the main bedroom',
      importance: 'important',
      valueType: 'boolean',
      targetValue: true,
      fieldKey: 'hasEnSuite',
      autoSuggested: true,
      suggestionReason: 'Your current home does not have an en suite.',
    });
  }

  // 6. Downstairs WC suggestion
  if (!currentHouse.hasDownstairsWc && currentHouse.propertyType !== 'flat') {
    suggestions.push({
      id: 'suggest_downstairs_wc',
      group: 'current_house',
      title: 'Downstairs guest WC / cloakroom',
      description: 'Convenient ground-floor toilet for guests and family',
      importance: 'important',
      valueType: 'boolean',
      targetValue: true,
      fieldKey: 'hasDownstairsWc',
      autoSuggested: true,
      suggestionReason: 'Your current home does not have a ground-floor WC.',
    });
  }

  // 7. Utility room suggestion
  if (!currentHouse.hasUtilityRoom) {
    suggestions.push({
      id: 'suggest_utility_room',
      group: 'current_house',
      title: 'Separate utility room',
      description: 'Keep washing machine, laundry, and cleaning storage out of the kitchen',
      importance: 'nice_to_have',
      valueType: 'boolean',
      targetValue: true,
      fieldKey: 'hasUtilityRoom',
      autoSuggested: true,
      suggestionReason: 'Your current home lacks a dedicated utility room.',
    });
  }

  // 8. Energy / EPC suggestion
  if (['D', 'E', 'F', 'G', 'unknown'].includes(currentHouse.epcRating)) {
    suggestions.push({
      id: 'suggest_better_epc',
      group: 'current_house',
      title: 'Energy efficient rating (EPC Band C or above)',
      description: 'Lower energy bills and superior thermal insulation',
      importance: 'important',
      valueType: 'enum',
      targetValue: 'C_or_above',
      fieldKey: 'epcRating',
      autoSuggested: true,
      suggestionReason: `Your current home EPC rating is Band ${currentHouse.epcRating}.`,
    });
  }

  // 9. Converted or boarded loft suggestion
  if (currentHouse.loftStatus === 'not_mentioned') {
    suggestions.push({
      id: 'suggest_loft_storage',
      group: 'current_house',
      title: 'Boarded or converted loft space',
      description: 'Valuable attic storage or habitable extra space',
      importance: 'nice_to_have',
      valueType: 'enum',
      targetValue: 'boarded_or_converted',
      fieldKey: 'loftStatus',
      autoSuggested: true,
      suggestionReason: 'Your current home does not have confirmed loft storage.',
    });
  }

  // 10. Suggestions based on user frustrations
  for (const frustration of currentHouse.frustrations || []) {
    const text = frustration.toLowerCase();
    if (text.includes('noise') || text.includes('loud') || text.includes('traffic')) {
      suggestions.push({
        id: 'suggest_quiet_road',
        group: 'current_house',
        title: 'Quiet residential road / cul-de-sac',
        description: 'Peaceful location away from busy thoroughfares',
        importance: 'important',
        valueType: 'text_match',
        targetValue: 'cul-de-sac, quiet road, peaceful, residential cul-de-sac',
        fieldKey: 'customKeywords',
        autoSuggested: true,
        suggestionReason: `Matches frustration: "${frustration}"`,
      });
    } else if (text.includes('kitchen') || text.includes('cramped cooking')) {
      suggestions.push({
        id: 'suggest_open_kitchen',
        group: 'current_house',
        title: 'Open-plan kitchen diner / large kitchen',
        description: 'Modern spacious kitchen with dining space',
        importance: 'important',
        valueType: 'boolean',
        targetValue: true,
        fieldKey: 'hasOpenPlanKitchen',
        autoSuggested: true,
        suggestionReason: `Matches frustration: "${frustration}"`,
      });
    }
  }

  return suggestions;
}
