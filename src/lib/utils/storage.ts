/**
 * Type-safe browser localStorage manager with JSON export and import.
 */

import { CurrentHouseProfile, Property } from '../../types/property';
import { WantCriterion } from '../../types/wants';

export interface UserCommuteDestination {
  id: string;
  name: string; // e.g. "Work - Soho", "Grandparents", "School"
  addressOrPostcode?: string;
  notes?: string;
}

export interface AppStoredData {
  version: number;
  currentHouses: CurrentHouseProfile[];
  activeCurrentHouseId: string;
  listings: Property[];
  activeListingId?: string;
  secondaryListingId?: string;
  wants: WantCriterion[];
  commuteDestinations: UserCommuteDestination[];
  theme: 'light' | 'dark';
  onboardingCompleted: boolean;
  exportedAt?: string;
}

const STORAGE_KEY = 'shall_we_move_app_data_v1';

export function loadStoredData(): AppStoredData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object' && Array.isArray(data.currentHouses)) {
      return data as AppStoredData;
    }
  } catch (err) {
    console.error('Failed to load data from localStorage:', err);
  }
  return null;
}

export function saveStoredData(data: AppStoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
}

export function exportDataAsJson(data: AppStoredData): void {
  const exportPayload: AppStoredData = {
    ...data,
    exportedAt: new Date().toISOString(),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportPayload, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateSlug = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `shall-we-move-backup-${dateSlug}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function validateImportData(rawJson: string): AppStoredData {
  const parsed = JSON.parse(rawJson);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON format.');
  }

  if (!Array.isArray(parsed.currentHouses) || !Array.isArray(parsed.listings) || !Array.isArray(parsed.wants)) {
    throw new Error('File does not match the Shall We Move backup schema.');
  }

  return parsed as AppStoredData;
}
