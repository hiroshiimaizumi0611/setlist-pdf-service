import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env";
import type { PdfOutputPresetId } from "./output-presets";
import type { PdfThemeName } from "./theme-tokens";

type PdfDocumentTokenPayload = {
  eventId: string;
  theme: PdfThemeName;
  preset: PdfOutputPresetId;
  exp: number;
};

type SignPdfDocumentTokenInput = {
  eventId: string;
  theme: PdfThemeName;
  preset: PdfOutputPresetId;
  expiresInSeconds?: number;
};

const TOKEN_SEPARATOR = ".";
const TOKEN_SECRET = env.BETTER_AUTH_SECRET;
const BASE64URL_SEGMENT_PATTERN = /^[A-Za-z0-9_-]+$/;

function base64UrlEncode(buffer: Buffer | Uint8Array) {
  return Buffer.from(buffer).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url");
}

function parseCanonicalBase64UrlSegment(value: string) {
  if (!BASE64URL_SEGMENT_PATTERN.test(value)) {
    return null;
  }

  const decoded = base64UrlDecode(value);
  const canonical = base64UrlEncode(decoded);

  if (canonical !== value) {
    return null;
  }

  return decoded;
}

function signValue(value: string) {
  return createHmac("sha256", TOKEN_SECRET).update(value).digest();
}

function isPdfDocumentTokenPayload(
  value: unknown,
): value is PdfDocumentTokenPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.eventId === "string" &&
    (payload.theme === "light" || payload.theme === "dark") &&
    typeof payload.preset === "string" &&
    typeof payload.exp === "number" &&
    Number.isFinite(payload.exp)
  );
}

export function signPdfDocumentToken({
  eventId,
  theme,
  preset,
  expiresInSeconds = 60 * 60,
}: SignPdfDocumentTokenInput) {
  const exp = Math.floor(Date.now() / 1000) + Math.floor(expiresInSeconds);
  const payload = { eventId, theme, preset, exp };
  const encodedPayload = base64UrlEncode(
    Buffer.from(JSON.stringify(payload), "utf8"),
  );
  const encodedSignature = base64UrlEncode(signValue(encodedPayload));

  return `${encodedPayload}${TOKEN_SEPARATOR}${encodedSignature}`;
}

export function verifyPdfDocumentToken(token: string) {
  const [encodedPayload, encodedSignature] = token.split(TOKEN_SEPARATOR);

  if (
    !encodedPayload ||
    !encodedSignature ||
    token.includes(TOKEN_SEPARATOR, token.indexOf(TOKEN_SEPARATOR) + 1)
  ) {
    return null;
  }

  const payloadBuffer = parseCanonicalBase64UrlSegment(encodedPayload);
  const signatureBuffer = parseCanonicalBase64UrlSegment(encodedSignature);

  if (!payloadBuffer || !signatureBuffer) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);

  if (
    signatureBuffer.length !== expectedSignature.length ||
    !timingSafeEqual(signatureBuffer, expectedSignature)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(payloadBuffer.toString("utf8"));

    if (!isPdfDocumentTokenPayload(payload)) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
