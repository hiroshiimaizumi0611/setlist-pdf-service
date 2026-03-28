export type SetlistPdfDensityPreset = "relaxed" | "standard" | "compact";

export type SetlistPdfRowType = "song" | "mc" | "transition" | "heading";

export const DENSITY_ROW_WEIGHTS: Record<SetlistPdfRowType, number> = {
  song: 1,
  mc: 1.25,
  transition: 1.25,
  heading: 1.5,
};

export const DENSITY_PRESETS: Record<
  SetlistPdfDensityPreset,
  {
    rowGap: number;
    rowHeights: Record<SetlistPdfRowType, number>;
  }
> = {
  relaxed: {
    rowGap: 8,
    rowHeights: {
      song: 36,
      mc: 32,
      transition: 36,
      heading: 46,
    },
  },
  standard: {
    rowGap: 6,
    rowHeights: {
      song: 32,
      mc: 28,
      transition: 32,
      heading: 42,
    },
  },
  compact: {
    rowGap: 4,
    rowHeights: {
      song: 28,
      mc: 24,
      transition: 28,
      heading: 36,
    },
  },
};

const SINGLE_PAGE_EXPANSION_CONFIG: Record<
  SetlistPdfDensityPreset,
  {
    targetFillRatio: number;
    maxExpansion: number;
    topOffsetRatio: number;
  }
> = {
  relaxed: {
    targetFillRatio: 0.76,
    maxExpansion: 2.8,
    topOffsetRatio: 0.34,
  },
  standard: {
    targetFillRatio: 0.72,
    maxExpansion: 1.6,
    topOffsetRatio: 0.3,
  },
  compact: {
    targetFillRatio: 0.86,
    maxExpansion: 1.08,
    topOffsetRatio: 0.18,
  },
};

const RELAXED_MAX_EFFECTIVE_ROWS = 6;
const STANDARD_MAX_EFFECTIVE_ROWS = 16;

export function getRowDensityWeight(rowType: SetlistPdfRowType) {
  return DENSITY_ROW_WEIGHTS[rowType];
}

export function getDensityPreset(effectiveRowDensity: number): SetlistPdfDensityPreset {
  if (effectiveRowDensity <= RELAXED_MAX_EFFECTIVE_ROWS) {
    return "relaxed";
  }

  if (effectiveRowDensity <= STANDARD_MAX_EFFECTIVE_ROWS) {
    return "standard";
  }

  return "compact";
}

export function getSinglePageExpansionConfig(preset: SetlistPdfDensityPreset) {
  return SINGLE_PAGE_EXPANSION_CONFIG[preset];
}
