#!/usr/bin/env node
/**
 * cli.ts
 * Command-line interface for world-clock.
 *
 * Usage:
 *   world-clock now <city> [<city2> ...]
 *   world-clock diff <cityA> <cityB>
 *   world-clock meeting <city1> <city2> [<city3> ...]
 *   world-clock list
 */

import { compareCities, getCurrentTime } from "./compare";
import { diff } from "./diff";
import { findMeetingWindow } from "./compare";
import { listCities } from "./cityMap";

function printTable(rows: { city: string; time: string; date: string; weekday: string; utcOffset: string }[]): void {
  const widest = Math.max(...rows.map((r) => r.city.length), 4);
  for (const r of rows) {
    console.log(
      `${r.city.padEnd(widest)}  ${r.time}  ${r.weekday.padEnd(9)} ${r.date}  (UTC${r.utcOffset})`
    );
  }
}

function main(): void {
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case "now": {
        if (args.length === 0) throw new Error("Usage: world-clock now <city> [<city2> ...]");
        const rows = args.length === 1 ? [getCurrentTime(args[0])] : compareCities(args);
        printTable(rows);
        break;
      }

      case "diff": {
        const [cityA, cityB] = args;
        if (!cityA || !cityB) throw new Error("Usage: world-clock diff <cityA> <cityB>");
        console.log(diff(cityA, cityB).description);
        break;
      }

      case "meeting": {
        if (args.length < 2) throw new Error("Usage: world-clock meeting <city1> <city2> [<city3> ...]");
        const result = findMeetingWindow(args);
        if (result.startUTCHour === null) {
          console.log("No overlapping work-hours window found for those cities.");
        } else {
          console.log(`Overlap window: ${result.startUTCHour}:00-${result.endUTCHour}:00 UTC`);
          for (const [city, time] of Object.entries(result.localTimes ?? {})) {
            console.log(`  ${city}: ${time} local`);
          }
        }
        break;
      }

      case "list": {
        console.log(listCities().join("\n"));
        break;
      }

      default: {
        console.log(
          [
            "world-clock — compare time across cities",
            "",
            "Usage:",
            "  world-clock now <city> [<city2> ...]",
            "  world-clock diff <cityA> <cityB>",
            "  world-clock meeting <city1> <city2> [<city3> ...]",
            "  world-clock list",
          ].join("\n")
        );
      }
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exitCode = 1;
  }
}

main();
