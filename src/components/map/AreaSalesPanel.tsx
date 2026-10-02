import React, { useEffect, useRef, useState } from 'react';
import { Property } from '../../types/property';
import { useApp } from '../../context/AppContext';
import { homeName } from '../../lib/utils/homePresentation';
import { formatCurrency } from '../../lib/utils/formatters';
import { fetchNearbySales, median, NearbySales, quarterlySales, SoldHome } from '../../lib/services/nearbySales';

export interface SalesOverlay { data: NearbySales; sales: SoldHome[] }
interface Props { property: Property; chooseHome?: boolean; onSalesChange?: (overlay: SalesOverlay | null) => void; onShowMap?: () => void }
const control = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const types = ['detached', 'semi-detached', 'terraced', 'flat'];
const typeName = (type: string) => type === 'flat' ? 'Flat / maisonette' : type.replace('-', ' ');

export const AreaSalesPanel: React.FC<Props> = ({ property, chooseHome, onSalesChange, onShowMap }) => {
  const { currentHouses, listings } = useApp();
  const homes = [...currentHouses, ...listings];
  const [homeId, setHomeId] = useState(property.id);
  const selectedHome = homes.find((home) => home.id === homeId) || property;
  const getPostcode = (home: Property) => home.postcode || home.displayAddress.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i)?.[0] || '';
  const [postcode, setPostcode] = useState(getPostcode(selectedHome));
  const [radius, setRadius] = useState(500);
  const [years, setYears] = useState(5);
  const [type, setType] = useState('all');
  const [build, setBuild] = useState('all');
  const [quarter, setQuarter] = useState<string | null>(null);
  const [data, setData] = useState<NearbySales | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(0);
  useEffect(() => { setHomeId(property.id); }, [property.id]);
  useEffect(() => { setPostcode(getPostcode(selectedHome)); request.current++; setData(null); setQuarter(null); setLoading(false); setError(''); }, [selectedHome.id]);
  useEffect(() => () => { request.current++; }, []);
  const filtered = (data?.sales || []).filter((sale) => (type === 'all' || sale.propertyType === type) && (build === 'all' || sale.newBuild === (build === 'new')));
  const quarters = data ? quarterlySales(filtered, data.from, data.to) : [];
  const selectedQuarter = quarters.find((item) => item.start === quarter);
  const visible = selectedQuarter ? filtered.filter((sale) => sale.date >= selectedQuarter.start && sale.date < new Date(Date.UTC(Number(selectedQuarter.start.slice(0, 4)), Number(selectedQuarter.start.slice(5, 7)) - 1 + 3, 1)).toISOString().slice(0, 10)) : filtered;
  const visibleIds = visible.map((sale) => sale.id).join('|');
  useEffect(() => { onSalesChange?.(data ? { data, sales: visible } : null); }, [data, visibleIds, onSalesChange]);
  const changeSearch = () => { request.current++; setLoading(false); setData(null); setQuarter(null); setError(''); };
  const load = async (refresh = false) => {
    const id = ++request.current;
    setLoading(true); setError(''); setQuarter(null); setData(null);
    try { const result = await fetchNearbySales(postcode, radius, years, refresh); if (id === request.current) setData(result); }
    catch (err) { if (id === request.current) setError(err instanceof Error ? err.message : 'Unable to load sales. Try again later.'); }
    finally { if (id === request.current) setLoading(false); }
  };
  const priceMedian = median(visible.map((sale) => sale.price));
  const maxPrice = Math.max(100000, ...quarters.map((item) => item.median || 0)) * 1.1;
  const maxCount = Math.max(1, ...quarters.map((item) => item.count));
  const x = (index: number) => 65 + index * 615 / Math.max(1, quarters.length - 1);
  const y = (value: number) => 210 - value / maxPrice * 175;

  return <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-850 sm:p-5" aria-labelledby="area-sales-title">
    <div><h2 id="area-sales-title" className="text-xl font-bold text-slate-900 dark:text-white">What has sold nearby?</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Completed sales from HM Land Registry, with quarterly prices and activity for the area around a postcode.</p></div>
    <form onSubmit={(event) => { event.preventDefault(); void load(); }} className="flex flex-wrap items-end gap-3">
      {chooseHome && <label className="min-w-0 flex-[1_1_220px] text-xs font-semibold">Around home<select className={`${control} mt-1 w-full`} value={homeId} onChange={(event) => { setHomeId(event.target.value); changeSearch(); }}>{homes.map((home) => <option key={home.id} value={home.id}>{'profileName' in home ? String(home.profileName) : homeName(home)}</option>)}</select></label>}
      <label className="text-xs font-semibold">Postcode<input className={`${control} mt-1 block w-32 uppercase`} value={postcode} onChange={(event) => { setPostcode(event.target.value); changeSearch(); }} placeholder="OX4 1QZ" required maxLength={10} /></label>
      <label className="text-xs font-semibold">Search radius<select className={`${control} mt-1 block`} value={radius} onChange={(event) => { setRadius(Number(event.target.value)); changeSearch(); }}><option value={250}>250 metres</option><option value={500}>500 metres</option><option value={1000}>1 kilometre</option></select></label>
      <label className="text-xs font-semibold">Period<select className={`${control} mt-1 block`} value={years} onChange={(event) => { setYears(Number(event.target.value)); changeSearch(); }}><option value={2}>Past 2 years</option><option value={5}>Past 5 years</option></select></label>
      <button disabled={loading} className="min-h-10 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60">{loading ? 'Loading sales…' : 'Load nearby sales'}</button>
    </form>
    <p className="text-xs text-slate-500 dark:text-slate-400">Lookup sends this postcode to postcodes.io and nearby postcodes to HM Land Registry. England and Wales only. Saved finances are not sent.</p>
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">{error}</p>}
    {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Finding nearby postcodes and completed sales. This can take up to 45 seconds.</p>}
    {data && <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4 dark:border-slate-700">
        <div><p className="text-sm font-semibold">{data.postcode} · {data.postcodeCount} nearby postcodes · {data.radius}m requested</p><p className="text-xs text-slate-500 dark:text-slate-400">Checked {new Date(data.fetchedAt).toLocaleString('en-GB')} · Latest recorded sale: {data.sales[0]?.date || 'none found'}</p></div>
        <div className="flex gap-4">{onShowMap && <button type="button" onClick={onShowMap} className="text-xs font-semibold text-brand-700 underline underline-offset-2 dark:text-brand-300">View sales on map</button>}<button type="button" onClick={() => void load(true)} className="text-xs font-semibold text-brand-700 underline underline-offset-2 dark:text-brand-300">Refresh data</button></div>
      </div>
      <p className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">Updated monthly; recent registrations can lag. The latest two months are incomplete. This is a sample of standard residential sales at active nearby postcodes. Pins mark postcode centres, not individual buildings. Different homes selling can change the median even if values stay steady.</p>
      {(data.coverageLimited || data.truncated) && <p role="status" className="text-sm font-semibold text-amber-800 dark:text-amber-200">{data.coverageLimited && `Coverage limited to the nearest 100 postcodes (furthest ${Math.round(data.coveredRadius)}m). `}{data.truncated && 'Only the latest 2,000 transactions were checked for standard residential sales; older quarters are incomplete. '}Try a smaller radius for a fuller sample.</p>}
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold">Property type<select className={`${control} mt-1 block capitalize`} value={type} onChange={(event) => { setType(event.target.value); setQuarter(null); }}><option value="all">All residential types</option>{types.map((item) => <option key={item} value={item}>{typeName(item)}</option>)}</select></label>
        <label className="text-xs font-semibold">Build<select className={`${control} mt-1 block`} value={build} onChange={(event) => { setBuild(event.target.value); setQuarter(null); }}><option value="all">All homes</option><option value="existing">Existing homes</option><option value="new">New builds</option></select></label>
        {quarter && <button className="py-2 text-sm font-semibold text-brand-700 underline dark:text-brand-300" onClick={() => setQuarter(null)}>Show all quarters</button>}
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm"><p><strong className="text-2xl">{visible.length}</strong> recorded sales{selectedQuarter ? ` in ${selectedQuarter.label}` : ''}</p><p><strong className="text-2xl">{priceMedian === null ? '—' : formatCurrency(priceMedian)}</strong> median sold price</p></div>
      {filtered.length > 0 ? <>
        <div><h3 className="text-sm font-semibold">Quarterly median sold price and sales volume</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select a quarter to filter the sales and map. Hollow points: fewer than 5 sales or an incomplete quarter. Lines join only quarters with at least 5 sales and no known period gap.</p></div>
        <p className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">Swipe the graph sideways for later quarters. Open Quarterly figures below for every value.</p>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 720 330" className="h-80 min-w-[560px] w-full" role="img" aria-label="Quarterly median sold prices above, sale counts below. Full figures and quarter filters are in the table below.">
            {[0, 0.5, 1].map((fraction) => <g key={fraction}><line x1="65" x2="690" y1={y(maxPrice * fraction)} y2={y(maxPrice * fraction)} stroke="currentColor" opacity="0.12" /><text x="57" y={y(maxPrice * fraction) + 4} textAnchor="end" fontSize="11" fill="currentColor">£{Math.round(maxPrice * fraction / 1000)}k</text></g>)}
            {quarters.map((item, index) => {
              const prior = quarters[index - 1];
              return <g key={item.start}>
                {item.median !== null && prior?.median !== null && prior?.median !== undefined && item.count >= 5 && prior.count >= 5 && !item.incomplete && !prior.incomplete && !data.truncated && <line x1={x(index - 1)} y1={y(prior.median)} x2={x(index)} y2={y(item.median)} stroke="#0f766e" strokeWidth="2" />}
                <g role="button" tabIndex={0} aria-label={`${item.label}: ${item.count} sales, median ${item.median === null ? 'unavailable' : formatCurrency(item.median)}${item.incomplete ? ', incomplete period' : ''}`} onClick={() => setQuarter(item.start)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setQuarter(item.start); } }} className="cursor-pointer">
                  <rect x={x(index) - 10} y="25" width="20" height="280" fill="transparent" />
                  {item.median !== null && <circle cx={x(index)} cy={y(item.median)} r={quarter === item.start ? 6 : 4} stroke="#0f766e" strokeWidth="2" fill={item.count < 5 || item.incomplete || data.truncated ? 'white' : '#0f766e'} />}
                  <rect x={x(index) - 7} y={295 - item.count / maxCount * 50} width="14" height={item.count / maxCount * 50} fill="#64748b" opacity={item.incomplete || data.truncated ? 0.4 : 0.85} />
                  <title>{item.label}: {item.count} sales; median {item.median === null ? '—' : formatCurrency(item.median)}</title>
                </g>
                {(index % Math.ceil(quarters.length / 7) === 0 || index === quarters.length - 1) && <text x={x(index)} y="322" fontSize="10" textAnchor="middle" fill="currentColor">{item.label}</text>}
              </g>;
            })}
            <text x="6" y="268" fontSize="11" fill="currentColor">Sales</text><text x="57" y="286" fontSize="11" textAnchor="end" fill="currentColor">0–{maxCount}</text>
          </svg>
        </div>
        <details><summary className="cursor-pointer text-sm font-semibold text-brand-700 dark:text-brand-300">Quarterly figures and filters</summary><div className="mt-2 max-h-64 overflow-auto"><table className="w-full text-left text-xs"><caption className="sr-only">Quarterly completed-sale medians and counts</caption><thead><tr><th className="p-2">Quarter</th><th className="p-2">Sales</th><th className="p-2">Median</th><th className="p-2">Coverage</th></tr></thead><tbody>{quarters.map((item) => <tr key={item.start} className="border-t border-stone-200 dark:border-slate-700"><td className="p-2"><button className="underline" onClick={() => setQuarter(item.start)}>{item.label}</button></td><td className="p-2">{item.count}</td><td className="p-2">{item.median === null ? '—' : formatCurrency(item.median)}</td><td className="p-2">{item.incomplete || data.truncated ? 'Incomplete period' : item.count < 5 ? 'Small sample' : '5+ sales'}</td></tr>)}</tbody></table></div></details>
      </> : <p className="rounded-lg bg-stone-50 p-4 text-sm dark:bg-slate-800">No sales match this area, period and property filter. Try a wider radius, a longer period, or all property types.</p>}
      <div className="max-h-80 overflow-auto rounded-lg border border-stone-200 dark:border-slate-700"><table className="w-full min-w-[520px] text-left text-sm"><caption className="p-3 text-left font-semibold">Completed sales{selectedQuarter ? ` · ${selectedQuarter.label}` : ''} · newest first</caption><thead className="bg-stone-50 dark:bg-slate-800"><tr><th className="p-3">Address</th><th className="p-3">Sold</th><th className="p-3">Price</th><th className="p-3">Type</th></tr></thead><tbody>{visible.map((sale) => <tr key={sale.id} className="border-t border-stone-200 dark:border-slate-700"><td className="p-3"><a href={sale.id.replace('http:', 'https:')} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline dark:text-brand-300">{sale.address}</a><p className="text-xs text-slate-500">{Math.round(sale.distance)}m · postcode centre</p></td><td className="whitespace-nowrap p-3">{sale.date}</td><td className="whitespace-nowrap p-3 font-semibold">{formatCurrency(sale.price)}</td><td className="p-3 capitalize">{typeName(sale.propertyType)}{sale.newBuild ? ' · new build' : ''}</td></tr>)}</tbody></table></div>
    </>}
    <p className="text-xs text-slate-500 dark:text-slate-400"><a className="underline" href="https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads" target="_blank" rel="noopener noreferrer">Contains HM Land Registry data © Crown copyright and database right 2021.</a> Licensed under the <a className="underline" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener noreferrer">Open Government Licence v3.0</a>.</p>
  </section>;
};
