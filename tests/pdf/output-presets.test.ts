import { describe, expect, it } from "vitest";

import { isPdfOutputPresetId } from "../../lib/pdf/output-presets";

describe("isPdfOutputPresetId", () => {
  it("rejects inherited property names like toString", () => {
    expect(isPdfOutputPresetId("toString")).toBe(false);
  });

  it("accepts known preset ids", () => {
    expect(isPdfOutputPresetId("standard-dark")).toBe(true);
  });
});
