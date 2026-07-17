import { describe, expect, it } from "vitest";
import { getWrappedFocusTarget } from "./focus-trap";

describe("getWrappedFocusTarget", () => {
  const elements = ["first", "middle", "last"];

  it("wraps Tab from the last element to the first", () => {
    expect(getWrappedFocusTarget(elements, "last", false)).toBe("first");
  });

  it("wraps Shift+Tab from the first element to the last", () => {
    expect(getWrappedFocusTarget(elements, "first", true)).toBe("last");
  });

  it("starts at the appropriate edge when focus is outside the dialog", () => {
    expect(getWrappedFocusTarget(elements, null, false)).toBe("first");
    expect(getWrappedFocusTarget(elements, null, true)).toBe("last");
  });

  it("leaves native focus movement alone between internal elements", () => {
    expect(getWrappedFocusTarget(elements, "middle", false)).toBeNull();
    expect(getWrappedFocusTarget(elements, "middle", true)).toBeNull();
  });
});
