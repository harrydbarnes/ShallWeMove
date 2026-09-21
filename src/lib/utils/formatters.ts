/**
 * British English formatting utilities for currency (£ GBP),
 * dual area units (sq ft / sq m), distances in miles, and dates.
 */

export const SQ_FT_PER_SQ_M = 10.7639104167;

/**
 * Formats a number as GBP currency, e.g. £475,000 or £1,850.
 */
export function formatCurrency(amount: number | undefined | null, includeDecimals = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Not specified';
  }
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Formats currency differences with explicit plus/minus signs.
 */
export function formatCurrencyDelta(amount: number): string {
  if (isNaN(amount) || amount === 0) return '£0';
  const prefix = amount > 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount)}`;
}

/**
 * Formats dual area string: "1,200 sq ft (111 sq m)" or single unit if only one is available.
 */
export function formatDualArea(
  sqFt: number | undefined | null,
  sqM?: number | undefined | null,
  compact = false
): string {
  let computedSqFt = sqFt;
  let computedSqM = sqM;

  if (!computedSqFt && computedSqM) {
    computedSqFt = Math.round(computedSqM * SQ_FT_PER_SQ_M);
  } else if (computedSqFt && !computedSqM) {
    computedSqM = Math.round((computedSqFt / SQ_FT_PER_SQ_M) * 10) / 10;
  }

  if (!computedSqFt) {
    return 'Floor area unconfirmed';
  }

  const formattedSqFt = new Intl.NumberFormat('en-GB').format(Math.round(computedSqFt));
  const formattedSqM = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(
    computedSqM ?? computedSqFt / SQ_FT_PER_SQ_M
  );

  if (compact) {
    return `${formattedSqFt} sq ft`;
  }

  return `${formattedSqFt} sq ft (${formattedSqM} sq m)`;
}

/**
 * Formats distance in miles, e.g. "0.3 miles" or "1.2 miles".
 */
export function formatDistanceMiles(miles: number | undefined | null): string {
  if (miles === undefined || miles === null || isNaN(miles)) {
    return 'Distance unstated';
  }
  const formatted = miles.toFixed(1);
  return `${formatted} ${miles === 1 ? 'mile' : 'miles'}`;
}

/**
 * Converts sq ft to sq m.
 */
export function sqFtToSqM(sqFt: number): number {
  return Math.round((sqFt / SQ_FT_PER_SQ_M) * 10) / 10;
}

/**
 * Converts sq m to sq ft.
 */
export function sqMToSqFt(sqM: number): number {
  return Math.round(sqM * SQ_FT_PER_SQ_M);
}

/**
 * Formats percentage, e.g. "+12.5%" or "-4.0%".
 */
export function formatPercentage(val: number, includeSign = true): string {
  if (isNaN(val)) return '0%';
  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

/**
 * British English date formatter: e.g. "15 Oct 2024".
 */
export function formatBritishDate(dateString: string | undefined | null): string {
  if (!dateString) return 'Date unknown';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}
