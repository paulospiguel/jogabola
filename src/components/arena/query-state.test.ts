import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { deriveQueryViewState } from "./query-state";

function readArenaSource(fileName: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), "src/components/arena", fileName),
    "utf8",
  );
}

function readComponentsSource(fileName: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), "src/components", fileName),
    "utf8",
  );
}

describe("deriveQueryViewState", () => {
  it("shows loading during the initial fetch, before any data exists", () => {
    expect(
      deriveQueryViewState({
        hasData: false,
        isInitialLoading: true,
        isFetching: true,
        error: null,
      }),
    ).toEqual({ status: "loading" });
  });

  it("lets an error take precedence over empty when there is no data yet", () => {
    expect(
      deriveQueryViewState({
        hasData: false,
        isInitialLoading: false,
        isFetching: false,
        error: new Error("network down"),
      }),
    ).toEqual({ status: "error" });
  });

  it("only shows empty after a successful fetch that returned no data", () => {
    expect(
      deriveQueryViewState({
        hasData: false,
        isInitialLoading: false,
        isFetching: false,
        error: null,
      }),
    ).toEqual({ status: "empty" });
  });

  it("shows success once data exists and no refetch is in flight", () => {
    expect(
      deriveQueryViewState({
        hasData: true,
        isInitialLoading: false,
        isFetching: false,
        error: null,
      }),
    ).toEqual({
      status: "success",
      isRefreshing: false,
      hasBackgroundError: false,
    });
  });

  it("preserves success and marks isRefreshing during a background refetch with data", () => {
    expect(
      deriveQueryViewState({
        hasData: true,
        isInitialLoading: false,
        isFetching: true,
        error: null,
      }),
    ).toEqual({
      status: "success",
      isRefreshing: true,
      hasBackgroundError: false,
    });
  });

  it("flags hasBackgroundError when a background refetch settles with an error but stale data remains", () => {
    expect(
      deriveQueryViewState({
        hasData: true,
        isInitialLoading: false,
        isFetching: false,
        error: new Error("background refetch failed"),
      }),
    ).toEqual({
      status: "success",
      isRefreshing: false,
      hasBackgroundError: true,
    });
  });
});

describe("arena query feedback contract", () => {
  it("gives ArenaQueryError an alert region that reports busy state during retry", () => {
    const source = readArenaSource("query-state.tsx");

    expect(source).toContain('role="alert"');
    expect(source).toContain("aria-busy");
  });

  it("keeps ArenaEmptyStateProps a discriminated union of icon-only or image-only branches", () => {
    const source = readArenaSource("empty-state.tsx");

    expect(source).toContain("icon?: never");
    expect(source).toContain("image?: never");
  });

  it("keeps Loading's GIF decorative with a sizes hint when rendered with fill", () => {
    const source = readComponentsSource("loading.tsx");

    expect(source).toContain('alt=""');
    expect(source).toContain("sizes");
    expect(source).toContain("fill");
  });
});
