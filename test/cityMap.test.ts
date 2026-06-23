import { test } from "node:test";
import assert from "node:assert/strict";
import { getTimezone, addCity, listCities, isValidTimezone } from "../src/cityMap";

test("getTimezone resolves known cities case-insensitively", () => {
  assert.equal(getTimezone("Tokyo"), "Asia/Tokyo");
  assert.equal(getTimezone("  tOkYo "), "Asia/Tokyo");
});

test("getTimezone accepts a raw IANA timezone", () => {
  assert.equal(getTimezone("Asia/Kolkata"), "Asia/Kolkata");
});

test("getTimezone throws for unknown city", () => {
  assert.throws(() => getTimezone("Nowhereville"), /Unknown city/);
});

test("addCity registers a new city, then getTimezone resolves it", () => {
  addCity("Lima", "America/Lima");
  assert.equal(getTimezone("Lima"), "America/Lima");
  assert.ok(listCities().includes("lima"));
});

test("addCity rejects an invalid timezone", () => {
  assert.throws(() => addCity("Fakeville", "Not/AZone"), /not a valid IANA timezone/);
});

test("isValidTimezone", () => {
  assert.equal(isValidTimezone("Europe/London"), true);
  assert.equal(isValidTimezone("Not/AZone"), false);
});
