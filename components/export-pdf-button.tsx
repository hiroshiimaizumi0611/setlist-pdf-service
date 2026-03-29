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
  const previewHref = href.replace(/^\/api\/events\//, "/events/");

  return (
    <Link
      href={previewHref}
      className={`${theme.buttonPrimary} inline-flex min-h-11 items-center justify-center px-5 text-sm font-black tracking-[0.16em] uppercase`}
    >
      PDF出力
    </Link>
  );
}
