import React from 'react';
import { Download, Home, Moon, Plus, Printer, Settings2, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
  onOpenAddListing, onOpenCurrentHouse, onOpenWants, onOpenShareModal,
  onOpenBackupModal, viewMode, setViewMode,
}) => {
  const {
    currentHouses, activeCurrentHouse, setActiveCurrentHouseId,
    listings, activeListing, setActiveListingId, theme, toggleTheme,
  } = useApp();

  return (
    <header className="site-header sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-white dark:bg-emerald-700" aria-hidden="true">
              <Home className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold tracking-tight text-lg leading-tight text-slate-900 dark:text-white">Shall We Move?</div>
              <p className="text-xs text-slate-600 dark:text-slate-300">Compare homes against what matters to you</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onOpenAddListing} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add listing
            </button>
            {activeListing && <button onClick={onOpenShareModal} className="header-icon-button" aria-label="Print or export summary" title="Print or export summary"><Printer className="h-4 w-4" /></button>}
            <button onClick={onOpenBackupModal} className="header-icon-button" aria-label="Backup or restore data" title="Backup or restore data"><Download className="h-4 w-4" /></button>
            <button onClick={toggleTheme} className="header-icon-button" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <nav className="flex flex-col gap-3 border-t border-stone-100 py-3 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between" aria-label="Comparison controls">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:flex lg:items-end">
            <div className="flex min-w-0 items-end gap-1">
              <label className="block min-w-0 flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Current home
                <select value={activeCurrentHouse.id} onChange={(event) => setActiveCurrentHouseId(event.target.value)} className="header-select mt-1">
                  {currentHouses.map((house) => <option key={house.id} value={house.id}>{house.profileName || house.displayAddress}</option>)}
                </select>
              </label>
              <button onClick={onOpenCurrentHouse} className="header-icon-button mb-0.5" aria-label="Edit current home" title="Edit current home"><Settings2 className="h-4 w-4" /></button>
            </div>
            <label className="block min-w-0 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Listing to compare
              <select value={activeListing?.id || ''} onChange={(event) => setActiveListingId(event.target.value)} disabled={listings.length === 0} className="header-select mt-1 disabled:opacity-60">
                {listings.length === 0 && <option value="">No listings yet</option>}
                {listings.map((listing) => <option key={listing.id} value={listing.id}>{listing.displayAddress}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-1 dark:border-slate-700 dark:bg-slate-800" aria-label="View">
              <button onClick={() => setViewMode('comparison')} aria-current={viewMode === 'comparison' ? 'page' : undefined} className={`view-button ${viewMode === 'comparison' ? 'view-button-active' : ''}`}>Comparison</button>
              <button onClick={() => setViewMode('shortlist')} aria-current={viewMode === 'shortlist' ? 'page' : undefined} className={`view-button ${viewMode === 'shortlist' ? 'view-button-active' : ''}`}>Shortlist{listings.length > 0 && <span className="ml-1 text-xs opacity-70">{listings.length}</span>}</button>
            </div>
            <button onClick={onOpenWants} className="min-h-10 whitespace-nowrap rounded-lg border border-stone-200 px-3 text-sm font-medium text-slate-700 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">My priorities</button>
          </div>
        </nav>
      </div>
    </header>
  );
};
