/**
 * UK Address and Postcode Lookup Service
 * Uses open, keyless, CORS-enabled endpoints:
 * - Photon (OpenStreetMap geocoding filtered to GB)
 * - postcodes.io (Official UK ONS postcode and locality database)
 */

export interface AddressSuggestion {
  displayName: string;
  street?: string;
  housenumber?: string;
  city?: string;
  county?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
}

// Simple UK Postcode Regex
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;

export function isUkPostcode(query: string): boolean {
  return UK_POSTCODE_REGEX.test(query.trim());
}

export function formatUkPostcode(postcode: string): string {
  const clean = postcode.replace(/\s+/g, '').toUpperCase();
  if (clean.length < 5) return clean;
  const incode = clean.slice(-3);
  const outcode = clean.slice(0, -3);
  return `${outcode} ${incode}`;
}

/**
 * Search UK addresses and postcodes
 */
export async function searchUkAddresses(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  // Check if query looks like a full postcode first
  if (isUkPostcode(trimmed)) {
    try {
      const formatted = formatUkPostcode(trimmed);
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(formatted.replace(/\s+/g, ''))}`, { signal });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          const r = data.result;
          const nameParts = [r.parish, r.admin_ward, r.admin_district, r.region, r.postcode].filter(Boolean);
          const uniqueParts = Array.from(new Set(nameParts));
          return [
            {
              displayName: uniqueParts.join(', '),
              city: r.admin_district || r.parish,
              county: r.admin_county || r.region,
              postcode: r.postcode,
              latitude: r.latitude,
              longitude: r.longitude,
            },
          ];
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      // Fallback to Photon
    }
  }

  // Geocode via Photon (OpenStreetMap)
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6&countrycode=gb`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.features || !Array.isArray(data.features)) return [];

    const results: AddressSuggestion[] = [];
    const seenNames = new Set<string>();

    for (const feat of data.features) {
      const p = feat.properties || {};
      const coords = feat.geometry?.coordinates; // [lon, lat]

      // Build readable display address
      const parts: string[] = [];
      const streetPart = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');
      if (streetPart) parts.push(streetPart);
      if (p.locality && !parts.includes(p.locality)) parts.push(p.locality);
      if (p.district && !parts.includes(p.district)) parts.push(p.district);
      if (p.city && !parts.includes(p.city)) parts.push(p.city);
      if (p.county && !parts.includes(p.county) && p.county !== p.city) parts.push(p.county);
      if (p.postcode) parts.push(p.postcode);

      const displayName = parts.length > 0 ? parts.join(', ') : p.name || 'UK Address';

      if (!seenNames.has(displayName)) {
        seenNames.add(displayName);
        results.push({
          displayName,
          street: p.street,
          housenumber: p.housenumber,
          city: p.city || p.district || p.locality,
          county: p.county,
          postcode: p.postcode,
          latitude: coords && coords[1] ? coords[1] : undefined,
          longitude: coords && coords[0] ? coords[0] : undefined,
        });
      }
    }

    return results;
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    console.warn('Address lookup error:', err);
    return [];
  }
}
