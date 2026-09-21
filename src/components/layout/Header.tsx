import React, { useState } from 'react';
import {
  Home,
  PlusCircle,
  Settings,
  Sun,
  Moon,
  Download,
  Upload,
  ListFilter,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/utils/formatters';

interface HeaderProps {
  onOpenAddListing: () => void;
  onOpenCurrentHouse: () => void;
  onOpenWants: () => void;
  onOpenShareModal: () => void;
  onOpenBackupModal: () => void;
  viewMode: 'comparison' | 'shortlist';
  setViewMode: (mode: 'comparison' | 'shortlist') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddListing,
  onOpenCurrentHouse,
  onOpenWants,
  onOpenShareModal,
  onOpenBackupModal,
  viewMode,
  setViewMode,
}) => {
  const {
    currentHouses,
    activeCurrentHouse,
    setActiveCurrentHouseId,
    listings,
    activeListing,
    setActiveListingId,
    theme,
    toggleTheme,
    loadSampleData,
  } = useApp();

  const [houseDropdownOpen, setHouseDropdownOpen] = useState(false);
  const [listingDropdownOpen, setListingDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  Shall We Move?
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Client-Side & Private
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Evidence-based UK home comparison vs your current home
              </p>
            </div>
          </div>

          {/* Center: Context Selectors (Current Home & Prospective Listing) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Current House selector */}
            <div className="relative">
              <button
                onClick={() => setHouseDropdownOpen(!houseDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              >
                <Home className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span className="max-w-[140px] truncate">
                  {activeCurrentHouse.profileName || 'Current Home'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {houseDropdownOpen && (
                <div
                  className="absolute left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40"
                  onClick={() => setHouseDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Current Home Profiles
                  </div>
                  {currentHouses.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setActiveCurrentHouseId(h.id)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                        h.id === activeCurrentHouse.id
                          ? 'font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{h.profileName || h.displayAddress}</span>
                      {h.id === activeCurrentHouse.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
                    <button
                      onClick={onOpenCurrentHouse}
                      className="w-full text-left px-3 py-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium hover:bg-brand-50 dark:hover:bg-brand-950/40 flex items-center space-x-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Edit Current Home Details</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Mode: Comparison vs Shortlist */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'comparison'
                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Comparison
              </button>
              <button
                onClick={() => setViewMode('shortlist')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition ${
                  viewMode === 'shortlist'
                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Shortlist</span>
                {listings.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-brand-500 text-white text-[10px] font-bold rounded-full">
                    {listings.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right actions: Wants, Add Listing, Theme, Backup */}
          <div className="flex items-center space-x-2">
            {/* Quick Sample Button if no listings */}
            {listings.length === 0 && (
              <button
                onClick={loadSampleData}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Try Sample Data</span>
              </button>
            )}

            {/* Wants button */}
            <button
              onClick={onOpenWants}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition"
              title="Configure Priorities & Deal Breakers"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">My Priorities</span>
            </button>

            {/* Add Listing button */}
            <button
              onClick={onOpenAddListing}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm shadow-brand-500/30 transition transform active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Listing</span>
            </button>

            {/* Print / Export Report button */}
            {activeListing && (
              <button
                onClick={onOpenShareModal}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Print or Export Summary"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            {/* Backup & Restore modal */}
            <button
              onClick={onOpenBackupModal}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Backup or Restore Data (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Sub-bar for quick listing selection */}
        {listings.length > 0 && (
          <div className="md:hidden py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Viewing:</span>
              <select
                value={activeListing?.id || ''}
                onChange={(e) => setActiveListingId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.displayAddress} ({formatCurrency(l.price)})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'comparison' ? 'shortlist' : 'comparison')}
              className="text-brand-600 dark:text-brand-400 font-semibold px-2 py-1 rounded bg-brand-50 dark:bg-brand-950/50"
            >
              {viewMode === 'comparison' ? 'Shortlist' : 'Compare'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
