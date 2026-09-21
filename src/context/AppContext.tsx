/**
 * Central application state context for Shall We Move?
 * Handles persistence, theme, listings, current house profiles, and wants.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CurrentHouseProfile, Property } from '../types/property';
import { WantCriterion } from '../types/wants';
import {
  loadStoredData,
  saveStoredData,
  exportDataAsJson,
  validateImportData,
  UserCommuteDestination,
  AppStoredData,
} from '../lib/utils/storage';
import { SAMPLE_CURRENT_HOUSE, getSampleListings } from '../lib/parser/sampleListings';
import { DEFAULT_WANTS } from '../lib/scoring/defaultWants';
import { parseListingInput } from '../lib/parser/index';

interface AppContextType {
  currentHouses: CurrentHouseProfile[];
  activeCurrentHouse: CurrentHouseProfile;
  activeCurrentHouseId: string;
  listings: Property[];
  activeListing: Property | null;
  activeListingId: string | null;
  secondaryListing: Property | null;
  secondaryListingId: string | null;
  comparisonMode: 'vs_current' | 'two_listings';
  wants: WantCriterion[];
  commuteDestinations: UserCommuteDestination[];
  theme: 'light' | 'dark';
  onboardingCompleted: boolean;
  activeTab: string;
  urlHashImportNotification: string | null;

  // Actions
  setActiveCurrentHouseId: (id: string) => void;
  addCurrentHouse: (profile: CurrentHouseProfile) => void;
  updateCurrentHouse: (profile: CurrentHouseProfile) => void;
  deleteCurrentHouse: (id: string) => void;

  setActiveListingId: (id: string | null) => void;
  setSecondaryListingId: (id: string | null) => void;
  setComparisonMode: (mode: 'vs_current' | 'two_listings') => void;
  addListing: (prop: Property) => void;
  updateListing: (prop: Property) => void;
  deleteListing: (id: string) => void;

  updateWant: (want: WantCriterion) => void;
  addWant: (want: WantCriterion) => void;
  deleteWant: (id: string) => void;
  resetWantsToDefaults: () => void;
  applySuggestedWants: (suggested: WantCriterion[]) => void;

  addCommuteDestination: (dest: UserCommuteDestination) => void;
  deleteCommuteDestination: (id: string) => void;

  toggleTheme: () => void;
  setActiveTab: (tab: string) => void;
  completeOnboarding: () => void;
  loadSampleData: () => void;
  clearAllData: () => void;
  exportBackup: () => void;
  importBackup: (jsonStr: string) => void;
  dismissHashNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stored, setStored] = useState<AppStoredData>(() => {
    const loaded = loadStoredData();
    if (loaded && loaded.currentHouses.length > 0) {
      return loaded;
    }
    // Default initial empty state
    return {
      version: 1,
      currentHouses: [SAMPLE_CURRENT_HOUSE],
      activeCurrentHouseId: SAMPLE_CURRENT_HOUSE.id,
      listings: [],
      wants: DEFAULT_WANTS,
      commuteDestinations: [
        { id: 'commute_work', name: 'Work / Office', addressOrPostcode: 'Central London' },
      ],
      theme: 'light',
      onboardingCompleted: false,
    };
  });

  const [activeListingId, setActiveListingId] = useState<string | null>(
    stored.activeListingId || (stored.listings.length > 0 ? stored.listings[0].id : null)
  );
  const [secondaryListingId, setSecondaryListingId] = useState<string | null>(
    stored.secondaryListingId || (stored.listings.length > 1 ? stored.listings[1].id : null)
  );
  const [comparisonMode, setComparisonMode] = useState<'vs_current' | 'two_listings'>('vs_current');
  const [activeTab, setActiveTab] = useState<string>('verdict');
  const [urlHashImportNotification, setUrlHashImportNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveStoredData({
      ...stored,
      activeListingId: activeListingId || undefined,
      secondaryListingId: secondaryListingId || undefined,
    });
  }, [stored, activeListingId, secondaryListingId]);

  // Sync Dark/Light theme on <html> class
  useEffect(() => {
    const root = document.documentElement;
    if (stored.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [stored.theme]);

  // Check URL Hash for Bookmarklet payload on page load
  useEffect(() => {
    if (window.location.hash && (window.location.hash.startsWith('#data=') || window.location.hash.startsWith('#%7B'))) {
      try {
        const parseRes = parseListingInput(window.location.hash, 'bookmarklet');
        if (parseRes && parseRes.property && parseRes.property.price > 0) {
          const newProp = parseRes.property;
          setStored((prev) => ({
            ...prev,
            listings: [newProp, ...prev.listings.filter((l) => l.id !== newProp.id)],
          }));
          setActiveListingId(newProp.id);
          setUrlHashImportNotification(`Imported "${newProp.displayAddress}" successfully via bookmarklet!`);
          // Clear hash from address bar without reloading
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (e) {
        console.error('Error importing from URL hash:', e);
      }
    }
  }, []);

  const activeCurrentHouse =
    stored.currentHouses.find((h) => h.id === stored.activeCurrentHouseId) ||
    stored.currentHouses[0] ||
    SAMPLE_CURRENT_HOUSE;

  const activeListing = stored.listings.find((l) => l.id === activeListingId) || null;
  const secondaryListing = stored.listings.find((l) => l.id === secondaryListingId) || null;

  // Actions
  const setActiveCurrentHouseId = (id: string) => {
    setStored((prev) => ({ ...prev, activeCurrentHouseId: id }));
  };

  const addCurrentHouse = (profile: CurrentHouseProfile) => {
    setStored((prev) => ({
      ...prev,
      currentHouses: [...prev.currentHouses, profile],
      activeCurrentHouseId: profile.id,
    }));
  };

  const updateCurrentHouse = (profile: CurrentHouseProfile) => {
    setStored((prev) => ({
      ...prev,
      currentHouses: prev.currentHouses.map((h) => (h.id === profile.id ? profile : h)),
    }));
  };

  const deleteCurrentHouse = (id: string) => {
    setStored((prev) => {
      const remaining = prev.currentHouses.filter((h) => h.id !== id);
      return {
        ...prev,
        currentHouses: remaining,
        activeCurrentHouseId: remaining.length > 0 ? remaining[0].id : '',
      };
    });
  };

  const addListing = (prop: Property) => {
    setStored((prev) => ({
      ...prev,
      listings: [prop, ...prev.listings.filter((l) => l.id !== prop.id)],
    }));
    setActiveListingId(prop.id);
  };

  const updateListing = (prop: Property) => {
    setStored((prev) => ({
      ...prev,
      listings: prev.listings.map((l) => (l.id === prop.id ? prop : l)),
    }));
  };

  const deleteListing = (id: string) => {
    setStored((prev) => {
      const remaining = prev.listings.filter((l) => l.id !== id);
      return {
        ...prev,
        listings: remaining,
      };
    });
    if (activeListingId === id) {
      const remaining = stored.listings.filter((l) => l.id !== id);
      setActiveListingId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateWant = (want: WantCriterion) => {
    setStored((prev) => ({
      ...prev,
      wants: prev.wants.map((w) => (w.id === want.id ? want : w)),
    }));
  };

  const addWant = (want: WantCriterion) => {
    setStored((prev) => ({
      ...prev,
      wants: [...prev.wants, want],
    }));
  };

  const deleteWant = (id: string) => {
    setStored((prev) => ({
      ...prev,
      wants: prev.wants.filter((w) => w.id !== id),
    }));
  };

  const resetWantsToDefaults = () => {
    setStored((prev) => ({
      ...prev,
      wants: DEFAULT_WANTS,
    }));
  };

  const applySuggestedWants = (suggested: WantCriterion[]) => {
    setStored((prev) => {
      const existingIds = new Set(prev.wants.map((w) => w.id));
      const newItems = suggested.filter((s) => !existingIds.has(s.id));
      return {
        ...prev,
        wants: [...prev.wants, ...newItems],
      };
    });
  };

  const addCommuteDestination = (dest: UserCommuteDestination) => {
    setStored((prev) => ({
      ...prev,
      commuteDestinations: [...prev.commuteDestinations, dest],
    }));
  };

  const deleteCommuteDestination = (id: string) => {
    setStored((prev) => ({
      ...prev,
      commuteDestinations: prev.commuteDestinations.filter((d) => d.id !== id),
    }));
  };

  const toggleTheme = () => {
    setStored((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const completeOnboarding = () => {
    setStored((prev) => ({
      ...prev,
      onboardingCompleted: true,
    }));
  };

  const loadSampleData = () => {
    const samples = getSampleListings();
    setStored((prev) => ({
      ...prev,
      currentHouses: [SAMPLE_CURRENT_HOUSE],
      activeCurrentHouseId: SAMPLE_CURRENT_HOUSE.id,
      listings: samples,
      wants: DEFAULT_WANTS,
      onboardingCompleted: true,
    }));
    setActiveListingId(samples[0].id);
    setSecondaryListingId(samples[1].id);
  };

  const clearAllData = () => {
    setStored({
      version: 1,
      currentHouses: [SAMPLE_CURRENT_HOUSE],
      activeCurrentHouseId: SAMPLE_CURRENT_HOUSE.id,
      listings: [],
      wants: DEFAULT_WANTS,
      commuteDestinations: [],
      theme: 'light',
      onboardingCompleted: false,
    });
    setActiveListingId(null);
    setSecondaryListingId(null);
  };

  const exportBackup = () => {
    exportDataAsJson(stored);
  };

  const importBackup = (jsonStr: string) => {
    const validated = validateImportData(jsonStr);
    setStored(validated);
    if (validated.listings.length > 0) {
      setActiveListingId(validated.listings[0].id);
    }
  };

  const dismissHashNotification = () => {
    setUrlHashImportNotification(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentHouses: stored.currentHouses,
        activeCurrentHouse,
        activeCurrentHouseId: stored.activeCurrentHouseId,
        listings: stored.listings,
        activeListing,
        activeListingId,
        secondaryListing,
        secondaryListingId,
        comparisonMode,
        wants: stored.wants,
        commuteDestinations: stored.commuteDestinations,
        theme: stored.theme,
        onboardingCompleted: stored.onboardingCompleted,
        activeTab,
        urlHashImportNotification,

        setActiveCurrentHouseId,
        addCurrentHouse,
        updateCurrentHouse,
        deleteCurrentHouse,

        setActiveListingId,
        setSecondaryListingId,
        setComparisonMode,
        addListing,
        updateListing,
        deleteListing,

        updateWant,
        addWant,
        deleteWant,
        resetWantsToDefaults,
        applySuggestedWants,

        addCommuteDestination,
        deleteCommuteDestination,

        toggleTheme,
        setActiveTab,
        completeOnboarding,
        loadSampleData,
        clearAllData,
        exportBackup,
        importBackup,
        dismissHashNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
