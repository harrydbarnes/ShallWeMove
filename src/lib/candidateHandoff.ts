import { Property } from '../types/property';

export interface MoveCandidate {
  kind: 'shall-we-move-candidate';
  version: 1;
  displayAddress: string;
  askingPrice: number;
  councilTaxAnnual?: number;
  serviceChargeAnnual?: number;
  groundRentAnnual?: number;
  sample: boolean;
}

export function createMoveCandidate(property: Property): MoveCandidate {
  const candidate: MoveCandidate = {
    kind: 'shall-we-move-candidate',
    version: 1,
    displayAddress: property.displayAddress.trim(),
    askingPrice: property.price,
    sample: property.source === 'sample',
  };

  if (Number.isFinite(property.councilTaxAnnual) && property.councilTaxAnnual! >= 0) {
    candidate.councilTaxAnnual = property.councilTaxAnnual;
  }
  if (Number.isFinite(property.serviceChargeAnnual) && property.serviceChargeAnnual! >= 0) {
    candidate.serviceChargeAnnual = property.serviceChargeAnnual;
  }
  if (Number.isFinite(property.groundRentAnnual) && property.groundRentAnnual! >= 0) {
    candidate.groundRentAnnual = property.groundRentAnnual;
  }
  return candidate;
}
