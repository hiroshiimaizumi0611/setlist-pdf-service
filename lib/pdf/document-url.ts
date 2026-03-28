import { env } from "../env";
import type { PdfThemeName } from "./theme-tokens";

type BuildPdfDocumentUrlInput = {
  eventId: string;
  theme?: PdfThemeName;
  token?: string;
  baseUrl?: string;
};

export function buildPdfDocumentUrl({
  eventId,
  theme = "light",
  token,
  baseUrl = env.BETTER_AUTH_URL,
}: BuildPdfDocumentUrlInput) {
  const url = new URL(
    `/events/${encodeURIComponent(eventId)}/pdf/document`,
    baseUrl,
  );

  url.searchParams.set("theme", theme);

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
}
