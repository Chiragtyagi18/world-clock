import { test } from "node:test";
import assert from "node:assert/strict";
import { diff, getOffsetMinutes, formatOffset } from "../src/diff";

// Fixed instant in northern-hemisphere summer (DST in effect for US/UK)
const SUMMER = new Date("2026-06-23T12:00:00Z");
// Fixed instant in northern-hemisphere winter (no DST for US/UK)
const WINTER = new Date("2026-01-15T12:00:00Z");

test("getOffsetMinutes reflects DST correctly", () => {
  // London: BST (+60) in summer, GMT (0) in winter
  assert.equal(getOffsetMinutes("Europe/London", SUMMER), 60);
  assert.equal(getOffsetMinutes("Europe/London", WINTER), 0);

  // New York: EDT (-240) in summer, EST (-300) in winter
  assert.equal(getOffsetMinutes("America/New_York", SUMMER), -240);
  assert.equal(getOffsetMinutes("America/New_York", WINTER), -300);

  // Kolkata never observes DST: always +330
  assert.equal(getOffsetMinutes("Asia/Kolkata", SUMMER), 330);
  assert.equal(getOffsetMinutes("Asia/Kolkata", WINTER), 330);
});

test("formatOffset formats positive and negative offsets", () => {
  assert.equal(formatOffset(330), "+05:30");
  assert.equal(formatOffset(-240), "-04:00");
  assert.equal(formatOffset(0), "+00:00");
});

test("diff reports correct direction and magnitude", () => {
  const result = diff("London", "Tokyo", SUMMER);
  assert.equal(result.totalMinutes, 480); // Tokyo +9:00 vs London +1:00 in summer
  assert.equal(result.hours, 8);
  assert.match(result.description, /Tokyo is 8h ahead of London/);
});

test("diff handles same timezone", () => {
  const result = diff("Mumbai", "Delhi", SUMMER);
  assert.equal(result.totalMinutes, 0);
  assert.match(result.description, /the same as/);
});

test("diff handles negative direction (behind)", () => {
  const result = diff("Tokyo", "London", SUMMER);
  assert.equal(result.totalMinutes, -480);
  assert.match(result.description, /London is 8h behind Tokyo/);
});
