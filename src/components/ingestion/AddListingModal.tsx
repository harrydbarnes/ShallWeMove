import React, { useState } from 'react';
import {
  X,
  Bookmark,
  ClipboardPaste,
  Edit3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseListingInput } from '../../lib/parser/index';
import { Property, FieldExtractionSummary } from '../../types/property';
import {
  generateBookmarkletJs,
} from '../../lib/bookmarklet/bookmarkletCode';
import { BOOKMARKLET_GUIDES } from '../../lib/bookmarklet/bookmarkletHelp';
import { getSampleListings } from '../../lib/parser/sampleListings';
import { formatCurrency, formatDualArea } from '../../lib/utils/formatters';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddListingModal: React.FC<AddListingModalProps> = ({ isOpen, onClose }) => {
  const { addListing } = useApp();
  const [activeTab, setActiveTab] = useState<'bookmarklet' | 'paste' | 'manual'>('paste');

  // Bookmarklet state
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [selectedBrowserGuide, setSelectedBrowserGuide] = useState(0);

  // Paste state
  const [pasteInput, setPasteInput] = useState('');
  const [listingName, setListingName] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    property: Property;
    summary: FieldExtractionSummary[];
    strategy: string;
  } | null>(null);
  const [showEvidenceList, setShowEvidenceList] = useState(true);

  // Manual Form State
  const [manualAddress, setManualAddress] = useState('');
  const [manualPrice, setManualPrice] = useState(0);
  const [manualBeds, setManualBeds] = useState(0);
  const [manualBaths, setManualBaths] = useState(0);
  const [manualReceptions, setManualReceptions] = useState(0);
  const [manualAreaSqFt, setManualAreaSqFt] = useState<number | ''>('');
  const [manualPropertyType, setManualPropertyType] = useState('other');
  const [manualTenure, setManualTenure] = useState('unknown');
  const [manualLeaseYears, setManualLeaseYears] = useState<number | ''>('');
  const [manualCouncilTax, setManualCouncilTax] = useState('unknown');
  const [manualEpc, setManualEpc] = useState('unknown');
  const [manualParking, setManualParking] = useState(0);
  const [manualGarage, setManualGarage] = useState('none');
  const [manualGarden, setManualGarden] = useState('unknown');
  const [manualLoft, setManualLoft] = useState('not_mentioned');
  const [manualEv, setManualEv] = useState(false);
  const [manualEnSuite, setManualEnSuite] = useState(false);
  const [manualUtility, setManualUtility] = useState(false);
  const [manualDownstairsWc, setManualDownstairsWc] = useState(false);
  const [manualOffice, setManualOffice] = useState(false);
  const [manualChainStatus, setManualChainStatus] = useState('unknown');
  const [manualDescription, setManualDescription] = useState('');

  if (!isOpen) return null;

  const currentAppOrigin = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const bookmarkletCode = generateBookmarkletJs(currentAppOrigin);

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 3000);
  };

  const handleParsePastedContent = () => {
    setParseError(null);
    if (!pasteInput.trim()) {
      setParseError('Please paste listing source HTML, JSON, or copied text.');
      return;
    }
    if (/^https?:\/\/(?:www\.)?(?:rightmove|zoopla)\.co\.uk\/[^\s]+$/i.test(pasteInput.trim())) {
      setParseError('Open the listing and copy its page text, or use the bookmarklet. A link alone cannot provide the listing details.');
      return;
    }

    try {
      const result = parseListingInput(pasteInput, 'paste');
      if (!result.property.displayAddress || result.property.displayAddress === 'Address not stated') {
        if (!result.property.price && !result.property.bedrooms) {
          throw new Error('Unable to extract property details. Try pasting the entire page source or using manual entry.');
        }
      }
      setParsedPreview({
        property: result.property,
        summary: result.summary,
        strategy: result.parseStrategy,
      });
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse listing data.');
    }
  };

  const handleConfirmParsedListing = () => {
    if (parsedPreview) {
      addListing({ ...parsedPreview.property, nickname: listingName.trim() || undefined });
      onClose();
    }
  };

  const handleCreateManualListing = () => {
    if (!manualAddress.trim()) {
      alert('Please enter a property address.');
      return;
    }

    if (!Number.isFinite(manualPrice) || manualPrice <= 0) {
      alert('Please enter a valid asking price.');
      return;
    }

    const newProp: Property = {
      id: `prop_manual_${Date.now()}`,
      nickname: listingName.trim() || undefined,
      source: 'manual',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      displayAddress: manualAddress,
      price: manualPrice,
      reduced: false,
      priceHistory: [],
      propertyType: manualPropertyType as any,
      tenure: manualTenure as any,
      leaseYearsRemaining: typeof manualLeaseYears === 'number' ? manualLeaseYears : undefined,
      councilTaxBand: manualCouncilTax as any,
      epcRating: manualEpc as any,
      bedrooms: manualBeds,
      bathrooms: manualBaths,
      receptions: manualReceptions,
      floorAreaSqFt: typeof manualAreaSqFt === 'number' ? manualAreaSqFt : undefined,
      floorAreaSqM: typeof manualAreaSqFt === 'number' ? Math.round((manualAreaSqFt / 10.7639) * 10) / 10 : undefined,
      parkingSpaces: manualParking,
      garageType: manualGarage as any,
      hasDriveway: false,
      hasEvCharger: manualEv,
      gardenOrientation: manualGarden as any,
      hasGarden: manualGarden !== 'none' && manualGarden !== 'unknown',
      hasPatioOrDecking: false,
      hasOutbuilding: false,
      hasEnSuite: manualEnSuite,
      hasUtilityRoom: manualUtility,
      hasDownstairsWc: manualDownstairsWc,
      hasHomeOfficeOrStudy: manualOffice,
      hasOpenPlanKitchen: false,
      loftStatus: manualLoft as any,
      hasNewBoiler: false,
      hasSolarPanels: false,
      hasUnderfloorHeating: false,
      needsModernisation: false,
      chainStatus: manualChainStatus as any,
      keyFeatures: [],
      descriptionText: manualDescription,
      photos: [],
      floorplans: [],
      nearestStations: [],
      nearestSchools: [],
      detectedFeatures: [],
      extractionSummary: [],
    };

    addListing(newProp);
    onClose();
  };

  const handleLoadSample = (index = 0) => {
    const samples = getSampleListings();
    if (samples[index]) {
      addListing(samples[index]);
      onClose();
    }
  };

  const foundCount = parsedPreview?.summary.filter((s) => s.status === 'found').length || 0;
  const inferredCount = parsedPreview?.summary.filter((s) => s.status === 'inferred').length || 0;
  const missingCount = parsedPreview?.summary.filter((s) => s.status === 'missing').length || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="add-listing-title" className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 id="add-listing-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Add a listing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paste a listing or enter details yourself. Saved in this browser.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close add listing"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-5 pt-3">
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'paste'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Paste Source / Text</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarklet')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'bookmarklet'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>1-Click Bookmarklet</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'manual'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Manual Entry</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: PASTE BOX */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              {!parsedPreview ? (
                <>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-emerald-800 dark:text-emerald-300">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      <p className="font-semibold">Accepts any of the following:</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                        <li><strong>Copied page text:</strong> Open a Rightmove or Zoopla listing, then select all and copy</li>
                        <li><strong>Bookmarklet output:</strong> Use the bookmarklet on either site, then paste its JSON here</li>
                        <li><strong>Page source:</strong> Rightmove PAGE_MODEL or Zoopla HTML</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Paste Listing Content Here
                    </label>
                    <textarea
                      rows={8}
                      value={pasteInput}
                      onChange={(e) => setPasteInput(e.target.value)}
                      className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                      placeholder="Paste Rightmove or Zoopla listing text, page source, or bookmarklet JSON..."
                    />
                  </div>

                  {parseError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{parseError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => handleLoadSample(0)}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Or test with Victorian Semi Sample Listing</span>
                    </button>

                    <button
                      onClick={handleParsePastedContent}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                    >
                      Parse Listing
                    </button>
                  </div>
                </>
              ) : (
                /* PARSE PREVIEW & EXTRACTION VERIFICATION */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                          Strategy: {parsedPreview.strategy.replace('_', ' ')}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {parsedPreview.property.displayAddress}
                        </h4>
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-0.5">
                          {formatCurrency(parsedPreview.property.price)}{' '}
                          {parsedPreview.property.priceQualifier && (
                            <span className="text-slate-400 font-normal">
                              ({parsedPreview.property.priceQualifier})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex space-x-2 text-xs">
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md font-semibold">
                          🟢 {foundCount} Found
                        </span>
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md font-semibold">
                          🟡 {inferredCount} Inferred
                        </span>
                        {missingCount > 0 && (
                          <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-semibold">
                            ⚪ {missingCount} Missing
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                      <div>
                        <span className="text-slate-400">Beds / Baths:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {parsedPreview.property.bedrooms || 'Not stated'} bed / {parsedPreview.property.bathrooms || 'Not stated'} bath
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Tenure:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                          {parsedPreview.property.tenure.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Floor Area:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDualArea(parsedPreview.property.floorAreaSqFt, parsedPreview.property.floorAreaSqM, true)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Loft Status:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                          {parsedPreview.property.loftStatus.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Name this home <span className="font-normal text-slate-500">(optional)</span>
                    <input type="text" value={listingName} onChange={(event) => setListingName(event.target.value)} maxLength={60} placeholder="e.g. The garden house" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </label>

                  {/* Inferred Features with Evidence Snippets */}
                  {parsedPreview.property.detectedFeatures.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowEvidenceList(!showEvidenceList)}
                        className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 mb-2"
                      >
                        {showEvidenceList ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span>Inferred Features with Evidence ({parsedPreview.property.detectedFeatures.length})</span>
                      </button>

                      {showEvidenceList && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {parsedPreview.property.detectedFeatures.map((f, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {f.label}
                                </span>
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                  Inferred from listing text
                                </span>
                              </div>
                              {f.evidence && (
                                <p className="mt-1 text-slate-500 dark:text-slate-400 italic text-[11px] bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded">
                                  "{f.evidence}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setParsedPreview(null)}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                    >
                      ← Paste Different Listing
                    </button>

                    <button
                      onClick={handleConfirmParsedListing}
                      className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Add to Comparison</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BOOKMARKLET HUB */}
          {activeTab === 'bookmarklet' && (
            <div className="space-y-5">
              <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-xl p-4 text-xs text-brand-900 dark:text-brand-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <Bookmark className="w-4 h-4 text-brand-600" />
                  <span>How the Bookmarklet Works</span>
                </div>
                <p className="leading-relaxed">
                  On a Rightmove or Zoopla for-sale listing, the bookmarklet reads the listing already shown in your browser and copies its details. Return here and paste the result into Add a listing. Review every extracted fact before saving.
                </p>
              </div>

              {/* Bookmarklet Actions */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Desktop: Drag to Bookmarks Bar
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Drag this button to your browser’s bookmark bar, or click to copy the code.
                  </p>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <a
                    href={bookmarkletCode}
                    onClick={(e) => e.preventDefault()}
                    className="cursor-move px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5"
                    title="Drag this button to your bookmarks toolbar"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Compare on Shall We Move</span>
                  </a>

                  <button
                    onClick={handleCopyBookmarklet}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition flex items-center space-x-1"
                  >
                    {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBookmarklet ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Browser Guides Accordion */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                  Browser-Specific Setup Guides
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {BOOKMARKLET_GUIDES.map((g, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedBrowserGuide(idx)}
                      className={`p-2 rounded-lg text-xs text-center border font-semibold transition ${
                        selectedBrowserGuide === idx
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {g.browser}
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-xs">
                  <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                    {BOOKMARKLET_GUIDES[selectedBrowserGuide].browser} Instructions:
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {BOOKMARKLET_GUIDES[selectedBrowserGuide].steps.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ol>
                  {BOOKMARKLET_GUIDES[selectedBrowserGuide].tip && (
                    <p className="mt-3 text-[11px] text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 p-2 rounded">
                      💡 <strong>Tip:</strong> {BOOKMARKLET_GUIDES[selectedBrowserGuide].tip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL ENTRY */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <p className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Enter only details you know. Unconfirmed features are left off the comparison until you check them.</p>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Name this home <span className="font-normal text-slate-500">(optional)</span>
                <input type="text" value={listingName} onChange={(event) => setListingName(event.target.value)} maxLength={60} placeholder="e.g. The garden house" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Address *
                  </label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="e.g. 14 Church Lane, Headington, Oxford, OX3 9HQ"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Asking Price (£) *
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Property Type
                  </label>
                  <select
                    value={manualPropertyType}
                    onChange={(e) => setManualPropertyType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="other">Not specified</option>
                    <option value="detached">Detached</option>
                    <option value="semi-detached">Semi-Detached</option>
                    <option value="terraced">Terraced</option>
                    <option value="flat">Flat / Apartment</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="maisonette">Maisonette</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={manualBeds}
                    onChange={(e) => setManualBeds(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={manualBaths}
                    onChange={(e) => setManualBaths(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor Area (sq ft)
                  </label>
                  <input
                    type="number"
                    value={manualAreaSqFt}
                    onChange={(e) => setManualAreaSqFt(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tenure
                  </label>
                  <select
                    value={manualTenure}
                    onChange={(e) => setManualTenure(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="freehold">Freehold</option>
                    <option value="leasehold">Leasehold</option>
                    <option value="share_of_freehold">Share of Freehold</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Council Tax Band
                  </label>
                  <select
                    value={manualCouncilTax}
                    onChange={(e) => setManualCouncilTax(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'unknown'].map((b) => (
                      <option key={b} value={b}>
                        {b === 'unknown' ? 'Unknown' : `Band ${b}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    EPC Rating
                  </label>
                  <select
                    value={manualEpc}
                    onChange={(e) => setManualEpc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'unknown'].map((r) => (
                      <option key={r} value={r}>
                        {r === 'unknown' ? 'Unknown' : `Band ${r}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={manualParking}
                    onChange={(e) => setManualParking(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Garden Orientation
                  </label>
                  <select
                    value={manualGarden}
                    onChange={(e) => setManualGarden(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="south">South Facing</option>
                    <option value="south_west">South-West Facing</option>
                    <option value="west">West Facing</option>
                    <option value="east">East Facing</option>
                    <option value="north">North Facing</option>
                    <option value="none">No Garden</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loft Status
                  </label>
                  <select
                    value={manualLoft}
                    onChange={(e) => setManualLoft(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="not_mentioned">Not Mentioned</option>
                    <option value="boarded">Boarded</option>
                    <option value="boarded_with_ladder_light">Boarded with Ladder & Light</option>
                    <option value="converted_with_building_regs">Converted with Building Regs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chain Status
                  </label>
                  <select
                    value={manualChainStatus}
                    onChange={(e) => setManualChainStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="no_onward_chain">No Onward Chain (Chain Free)</option>
                    <option value="chain_in_progress">Chain in progress</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={manualEnSuite}
                    onChange={(e) => setManualEnSuite(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>En Suite Bathroom</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={manualDownstairsWc}
                    onChange={(e) => setManualDownstairsWc(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Downstairs WC</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={manualUtility}
                    onChange={(e) => setManualUtility(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Utility Room</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={manualEv}
                    onChange={(e) => setManualEv(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>EV Car Charger</span>
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={handleCreateManualListing}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Create Listing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
