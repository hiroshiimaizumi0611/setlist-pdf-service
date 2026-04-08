"use client";

import Link from "next/link";
import { useState } from "react";
import type { PdfOutputPresetId } from "@/lib/pdf/output-presets";
import {
  APP_PLAN_NAMES,
  type AppPlan,
} from "@/lib/stripe/plans";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import {
  getDefaultPdfOutputPresetId,
  getPdfOutputPreset,
} from "@/lib/pdf/output-presets";

type PdfExportGateModalProps = {
  currentTheme: PdfThemeName;
  currentPlan: AppPlan;
  activePresetId: PdfOutputPresetId;
  downloadHref: string;
};

function buildFallbackDownloadHref(downloadHref: string, currentTheme: PdfThemeName) {
  const url = new URL(downloadHref, "http://localhost");
  url.searchParams.set("preset", getDefaultPdfOutputPresetId(currentTheme));
  return `${url.pathname}${url.search}`;
}

export function PdfExportGateModal({
  currentTheme,
  currentPlan,
  activePresetId,
  downloadHref,
}: PdfExportGateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activePreset = getPdfOutputPreset(activePresetId);
  const needsGate =
    currentPlan !== APP_PLAN_NAMES.pro &&
    activePreset.requiredPlan === APP_PLAN_NAMES.pro;

  if (!needsGate) {
    return (
      <a
        href={downloadHref}
        className="inline-flex min-h-11 items-center justify-center border border-[#f6c453] bg-[#f6c453] px-5 text-sm font-black uppercase tracking-[0.14em] text-[#1f1b16] transition hover:bg-[#ffe08a]"
      >
        PDF出力
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-11 items-center justify-center border border-[#f6c453] bg-[#f6c453] px-5 text-sm font-black uppercase tracking-[0.14em] text-[#1f1b16] transition hover:bg-[#ffe08a]"
      >
        PDF出力
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#050505]/78 px-4 py-8 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-export-gate-modal-title"
            className="w-full max-w-lg border border-[#5d4320] bg-[#22180d] text-[#f6f3ee] shadow-[0_32px_90px_rgba(0,0,0,0.45)]"
          >
            <div className="border-b border-[#4d3820] px-6 py-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#f6c453]">
                Export Gate
              </p>
              <h2
                id="pdf-export-gate-modal-title"
                className="mt-2 font-mono text-2xl font-black tracking-[-0.05em]"
              >
                PDF出力の制限
              </h2>
            </div>

            <div className="space-y-3 px-6 py-5">
              <p className="text-sm font-semibold leading-7">
                このプリセットで出力するにはProが必要です
              </p>
              <p className="text-xs leading-6 text-[#c6b49c]">
                プレビューでは確認できますが、このプリセットでのPDF出力はPro限定です。
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#4d3820] px-6 py-5 sm:flex-row sm:flex-wrap sm:justify-end">
              <Link
                href={buildFallbackDownloadHref(downloadHref, currentTheme)}
                className="inline-flex min-h-11 items-center justify-center border border-[#f6c453] bg-[#f6c453] px-4 text-sm font-black text-[#1f1b16] transition hover:bg-[#ffe08a]"
              >
                標準プリセットで出力
              </Link>
              <Link
                href="/settings/billing"
                className="inline-flex min-h-11 items-center justify-center border border-[#8a6b42] bg-[#2a1e12] px-4 text-sm font-black text-[#f6c453] transition hover:border-[#f6c453] hover:bg-[#352612]"
              >
                Proにアップグレード
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 items-center justify-center border border-[#4d3820] bg-transparent px-4 text-sm font-black text-[#f6f3ee] transition hover:bg-[#302215]"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
