import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("loadNotoSansJPFont", () => {
  it("loads and caches font bytes from a URL source", async () => {
    const fontBytes = new Uint8Array([1, 2, 3, 4]);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => fontBytes.buffer,
    });

    vi.stubGlobal("fetch", fetchMock);

    const { loadNotoSansJPFont } = await import("../../lib/pdf/load-font");

    const first = await loadNotoSansJPFont("https://example.com/fonts/noto.ttf");
    const second = await loadNotoSansJPFont("https://example.com/fonts/noto.ttf");

    expect(first).toEqual(fontBytes);
    expect(second).toEqual(fontBytes);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/fonts/noto.ttf");
  });
});
