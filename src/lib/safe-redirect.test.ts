import { describe, expect, it } from "vitest";
import { getSafeRedirectPath, redirectDestination } from "./safe-redirect";

describe("getSafeRedirectPath", () => {
  it("keeps same-origin relative paths", () => {
    expect(getSafeRedirectPath("/transfer/abc_DEF-123")).toBe(
      "/transfer/abc_DEF-123",
    );
    expect(getSafeRedirectPath("/arena?tab=staff#top")).toBe(
      "/arena?tab=staff#top",
    );
    expect(getSafeRedirectPath("/")).toBe("/");
  });

  it("falls back when missing", () => {
    expect(getSafeRedirectPath(null)).toBe("/arena");
    expect(getSafeRedirectPath(undefined)).toBe("/arena");
    expect(getSafeRedirectPath("")).toBe("/arena");
  });

  it("rejects protocol-relative and backslash paths", () => {
    expect(getSafeRedirectPath("//evil.com")).toBe("/arena");
    expect(getSafeRedirectPath("//evil.com/path")).toBe("/arena");
    expect(getSafeRedirectPath("/\\evil.com")).toBe("/arena");
    expect(getSafeRedirectPath("\\\\evil.com")).toBe("/arena");
    expect(getSafeRedirectPath("/foo\\bar")).toBe("/arena");
  });

  it("rejects absolute URLs and schemes", () => {
    expect(getSafeRedirectPath("https://evil.com")).toBe("/arena");
    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/arena");
    expect(getSafeRedirectPath("evil.com")).toBe("/arena");
  });

  it("rejects control characters and whitespace browsers strip", () => {
    expect(getSafeRedirectPath("/\t/evil.com")).toBe("/arena");
    expect(getSafeRedirectPath("/\n/evil.com")).toBe("/arena");
    expect(getSafeRedirectPath("/ /evil.com")).toBe("/arena");
  });

  it("uses the given fallback", () => {
    expect(getSafeRedirectPath("//evil.com", "/")).toBe("/");
  });
});

describe("redirectDestination", () => {
  it("classifies the post-login destination", () => {
    expect(redirectDestination("/arena")).toBe("arena");
    expect(redirectDestination("/transfer/abc")).toBe("transfer");
    expect(redirectDestination("/event/12")).toBe("event");
  });
});
