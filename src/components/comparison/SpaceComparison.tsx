import React, { useState } from 'react';
import {
  Maximize2,
  Bed,
  Bath,
  Armchair,
  Layers,
  ZoomIn,
  X,
  FileImage,
  Sparkles,
} from 'lucide-react';
import { ComparisonSummary } from '../../types/comparison';
import { formatDualArea, formatPercentage } from '../../lib/utils/formatters';

interface SpaceComparisonProps {
  summary: ComparisonSummary;
}

export const SpaceComparison: React.FC<SpaceComparisonProps> = ({ summary }) => {
  const { currentProperty, newProperty, headlineMetrics } = summary;

  const [activeFloorplanModal, setActiveFloorplanModal] = useState<string | null>(null);

  const currentArea = currentProperty.floorAreaSqFt || 800;
  const newArea = newProperty.floorAreaSqFt || 1000;
  const maxArea = Math.max(currentArea, newArea) * 1.15;

  const currentPercent = Math.round((currentArea / maxArea) * 100);
  const newPercent = Math.round((newArea / maxArea) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Floor Area Visual Bar Scale */}
      <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Maximize2 className="w-4 h-4 text-brand-600" />
              <span>Total Internal Floor Area Scale</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dual measurement comparison in square feet and square metres
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-extrabold ${
                headlineMetrics.floorAreaDifferenceSqFt > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : headlineMetrics.floorAreaDifferenceSqFt < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-600'
              }`}
            >
              {headlineMetrics.floorAreaDifferenceSqFt > 0 ? '+' : ''}
              {formatDualArea(
                headlineMetrics.floorAreaDifferenceSqFt,
                headlineMetrics.floorAreaDifferenceSqM
              )}
            </span>
            <p className="text-[11px] text-slate-400">
              ({formatPercentage(headlineMetrics.floorAreaDifferencePercent)} delta)
            </p>
          </div>
        </div>

        {/* Visual Bar Comparison */}
        <div className="space-y-3 pt-2">
          {/* Current House Area Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Current Home: {currentProperty.displayAddress}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatDualArea(currentProperty.floorAreaSqFt, currentProperty.floorAreaSqM)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
              <div
                className="bg-slate-400 dark:bg-slate-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentPercent}%` }}
              />
            </div>
          </div>

          {/* New Listing Area Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-brand-700 dark:text-brand-400">
                Prospective Home: {newProperty.displayAddress}
              </span>
              <span className="font-bold text-brand-700 dark:text-brand-300">
                {formatDualArea(newProperty.floorAreaSqFt, newProperty.floorAreaSqM)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  newArea >= currentArea
                    ? 'bg-gradient-to-r from-emerald-500 to-brand-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${newPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Room Breakdown Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current House Rooms */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Current House Accommodation
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <Bed className="w-4 h-4 mx-auto text-slate-400 mb-1" />
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {currentProperty.bedrooms}
              </div>
              <span className="text-[10px] text-slate-500">Bedrooms</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <Bath className="w-4 h-4 mx-auto text-slate-400 mb-1" />
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {currentProperty.bathrooms}
              </div>
              <span className="text-[10px] text-slate-500">Bathrooms</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <Armchair className="w-4 h-4 mx-auto text-slate-400 mb-1" />
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {currentProperty.receptions}
              </div>
              <span className="text-[10px] text-slate-500">Receptions</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>Loft Status</span>
              <span className="font-semibold capitalize">{currentProperty.loftStatus.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>En Suite Bathroom</span>
              <span className="font-semibold">{currentProperty.hasEnSuite ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>Downstairs Cloakroom / WC</span>
              <span className="font-semibold">{currentProperty.hasDownstairsWc ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Utility Room</span>
              <span className="font-semibold">{currentProperty.hasUtilityRoom ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Prospective House Rooms */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-brand-200 dark:border-brand-900/50 space-y-3">
          <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Prospective House Accommodation
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-brand-50/40 dark:bg-brand-950/30 rounded-xl">
              <Bed className="w-4 h-4 mx-auto text-brand-600 mb-1" />
              <div className="text-lg font-black text-brand-900 dark:text-white">
                {newProperty.bedrooms}
              </div>
              <span className="text-[10px] text-brand-600 dark:text-brand-400">Bedrooms</span>
            </div>

            <div className="p-3 bg-brand-50/40 dark:bg-brand-950/30 rounded-xl">
              <Bath className="w-4 h-4 mx-auto text-brand-600 mb-1" />
              <div className="text-lg font-black text-brand-900 dark:text-white">
                {newProperty.bathrooms}
              </div>
              <span className="text-[10px] text-brand-600 dark:text-brand-400">Bathrooms</span>
            </div>

            <div className="p-3 bg-brand-50/40 dark:bg-brand-950/30 rounded-xl">
              <Armchair className="w-4 h-4 mx-auto text-brand-600 mb-1" />
              <div className="text-lg font-black text-brand-900 dark:text-white">
                {newProperty.receptions}
              </div>
              <span className="text-[10px] text-brand-600 dark:text-brand-400">Receptions</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 text-xs text-slate-700 dark:text-slate-200">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>Loft Status</span>
              <span className="font-semibold capitalize text-brand-600 dark:text-brand-400">
                {newProperty.loftStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>En Suite Bathroom</span>
              <span className="font-semibold">{newProperty.hasEnSuite ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>Downstairs Cloakroom / WC</span>
              <span className="font-semibold">{newProperty.hasDownstairsWc ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Utility Room</span>
              <span className="font-semibold">{newProperty.hasUtilityRoom ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Floorplans Side by Side */}
      <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Layers className="w-4 h-4 text-brand-600" />
          <span>Floorplans Comparison</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current House Floorplan */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center min-h-[220px] bg-slate-50/50 dark:bg-slate-900/50">
            {currentProperty.floorplans.length > 0 ? (
              <div
                className="relative group cursor-pointer"
                onClick={() => setActiveFloorplanModal(currentProperty.floorplans[0].url)}
              >
                <img
                  src={currentProperty.floorplans[0].url}
                  alt="Current House Floorplan"
                  className="max-h-56 object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-lg transition">
                  <ZoomIn className="w-6 h-6" />
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 p-4">
                <FileImage className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs">No floorplan image uploaded for current house.</p>
              </div>
            )}
            <span className="text-[11px] font-semibold text-slate-500 mt-2">
              Current Home ({currentProperty.displayAddress})
            </span>
          </div>

          {/* Prospective House Floorplan */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center min-h-[220px] bg-slate-50/50 dark:bg-slate-900/50">
            {newProperty.floorplans.length > 0 ? (
              <div
                className="relative group cursor-pointer"
                onClick={() => setActiveFloorplanModal(newProperty.floorplans[0].url)}
              >
                <img
                  src={newProperty.floorplans[0].url}
                  alt="Prospective Listing Floorplan"
                  className="max-h-56 object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-lg transition">
                  <ZoomIn className="w-6 h-6" />
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 p-4">
                <FileImage className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs">No floorplan image detected in this listing.</p>
              </div>
            )}
            <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mt-2">
              Prospective Listing ({newProperty.displayAddress})
            </span>
          </div>
        </div>
      </div>

      {/* Modal Zoom Viewer */}
      {activeFloorplanModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveFloorplanModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl p-2 overflow-hidden">
            <button
              onClick={() => setActiveFloorplanModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeFloorplanModal}
              alt="Enlarged Floorplan"
              className="max-h-[85vh] max-w-full object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
