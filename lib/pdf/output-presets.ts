import { APP_PLAN_NAMES, type AppPlan } from "../stripe/plans";
import type { PdfThemeName } from "./theme-tokens";
import type { SetlistPdfDensityPreset } from "./density-presets";

export type PdfOutputPresetId =
  | "standard-light"
  | "standard-dark"
  | "large-type"
  | "compact"
  | "venue-copy";

export type PdfOutputPresetTuning = {
  densityPreset: SetlistPdfDensityPreset;
  titleScale: number;
  bodyScale: number;
  marginScale: number;
  rowSpacingScale: number;
};

export type PdfOutputPreset = {
  id: PdfOutputPresetId;
  label: string;
  description: string;
  requiredPlan: AppPlan;
  baseTheme: PdfThemeName;
  compatibleThemes: PdfThemeName[];
  tuning: PdfOutputPresetTuning;
};

export const PDF_OUTPUT_PRESETS = [
  {
    id: "standard-light",
    label: "Standard Light",
    description: "標準の読みやすさを保つ light 出力",
    requiredPlan: APP_PLAN_NAMES.free,
    baseTheme: "light",
    compatibleThemes: ["light", "dark"],
    tuning: {
      densityPreset: "standard",
      titleScale: 1,
      bodyScale: 1,
      marginScale: 1,
      rowSpacingScale: 1,
    },
  },
  {
    id: "standard-dark",
    label: "Standard Dark",
    description: "暗背景でも標準の見やすさを保つ出力",
    requiredPlan: APP_PLAN_NAMES.free,
    baseTheme: "dark",
    compatibleThemes: ["dark", "light"],
    tuning: {
      densityPreset: "standard",
      titleScale: 1,
      bodyScale: 1,
      marginScale: 1,
      rowSpacingScale: 1,
    },
  },
  {
    id: "large-type",
    label: "Large Type",
    description: "Large Type で足元でも読みやすく",
    requiredPlan: APP_PLAN_NAMES.pro,
    baseTheme: "light",
    compatibleThemes: ["light", "dark"],
    tuning: {
      densityPreset: "relaxed",
      titleScale: 1.12,
      bodyScale: 1.08,
      marginScale: 1.05,
      rowSpacingScale: 1.08,
    },
  },
  {
    id: "compact",
    label: "Compact",
    description: "Compact で曲数が多い公演にも対応",
    requiredPlan: APP_PLAN_NAMES.pro,
    baseTheme: "light",
    compatibleThemes: ["light", "dark"],
    tuning: {
      densityPreset: "compact",
      titleScale: 0.96,
      bodyScale: 0.94,
      marginScale: 0.92,
      rowSpacingScale: 0.9,
    },
  },
  {
    id: "venue-copy",
    label: "Venue Copy",
    description: "Venue Copy で共有しやすい紙面に",
    requiredPlan: APP_PLAN_NAMES.pro,
    baseTheme: "dark",
    compatibleThemes: ["dark", "light"],
    tuning: {
      densityPreset: "standard",
      titleScale: 1.03,
      bodyScale: 0.98,
      marginScale: 0.96,
      rowSpacingScale: 0.98,
    },
  },
] as const satisfies ReadonlyArray<PdfOutputPreset>;

export const PDF_OUTPUT_PRESET_BY_ID: Record<PdfOutputPresetId, PdfOutputPreset> =
  PDF_OUTPUT_PRESETS.reduce((accumulator, preset) => {
    accumulator[preset.id] = preset;
    return accumulator;
  }, {} as Record<PdfOutputPresetId, PdfOutputPreset>);

export function isPdfOutputPresetId(value: string): value is PdfOutputPresetId {
  return Object.prototype.hasOwnProperty.call(PDF_OUTPUT_PRESET_BY_ID, value);
}

export function getDefaultPdfOutputPresetId(theme: PdfThemeName) {
  return theme === "dark" ? "standard-dark" : "standard-light";
}

export function getRequestedPdfOutputPresetId(
  value: string | string[] | undefined,
  theme: PdfThemeName,
) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate && isPdfOutputPresetId(candidate)) {
    return candidate;
  }

  return getDefaultPdfOutputPresetId(theme);
}

export function resolvePdfOutputPresetSelection({
  requestedPreset,
  theme,
  currentPlan,
}: {
  requestedPreset: string | string[] | undefined;
  theme: PdfThemeName;
  currentPlan: AppPlan;
}) {
  const requestedPresetId = getRequestedPdfOutputPresetId(requestedPreset, theme);
  const requestedPresetRecord = getPdfOutputPreset(requestedPresetId);
  const fallbackPresetId = getDefaultPdfOutputPresetId(theme);

  if (
    requestedPresetRecord.requiredPlan === APP_PLAN_NAMES.pro &&
    currentPlan !== APP_PLAN_NAMES.pro
  ) {
    return {
      requestedPresetId,
      activePresetId: fallbackPresetId,
      blockedPresetId: requestedPresetId,
    } as const;
  }

  return {
    requestedPresetId,
    activePresetId: requestedPresetId,
    blockedPresetId: null,
  } as const;
}

export function getPdfOutputPreset(presetId: PdfOutputPresetId) {
  return PDF_OUTPUT_PRESET_BY_ID[presetId];
}

export function getPdfOutputPresets() {
  return PDF_OUTPUT_PRESETS;
}
