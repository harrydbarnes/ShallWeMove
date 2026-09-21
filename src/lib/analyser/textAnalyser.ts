/**
 * British Property Text Analyser.
 * Scans property descriptions and key features to detect features the structured data misses.
 * Captures exact evidence phrases for every detection.
 */

import {
  LoftStatus,
  GarageType,
  GardenOrientation,
  ChainStatus,
  DetectedFeature,
} from '../../types/property';

export interface AnalysisResult {
  loftStatus: LoftStatus;
  loftEvidence?: string;

  garageType: GarageType;
  garageEvidence?: string;

  parkingSpacesInferred?: number;
  hasDriveway: boolean;
  drivewayEvidence?: string;

  hasEvCharger: boolean;
  evChargerEvidence?: string;

  gardenOrientation: GardenOrientation;
  gardenOrientationEvidence?: string;

  hasPatioOrDecking: boolean;
  patioOrDeckingEvidence?: string;

  hasOutbuilding: boolean;
  outbuildingEvidence?: string;

  hasEnSuite: boolean;
  enSuiteEvidence?: string;

  hasUtilityRoom: boolean;
  utilityRoomEvidence?: string;

  hasDownstairsWc: boolean;
  downstairsWcEvidence?: string;

  hasHomeOfficeOrStudy: boolean;
  homeOfficeEvidence?: string;

  hasOpenPlanKitchen: boolean;
  openPlanKitchenEvidence?: string;

  hasNewBoiler: boolean;
  newBoilerEvidence?: string;

  hasSolarPanels: boolean;
  solarPanelsEvidence?: string;

  hasUnderfloorHeating: boolean;
  underfloorHeatingEvidence?: string;

  needsModernisation: boolean;
  needsModernisationEvidence?: string;

  chainStatus: ChainStatus;
  chainStatusEvidence?: string;

  allDetections: DetectedFeature[];
}

/**
 * Extracts the surrounding sentence or clause matching a regex pattern.
 */
function extractEvidenceSnippet(fullText: string, matchIndex: number, matchLength: number): string {
  const windowStart = Math.max(0, matchIndex - 80);
  const windowEnd = Math.min(fullText.length, matchIndex + matchLength + 80);
  let snippet = fullText.slice(windowStart, windowEnd).trim();

  // Try to clean up sentence boundaries
  const firstPeriod = snippet.indexOf('. ');
  if (firstPeriod !== -1 && firstPeriod < 40) {
    snippet = snippet.slice(firstPeriod + 2);
  }
  const lastPeriod = snippet.lastIndexOf('. ');
  if (lastPeriod !== -1 && lastPeriod > snippet.length - 40) {
    snippet = snippet.slice(0, lastPeriod + 1);
  }

  // Replace excessive whitespace
  return snippet.replace(/\s+/g, ' ').trim();
}

/**
 * Runs text analysis over description and key features.
 */
export function analysePropertyText(description: string, keyFeatures: string[] = []): AnalysisResult {
  const combinedText = `${keyFeatures.join('. ')}. ${description}`;
  const detections: DetectedFeature[] = [];

  // 1. LOFT STATUS
  let loftStatus: LoftStatus = 'not_mentioned';
  let loftEvidence: string | undefined;

  const convertedLoftRegex = /\b(?:loft conversion|converted loft|loft converted|attic conversion|attic converted|dormer loft|loft room with building (?:regs|regulations)|loft bedroom with (?:full )?building regs?)\b/i;
  const ladderLightRegex = /\b(?:boarded loft with (?:pull[- ]down )?ladder|loft ladder and light|boarded with light and ladder|ladder and (?:electric )?light|power and light to (?:the )?loft|ladder, power and light)\b/i;
  const boardedLoftRegex = /\b(?:boarded loft|part(?:ially)? boarded loft|boarded attic|loft space is boarded)\b/i;
  const loftMentionRegex = /\b(?:loft|attic)\b/i;

  const convertedMatch = combinedText.match(convertedLoftRegex);
  if (convertedMatch && convertedMatch.index !== undefined) {
    loftStatus = 'converted_with_building_regs';
    loftEvidence = extractEvidenceSnippet(combinedText, convertedMatch.index, convertedMatch[0].length);
  } else {
    const ladderLightMatch = combinedText.match(ladderLightRegex);
    if (ladderLightMatch && ladderLightMatch.index !== undefined) {
      loftStatus = 'boarded_with_ladder_light';
      loftEvidence = extractEvidenceSnippet(combinedText, ladderLightMatch.index, ladderLightMatch[0].length);
    } else {
      const boardedMatch = combinedText.match(boardedLoftRegex);
      if (boardedMatch && boardedMatch.index !== undefined) {
        loftStatus = 'boarded';
        loftEvidence = extractEvidenceSnippet(combinedText, boardedMatch.index, boardedMatch[0].length);
      }
    }
  }

  if (loftStatus !== 'not_mentioned') {
    detections.push({
      key: 'loft_status',
      label: 'Loft Status',
      detected: true,
      value: loftStatus,
      evidence: loftEvidence,
      confidence: 'high',
    });
  }

  // 2. GARAGE TYPE
  let garageType: GarageType = 'none';
  let garageEvidence: string | undefined;

  const doubleGarageRegex = /\b(?:double garage|triple garage|tandem garage|two car garage|double width garage)\b/i;
  const integralGarageRegex = /\b(?:integral garage|integrated garage|internal garage|garage with internal access)\b/i;
  const detachedGarageRegex = /\b(?:detached garage|separate garage|standalone garage)\b/i;
  const singleGarageRegex = /\b(?:single garage|attached garage|lock[- ]up garage|garage)\b/i;

  const doubleMatch = combinedText.match(doubleGarageRegex);
  const integralMatch = combinedText.match(integralGarageRegex);
  const detachedMatch = combinedText.match(detachedGarageRegex);
  const singleMatch = combinedText.match(singleGarageRegex);

  if (doubleMatch && doubleMatch.index !== undefined) {
    garageType = 'double';
    garageEvidence = extractEvidenceSnippet(combinedText, doubleMatch.index, doubleMatch[0].length);
  } else if (integralMatch && integralMatch.index !== undefined) {
    garageType = 'integral';
    garageEvidence = extractEvidenceSnippet(combinedText, integralMatch.index, integralMatch[0].length);
  } else if (detachedMatch && detachedMatch.index !== undefined) {
    garageType = 'detached';
    garageEvidence = extractEvidenceSnippet(combinedText, detachedMatch.index, detachedMatch[0].length);
  } else if (singleMatch && singleMatch.index !== undefined) {
    garageType = 'single';
    garageEvidence = extractEvidenceSnippet(combinedText, singleMatch.index, singleMatch[0].length);
  }

  if (garageType !== 'none') {
    detections.push({
      key: 'garage_type',
      label: 'Garage Type',
      detected: true,
      value: garageType,
      evidence: garageEvidence,
      confidence: 'high',
    });
  }

  // 3. DRIVEWAY & OFF-STREET PARKING
  let hasDriveway = false;
  let drivewayEvidence: string | undefined;
  let parkingSpacesInferred: number | undefined;

  const drivewayRegex = /\b(?:driveway|drive|off[- ]street parking|private parking|block[- ]paved driveway|tarmac driveway|hardstanding|allocated(?:\s+underground)?\s+(?:secure\s+)?parking|allocated space|underground (?:secure )?parking)\b/i;
  const drivewayMatch = combinedText.match(drivewayRegex);
  if (drivewayMatch && drivewayMatch.index !== undefined) {
    hasDriveway = true;
    drivewayEvidence = extractEvidenceSnippet(combinedText, drivewayMatch.index, drivewayMatch[0].length);

    // Try to extract capacity: "parking for 2/3/4 cars"
    const spacesMatch = combinedText.match(/(?:parking for|driveway for|spaces? for|space for up to)\s+(\d+|two|three|four|five)\s+(?:cars|vehicles)/i);
    if (spacesMatch) {
      const numMap: Record<string, number> = { two: 2, three: 3, four: 4, five: 5 };
      const rawNum = spacesMatch[1].toLowerCase();
      parkingSpacesInferred = numMap[rawNum] || parseInt(rawNum, 10);
    } else {
      parkingSpacesInferred = 1;
    }

    detections.push({
      key: 'driveway',
      label: 'Driveway / Off-Street Parking',
      detected: true,
      value: parkingSpacesInferred,
      evidence: drivewayEvidence,
      confidence: 'high',
    });
  }

  // 4. EV CHARGER
  let hasEvCharger = false;
  let evChargerEvidence: string | undefined;
  const evRegex = /\b(?:ev charger|ev charging|electric vehicle charging|electric car charger|type 2 charging point|pod point|zappi|wallbox)\b/i;
  const evMatch = combinedText.match(evRegex);
  if (evMatch && evMatch.index !== undefined) {
    hasEvCharger = true;
    evChargerEvidence = extractEvidenceSnippet(combinedText, evMatch.index, evMatch[0].length);
    detections.push({
      key: 'ev_charger',
      label: 'EV Home Charger',
      detected: true,
      evidence: evChargerEvidence,
      confidence: 'high',
    });
  }

  // 5. GARDEN ORIENTATION
  let gardenOrientation: GardenOrientation = 'unknown';
  let gardenOrientationEvidence: string | undefined;

  const southWestRegex = /\b(?:south[- ]west(?:erly)?(?:[- ]facing)?|south[- ]westerly)\b/i;
  const southFacingRegex = /\b(?:south(?:[- ]facing|erly)?(?: rear)? garden|south[- ]facing|sunny south(?:[- ]facing)?)\b/i;
  const westFacingRegex = /\b(?:west(?:[- ]facing|erly)?(?: rear)? garden|west[- ]facing)\b/i;
  const eastFacingRegex = /\b(?:east(?:[- ]facing|erly)?(?: rear)? garden|east[- ]facing)\b/i;
  const northFacingRegex = /\b(?:north(?:[- ]facing|erly)?(?: rear)? garden|north[- ]facing)\b/i;
  const noGardenRegex = /\b(?:no garden|communal grounds only|without garden)\b/i;

  if (combinedText.match(noGardenRegex)) {
    gardenOrientation = 'none';
  } else {
    const swMatch = combinedText.match(southWestRegex);
    const sMatch = combinedText.match(southFacingRegex);
    const wMatch = combinedText.match(westFacingRegex);
    const eMatch = combinedText.match(eastFacingRegex);
    const nMatch = combinedText.match(northFacingRegex);

    if (swMatch && swMatch.index !== undefined) {
      gardenOrientation = 'south_west';
      gardenOrientationEvidence = extractEvidenceSnippet(combinedText, swMatch.index, swMatch[0].length);
    } else if (sMatch && sMatch.index !== undefined) {
      gardenOrientation = 'south';
      gardenOrientationEvidence = extractEvidenceSnippet(combinedText, sMatch.index, sMatch[0].length);
    } else if (wMatch && wMatch.index !== undefined) {
      gardenOrientation = 'west';
      gardenOrientationEvidence = extractEvidenceSnippet(combinedText, wMatch.index, wMatch[0].length);
    } else if (eMatch && eMatch.index !== undefined) {
      gardenOrientation = 'east';
      gardenOrientationEvidence = extractEvidenceSnippet(combinedText, eMatch.index, eMatch[0].length);
    } else if (nMatch && nMatch.index !== undefined) {
      gardenOrientation = 'north';
      gardenOrientationEvidence = extractEvidenceSnippet(combinedText, nMatch.index, nMatch[0].length);
    }
  }

  if (gardenOrientation !== 'unknown' && gardenOrientation !== 'none') {
    detections.push({
      key: 'garden_orientation',
      label: 'Garden Orientation',
      detected: true,
      value: gardenOrientation,
      evidence: gardenOrientationEvidence,
      confidence: 'high',
    });
  }

  // 6. PATIO OR DECKING
  let hasPatioOrDecking = false;
  let patioOrDeckingEvidence: string | undefined;
  const patioRegex = /\b(?:patio|decking|composite deck|sun terrace|paved seating area|flagstone patio)\b/i;
  const patioMatch = combinedText.match(patioRegex);
  if (patioMatch && patioMatch.index !== undefined) {
    hasPatioOrDecking = true;
    patioOrDeckingEvidence = extractEvidenceSnippet(combinedText, patioMatch.index, patioMatch[0].length);
    detections.push({
      key: 'patio_decking',
      label: 'Patio or Decking',
      detected: true,
      evidence: patioOrDeckingEvidence,
      confidence: 'high',
    });
  }

  // 7. OUTBUILDING / GARDEN OFFICE
  let hasOutbuilding = false;
  let outbuildingEvidence: string | undefined;
  const outbuildingRegex = /\b(?:garden office|garden room|summerhouse|summer house|workshop|home studio|insulated outbuilding|annexe)\b/i;
  const outbuildingMatch = combinedText.match(outbuildingRegex);
  if (outbuildingMatch && outbuildingMatch.index !== undefined) {
    hasOutbuilding = true;
    outbuildingEvidence = extractEvidenceSnippet(combinedText, outbuildingMatch.index, outbuildingMatch[0].length);
    detections.push({
      key: 'outbuilding',
      label: 'Garden Office / Outbuilding',
      detected: true,
      evidence: outbuildingEvidence,
      confidence: 'high',
    });
  }

  // 8. EN SUITE
  let hasEnSuite = false;
  let enSuiteEvidence: string | undefined;
  const enSuiteRegex = /\b(?:en[- ]suite|ensuite shower room|master with en[- ]suite|private en[- ]suite)\b/i;
  const enSuiteMatch = combinedText.match(enSuiteRegex);
  if (enSuiteMatch && enSuiteMatch.index !== undefined) {
    hasEnSuite = true;
    enSuiteEvidence = extractEvidenceSnippet(combinedText, enSuiteMatch.index, enSuiteMatch[0].length);
    detections.push({
      key: 'en_suite',
      label: 'En Suite Bathroom',
      detected: true,
      evidence: enSuiteEvidence,
      confidence: 'high',
    });
  }

  // 9. UTILITY ROOM
  let hasUtilityRoom = false;
  let utilityRoomEvidence: string | undefined;
  const utilityRegex = /\b(?:utility room|separate utility|laundry room)\b/i;
  const utilityMatch = combinedText.match(utilityRegex);
  if (utilityMatch && utilityMatch.index !== undefined) {
    hasUtilityRoom = true;
    utilityRoomEvidence = extractEvidenceSnippet(combinedText, utilityMatch.index, utilityMatch[0].length);
    detections.push({
      key: 'utility_room',
      label: 'Utility Room',
      detected: true,
      evidence: utilityRoomEvidence,
      confidence: 'high',
    });
  }

  // 10. DOWNSTAIRS WC / CLOAKROOM
  let hasDownstairsWc = false;
  let downstairsWcEvidence: string | undefined;
  const downstairsWcRegex = /\b(?:downstairs wc|downstairs cloakroom|ground floor wc|guest cloakroom|guest wc|cloakroom\/wc)\b/i;
  const wcMatch = combinedText.match(downstairsWcRegex);
  if (wcMatch && wcMatch.index !== undefined) {
    hasDownstairsWc = true;
    downstairsWcEvidence = extractEvidenceSnippet(combinedText, wcMatch.index, wcMatch[0].length);
    detections.push({
      key: 'downstairs_wc',
      label: 'Downstairs WC / Cloakroom',
      detected: true,
      evidence: downstairsWcEvidence,
      confidence: 'high',
    });
  }

  // 11. STUDY / HOME OFFICE
  let hasHomeOfficeOrStudy = false;
  let homeOfficeEvidence: string | undefined;
  const officeRegex = /\b(?:study|home office|work from home space|dedicated office)\b/i;
  const officeMatch = combinedText.match(officeRegex);
  if (officeMatch && officeMatch.index !== undefined) {
    hasHomeOfficeOrStudy = true;
    homeOfficeEvidence = extractEvidenceSnippet(combinedText, officeMatch.index, officeMatch[0].length);
    detections.push({
      key: 'home_office',
      label: 'Study / Home Office',
      detected: true,
      evidence: homeOfficeEvidence,
      confidence: 'high',
    });
  }

  // 12. OPEN-PLAN KITCHEN DINER
  let hasOpenPlanKitchen = false;
  let openPlanKitchenEvidence: string | undefined;
  const openPlanRegex = /\b(?:open[- ]plan kitchen|kitchen\/diner|kitchen\/dining room|kitchen breakfast room|open plan living\/dining)\b/i;
  const openPlanMatch = combinedText.match(openPlanRegex);
  if (openPlanMatch && openPlanMatch.index !== undefined) {
    hasOpenPlanKitchen = true;
    openPlanKitchenEvidence = extractEvidenceSnippet(combinedText, openPlanMatch.index, openPlanMatch[0].length);
    detections.push({
      key: 'open_plan_kitchen',
      label: 'Open-Plan Kitchen Diner',
      detected: true,
      evidence: openPlanKitchenEvidence,
      confidence: 'high',
    });
  }

  // 13. NEW BOILER
  let hasNewBoiler = false;
  let newBoilerEvidence: string | undefined;
  const boilerRegex = /\b(?:new boiler|recently replaced boiler|newly installed boiler|combi boiler installed in 20\d\d|worcester bosch combi)\b/i;
  const boilerMatch = combinedText.match(boilerRegex);
  if (boilerMatch && boilerMatch.index !== undefined) {
    hasNewBoiler = true;
    newBoilerEvidence = extractEvidenceSnippet(combinedText, boilerMatch.index, boilerMatch[0].length);
    detections.push({
      key: 'new_boiler',
      label: 'New / Recently Fitted Boiler',
      detected: true,
      evidence: newBoilerEvidence,
      confidence: 'medium',
    });
  }

  // 14. SOLAR PANELS
  let hasSolarPanels = false;
  let solarPanelsEvidence: string | undefined;
  const solarRegex = /\b(?:solar panels|photovoltaic|solar pv|solar energy)\b/i;
  const solarMatch = combinedText.match(solarRegex);
  if (solarMatch && solarMatch.index !== undefined) {
    hasSolarPanels = true;
    solarPanelsEvidence = extractEvidenceSnippet(combinedText, solarMatch.index, solarMatch[0].length);
    detections.push({
      key: 'solar_panels',
      label: 'Solar Panels',
      detected: true,
      evidence: solarPanelsEvidence,
      confidence: 'high',
    });
  }

  // 15. UNDERFLOOR HEATING
  let hasUnderfloorHeating = false;
  let underfloorHeatingEvidence: string | undefined;
  const underfloorRegex = /\b(?:underfloor heating|under[- ]floor heating|wet underfloor)\b/i;
  const underfloorMatch = combinedText.match(underfloorRegex);
  if (underfloorMatch && underfloorMatch.index !== undefined) {
    hasUnderfloorHeating = true;
    underfloorHeatingEvidence = extractEvidenceSnippet(combinedText, underfloorMatch.index, underfloorMatch[0].length);
    detections.push({
      key: 'underfloor_heating',
      label: 'Underfloor Heating',
      detected: true,
      evidence: underfloorHeatingEvidence,
      confidence: 'high',
    });
  }

  // 16. NEEDS MODERNISATION
  let needsModernisation = false;
  let needsModernisationEvidence: string | undefined;
  const modernisationRegex = /\b(?:needs?\s+(?:complete\s+|total\s+|thorough\s+)?modernis|in need of\s+(?:complete\s+|total\s+|thorough\s+)?modernis|requir(?:ing|es)\s+(?:complete\s+|total\s+)?modernis|modernis(?:ation|ed)|moderniz(?:ation|ed)|requiring updating|potential to add value|project property|in need of\s+(?:complete\s+|total\s+)?refurbishment|needs?\s+refurbishment)\b/i;
  const modernisationMatch = combinedText.match(modernisationRegex);
  if (modernisationMatch && modernisationMatch.index !== undefined) {
    needsModernisation = true;
    needsModernisationEvidence = extractEvidenceSnippet(combinedText, modernisationMatch.index, modernisationMatch[0].length);
    detections.push({
      key: 'needs_modernisation',
      label: 'Needs Modernisation',
      detected: true,
      evidence: needsModernisationEvidence,
      confidence: 'high',
    });
  }

  // 17. CHAIN STATUS
  let chainStatus: ChainStatus = 'unknown';
  let chainStatusEvidence: string | undefined;
  const chainFreeRegex = /\b(?:no onward chain|chain[- ]free|chain free|end of chain|vacant possession)\b/i;
  const chainMatch = combinedText.match(chainFreeRegex);
  if (chainMatch && chainMatch.index !== undefined) {
    chainStatus = 'no_onward_chain';
    chainStatusEvidence = extractEvidenceSnippet(combinedText, chainMatch.index, chainMatch[0].length);
    detections.push({
      key: 'chain_free',
      label: 'Chain Free / No Onward Chain',
      detected: true,
      evidence: chainStatusEvidence,
      confidence: 'high',
    });
  }

  return {
    loftStatus,
    loftEvidence,
    garageType,
    garageEvidence,
    parkingSpacesInferred,
    hasDriveway,
    drivewayEvidence,
    hasEvCharger,
    evChargerEvidence,
    gardenOrientation,
    gardenOrientationEvidence,
    hasPatioOrDecking,
    patioOrDeckingEvidence,
    hasOutbuilding,
    outbuildingEvidence,
    hasEnSuite,
    enSuiteEvidence,
    hasUtilityRoom,
    utilityRoomEvidence,
    hasDownstairsWc,
    downstairsWcEvidence,
    hasHomeOfficeOrStudy,
    homeOfficeEvidence,
    hasOpenPlanKitchen,
    openPlanKitchenEvidence,
    hasNewBoiler,
    newBoilerEvidence,
    hasSolarPanels,
    solarPanelsEvidence,
    hasUnderfloorHeating,
    underfloorHeatingEvidence,
    needsModernisation,
    needsModernisationEvidence,
    chainStatus,
    chainStatusEvidence,
    allDetections: detections,
  };
}
