import React, { useState } from 'react';
import { Sparkles, Clipboard, AlertCircle, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { parseListingInput } from '../../lib/parser/index';
import { CurrentHouseProfile } from '../../types/property';

interface CurrentHouseRightmoveImportProps {
  onImport: (importedData: Partial<CurrentHouseProfile>) => void;
  onCancel?: () => void;
}

export const CurrentHouseRightmoveImport: React.FC<CurrentHouseRightmoveImportProps> = ({
  onImport,
  onCancel,
}) => {
  const [rawInput, setRawInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedSummary, setDetectedSummary] = useState<Partial<CurrentHouseProfile> | null>(null);

  const handleParse = () => {
    setErrorMsg(null);
    setDetectedSummary(null);

    const trimmed = rawInput.trim();
    if (!trimmed) {
      setErrorMsg('Please paste Rightmove or Zoopla listing text, HTML source, or bookmarklet JSON.');
      return;
    }

    // A URL alone contains no listing facts and cannot be fetched from this app.
    if (
      (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
      /(?:rightmove|zoopla)\.co\.uk/.test(trimmed) &&
      trimmed.length < 200
    ) {
      setErrorMsg(
        'Open the listing page, press Ctrl+A and Ctrl+C to copy its text, then paste it here. A link alone cannot provide listing details.'
      );
      return;
    }

    try {
      const parsed = parseListingInput(trimmed);
      if (!parsed || !parsed.property) {
        setErrorMsg('Could not detect property details from the pasted text. Please ensure you have copied the full listing description or HTML source.');
        return;
      }

      const p = parsed.property;
      if (p.displayAddress === 'Address not stated' || p.displayAddress === 'Address not specified' || (!p.price && !p.bedrooms)) {
        setErrorMsg('Could not find a complete listing. Copy the text from an individual property page or use the bookmarklet.');
        return;
      }

      const imported: Partial<CurrentHouseProfile> = {
        displayAddress: p.displayAddress,
        postcode: p.postcode || undefined,
        bedrooms: p.bedrooms || undefined,
        bathrooms: p.bathrooms || undefined,
        receptions: p.receptions || undefined,
        propertyType: p.propertyType !== 'other' ? p.propertyType : undefined,
        tenure: p.tenure !== 'unknown' ? p.tenure : undefined,
        floorAreaSqFt: p.floorAreaSqFt || undefined,
        floorAreaSqM: p.floorAreaSqM || undefined,
        parkingSpaces: p.parkingSpaces ?? 0,
        garageType: p.garageType !== 'none' ? p.garageType : undefined,
        hasDriveway: p.hasDriveway || undefined,
        gardenOrientation: p.gardenOrientation !== 'unknown' ? p.gardenOrientation : undefined,
        hasGarden: p.hasGarden || undefined,
        loftStatus: p.loftStatus !== 'not_mentioned' ? p.loftStatus : undefined,
        councilTaxBand: p.councilTaxBand !== 'unknown' ? p.councilTaxBand : undefined,
        epcRating: p.epcRating !== 'unknown' ? p.epcRating : undefined,
        estimatedCurrentValue: p.price || undefined,
        frustrations: [],
        thingsWeLove: p.keyFeatures || [],
      };

      setDetectedSummary(imported);
    } catch (err: any) {
      setErrorMsg(`Failed to parse: ${err.message || 'Unknown error'}`);
    }
  };

  const handleApply = () => {
    if (detectedSummary) {
      onImport(detectedSummary);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/40 dark:bg-brand-950/20 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Import Current Home from Rightmove or Zoopla
          </h4>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
        Have a listing for your current home? Paste its Rightmove or Zoopla page text, source, or bookmarklet output to review the details before applying them.
      </p>

      <div>
        <textarea
          rows={3}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Paste Rightmove or Zoopla listing text, HTML source, or bookmarklet JSON..."
          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {detectedSummary && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Listing Data Detected Successfully:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
            <div>
              <span className="text-slate-500 block">Address:</span>
              <span className="font-semibold">{detectedSummary.displayAddress || 'Detected'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Bed / Bath:</span>
              <span className="font-semibold">{detectedSummary.bedrooms ?? 'Not stated'} beds, {detectedSummary.bathrooms ?? 'Not stated'} baths</span>
            </div>
            <div>
              <span className="text-slate-500 block">Floor Area:</span>
              <span className="font-semibold">{detectedSummary.floorAreaSqFt ? `${detectedSummary.floorAreaSqFt} sq ft` : 'Not stated'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Price / Value:</span>
              <span className="font-semibold">£{detectedSummary.estimatedCurrentValue?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-slate-400">
          Works with Rightmove and Zoopla listing content
        </span>

        {detectedSummary ? (
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <span>Apply to Current Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleParse}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Extract Details</span>
          </button>
        )}
      </div>
    </div>
  );
};
