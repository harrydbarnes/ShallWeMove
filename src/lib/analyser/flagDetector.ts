/**
 * Red Flags and Green Flags generator for UK property listings.
 * Analyses tenure, lease length, price reductions, days on market, EPC, and text clues.
 */

import { Property } from '../../types/property';
import { formatCurrency } from '../utils/formatters';

export interface PropertyFlag {
  id: string;
  type: 'green' | 'red' | 'amber';
  title: string;
  description: string;
  category: 'Tenure & Legal' | 'Market & Pricing' | 'Condition & Energy' | 'Space & Practicality';
  severity?: 'critical' | 'moderate' | 'minor'; // for red flags
}

export function detectPropertyFlags(property: Property): PropertyFlag[] {
  const flags: PropertyFlag[] = [];

  // 1. TENURE & LEASE
  if (property.tenure === 'freehold') {
    flags.push({
      id: 'flag_freehold',
      type: 'green',
      category: 'Tenure & Legal',
      title: 'Freehold Ownership',
      description: 'You own the building and the land outright, with no ground rent, lease renewals, or landlord permissions required.',
    });
  } else if (property.tenure === 'share_of_freehold') {
    flags.push({
      id: 'flag_share_freehold',
      type: 'green',
      category: 'Tenure & Legal',
      title: 'Share of Freehold',
      description: 'You share ownership of the freehold, providing greater control over maintenance, management, and lease extensions.',
    });
  } else if (property.tenure === 'leasehold') {
    if (property.leaseYearsRemaining !== undefined) {
      if (property.leaseYearsRemaining < 80) {
        flags.push({
          id: 'flag_short_lease_critical',
          type: 'red',
          severity: 'critical',
          category: 'Tenure & Legal',
          title: `Short Lease (${property.leaseYearsRemaining} years remaining)`,
          description: 'Below 80 years, marriage value applies making lease extensions significantly more expensive, and many mortgage lenders will refuse lending.',
        });
      } else if (property.leaseYearsRemaining < 90) {
        flags.push({
          id: 'flag_short_lease_warning',
          type: 'red',
          severity: 'moderate',
          category: 'Tenure & Legal',
          title: `Borderline Lease (${property.leaseYearsRemaining} years remaining)`,
          description: 'Approaching the 80-year marriage value threshold. Factor in the cost and time of extending the lease.',
        });
      } else if (property.leaseYearsRemaining >= 900) {
        flags.push({
          id: 'flag_long_lease',
          type: 'green',
          category: 'Tenure & Legal',
          title: `Virtually Infinite Lease (${property.leaseYearsRemaining} years)`,
          description: '900+ year lease means no lease extension costs for generations.',
        });
      }
    }

    // High Service Charge
    if (property.serviceChargeAnnual && property.serviceChargeAnnual > 3000) {
      flags.push({
        id: 'flag_high_service_charge',
        type: 'red',
        severity: 'moderate',
        category: 'Tenure & Legal',
        title: `High Service Charge (${formatCurrency(property.serviceChargeAnnual)}/year)`,
        description: `Adds approximately ${formatCurrency(Math.round(property.serviceChargeAnnual / 12))}/month to your fixed living costs. Check what is covered and verify sinking fund reserves.`,
      });
    }

    // High Ground Rent
    if (property.groundRentAnnual && property.groundRentAnnual > 350) {
      flags.push({
        id: 'flag_high_ground_rent',
        type: 'red',
        severity: 'moderate',
        category: 'Tenure & Legal',
        title: `Elevated Ground Rent (${formatCurrency(property.groundRentAnnual)}/year)`,
        description: 'Verify the review clause. In England, ground rents exceeding 0.1% of property value or £250 (£1,000 in London) can trigger AST repossession risks under the Housing Act 1988.',
      });
    }
  }

  // 2. MARKET & PRICING
  if (property.reduced) {
    const pct = property.reductionPercentage ? ` (${property.reductionPercentage.toFixed(1)}% reduction)` : '';
    flags.push({
      id: 'flag_price_reduced',
      type: 'green',
      category: 'Market & Pricing',
      title: `Price Reduced${pct}`,
      description: 'Vendor is motivated and realistic about market conditions. You may have stronger negotiating leverage.',
    });
  }

  if (property.daysOnMarket !== undefined && property.daysOnMarket > 120 && !property.reduced) {
    flags.push({
      id: 'flag_stale_listing',
      type: 'red',
      severity: 'minor',
      category: 'Market & Pricing',
      title: `Long Time on Market (${property.daysOnMarket} days)`,
      description: 'Property has been on the market for over 4 months without a recorded price reduction. May indicate an inflexible seller or unseen buyer survey issues.',
    });
  }

  if (property.chainStatus === 'chain_free' || property.chainStatus === 'no_onward_chain') {
    flags.push({
      id: 'flag_chain_free',
      type: 'green',
      category: 'Market & Pricing',
      title: 'No Onward Chain',
      description: 'Substantially reduces transaction risk, delays, and the probability of chain collapse.',
    });
  }

  // 3. CONDITION & ENERGY
  if (property.epcRating === 'A' || property.epcRating === 'B') {
    flags.push({
      id: 'flag_high_epc',
      type: 'green',
      category: 'Condition & Energy',
      title: `Excellent Energy Efficiency (EPC Band ${property.epcRating})`,
      description: 'Low heating bills, high thermal comfort, and future-proofed against evolving domestic energy standards.',
    });
  } else if (property.epcRating === 'E' || property.epcRating === 'F' || property.epcRating === 'G') {
    flags.push({
      id: 'flag_poor_epc',
      type: 'red',
      severity: 'moderate',
      category: 'Condition & Energy',
      title: `Poor Energy Rating (EPC Band ${property.epcRating})`,
      description: 'High ongoing energy bills. Likely requires costly insulation, glazing, or boiler upgrades to achieve reasonable efficiency.',
    });
  }

  if (property.hasSolarPanels) {
    flags.push({
      id: 'flag_solar_panels',
      type: 'green',
      category: 'Condition & Energy',
      title: 'Solar Panels Installed',
      description: 'Generates free electricity during daylight hours and provides potential Smart Export Guarantee (SEG) payments.',
    });
  }

  if (property.needsModernisation) {
    flags.push({
      id: 'flag_needs_modernisation',
      type: 'red',
      severity: 'moderate',
      category: 'Condition & Energy',
      title: 'Modernisation Required',
      description: 'Will require immediate capital expenditure and disruption for rewiring, heating, replastering, kitchen, or bathrooms.',
    });
  }

  // 4. SPACE & PRACTICALITY
  if (property.gardenOrientation === 'south' || property.gardenOrientation === 'south_west') {
    const name = property.gardenOrientation === 'south_west' ? 'South-West' : 'South';
    flags.push({
      id: 'flag_south_garden',
      type: 'green',
      category: 'Space & Practicality',
      title: `${name}-Facing Garden`,
      description: 'Enjoys maximum sunlight throughout afternoon and evening, ideal for British weather.',
    });
  }

  if (property.loftStatus === 'converted_with_building_regs') {
    flags.push({
      id: 'flag_converted_loft',
      type: 'green',
      category: 'Space & Practicality',
      title: 'Converted Loft with Building Regs',
      description: 'Legally compliant additional living/bedroom space without the headache of managing builders.',
    });
  }

  if (property.hasEvCharger) {
    flags.push({
      id: 'flag_ev_charger',
      type: 'green',
      category: 'Space & Practicality',
      title: 'EV Charger Installed',
      description: 'Home EV charging point in place, saving installation costs (£800-£1,200).',
    });
  }

  return flags;
}
