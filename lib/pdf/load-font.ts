const LOCAL_FONT_PATH_SEGMENTS = ["public", "fonts", "NotoSansJP-Regular.ttf"] as const;

const fontBytesCache = new Map<string, Promise<Uint8Array>>();

async function loadFontFromFileSystem() {
  const [{ readFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const fontPath = path.join(process.cwd(), ...LOCAL_FONT_PATH_SEGMENTS);
  const buffer = await readFile(fontPath);

  return new Uint8Array(buffer);
}

async function loadFontFromUrl(sourceUrl: string) {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to load PDF font from ${sourceUrl}.`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export function loadNotoSansJPFont(sourceUrl?: string) {
  const cacheKey = sourceUrl ?? "local-filesystem";

  if (!fontBytesCache.has(cacheKey)) {
    fontBytesCache.set(
      cacheKey,
      sourceUrl ? loadFontFromUrl(sourceUrl) : loadFontFromFileSystem(),
    );
  }

  return fontBytesCache.get(cacheKey)!;
}
