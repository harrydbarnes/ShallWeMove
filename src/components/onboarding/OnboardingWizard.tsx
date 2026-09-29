import React, { useState } from 'react';
import {
  Home,
  SlidersHorizontal,
  PlusCircle,
  ArrowRight,
  Check,
  Sparkles,
  AlertTriangle,
  FileText,
  Bookmark,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateAutoSuggestions } from '../../lib/scoring/autoSuggestions';
import { parseListingInput } from '../../lib/parser/index';
import { CurrentHouseProfile } from '../../types/property';
import { AddressSearchInput } from '../address/AddressSearchInput';
import { Tooltip } from '../ui/Tooltip';
import { ImportancePillGroup } from '../wants/ImportancePillGroup';
import { CurrentHouseRightmoveImport } from '../currentHouse/CurrentHouseRightmoveImport';

interface OnboardingWizardProps {
  onClose: () => void;
  onOpenAddListingModal: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onClose,
  onOpenAddListingModal,
}) => {
  const {
    activeCurrentHouse,
    updateCurrentHouse,
    wants,
    updateWant,
    applySuggestedWants,
    loadSampleData,
    completeOnboarding,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form state
  const [profileName, setProfileName] = useState(activeCurrentHouse.id === 'current_house_sample' ? '' : activeCurrentHouse.profileName);
  const [address, setAddress] = useState(activeCurrentHouse.id === 'current_house_sample' ? '' : activeCurrentHouse.displayAddress);
  const [beds, setBeds] = useState(activeCurrentHouse.bedrooms);
  const [baths, setBaths] = useState(activeCurrentHouse.bathrooms);
  const [currentValue, setCurrentValue] = useState(activeCurrentHouse.estimatedCurrentValue ?? 0);
  const [mortgage, setMortgage] = useState(activeCurrentHouse.outstandingMortgage ?? 0);
  const [frustrationsText, setFrustrationsText] = useState(
    activeCurrentHouse.frustrations.join('\n')
  );
  const [showRightmoveImport, setShowRightmoveImport] = useState(false);
  const [stepOneError, setStepOneError] = useState('');

  const handleImportRightmove = (imported: Partial<CurrentHouseProfile>) => {
    if (imported.displayAddress) setAddress(imported.displayAddress);
    if (imported.bedrooms !== undefined) setBeds(imported.bedrooms);
    if (imported.bathrooms !== undefined) setBaths(imported.bathrooms);
    if (imported.estimatedCurrentValue !== undefined) setCurrentValue(imported.estimatedCurrentValue);
    setShowRightmoveImport(false);
  };

  const handleSaveStep1 = () => {
    if (!profileName.trim() || !address.trim()) {
      setStepOneError('Add a home name and address to continue, or choose Skip setup to explore the example.');
      return;
    }
    setStepOneError('');
    const updated = {
      ...activeCurrentHouse,
      profileName: profileName.trim(),
      displayAddress: address.trim(),
      bedrooms: beds,
      bathrooms: baths,
      estimatedCurrentValue: currentValue,
      outstandingMortgage: mortgage,
      frustrations: frustrationsText.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    updateCurrentHouse(updated);

    // Generate and propose auto-suggestions
    const suggestions = generateAutoSuggestions(updated);
    applySuggestedWants(suggestions);

    setStep(2);
  };

  const handleFinishOnboarding = () => {
    completeOnboarding();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden transition-all">
        {/* Top Progress bar */}
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Quick Setup
              </span>
              <span className="text-xs text-slate-400">Step {step} of 3</span>
            </div>
            <button
              onClick={() => {
                completeOnboarding();
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
            >
              Skip Setup
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div
              className={`h-1.5 rounded-full transition-all ${
                step >= 1 ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step >= 2 ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step >= 3 ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* STEP 1: CURRENT HOUSE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Start with your current home
                </h3>
                <div className="mt-1 flex flex-col items-start gap-2 pb-1 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Some example figures are prefilled. Replace them before comparing. Saved homes stay in this browser; address suggestions use an external lookup.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRightmoveImport((prev) => !prev)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1.5 rounded-lg border border-brand-200 dark:border-brand-800 transition flex-shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showRightmoveImport ? 'Hide listing import' : 'Import from Rightmove or Zoopla'}</span>
                  </button>
                </div>
              </div>

              {showRightmoveImport && (
                <CurrentHouseRightmoveImport
                  onImport={handleImportRightmove}
                  onCancel={() => setShowRightmoveImport(false)}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="onboarding-home-name" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Home name *</label>
                  <input id="onboarding-home-name" value={profileName} onChange={(event) => setProfileName(event.target.value)} maxLength={60} placeholder="e.g. Our Oxford home" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Address *
                    </label>
                    <span className="text-[10px] text-slate-400">Type to search UK addresses</span>
                  </div>
                  <AddressSearchInput
                    value={address}
                    onChange={setAddress}
                    onSelectAddress={(s) => setAddress(s.displayName)}
                    placeholder="Search address or postcode (e.g. 28 Stanley Road, Oxford or OX4 1QZ)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={beds}
                    onChange={(e) => setBeds(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={baths}
                    onChange={(e) => setBaths(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Current Value (£)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Outstanding Mortgage (£)
                    </label>
                    <Tooltip
                      content={
                        <div className="space-y-1.5 text-[11px] text-slate-200">
                          <p className="font-bold text-amber-300">What should you include?</p>
                          <p>
                            Enter your total redemption figure: your current principal balance <strong>plus any Early Repayment Charge (ERC)</strong>, discharge/exit administration fees, and accrued daily interest.
                          </p>
                          <p className="text-slate-300">
                            💡 If you are unsure, request a <strong>redemption statement</strong> from your mortgage provider for the exact payoff amount.
                          </p>
                        </div>
                      }
                    />
                  </div>
                  <input
                    type="number"
                    step="5000"
                    value={mortgage}
                    onChange={(e) => setMortgage(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    What frustrates you about this house? (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={frustrationsText}
                    onChange={(e) => setFrustrationsText(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. No off-street parking&#10;North facing dark garden&#10;Cramped kitchen"
                  />
                </div>
              </div>

              {stepOneError && <p role="alert" className="text-sm font-medium text-rose-700 dark:text-rose-300">{stepOneError}</p>}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveStep1}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  <span>Continue to priorities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: WHAT DO YOU WANT? */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <div className="inline-flex p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 mb-2">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Define your moving priorities
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Set importance for each requirement. If a requirement is a strict Deal Breaker, mark it so listings that fail it are immediately flagged in red.
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto pr-2 space-y-2.5">
                {wants.slice(0, 6).map((want) => (
                  <div
                    key={want.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200">{want.title}</h4>
                      {want.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          {want.description}
                        </p>
                      )}
                    </div>
                    <ImportancePillGroup
                      value={want.importance}
                      onChange={(newImportance) =>
                        updateWant({
                          ...want,
                          importance: newImportance,
                        })
                      }
                      compact={true}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  <span>Next: Add Your First Listing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PASTE OR EXPLORE WITH DEMO */}
          {step === 3 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  You're all set! Let's compare properties.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Choose how you'd like to get started. You can explore with our 5 realistic UK listing fixtures or add your own Rightmove or Zoopla listing right now.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <button type="button"
                  onClick={() => {
                    loadSampleData();
                    handleFinishOnboarding();
                  }}
                  className="w-full text-left p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-500 transition shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                      Explore with Sample Listings
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-[10px] font-bold text-emerald-900 dark:text-emerald-100">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Loads 5 pre-configured realistic listings (Victorian semi, leasehold flat, detached family home, Camden conversion, eco new build) for instant comparison.
                  </p>
                </button>

                <button type="button"
                  onClick={() => {
                    handleFinishOnboarding();
                    onOpenAddListingModal();
                  }}
                  className="w-full text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 transition shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Add a Listing
                    </span>
                    <PlusCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Use our Bookmarklet, paste listing text/HTML source, or enter property details manually.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
