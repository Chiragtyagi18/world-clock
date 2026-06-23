# world-clock

> Compare time across world cities — with correct DST handling, a friendly programmatic API, and a handy CLI.

`world-clock` lets you get the current time in any city, compute the time
difference between two places, compare many cities at once (sorted west → east),
and even find an overlapping work-hours window for scheduling cross-timezone
meetings. It uses IANA timezones via the built-in `Intl` engine, so daylight
saving time is handled automatically.

## Features

- 🕒 Get the current (or any given) time in a city
- 🔁 Compute the difference between two cities, DST-aware
- 🌍 Compare many cities at once, sorted west → east
- 🤝 Find an overlapping work-hours window across cities (meeting planner)
- 🧩 Register your own cities at runtime
- 💻 Zero-dependency runtime, ships with both a library API and a CLI

## Installation

```bash
npm install world-clock
```

Or install globally to use the CLI anywhere:

```bash
npm install -g world-clock
```

## CLI Usage

```bash
# Current time in one or more cities
world-clock now Tokyo
world-clock now London Tokyo "New York"

# Time difference between two cities
world-clock diff London Tokyo
# -> Tokyo is 8h ahead of London

# Find an overlapping work-hours window (UTC) for a meeting
world-clock meeting London Tokyo "New York"

# List all known cities
world-clock list
```

If you installed locally (not globally), you can run it via the package script:

```bash
npm start -- now Tokyo
# or
npx world-clock now Tokyo
```

### Commands

| Command  | Arguments                              | Description                                            |
| -------- | -------------------------------------- | ------------------------------------------------------ |
| `now`    | `<city> [<city2> ...]`                 | Show current time for one or more cities               |
| `diff`   | `<cityA> <cityB>`                      | Show the time difference between two cities            |
| `meeting`| `<city1> <city2> [<city3> ...]`        | Find an overlapping work-hours window across cities    |
| `list`   | —                                      | List all registered city names                         |

City names are case- and whitespace-insensitive. You may also pass a raw IANA
timezone string directly (e.g. `Asia/Kolkata`).

## Library Usage

The package ships with TypeScript types and works in both ESM/TS and CommonJS
projects.

```ts
import {
  getCurrentTime,
  compareCities,
  diff,
  findMeetingWindow,
  addCity,
  listCities,
} from "world-clock";

// Current time in a single city
getCurrentTime("Tokyo");
// {
//   city: "Tokyo",
//   timezone: "Asia/Tokyo",
//   time: "23:05",
//   date: "Jun 23, 2026",
//   weekday: "Tuesday",
//   utcOffset: "+09:00"
// }

// Compare several cities (returned sorted west → east)
compareCities(["London", "Tokyo", "New York"]);

// Difference between two cities
diff("London", "Tokyo");
// {
//   cityA: "London",
//   cityB: "Tokyo",
//   hours: 8,
//   minutes: 0,
//   totalMinutes: 480,
//   description: "Tokyo is 8h ahead of London"
// }

// Find a meeting window that overlaps everyone's 9–18 work hours
findMeetingWindow(["London", "Tokyo", "New York"]);

// Register a custom city
addCity("Reykjavik", "Atlantic/Reykjavik");

// List every known city
listCities();
```

### Object-oriented API

If you prefer methods, use the default-exported `WorldClock` class:

```ts
import WorldClock from "world-clock";

const clock = new WorldClock();
clock.now("Tokyo");
clock.compare(["London", "Tokyo", "New York"]);
clock.diff("London", "Tokyo");
clock.findMeetingWindow(["London", "Tokyo"]);
clock.addCity("Reykjavik", "Atlantic/Reykjavik");
clock.listCities();
```

## API Reference

### Time & comparison

- `getCurrentTime(city, options?)` → `CityTime` — formatted time/date info for a city.
- `compareCities(cities, options?)` → `CityTime[]` — each city's time, sorted west → east.
- `diff(cityA, cityB, at?)` → `TimeDiffResult` — DST-aware difference between two cities.
- `findMeetingWindow(cities, options?)` → `MeetingWindow` — overlapping work-hours window (UTC).

### Cities

- `getTimezone(city)` → `string` — resolve a city (or raw IANA zone) to its IANA timezone.
- `addCity(city, timezone)` — register a new city/timezone pair (throws on invalid timezone).
- `listCities()` → `string[]` — all registered city names.
- `isValidTimezone(timezone)` → `boolean` — check whether a string is a valid IANA timezone.
- `CITY_TIMEZONES` — the underlying city → timezone map.

### Offsets

- `getOffsetMinutes(timezone, at?)` → `number` — UTC offset in minutes at a given instant.
- `formatOffset(offsetMinutes)` → `string` — format an offset like `"+05:30"`.

### Options

```ts
interface CompareOptions {
  at?: Date;        // reference instant (default: now)
  locale?: string;  // formatting locale (default: "en-US")
  hour24?: boolean; // 24-hour clock (default: true)
}

interface MeetingWindowOptions extends CompareOptions {
  workStart?: number; // local work-day start hour 0–23 (default: 9)
  workEnd?: number;   // local work-day end hour 0–23 (default: 18)
}
```

## Development

```bash
npm install      # install dependencies
npm run build    # bundle with tsup into dist/
npm run dev      # rebuild on change
npm test         # run the test suite
```

## License

ISC
