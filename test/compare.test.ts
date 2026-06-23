import { test } from "node:test";
import assert from "node:assert/strict";
import { getCurrentTime, compareCities, findMeetingWindow } from "../src/compare";

const AT = new Date("2026-06-23T12:00:00Z");

test("getCurrentTime returns expected fields", () => {
  const result = getCurrentTime("Tokyo", { at: AT });
  assert.equal(result.city, "Tokyo");
  assert.equal(result.timezone, "Asia/Tokyo");
  assert.equal(result.time, "21:00"); // UTC+9
  assert.equal(result.utcOffset, "+09:00");
});

test("compareCities sorts west to east", () => {
  const results = compareCities(["Tokyo", "London", "New York"], { at: AT });
  assert.deepEqual(
    results.map((r) => r.city),
    ["New York", "London", "Tokyo"]
  );
});

test("findMeetingWindow finds an overlap when one exists", () => {
  const result = findMeetingWindow(["London", "New York"], { at: AT });
  assert.notEqual(result.startUTCHour, null);
  assert.ok(result.localTimes);
  assert.ok(result.localTimes!["London"]);
  assert.ok(result.localTimes!["New York"]);
});

test("findMeetingWindow returns null when no overlap exists", () => {
  const result = findMeetingWindow(["London", "New York", "Mumbai"], { at: AT });
  assert.equal(result.startUTCHour, null);
  assert.equal(result.localTimes, null);
});
