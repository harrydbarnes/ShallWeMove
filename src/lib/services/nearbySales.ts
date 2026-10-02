import { formatUkPostcode, isUkPostcode } from './addressLookup';

export interface SoldHome {
  id: string;
  address: string;
  postcode: string;
  price: number;
  date: string;
  propertyType: string;
  newBuild: boolean;
  latitude: number;
  longitude: number;
  distance: number;
}

export interface NearbySales {
  postcode: string;
  radius: number;
  postcodeCount: number;
  coverageLimited: boolean;
  coveredRadius: number;
  truncated: boolean;
  fetchedAt: string;
  from: string;
  to: string;
  centre: { latitude: number; longitude: number };
  sales: SoldHome[];
}

type PostcodePoint = { postcode: string; latitude: number; longitude: number; distance: number; country: string };
type Binding = Record<string, { value: string }>;
const MAX_SALES = 2000;
const cache = new Map<string, NearbySales>();

async function getJson(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('The public data service is unavailable. Please try again later.');
  return response.json();
}

export function parseSaleBindings(bindings: Binding[], points: PostcodePoint[]): SoldHome[] {
  const locations = new Map(points.map((point) => [formatUkPostcode(point.postcode), point]));
  const seen = new Set<string>();
  return bindings.flatMap((row) => {
    const id = row.sale?.value;
    const postcode = formatUkPostcode(row.postcode?.value || '');
    const point = locations.get(postcode);
    const price = Number(row.price?.value);
    const date = row.date?.value?.slice(0, 10);
    if (row.category?.value !== 'http://landregistry.data.gov.uk/def/ppi/standardPricePaidTransaction' || row.status?.value === 'http://landregistry.data.gov.uk/def/ppi/delete' || !id || !/^https?:\/\/landregistry\.data\.gov\.uk\/data\/ppi\/transaction\/[A-Za-z0-9-]+\/current$/.test(id) || seen.has(id) || !point || !Number.isFinite(price) || price <= 0 || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date))) return [];
    seen.add(id);
    return [{ id, postcode, price, date,
      address: [row.saon?.value, row.paon?.value, row.street?.value, row.town?.value, postcode].filter(Boolean).join(', '),
      propertyType: row.type?.value?.split('/').pop() || 'other',
      newBuild: row.newBuild?.value === 'true',
      latitude: point.latitude, longitude: point.longitude, distance: point.distance,
    }];
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export async function fetchNearbySales(input: string, radius: number, years: number, refresh = false): Promise<NearbySales> {
  if (!isUkPostcode(input)) throw new Error('Enter a full UK postcode, such as OX4 1QZ.');
  if (![250, 500, 1000].includes(radius) || ![2, 5].includes(years)) throw new Error('Choose a supported area and period.');
  const postcode = formatUkPostcode(input);
  const key = `${postcode}:${radius}:${years}`;
  const cached = cache.get(key);
  if (!refresh && cached && Date.now() - Date.parse(cached.fetchedAt) < 60 * 60 * 1000) return cached;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const lookup = await getJson(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, controller.signal);
    if (!lookup.result) throw new Error('This postcode could not be located.');
    if (!['England', 'Wales'].includes(lookup.result.country)) throw new Error('Land Registry sales cover England and Wales. Scotland and Northern Ireland need a different data source.');
    const nearby = await getJson(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}/nearest?radius=${radius}&limit=100`, controller.signal);
    const points: PostcodePoint[] = (nearby.result || []).filter((point: PostcodePoint) => ['England', 'Wales'].includes(point.country) && Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && isUkPostcode(point.postcode));
    if (!points.length) throw new Error('No nearby postcodes were found. Try a different postcode.');
    const now = new Date();
    const fromDate = new Date(Date.UTC(now.getUTCFullYear() - years, now.getUTCMonth(), now.getUTCDate()));
    const from = fromDate.toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);
    // VALUES are validated postcodes; no arbitrary user text enters the query.
    const values = points.map((point) => `"${formatUkPostcode(point.postcode)}"`).join(' ');
    const query = `PREFIX ppi: <http://landregistry.data.gov.uk/def/ppi/>
PREFIX common: <http://landregistry.data.gov.uk/def/common/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT ?sale ?price ?date ?postcode ?paon ?saon ?street ?town ?type ?newBuild ?category ?status WHERE {
 { SELECT ?address ?postcode WHERE { VALUES ?postcode { ${values} } ?address common:postcode ?postcode. } }
 ?sale ppi:propertyAddress ?address; ppi:pricePaid ?price; ppi:transactionDate ?date; ppi:propertyType ?type.
 OPTIONAL { ?address common:paon ?paon } OPTIONAL { ?address common:saon ?saon }
 OPTIONAL { ?address common:street ?street } OPTIONAL { ?address common:town ?town }
 OPTIONAL { ?sale ppi:newBuild ?newBuild }
 OPTIONAL { ?sale ppi:transactionCategory ?category } OPTIONAL { ?sale ppi:recordStatus ?status }
 FILTER(?date >= "${from}"^^xsd:date && ?date <= "${to}"^^xsd:date)
} ORDER BY DESC(?date) LIMIT ${MAX_SALES + 1}`;
    const data = await getJson(`https://landregistry.data.gov.uk/landregistry/query?output=json&query=${encodeURIComponent(query)}`, controller.signal);
    if (!Array.isArray(data.results?.bindings)) throw new Error('The sales service returned an unexpected response. Try again later.');
    const result: NearbySales = {
      postcode, radius, postcodeCount: points.length, coverageLimited: points.length === 100,
      coveredRadius: Math.max(...points.map((point) => point.distance)),
      truncated: data.results.bindings.length > MAX_SALES,
      fetchedAt: new Date().toISOString(), from, to,
      centre: { latitude: lookup.result.latitude, longitude: lookup.result.longitude },
      sales: parseSaleBindings(data.results.bindings.slice(0, MAX_SALES), points),
    };
    cache.set(key, result);
    return result;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('The sales lookup timed out. Try a smaller area or try again later.');
    throw error;
  } finally { clearTimeout(timer); }
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function quarterlySales(sales: SoldHome[], from: string, to: string) {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const quarters: { label: string; start: string; median: number | null; count: number; incomplete: boolean }[] = [];
  const cutoff = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 2, 1));
  for (let cursor = new Date(Date.UTC(start.getUTCFullYear(), Math.floor(start.getUTCMonth() / 3) * 3, 1)); cursor <= end; cursor.setUTCMonth(cursor.getUTCMonth() + 3)) {
    const quarterStart = cursor.toISOString().slice(0, 10);
    const next = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 3, 1));
    const prices = sales.filter((sale) => sale.date >= quarterStart && sale.date < next.toISOString().slice(0, 10)).map((sale) => sale.price);
    quarters.push({ label: `Q${Math.floor(cursor.getUTCMonth() / 3) + 1} ${cursor.getUTCFullYear()}`, start: quarterStart, median: median(prices), count: prices.length, incomplete: quarterStart < from || next > cutoff });
  }
  return quarters;
}
