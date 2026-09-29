import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AddListingModal } from './components/ingestion/AddListingModal';
import { CurrentHouseModal } from './components/currentHouse/CurrentHouseModal';
import { WantsManagerModal } from './components/wants/WantsManagerModal';
import { ShareSummaryModal } from './components/export/ShareSummaryModal';
import { BackupModal } from './components/export/BackupModal';
import { PlannerHandoffModal } from './components/export/PlannerHandoffModal';

import { VerdictPanel } from './components/comparison/VerdictPanel';
import { SideBySideTable } from './components/comparison/SideBySideTable';
import { SpaceComparison } from './components/comparison/SpaceComparison';
import { WantsScorecard } from './components/comparison/WantsScorecard';
import { MoneySection } from './components/comparison/MoneySection';
import { LocationSection } from './components/comparison/LocationSection';
import { RunningCostsSection } from './components/comparison/RunningCostsSection';
import { FlagsSection } from './components/comparison/FlagsSection';
import { ShortlistPage } from './components/shortlist/ShortlistPage';

import { generateComparisonSummary } from './lib/scoring/comparisonSummary';
import { SAMPLE_CURRENT_HOUSE } from './lib/parser/sampleListings';
import {
  Sparkles,
  Home,
  Building,
  PlusCircle,
  Table,
  Maximize2,
  CheckSquare,
  PoundSterling,
  MapPin,
  Flame,
  Flag,
  CheckCircle2,
  X,
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeCurrentHouse,
    listings,
    activeListing,
    setActiveListingId,
    wants,
    onboardingCompleted,
    urlHashImportNotification,
    dismissHashNotification,
    loadSampleData,
  } = useApp();

  const [viewMode, setViewMode] = useState<'comparison' | 'shortlist'>('comparison');
  const [activeTab, setActiveTab] = useState<
    'table' | 'space' | 'scorecard' | 'money' | 'location' | 'running' | 'flags'
  >('table');

  // Modal open states
  const [showAddListing, setShowAddListing] = useState(false);
  const [showCurrentHouse, setShowCurrentHouse] = useState(false);
  const [showWants, setShowWants] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showPlannerHandoff, setShowPlannerHandoff] = useState(false);

  // Compute comparison summary for active listing
  const comparisonSummary = activeListing
    ? generateComparisonSummary(activeCurrentHouse, activeListing, wants)
    : null;
  const usingExampleHome =
    activeCurrentHouse.id === SAMPLE_CURRENT_HOUSE.id &&
    activeCurrentHouse.displayAddress === SAMPLE_CURRENT_HOUSE.displayAddress &&
    activeCurrentHouse.estimatedCurrentValue === SAMPLE_CURRENT_HOUSE.estimatedCurrentValue;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header
        onOpenAddListing={() => setShowAddListing(true)}
        onOpenCurrentHouse={() => setShowCurrentHouse(true)}
        onOpenWants={() => setShowWants(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        onOpenBackupModal={() => setShowBackupModal(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Bookmarklet Transfer Toast Notification */}
      {urlHashImportNotification && (
        <div className="bg-emerald-600 text-white px-4 py-3 shadow-md transition">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-semibold">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{urlHashImportNotification}</span>
            </div>
            <button
              onClick={dismissHashNotification}
              className="p-1 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Onboarding Wizard for first-time visitors */}
        {!onboardingCompleted && (
          <OnboardingWizard
            onClose={() => {}}
            onOpenAddListingModal={() => setShowAddListing(true)}
          />
        )}
        {usingExampleHome && onboardingCompleted && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <p><strong>Example current home.</strong> The Oxford address and financial figures are sample data. Replace them before relying on a comparison.</p>
            <button onClick={() => setShowCurrentHouse(true)} className="font-semibold underline underline-offset-2 hover:no-underline">Enter my home</button>
          </div>
        )}

        {/* View Mode: SHORTLIST */}
        {viewMode === 'shortlist' && (
          <ShortlistPage
            onOpenAddListing={() => setShowAddListing(true)}
            onSelectListingForComparison={(id) => {
              setActiveListingId(id);
              setViewMode('comparison');
            }}
          />
        )}

        {/* View Mode: COMPARISON */}
        {viewMode === 'comparison' && (
          <>
            {/* Empty State when no listings exist */}
            {!activeListing || listings.length === 0 ? (
              <div className="text-center py-20 px-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/10">
                  <Building className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  No listing to compare yet
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Add a home you are considering, then compare its space, costs and fit with your current home.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowAddListing(true)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add a Listing</span>
                  </button>

                  <button
                    onClick={loadSampleData}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Load 5 Realistic Samples</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Active Comparison View */
              <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Comparing with {activeCurrentHouse.profileName || activeCurrentHouse.displayAddress}</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{activeListing.displayAddress}</h1>
                    {activeListing.source === 'sample' && <p className="mt-1 text-sm font-medium text-amber-800 dark:text-amber-300">Sample listing for exploring the app</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{listings.length} {listings.length === 1 ? 'listing' : 'listings'} saved</span>
                    <button type="button" onClick={() => setShowPlannerHandoff(true)} className="rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm font-bold text-brand-800 hover:bg-brand-50 dark:border-brand-700 dark:bg-slate-800 dark:text-brand-200 dark:hover:bg-slate-700">Use in Home Move Planner</button>
                  </div>
                </div>
                {/* 1. Scannable Top Verdict Panel */}
                {comparisonSummary && <VerdictPanel summary={comparisonSummary} />}

                {/* 2. Deep-Dive Section Navigation Tabs */}
                <div className="bg-slate-200/60 dark:bg-slate-800/70 p-1.5 rounded-2xl border border-slate-300/50 dark:border-slate-700/60 shadow-inner overflow-x-auto">
                  <div className="flex space-x-1.5 min-w-max">
                    <button
                      onClick={() => setActiveTab('table')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                        activeTab === 'table'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750 font-medium'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Overview & Specs</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('space')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                        activeTab === 'space'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750 font-medium'
                      }`}
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Space & Floorplans</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('scorecard')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                        activeTab === 'scorecard'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750 font-medium'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Wants Scorecard</span>
                      {comparisonSummary && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          {comparisonSummary.fitScore.mustHavesMetCount}/{comparisonSummary.fitScore.mustHavesTotalCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('money')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                        activeTab === 'money'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750 font-medium'
                      }`}
                    >
                      <PoundSterling className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Money & SDLT</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('location')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                        activeTab === 'location'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750 font-medium'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Location & Commute</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('running')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                        activeTab === 'running'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750 font-medium'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Running Costs</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('flags')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                        activeTab === 'flags'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750 font-medium'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Red & Green Flags</span>
                    </button>
                  </div>
                </div>

                {/* 3. Tab Content */}
                {comparisonSummary && (
                  <div>
                    {activeTab === 'table' && <SideBySideTable summary={comparisonSummary} />}
                    {activeTab === 'space' && <SpaceComparison summary={comparisonSummary} />}
                    {activeTab === 'scorecard' && <WantsScorecard summary={comparisonSummary} />}
                    {activeTab === 'money' && <MoneySection summary={comparisonSummary} />}
                    {activeTab === 'location' && <LocationSection summary={comparisonSummary} />}
                    {activeTab === 'running' && <RunningCostsSection summary={comparisonSummary} />}
                    {activeTab === 'flags' && <FlagsSection summary={comparisonSummary} />}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AddListingModal isOpen={showAddListing} onClose={() => setShowAddListing(false)} />
      <CurrentHouseModal isOpen={showCurrentHouse} onClose={() => setShowCurrentHouse(false)} />
      <WantsManagerModal isOpen={showWants} onClose={() => setShowWants(false)} />
      <ShareSummaryModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        summary={comparisonSummary}
      />
      <BackupModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
      {showPlannerHandoff && <PlannerHandoffModal listing={activeListing} onClose={() => setShowPlannerHandoff(false)} />}
    </div>
  );
};
