import { describe, expect, it } from "vitest";
import { currentFootballSeason } from "@/lib/club-season";

describe("currentFootballSeason", () => {
  it("starts the season in July", () => {
    expect(currentFootballSeason(new Date("2026-07-01T00:30:00Z"))).toEqual({
      name: "2026/27",
      startsOn: "2026-07-01",
      endsOn: "2027-06-30",
    });
  });

  it("keeps the previous season until the end of June", () => {
    expect(currentFootballSeason(new Date("2027-06-15T12:00:00Z")).name).toBe(
      "2026/27",
    );
    expect(currentFootballSeason(new Date("2026-01-10T12:00:00Z")).name).toBe(
      "2025/26",
    );
  });

  it("uses the calendar's local date at the June/July boundary", () => {
    // 23:30 UTC on 30 June is already 1 July in Lisbon (UTC+1 in summer).
    const instant = new Date("2026-06-30T23:30:00Z");
    expect(currentFootballSeason(instant, "Europe/Lisbon").name).toBe(
      "2026/27",
    );
    expect(currentFootballSeason(instant, "America/Sao_Paulo").name).toBe(
      "2025/26",
    );
  });

  it("pads the short end year across centuries", () => {
    expect(currentFootballSeason(new Date("2099-09-01T12:00:00Z")).name).toBe(
      "2099/00",
    );
  });
});
