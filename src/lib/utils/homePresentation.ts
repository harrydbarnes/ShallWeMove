import { Property } from '../../types/property';

export function homeName(property: Property): string {
  return property.nickname?.trim() || property.displayAddress;
}

export interface DataConfidence {
  label: string;
  detail: string;
  tone: 'strong' | 'caution' | 'neutral';
}

/** Evidence coverage for the listing facts behind a verdict, not a probability of a good move. */
export function getDataConfidence(property: Property): DataConfidence {
  if (property.source === 'sample') {
    return { label: 'Sample data', detail: 'Illustrative listing. Replace it with a real home before deciding.', tone: 'neutral' };
  }
  if (property.source === 'manual') {
    return { label: 'User entered', detail: 'These details were entered manually. Check them against the listing or agent.', tone: 'neutral' };
  }

  const facts = (property.extractionSummary || []).filter((field) => field.status === 'found' || field.status === 'missing');
  const found = facts.filter((field) => field.status === 'found').length;
  const missing = facts.filter((field) => field.status === 'missing').length;
  if (facts.length === 0) {
    return { label: 'Needs review', detail: 'No field-level source record is available for this import.', tone: 'caution' };
  }
  if (found >= 5 && missing <= 2) {
    return { label: 'Good coverage', detail: `${found} details found; ${missing} unstated. This reflects listing completeness, not a survey.`, tone: 'strong' };
  }
  return { label: 'Limited coverage', detail: `${found} details found; ${missing} unstated. Check missing facts before relying on the verdict.`, tone: 'caution' };
}
