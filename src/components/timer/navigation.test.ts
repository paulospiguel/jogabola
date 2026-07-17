import { describe, expect, it } from "vitest";
import {
  createSetupNavigationState,
  reduceSetupNavigationState,
  shouldOpenSetup,
} from "./navigation";

describe("timer navigation", () => {
  it("starts closed for hydration and opens only after syncing the URL", () => {
    let state = createSetupNavigationState();
    expect(state).toEqual({ isOpen: false, urlRequestActive: false });

    state = reduceSetupNavigationState(state, {
      type: "url_changed",
      requested: true,
    });
    expect(state).toEqual({ isOpen: true, urlRequestActive: true });
  });

  it("opens the setup for the new-match URL contract", () => {
    expect(shouldOpenSetup(new URLSearchParams("novo=1"))).toBe(true);
  });

  it.each([
    "",
    "novo=0",
    "novo=true",
  ])("keeps the setup closed for query %s", query => {
    expect(shouldOpenSetup(new URLSearchParams(query))).toBe(false);
  });

  it("reopens for a later URL transition without reopening while close is replacing the URL", () => {
    let state = createSetupNavigationState();

    state = reduceSetupNavigationState(state, {
      type: "url_changed",
      requested: true,
    });
    expect(state).toEqual({ isOpen: true, urlRequestActive: true });

    state = reduceSetupNavigationState(state, { type: "close" });
    state = reduceSetupNavigationState(state, {
      type: "url_changed",
      requested: true,
    });
    expect(state).toEqual({ isOpen: false, urlRequestActive: true });

    state = reduceSetupNavigationState(state, {
      type: "url_changed",
      requested: false,
    });
    state = reduceSetupNavigationState(state, {
      type: "url_changed",
      requested: true,
    });
    expect(state).toEqual({ isOpen: true, urlRequestActive: true });
  });
});
