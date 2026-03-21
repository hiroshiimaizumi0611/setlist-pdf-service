import Link from "next/link";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type ExportPdfButtonProps = {
  href: string;
  currentTheme: PdfThemeName;
};

export function ExportPdfButton({
  href,
  currentTheme,
}: ExportPdfButtonProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${theme.buttonPrimary} inline-flex min-h-11 items-center justify-center px-5 text-sm font-bold tracking-[0.16em] uppercase`}
    >
      PDFを書き出し
    </Link>
  );
}
