export type PdfThemeName = "light" | "dark";

export type PdfThemeTokens = {
  name: PdfThemeName;
  pageBackground: string;
  headerBackground: string;
  primaryText: string;
  secondaryText: string;
  accentText: string;
  border: string;
  rowFill: string;
  emphasisFill: string;
};

const PDF_THEME_TOKENS: Record<PdfThemeName, PdfThemeTokens> = {
  light: {
    name: "light",
    pageBackground: "#fffdf8",
    headerBackground: "#f4efe4",
    primaryText: "#1f1b16",
    secondaryText: "#5f5649",
    accentText: "#7b5d1e",
    border: "#dacfb8",
    rowFill: "#fff7e8",
    emphasisFill: "#efe3c6",
  },
  dark: {
    name: "dark",
    pageBackground: "#111111",
    headerBackground: "#191919",
    primaryText: "#f6f3ee",
    secondaryText: "#bfb7aa",
    accentText: "#f6c453",
    border: "#38332b",
    rowFill: "#171717",
    emphasisFill: "#222222",
  },
};

export function getPdfThemeTokens(theme: PdfThemeName = "light") {
  return PDF_THEME_TOKENS[theme];
}
