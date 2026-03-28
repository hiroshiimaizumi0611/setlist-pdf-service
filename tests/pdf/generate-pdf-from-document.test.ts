import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const env = {
    useCloudflareBrowserRendering: false,
  };

  const cloudflareBrowser = {
    newPage: vi.fn(),
    close: vi.fn(),
  };
  const cloudflarePage = {
    goto: vi.fn(),
    pdf: vi.fn(),
  };
  const localBrowser = {
    newPage: vi.fn(),
    close: vi.fn(),
  };
  const localPage = {
    goto: vi.fn(),
    pdf: vi.fn(),
  };

  return {
    env,
    cloudflareLaunch: vi.fn(),
    getCloudflareContext: vi.fn(),
    cloudflareBrowser,
    cloudflarePage,
    localBrowser,
    localLaunch: vi.fn(),
    localPage,
  };
});

vi.mock("../../lib/env", () => ({
  env: mocks.env,
}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: mocks.getCloudflareContext,
}));

vi.mock("@cloudflare/playwright", () => ({
  launch: mocks.cloudflareLaunch,
}));

vi.mock("playwright", () => ({
  chromium: {
    launch: mocks.localLaunch,
  },
}));

import { generatePdfFromDocument } from "../../lib/pdf/generate-pdf-from-document";

describe("generatePdfFromDocument", () => {
  beforeEach(() => {
    mocks.env.useCloudflareBrowserRendering = false;

    mocks.cloudflareLaunch.mockReset();
    mocks.getCloudflareContext.mockReset();
    mocks.cloudflareBrowser.newPage.mockReset();
    mocks.cloudflareBrowser.close.mockReset();
    mocks.cloudflarePage.goto.mockReset();
    mocks.cloudflarePage.pdf.mockReset();
    mocks.localBrowser.newPage.mockReset();
    mocks.localBrowser.close.mockReset();
    mocks.localLaunch.mockReset();
    mocks.localPage.goto.mockReset();
    mocks.localPage.pdf.mockReset();

    mocks.cloudflareBrowser.newPage.mockResolvedValue(mocks.cloudflarePage);
    mocks.localBrowser.newPage.mockResolvedValue(mocks.localPage);
  });

  it("uses Cloudflare Browser Rendering when the browser binding is available", async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const browserBinding = { name: "browser-binding" };

    mocks.env.useCloudflareBrowserRendering = true;
    mocks.getCloudflareContext.mockResolvedValue({
      env: {
        BROWSER: browserBinding,
      },
    });
    mocks.cloudflareLaunch.mockResolvedValue(mocks.cloudflareBrowser);
    mocks.cloudflarePage.pdf.mockResolvedValue(pdfBytes);

    const result = await generatePdfFromDocument({
      documentUrl: "https://app.example.com/events/event-123/pdf/document?theme=dark&token=signed",
    });

    expect(mocks.getCloudflareContext).toHaveBeenCalledWith({ async: true });
    expect(mocks.cloudflareLaunch).toHaveBeenCalledWith(browserBinding);
    expect(mocks.cloudflarePage.goto).toHaveBeenCalledWith(
      "https://app.example.com/events/event-123/pdf/document?theme=dark&token=signed",
      { waitUntil: "networkidle" },
    );
    expect(mocks.cloudflarePage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        printBackground: true,
      }),
    );
    expect(mocks.cloudflareBrowser.close).toHaveBeenCalledOnce();
    expect(mocks.localLaunch).not.toHaveBeenCalled();
    expect(result).toEqual(pdfBytes);
  });

  it("falls back to local Playwright when the browser binding is unavailable", async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    mocks.env.useCloudflareBrowserRendering = true;
    mocks.getCloudflareContext.mockResolvedValue({
      env: {},
    });
    mocks.localLaunch.mockResolvedValue(mocks.localBrowser);
    mocks.localPage.pdf.mockResolvedValue(pdfBytes);

    const result = await generatePdfFromDocument({
      documentUrl: "https://app.example.com/events/event-123/pdf/document?theme=dark&token=signed",
    });

    expect(mocks.getCloudflareContext).toHaveBeenCalledWith({ async: true });
    expect(mocks.cloudflareLaunch).not.toHaveBeenCalled();
    expect(mocks.localLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: true,
      }),
    );
    expect(mocks.localPage.goto).toHaveBeenCalledWith(
      "https://app.example.com/events/event-123/pdf/document?theme=dark&token=signed",
      { waitUntil: "networkidle" },
    );
    expect(mocks.localBrowser.close).toHaveBeenCalledOnce();
    expect(result).toEqual(pdfBytes);
  });

  it("falls back to Playwright locally", async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    mocks.localLaunch.mockResolvedValue(mocks.localBrowser);
    mocks.localPage.pdf.mockResolvedValue(pdfBytes);

    const result = await generatePdfFromDocument({
      documentUrl: "http://localhost:3000/events/event-123/pdf/document?theme=light&token=signed",
    });

    expect(mocks.getCloudflareContext).not.toHaveBeenCalled();
    expect(mocks.localLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: true,
      }),
    );
    expect(mocks.localPage.goto).toHaveBeenCalledWith(
      "http://localhost:3000/events/event-123/pdf/document?theme=light&token=signed",
      { waitUntil: "networkidle" },
    );
    expect(mocks.localPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        printBackground: true,
      }),
    );
    expect(mocks.localBrowser.close).toHaveBeenCalledOnce();
    expect(result).toEqual(pdfBytes);
  });
});
