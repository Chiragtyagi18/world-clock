/**
 * cityMap.ts
 * Maps human-friendly city names to IANA timezone identifiers.
 * IANA zones (not raw UTC offsets) are used so DST is handled automatically
 * by the JS runtime's Intl engine.
 */

export const CITY_TIMEZONES: Record<string, string> = {
  "new york": "America/New_York",
  "los angeles": "America/Los_Angeles",
  "chicago": "America/Chicago",
  "toronto": "America/Toronto",
  "mexico city": "America/Mexico_City",
  "sao paulo": "America/Sao_Paulo",
  "buenos aires": "America/Argentina/Buenos_Aires",
  "london": "Europe/London",
  "paris": "Europe/Paris",
  "berlin": "Europe/Berlin",
  "madrid": "Europe/Madrid",
  "rome": "Europe/Rome",
  "moscow": "Europe/Moscow",
  "istanbul": "Europe/Istanbul",
  "cairo": "Africa/Cairo",
  "johannesburg": "Africa/Johannesburg",
  "lagos": "Africa/Lagos",
  "dubai": "Asia/Dubai",
  "delhi": "Asia/Kolkata",
  "mumbai": "Asia/Kolkata",
  "dehradun": "Asia/Kolkata",
  "karachi": "Asia/Karachi",
  "dhaka": "Asia/Dhaka",
  "bangkok": "Asia/Bangkok",
  "singapore": "Asia/Singapore",
  "hong kong": "Asia/Hong_Kong",
  "beijing": "Asia/Shanghai",
  "shanghai": "Asia/Shanghai",
  "tokyo": "Asia/Tokyo",
  "seoul": "Asia/Seoul",
  "sydney": "Australia/Sydney",
  "melbourne": "Australia/Melbourne",
  "auckland": "Pacific/Auckland",
};

/** Normalizes a city name for lookup (case/whitespace insensitive). */
function normalize(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Checks whether a string is a valid IANA timezone identifier. */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves a city name (or a raw IANA timezone, e.g. "Asia/Kolkata")
 * to its IANA timezone string.
 */
export function getTimezone(city: string): string {
  const key = normalize(city);
  const mapped = CITY_TIMEZONES[key];
  if (mapped) return mapped;

  // Allow passing a raw IANA zone directly, e.g. getTimezone("Asia/Tokyo")
  if (isValidTimezone(city)) return city;

  throw new Error(
    `Unknown city "${city}". Register it with addCity(name, timezone) or pass a valid IANA timezone string.`
  );
}

/** Registers a new city/timezone pair at runtime. Throws on invalid timezone. */
export function addCity(city: string, timezone: string): void {
  if (!isValidTimezone(timezone)) {
    throw new Error(`"${timezone}" is not a valid IANA timezone identifier.`);
  }
  CITY_TIMEZONES[normalize(city)] = timezone;
}

/** Returns all registered city names. */
export function listCities(): string[] {
  return Object.keys(CITY_TIMEZONES).sort();
}
