import React from 'react';
import { Download, Home, Moon, MoreHorizontal, Plus, Printer, Settings2, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { homeName } from '../../lib/utils/homePresentation';

interface HeaderProps {
  onOpenAddListing: () => void;
  onOpenCurrentHouse: () => void;
  onOpenWants: () => void;
  onOpenShareModal: () => void;
  onOpenBackupModal: () => void;
  viewMode: 'comparison' | 'shortlist' | 'map';
  setViewMode: (mode: 'comparison' | 'shortlist' | 'map') => void;
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
        <div className="flex min-h-14 items-center justify-between gap-2 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-white dark:bg-emerald-700" aria-hidden="true">
              <Home className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="whitespace-nowrap font-extrabold tracking-tight text-base leading-tight text-slate-900 dark:text-white sm:text-lg">Shall We Move?</div>
              <p className="hidden text-xs text-slate-600 dark:text-slate-300 sm:block">Compare homes against what matters to you</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={onOpenAddListing} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:gap-2 sm:px-4 sm:text-sm">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add listing
            </button>
            {activeListing && <button onClick={onOpenShareModal} className="header-icon-button hidden sm:inline-flex" aria-label="Print or export summary" title="Print or export summary"><Printer className="h-4 w-4" /></button>}
            <button onClick={onOpenBackupModal} className="header-icon-button hidden sm:inline-flex" aria-label="Backup or restore data" title="Backup or restore data"><Download className="h-4 w-4" /></button>
            <button onClick={toggleTheme} className="header-icon-button hidden sm:inline-flex" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <details className="relative sm:hidden">
              <summary className="header-icon-button list-none cursor-pointer" aria-label="More options"><MoreHorizontal className="h-4 w-4" /></summary>
              <div className="absolute right-0 top-11 z-40 w-52 space-y-1 rounded-xl border border-stone-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <button onClick={onOpenWants} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-slate-700">My priorities</button>
                {activeListing && <button onClick={onOpenShareModal} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-slate-700">Print or export</button>}
                <button onClick={onOpenBackupModal} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-slate-700">Backup or restore</button>
                <button onClick={toggleTheme} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-slate-700">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
              </div>
            </details>
          </div>
        </div>
        <nav className="flex flex-col gap-2 border-t border-stone-100 py-2 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between" aria-label="Comparison controls">
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
                {listings.map((listing) => <option key={listing.id} value={listing.id}>{homeName(listing)}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-1 dark:border-slate-700 dark:bg-slate-800" aria-label="View">
              <button onClick={() => setViewMode('comparison')} aria-current={viewMode === 'comparison' ? 'page' : undefined} className={`view-button ${viewMode === 'comparison' ? 'view-button-active' : ''}`}>Comparison</button>
              <button onClick={() => setViewMode('shortlist')} aria-current={viewMode === 'shortlist' ? 'page' : undefined} className={`view-button ${viewMode === 'shortlist' ? 'view-button-active' : ''}`}>Shortlist{listings.length > 0 && <span className="ml-1 text-xs opacity-70">{listings.length}</span>}</button>
              <button onClick={() => setViewMode('map')} aria-current={viewMode === 'map' ? 'page' : undefined} className={`view-button ${viewMode === 'map' ? 'view-button-active' : ''}`}>Map</button>
            </div>
            <button onClick={onOpenWants} className="hidden min-h-10 whitespace-nowrap rounded-lg border border-stone-200 px-3 text-sm font-medium text-slate-700 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex sm:items-center">My priorities</button>
          </div>
        </nav>
      </div>
    </header>
  );
};
