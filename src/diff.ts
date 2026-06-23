/**
 * diff.ts
 * Computes the UTC offset and relative time difference between any two
 * timezones at a given instant, correctly accounting for DST.
 */

import { getTimezone } from "./cityMap";

export interface TimeDiffResult {
  cityA: string;
  cityB: string;
  /** Whole-hour part of (cityB offset - cityA offset). */
  hours: number;
  /** Remaining minute part (0-59), always non-negative. */
  minutes: number;
  /** Raw signed difference in minutes (positive = cityB is ahead). */
  totalMinutes: number;
  /** Human-readable summary, e.g. "Tokyo is 13h30m ahead of New York". */
  description: string;
}

/**
 * Returns a timezone's UTC offset, in minutes, at the given instant.
 * Positive values are east of UTC (ahead), negative are west (behind).
 */
export function getOffsetMinutes(timezone: string, at: Date = new Date()): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(at);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;

  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );

  return Math.round((asUTC - at.getTime()) / 60000);
}

/** Formats a UTC offset in minutes as "+05:30" / "-04:00". */
export function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}

/**
 * Computes the time difference between two cities (or raw IANA timezones)
 * at a given instant.
 */
export function diff(cityA: string, cityB: string, at: Date = new Date()): TimeDiffResult {
  const tzA = getTimezone(cityA);
  const tzB = getTimezone(cityB);

  const offsetA = getOffsetMinutes(tzA, at);
  const offsetB = getOffsetMinutes(tzB, at);
  const totalMinutes = offsetB - offsetA;

  const hours = Math.trunc(Math.abs(totalMinutes) / 60);
  const minutes = Math.abs(totalMinutes) % 60;
  const direction = totalMinutes === 0 ? "the same as" : totalMinutes > 0 ? "ahead of" : "behind";

  const magnitude = totalMinutes === 0 ? "" : `${hours}h${minutes ? ` ${minutes}m` : ""} `;

  return {
    cityA,
    cityB,
    hours: totalMinutes >= 0 ? hours : -hours,
    minutes,
    totalMinutes,
    description: `${cityB} is ${magnitude}${direction} ${cityA}`,
  };
}
