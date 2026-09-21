/**
 * Generates tailored "Questions to Ask the Estate Agent" based on missing, vague, or critical fields.
 */

import { Property } from '../../types/property';

export interface AgentQuestion {
  id: string;
  category: 'Tenure & Legal' | 'Building & Planning' | 'Costs & Council' | 'Chain & Moving' | 'Practicalities';
  question: string;
  reason: string;
}

export function generateAgentQuestions(property: Property): AgentQuestion[] {
  const questions: AgentQuestion[] = [];

  // Tenure & Leasehold questions
  if (property.tenure === 'leasehold') {
    if (property.leaseYearsRemaining === undefined || property.leaseYearsRemaining === null) {
      questions.push({
        id: 'q_lease_length',
        category: 'Tenure & Legal',
        question: 'What is the exact unexpired lease term remaining on the property?',
        reason: 'Lease length is unstated in the listing. Leases under 80-85 years can cause mortgage refusal and heavy extension costs.',
      });
    }

    if (!property.groundRentReviewPeriod) {
      questions.push({
        id: 'q_ground_rent_review',
        category: 'Tenure & Legal',
        question: 'What are the exact review terms for the ground rent? Does it increase with RPI, double, or remain fixed?',
        reason: 'Ground rent escalation clauses (especially doubling every 10-15 years) can make properties unmortgageable.',
      });
    }

    if (property.serviceChargeAnnual === undefined || property.serviceChargeAnnual === 0) {
      questions.push({
        id: 'q_service_charge',
        category: 'Tenure & Legal',
        question: 'What is the current annual service charge, and are there any planned major works or Section 20 notices pending?',
        reason: 'Service charges were not clearly confirmed in the listing.',
      });
    }
  }

  // Loft compliance question
  if (property.loftStatus === 'boarded' || property.loftStatus === 'boarded_with_ladder_light') {
    questions.push({
      id: 'q_loft_conversion_potential',
      category: 'Building & Planning',
      question: 'Has the vendor looked into converting the loft, or has any neighbouring property on the terrace/road obtained planning permission?',
      reason: 'The loft is currently boarded for storage only, not living space.',
    });
  } else if (property.descriptionText.toLowerCase().includes('loft room') && property.loftStatus !== 'converted_with_building_regs') {
    questions.push({
      id: 'q_loft_building_regs',
      category: 'Building & Planning',
      question: 'Was the loft room completed with full Local Authority Building Regulations approval and a completion certificate?',
      reason: 'Uncertificated loft rooms cannot be marketed or insured legally as habitable bedrooms.',
    });
  }

  // Floor area
  if (!property.floorAreaSqFt && !property.floorAreaSqM) {
    questions.push({
      id: 'q_floor_area',
      category: 'Building & Planning',
      question: 'What is the total gross internal floor area in square feet or square metres?',
      reason: 'The listing does not specify the official internal floor area.',
    });
  }

  // Council Tax
  if (property.councilTaxBand === 'unknown') {
    questions.push({
      id: 'q_council_tax',
      category: 'Costs & Council',
      question: 'What is the current Council Tax band with the local authority?',
      reason: 'Council tax band was not provided in the listing.',
    });
  }

  // Heating & Boiler
  if (!property.hasNewBoiler) {
    questions.push({
      id: 'q_boiler_age',
      category: 'Costs & Council',
      question: 'How old is the central heating boiler, when was it last serviced, and is a Gas Safe certificate available?',
      reason: 'Replacing a modern condensing combi boiler typically costs £2,500 - £4,000.',
    });
  }

  // Parking permits & restrictions
  if (property.parkingSpaces === 0 && !property.hasDriveway) {
    questions.push({
      id: 'q_parking_permit',
      category: 'Practicalities',
      question: 'What is the local parking situation? Is a resident CPZ permit required, and is there a waiting list or restriction on permits for this address?',
      reason: 'No private off-street parking or driveway was detected.',
    });
  }

  // Chain & Forward movement
  if (property.chainStatus === 'unknown') {
    questions.push({
      id: 'q_chain_position',
      category: 'Chain & Moving',
      question: "What is the vendor's position? Are they looking for an onward purchase, or is this chain-free with vacant possession?",
      reason: 'Chain length dictates how quickly and reliably you can complete the purchase.',
    });
  }

  // Flood risk
  if (!property.floodRisk) {
    questions.push({
      id: 'q_flood_risk',
      category: 'Practicalities',
      question: 'Has the property or road experienced surface water or river flooding in the last 10 years, and is standard home insurance readily obtainable?',
      reason: 'Flood risk details were not explicitly stated.',
    });
  }

  return questions;
}
