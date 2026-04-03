"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
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
  const router = useRouter();
  const theme = getDashboardThemeStyles(currentTheme);
  const previewHref = href.replace(/^\/api\/events\//, "/events/");
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsNavigating(true);
          router.push(previewHref);
        }}
        className={`${theme.buttonPrimary} inline-flex min-h-11 items-center justify-center px-5 text-sm font-black tracking-[0.16em] uppercase`}
      >
        PDF出力
      </button>

      {isNavigating && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#050505]/78 px-6 backdrop-blur-sm">
              <div
                role="status"
                aria-label="PDFプレビューの読み込み状況"
                className="flex w-full max-w-md flex-col items-center gap-4 border border-[#2f2a24] bg-[#111111] px-8 py-8 text-center text-[#f6f3ee] shadow-[0_32px_90px_rgba(0,0,0,0.45)]"
              >
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2f2a24] border-t-[#f6c453]" />
                <div className="space-y-2">
                  <p className="font-mono text-lg font-black tracking-[-0.04em]">
                    PDFプレビューを準備中...
                  </p>
                  <p className="text-sm leading-6 text-[#bfb7aa]">
                    用紙レイアウトと埋め込みプレビューを読み込んでいます。
                  </p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
