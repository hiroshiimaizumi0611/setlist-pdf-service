import { describe, expect, it } from "vitest";

import {
  isPdfOutputPresetId,
  resolvePdfOutputPresetSelection,
} from "../../lib/pdf/output-presets";

describe("isPdfOutputPresetId", () => {
  it("rejects inherited property names like toString", () => {
    expect(isPdfOutputPresetId("toString")).toBe(false);
  });

  it("accepts known preset ids", () => {
    expect(isPdfOutputPresetId("standard-dark")).toBe(true);
  });
});

describe("resolvePdfOutputPresetSelection", () => {
  it("keeps the requested pro preset for preview but gates export for free users", () => {
    expect(
      resolvePdfOutputPresetSelection({
        requestedPreset: "large-type",
        theme: "dark",
        currentPlan: "free",
      }),
    ).toEqual({
      requestedPresetId: "large-type",
      previewPresetId: "large-type",
      downloadPresetId: "standard-dark",
      isExportGated: true,
      blockedPresetId: "large-type",
    });
  });

  it("keeps the same preset for preview and export for pro users", () => {
    expect(
      resolvePdfOutputPresetSelection({
        requestedPreset: "large-type",
        theme: "dark",
        currentPlan: "pro",
      }),
    ).toEqual({
      requestedPresetId: "large-type",
      previewPresetId: "large-type",
      downloadPresetId: "large-type",
      isExportGated: false,
      blockedPresetId: null,
    });
  });
});
