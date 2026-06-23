/**
 * compare.ts
 * Builds a sorted snapshot of the current (or a given) time across many
 * cities at once, and helps find overlapping working hours.
 */

import { getTimezone } from "./cityMap";
import { getOffsetMinutes, formatOffset } from "./diff";

export interface CityTime {
  city: string;
  timezone: string;
  /** Localized clock time, e.g. "14:05" */
  time: string;
  /** Localized date, e.g. "Jun 23, 2026" */
  date: string;
  /** Weekday name, e.g. "Tuesday" */
  weekday: string;
  /** UTC offset string, e.g. "+05:30" */
  utcOffset: string;
}

export interface CompareOptions {
  /** Reference instant. Defaults to now. */
  at?: Date;
  /** Locale for formatting. Defaults to "en-US". */
  locale?: string;
  /** Use 24-hour clock. Defaults to true. */
  hour24?: boolean;
}

/**
 * Memoizes a timezone's UTC offset for a given instant, so repeated
 * lookups (e.g. inside a sort comparator) don't rebuild the expensive
 * Intl.DateTimeFormat each time. Keyed by instant + timezone.
 */
function makeOffsetCache(at: Date) {
  const cache = new Map<string, number>();
  return (timezone: string): number => {
    let offset = cache.get(timezone);
    if (offset === undefined) {
      offset = getOffsetMinutes(timezone, at);
      cache.set(timezone, offset);
    }
    return offset;
  };
}

/** Returns formatted time/date info for a single city. */
export function getCurrentTime(city: string, options: CompareOptions = {}): CityTime {
  const { at = new Date(), locale = "en-US", hour24 = true } = options;
  const timezone = getTimezone(city);

  const timeFmt = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: !hour24,
  });
  const dateFmt = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const weekdayFmt = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: "long",
  });

  return {
    city,
    timezone,
    time: timeFmt.format(at),
    date: dateFmt.format(at),
    weekday: weekdayFmt.format(at),
    utcOffset: formatOffset(getOffsetMinutes(timezone, at)),
  };
}

/**
 * Returns each city's current time, sorted from furthest behind UTC
 * to furthest ahead (i.e. west to east).
 */
export function compareCities(cities: string[], options: CompareOptions = {}): CityTime[] {
  const at = options.at ?? new Date();
  const offsetOf = makeOffsetCache(at);
  return cities
    .map((city) => getCurrentTime(city, { ...options, at }))
    .sort((a, b) => offsetOf(a.timezone) - offsetOf(b.timezone));
}

export interface MeetingWindowOptions extends CompareOptions {
  /** Local work-day start hour (0-23). Default 9. */
  workStart?: number;
  /** Local work-day end hour (0-23). Default 18. */
  workEnd?: number;
}

export interface MeetingWindow {
  /** UTC hour the overlap starts (0-23), or null if no overlap exists. */
  startUTCHour: number | null;
  /** UTC hour the overlap ends (0-23), or null if no overlap exists. */
  endUTCHour: number | null;
  /** Local time each city would see at the window start, if one exists. */
  localTimes: Record<string, string> | null;
}

/**
 * Finds an overlapping work-hour window (UTC) across all given cities,
 * for a given reference day. Useful for scheduling cross-timezone meetings.
 * Returns the first hour-aligned overlap found, if any.
 */
export function findMeetingWindow(cities: string[], options: MeetingWindowOptions = {}): MeetingWindow {
  const { at = new Date(), workStart = 9, workEnd = 18 } = options;
  const offsetOf = makeOffsetCache(at);

  // Each city's work day projected onto the absolute UTC hour axis (may be
  // negative or exceed 24; we intersect first, then normalize once).
  const ranges = cities.map((city) => {
    const offset = offsetOf(getTimezone(city)) / 60; // hours, may be fractional
    return { city, startUTC: workStart - offset, endUTC: workEnd - offset };
  });

  // Intersect on the raw (un-wrapped) axis so windows that straddle UTC
  // midnight aren't falsely rejected.
  const start = Math.max(...ranges.map((r) => r.startUTC));
  const end = Math.min(...ranges.map((r) => r.endUTC));

  if (start >= end) {
    return { startUTCHour: null, endUTCHour: null, localTimes: null };
  }

  const startHour = Math.ceil(start);
  const localTimes: Record<string, string> = {};
  for (const city of cities) {
    const offset = offsetOf(getTimezone(city)) / 60;
    const localHour = (((startHour + offset) % 24) + 24) % 24;
    localTimes[city] = `${String(Math.floor(localHour)).padStart(2, "0")}:00`;
  }

  // Normalize the reported UTC hours into 0-23 for display.
  const wrap = (h: number) => ((Math.round(h) % 24) + 24) % 24;
  return { startUTCHour: wrap(startHour), endUTCHour: wrap(Math.floor(end)), localTimes };
}
