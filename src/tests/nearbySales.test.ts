import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchNearbySales, median, parseSaleBindings, quarterlySales, SoldHome } from '../lib/services/nearbySales';

const point = { postcode: 'OX4 1QZ', latitude: 51.74, longitude: -1.23, distance: 0, country: 'England' };
const binding = (id: string, price = '400000', date = '2024-02-01') => ({ sale: { value: `http://landregistry.data.gov.uk/data/ppi/transaction/${id}/current` }, price: { value: price }, date: { value: date }, postcode: { value: 'OX4 1QZ' }, paon: { value: '4' }, street: { value: 'STANLEY ROAD' }, type: { value: 'http://landregistry.data.gov.uk/def/common/terraced' }, category: { value: 'http://landregistry.data.gov.uk/def/ppi/standardPricePaidTransaction' } });
const sale = (price: number, date: string): SoldHome => ({ ...point, id: `${price}-${date}`, address: '4 Stanley Road', price, date, propertyType: 'terraced', newBuild: false });
afterEach(() => vi.unstubAllGlobals());

describe('nearby completed sales', () => {
  it('rejects invalid inputs before transmitting a query', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(fetchNearbySales('OX4" } UNION {', 500, 5)).rejects.toThrow('full UK postcode');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects Scotland rather than showing an empty England and Wales result', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: { country: 'Scotland' } }) }); vi.stubGlobal('fetch', fetch);
    await expect(fetchNearbySales('EH1 1YZ', 500, 5)).rejects.toThrow('Scotland');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('deduplicates sales and rejects invalid prices, dates, and external record links', () => {
    const rows = [binding('A'), binding('A'), binding('B', '-1'), binding('C', '500', 'bad'), { ...binding('D'), sale: { value: 'https://evil.example/record' } }, { ...binding('E'), category: { value: 'additional' } }, { ...binding('F'), status: { value: 'http://landregistry.data.gov.uk/def/ppi/delete' } }];
    const sales = parseSaleBindings(rows, [point]);
    expect(sales).toHaveLength(1);
    expect(sales[0]).toMatchObject({ price: 400000, address: '4, STANLEY ROAD, OX4 1QZ', latitude: 51.74, propertyType: 'terraced' });
  });
  it('uses medians and leaves empty quarters as gaps, including partial and recent periods', () => {
    expect(median([100, 200, 10000])).toBe(200);
    expect(median([100, 300])).toBe(200);
    const quarters = quarterlySales([sale(100, '2024-02-01'), sale(300, '2024-03-01'), sale(900, '2024-08-01')], '2024-02-01', '2024-10-01');
    expect(quarters[0]).toMatchObject({ label: 'Q1 2024', median: 200, count: 2, incomplete: true });
    expect(quarters[1]).toMatchObject({ median: null, count: 0, incomplete: false });
    expect(quarters[2].incomplete).toBe(true);
  });
  it('classifies the official flat-maisonette code under the flat filter', () => {
    const row = { ...binding('FLAT'), type: { value: 'http://landregistry.data.gov.uk/def/common/flat-maisonette' } };
    expect(parseSaleBindings([row], [point])[0].propertyType).toBe('flat');
  });
  it('queries bounded standard sales and reports coverage limits', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: point }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: Array.from({ length: 100 }, () => point) }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: { bindings: [binding('A')] } }) });
    vi.stubGlobal('fetch', fetch);
    const result = await fetchNearbySales(point.postcode, 250, 2, true);
    expect(result.coverageLimited).toBe(true);
    expect(result.sales).toHaveLength(1);
    const queryUrl = new URL(fetch.mock.calls[2][0]);
    const query = queryUrl.searchParams.get('query')!;
    expect(query).toContain('ppi:transactionCategory ?category');
    expect(query).toContain('LIMIT 2001');
    expect(query).toContain('ppi:recordStatus ?status');
  });
});
