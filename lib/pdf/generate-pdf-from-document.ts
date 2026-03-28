import { getCloudflareContext } from "@opennextjs/cloudflare";
import { env } from "../env";

type GeneratePdfFromDocumentInput = {
  documentUrl: string;
};

type PdfOptions = {
  preferCSSPageSize: boolean;
  printBackground: boolean;
};

type PdfPage = {
  goto(
    url: string,
    options: {
      waitUntil: "networkidle";
    },
  ): Promise<PdfResponse | null>;
  pdf(options: PdfOptions): Promise<Uint8Array | ArrayBuffer>;
};

type PdfResponse = {
  ok(): boolean;
  status(): number;
  url(): string;
};

type PdfBrowser = {
  newPage(): Promise<PdfPage>;
  close(): Promise<void>;
};

const PDF_OPTIONS: PdfOptions = {
  preferCSSPageSize: true,
  printBackground: true,
};

function toUint8Array(pdfBytes: Uint8Array | ArrayBuffer) {
  return pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
}

async function renderPdfWithBrowser(browser: PdfBrowser, documentUrl: string) {
  try {
    const page = await browser.newPage();

    const response = await page.goto(documentUrl, {
      waitUntil: "networkidle",
    });

    if (!response?.ok()) {
      const status = response?.status() ?? "NO_RESPONSE";
      const responseUrl = response?.url() ?? documentUrl;
      throw new Error(`Failed to load PDF document: ${status} ${responseUrl}`);
    }

    return toUint8Array(await page.pdf(PDF_OPTIONS));
  } finally {
    await browser.close();
  }
}

async function getCloudflareBrowserBinding() {
  try {
    const cloudflareContext = await getCloudflareContext({ async: true });
    return (cloudflareContext.env as { BROWSER?: unknown }).BROWSER;
  } catch {
    return undefined;
  }
}

async function renderPdfWithCloudflareBrowser(
  documentUrl: string,
  browserBinding: unknown,
) {
  const { launch } = await import("@cloudflare/playwright");
  const browser = await launch(browserBinding as Parameters<typeof launch>[0]);

  return renderPdfWithBrowser(browser, documentUrl);
}

async function renderPdfWithLocalPlaywright(documentUrl: string) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: true,
  });

  return renderPdfWithBrowser(browser, documentUrl);
}

export async function generatePdfFromDocument({
  documentUrl,
}: GeneratePdfFromDocumentInput) {
  if (env.useCloudflareBrowserRendering) {
    const browserBinding = await getCloudflareBrowserBinding();

    if (browserBinding) {
      return renderPdfWithCloudflareBrowser(documentUrl, browserBinding);
    }
  }

  return renderPdfWithLocalPlaywright(documentUrl);
}
