import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env";
import type { PdfThemeName } from "./theme-tokens";

type PdfDocumentTokenPayload = {
  eventId: string;
  theme: PdfThemeName;
  exp: number;
};

type SignPdfDocumentTokenInput = {
  eventId: string;
  theme: PdfThemeName;
  expiresInSeconds?: number;
};

const TOKEN_SEPARATOR = ".";
const TOKEN_SECRET = env.BETTER_AUTH_SECRET;

function base64UrlEncode(buffer: Buffer | Uint8Array) {
  return Buffer.from(buffer).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url");
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
    typeof payload.exp === "number" &&
    Number.isFinite(payload.exp)
  );
}

export function signPdfDocumentToken({
  eventId,
  theme,
  expiresInSeconds = 60 * 60,
}: SignPdfDocumentTokenInput) {
  const exp = Math.floor(Date.now() / 1000) + Math.floor(expiresInSeconds);
  const payload = { eventId, theme, exp };
  const encodedPayload = base64UrlEncode(
    Buffer.from(JSON.stringify(payload), "utf8"),
  );
  const encodedSignature = base64UrlEncode(signValue(encodedPayload));

  return `${encodedPayload}${TOKEN_SEPARATOR}${encodedSignature}`;
}

export function verifyPdfDocumentToken(token: string) {
  const [encodedPayload, encodedSignature] = token.split(TOKEN_SEPARATOR);

  if (!encodedPayload || !encodedSignature || token.includes(TOKEN_SEPARATOR, token.indexOf(TOKEN_SEPARATOR) + 1)) {
    return null;
  }

  let payloadBuffer: Buffer;
  let signatureBuffer: Buffer;

  try {
    payloadBuffer = base64UrlDecode(encodedPayload);
    signatureBuffer = base64UrlDecode(encodedSignature);
  } catch {
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
