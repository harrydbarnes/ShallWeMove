import React, { useState } from 'react';
import {
  MapPin,
  Train,
  GraduationCap,
  ExternalLink,
  Plus,
  Trash2,
  Navigation,
  Compass,
  Eye,
} from 'lucide-react';
import { ComparisonSummary } from '../../types/comparison';
import { useApp } from '../../context/AppContext';
import { formatDistanceMiles } from '../../lib/utils/formatters';
import { AreaSalesPanel } from '../map/AreaSalesPanel';

interface LocationSectionProps {
  summary: ComparisonSummary;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ summary }) => {
  const { newProperty } = summary;
  const { commuteDestinations, addCommuteDestination, deleteCommuteDestination } = useApp();

  const [newDestName, setNewDestName] = useState('');
  const [newDestLocation, setNewDestLocation] = useState('');

  const handleAddDest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestName.trim()) return;
    addCommuteDestination({
      id: `commute_${Date.now()}`,
      name: newDestName.trim(),
      addressOrPostcode: newDestLocation.trim(),
    });
    setNewDestName('');
    setNewDestLocation('');
  };

  // Helper links
  const queryAddress = encodeURIComponent(newProperty.displayAddress);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${queryAddress}`;
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${newProperty.coordinates ? `${newProperty.coordinates.latitude},${newProperty.coordinates.longitude}` : queryAddress}`;
  const ofstedUrl = `https://reports.ofsted.gov.uk/search?q=${encodeURIComponent(newProperty.postcode || newProperty.displayAddress)}`;

  return (
    <div className="space-y-6">
      <AreaSalesPanel key={newProperty.id} property={newProperty} />
      {/* 1. External Links Hub */}
      <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm text-xs">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-brand-600" />
          <span className="font-bold text-slate-900 dark:text-white">
            Quick Explorer Links:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-semibold flex items-center space-x-1.5 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href={streetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-semibold flex items-center space-x-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>Street View</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href={ofstedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-semibold flex items-center space-x-1.5 transition"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ofsted School Reports</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* 2. User-Entered Commute Destinations */}
      <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm text-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Compass className="w-4 h-4 text-brand-600" />
            <span>Household Commutes & Key Destinations</span>
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Add key places (work, parents, nurseries) to measure your household transit distances
          </p>
        </div>

        <div className="space-y-2">
          {commuteDestinations.map((dest) => {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${queryAddress}&destination=${encodeURIComponent(
              dest.addressOrPostcode || dest.name
            )}`;
            return (
              <div
                key={dest.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{dest.name}</h4>
                  {dest.addressOrPostcode && (
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {dest.addressOrPostcode}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <span>Check Transit Route</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => deleteCommuteDestination(dest.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add destination input */}
        <form
          onSubmit={handleAddDest}
          className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30 flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            placeholder="Destination name (e.g. Work - Soho, Grandparents)"
            value={newDestName}
            onChange={(e) => setNewDestName(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
          <input
            type="text"
            placeholder="Address or Postcode"
            value={newDestLocation}
            onChange={(e) => setNewDestLocation(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* 3. Stations and Schools Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Nearest Stations */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Train className="w-4 h-4 text-brand-600" />
            <span>Nearest Railway & Tube Stations</span>
          </h4>

          {newProperty.nearestStations.length > 0 ? (
            <div className="space-y-2">
              {newProperty.nearestStations.map((st, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{st.name}</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    {formatDistanceMiles(st.distanceMiles)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic py-2">
              No station distance data available in this listing model.
            </p>
          )}
        </div>

        {/* Nearest Schools */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <GraduationCap className="w-4 h-4 text-brand-600" />
            <span>Nearest Schools & Ofsted</span>
          </h4>

          {newProperty.nearestSchools.length > 0 ? (
            <div className="space-y-2">
              {newProperty.nearestSchools.map((sc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{sc.name}</span>
                    {sc.ofstedRating && (
                      <span
                        className={`ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          sc.ofstedRating === 'Outstanding'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {sc.ofstedRating}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-600 dark:text-slate-400 flex-shrink-0">
                    {formatDistanceMiles(sc.distanceMiles)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic py-2">
              No school catchment data listed directly in this listing model.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
