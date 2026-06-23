/**
 * index.ts
 * Public entry point for the `world-clock` package.
 */

export {
  CITY_TIMEZONES,
  getTimezone,
  addCity,
  listCities,
  isValidTimezone,
} from "./cityMap";

export { diff, getOffsetMinutes, formatOffset } from "./diff";
export type { TimeDiffResult } from "./diff";

export {
  getCurrentTime,
  compareCities,
  findMeetingWindow,
} from "./compare";
export type { CityTime, CompareOptions, MeetingWindow, MeetingWindowOptions } from "./compare";

import { getTimezone, addCity, listCities } from "./cityMap";
import { diff, type TimeDiffResult } from "./diff";
import {
  getCurrentTime,
  compareCities,
  findMeetingWindow,
  type CityTime,
  type CompareOptions,
  type MeetingWindow,
  type MeetingWindowOptions,
} from "./compare";

/**
 * Convenience wrapper bundling the package's functions as methods,
 * for people who prefer an object-oriented API.
 *
 * @example
 * const clock = new WorldClock();
 * clock.now("Tokyo");
 * clock.compare(["London", "Tokyo", "New York"]);
 * clock.diff("London", "Tokyo");
 */
export class WorldClock {
  /** Get the current (or given) time in a city. */
  now(city: string, options?: CompareOptions): CityTime {
    return getCurrentTime(city, options);
  }

  /** Compare times across multiple cities, sorted west to east. */
  compare(cities: string[], options?: CompareOptions): CityTime[] {
    return compareCities(cities, options);
  }

  /** Get the time difference between two cities. */
  diff(cityA: string, cityB: string, at?: Date): TimeDiffResult {
    return diff(cityA, cityB, at);
  }

  /** Find an overlapping work-hour window (UTC) across cities. */
  findMeetingWindow(cities: string[], options?: MeetingWindowOptions): MeetingWindow {
    return findMeetingWindow(cities, options);
  }

  /** Register a new city/timezone. */
  addCity(city: string, timezone: string): void {
    addCity(city, timezone);
  }

  /** List all known city names. */
  listCities(): string[] {
    return listCities();
  }

  /** Resolve a city to its IANA timezone string. */
  getTimezone(city: string): string {
    return getTimezone(city);
  }
}

export default WorldClock;
