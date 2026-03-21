import { readFile } from "node:fs/promises";
import path from "node:path";

const FONT_PATH = path.join(process.cwd(), "assets", "fonts", "NotoSansJP-Regular.ttf");

let fontBytesPromise: Promise<Uint8Array> | undefined;

export function loadNotoSansJPFont() {
  fontBytesPromise ??= readFile(FONT_PATH).then((buffer) => new Uint8Array(buffer));
  return fontBytesPromise;
}
