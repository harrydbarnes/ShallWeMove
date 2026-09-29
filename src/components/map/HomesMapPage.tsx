import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types/property';
import { homeName } from '../../lib/utils/homePresentation';
import { searchUkAddresses } from '../../lib/services/addressLookup';
import { formatCurrency } from '../../lib/utils/formatters';

type MapHome = { property: Property; current: boolean; latitude: number; longitude: number };
const postcodePattern = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;

export function googleMapsHomeUrl(property: Property): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.displayAddress)}`;
}

function validCoordinates(property: Property): boolean {
  const coords = property.coordinates;
  return !!coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude) &&
    coords.latitude >= 49 && coords.latitude <= 61 && coords.longitude >= -9 && coords.longitude <= 3;
}

interface HomesMapPageProps {
  onCompare: (id: string) => void;
}

export const HomesMapPage: React.FC<HomesMapPageProps> = ({ onCompare }) => {
  const { currentHouses, listings, updateCurrentHouse, updateListing } = useApp();
  const [locating, setLocating] = useState(false);
  const [locateMessage, setLocateMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);
  const allHomes = useMemo(() => [
    ...currentHouses.map((property) => ({ property, current: true })),
    ...listings.map((property) => ({ property, current: false })),
  ], [currentHouses, listings]);
  const located: MapHome[] = allHomes.filter(({ property }) => validCoordinates(property)).map(({ property, current }) => ({
    property, current,
    latitude: property.coordinates!.latitude,
    longitude: property.coordinates!.longitude,
  }));
  const unlocated = allHomes.filter(({ property }) => !validCoordinates(property));

  useEffect(() => {
    if (!mapElement.current || map.current) return;
    const instance = L.map(mapElement.current, { scrollWheelZoom: false }).setView([53.5, -2.5], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(instance);
    markerLayer.current = L.layerGroup().addTo(instance);
    map.current = instance;
    return () => { instance.remove(); map.current = null; markerLayer.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current || !markerLayer.current) return;
    markerLayer.current.clearLayers();
    const bounds: L.LatLngExpression[] = [];
    located.forEach(({ property, current, latitude, longitude }) => {
      const point: L.LatLngExpression = [latitude, longitude];
      bounds.push(point);
      const marker = L.circleMarker(point, {
        radius: current ? 10 : 8,
        color: '#fff', weight: 2,
        fillColor: current ? '#0f766e' : '#d97706', fillOpacity: 1,
      });
      marker.bindTooltip(homeName(property), { direction: 'top' });
      marker.on('click', () => setSelectedId(property.id));
      marker.addTo(markerLayer.current!);
    });
    if (bounds.length === 1) map.current.setView(bounds[0], 13);
    else if (bounds.length > 1) map.current.fitBounds(L.latLngBounds(bounds), { padding: [35, 35], maxZoom: 13 });
  }, [currentHouses, listings]);

  const locateHomes = async () => {
    setLocating(true);
    setLocateMessage('');
    let found = 0;
    for (const { property, current } of unlocated) {
      const postcode = property.postcode || property.displayAddress.match(postcodePattern)?.[0];
      const query = postcode || property.displayAddress;
      if (!query || /^(address not|new address)/i.test(query)) continue;
      try {
        const matches = await searchUkAddresses(query);
        const match = matches.find((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
        if (match && match.latitude !== undefined && match.longitude !== undefined) {
          const updated = { ...property, coordinates: { latitude: match.latitude, longitude: match.longitude }, updatedAt: new Date().toISOString() };
          if (current) updateCurrentHouse(updated as typeof currentHouses[number]);
          else updateListing(updated);
          found++;
        }
      } catch {
        // Leave this home unlocated; the user can still open it in Google Maps.
      }
    }
    setLocateMessage(found ? `Located ${found} ${found === 1 ? 'home' : 'homes'} approximately. Check each location before relying on it.` : 'No further homes could be located. Add a postcode or check each address in Google Maps.');
    setLocating(false);
  };

  return (
    <section className="space-y-5" aria-labelledby="homes-map-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="homes-map-title" className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your homes on a map</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Compare where your saved homes sit. Pins are approximate; confirm the address on the original listing.</p>
        </div>
        {unlocated.length > 0 && <button type="button" onClick={locateHomes} disabled={locating} className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"><Navigation className="h-4 w-4" />{locating ? 'Locating homes…' : `Locate ${unlocated.length} unpinned ${unlocated.length === 1 ? 'home' : 'homes'}`}</button>}
      </div>
      {unlocated.length > 0 && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">Locating sends saved postcodes, or addresses without a postcode, to postcodes.io or Photon. Opening the map loads OpenStreetMap tiles. Home details remain saved in this browser.</p>}
      {locateMessage && <p role="status" className="text-sm text-slate-700 dark:text-slate-200">{locateMessage}</p>}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div ref={mapElement} role="region" aria-label={`Map with ${located.length} saved home locations`} className="h-[28rem] overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-slate-700" />
        <div className="max-h-[28rem] space-y-2 overflow-y-auto" aria-label="Saved homes">
          {allHomes.map(({ property, current }) => {
            const isLocated = validCoordinates(property);
            return <div key={`${current ? 'current' : 'listing'}-${property.id}`} className={`rounded-xl border p-3 ${selectedId === property.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-stone-200 bg-white dark:border-slate-700 dark:bg-slate-850'}`}>
              <div className="flex items-start gap-2">
                <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${current ? 'text-brand-700' : 'text-amber-600'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{current ? 'Current home' : 'Saved listing'} · {isLocated ? 'Approximate pin' : 'Not pinned'}</p>
                  <h2 className="break-words text-sm font-bold text-slate-900 dark:text-white">{current ? (property as typeof currentHouses[number]).profileName || homeName(property) : homeName(property)}</h2>
                  {property.nickname && <p className="text-xs text-slate-500 dark:text-slate-400">{property.displayAddress}</p>}
                  {!current && <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(property.price)}</p>}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 pl-6 text-xs font-semibold">
                {isLocated && <button type="button" onClick={() => { setSelectedId(property.id); map.current?.setView([property.coordinates!.latitude, property.coordinates!.longitude], 13); }} className="text-brand-700 hover:underline dark:text-brand-300">Show pin</button>}
                {!current && <button type="button" onClick={() => onCompare(property.id)} className="text-brand-700 hover:underline dark:text-brand-300">Compare</button>}
                <a href={googleMapsHomeUrl(property)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-600 hover:underline dark:text-slate-300">Google Maps <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>;
          })}
          {allHomes.length === 0 && <p className="rounded-xl border border-dashed border-stone-300 p-5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">Save a home to see it here.</p>}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Map tiles © OpenStreetMap contributors. Marker positions are for orientation, not property boundaries.</p>
    </section>
  );
};
