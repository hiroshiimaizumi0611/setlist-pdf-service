"use client";

import Link from "next/link";
import {
  getPdfOutputPresets,
  type PdfOutputPreset,
  type PdfOutputPresetId,
} from "@/lib/pdf/output-presets";
import { APP_PLAN_NAMES, type AppPlan } from "@/lib/stripe/plans";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";

type PdfPresetSelectorProps = {
  previewBaseHref: string;
  currentTheme: PdfThemeName;
  currentPlan: AppPlan;
  requestedPresetId: PdfOutputPresetId;
  activePresetId: PdfOutputPresetId;
  blockedPresetId?: PdfOutputPresetId | null;
};

function buildPresetHref({
  previewBaseHref,
  currentTheme,
  presetId,
}: {
  previewBaseHref: string;
  currentTheme: PdfThemeName;
  presetId: PdfOutputPresetId;
}) {
  const searchParams = new URLSearchParams({
    theme: currentTheme,
    preset: presetId,
  });

  return `${previewBaseHref}?${searchParams.toString()}`;
}

function getPresetCardClassName({
  isRequested,
  isActive,
  isLocked,
}: {
  isRequested: boolean;
  isActive: boolean;
  isLocked: boolean;
}) {
  if (isActive) {
    return "border-[#f6c453] bg-[#241d11] text-[#f6f3ee] shadow-[0_18px_42px_rgba(0,0,0,0.28)]";
  }

  if (isLocked) {
    return "border-[#4b3a2a] bg-[#191411] text-[#d1bfa4] hover:border-[#8a6b42] hover:text-[#f6f3ee]";
  }

  return "border-[#38332b] bg-[#161616] text-[#d7d0c4] hover:border-[#6c5d45] hover:bg-[#1e1e1e] hover:text-[#f6f3ee]";
}

function PresetPlanBadge({
  preset,
  isLocked,
}: {
  preset: PdfOutputPreset;
  isLocked: boolean;
}) {
  const label = preset.requiredPlan === APP_PLAN_NAMES.pro ? "Pro" : "Free";
  const className = isLocked
    ? "border-[#8a6b42] bg-[#2a1e12] text-[#f6c453]"
    : preset.requiredPlan === APP_PLAN_NAMES.pro
      ? "border-[#5a4a2f] bg-[#20170f] text-[#f6c453]"
      : "border-[#3d4336] bg-[#171d16] text-[#9fd39b]";

  return (
    <span
      className={`inline-flex items-center border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.22em] ${className}`}
    >
      {label}
    </span>
  );
}

export function PdfPresetSelector({
  previewBaseHref,
  currentTheme,
  currentPlan,
  requestedPresetId,
  activePresetId,
  blockedPresetId,
}: PdfPresetSelectorProps) {
  void blockedPresetId;
  return (
    <section className="rounded-[24px] border border-[#2f2a24] bg-[#111111]/92 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur">
      <div className="flex flex-col gap-2 border-b border-[#2b2721] pb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#bfb7aa]">
            PDF出力プリセット
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8d8578]">
            preview + export sync
          </span>
        </div>
        <p className="text-xs leading-5 text-[#9f9688]">
          プレビューURLとPDF出力を同じ preset に揃えます。
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {getPdfOutputPresets().map((preset) => {
          const isRequested = preset.id === requestedPresetId;
          const isActive = preset.id === activePresetId;
          const isLocked =
            preset.requiredPlan === APP_PLAN_NAMES.pro &&
            currentPlan !== APP_PLAN_NAMES.pro;
          const cardClassName = getPresetCardClassName({
            isRequested,
            isActive,
            isLocked,
          });

          return (
            <Link
              key={preset.id}
              href={buildPresetHref({
                previewBaseHref,
                currentTheme,
                presetId: preset.id,
              })}
              aria-label={preset.label}
              aria-current={isRequested ? "page" : undefined}
              className={`flex min-h-[132px] flex-col justify-between rounded-[20px] border px-4 py-4 transition ${cardClassName}`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.08em] text-inherit">
                      {preset.label}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-inherit/80">
                      {preset.description}
                    </p>
                  </div>
                  <PresetPlanBadge preset={preset} isLocked={isLocked} />
                </div>
              </div>
              <p
                className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
                  isActive || isRequested || isLocked ? "text-[#f6c453]" : "text-[#8d8578]"
                }`}
              >
                {isLocked ? "preview available / export requires Pro" : isRequested ? "active route state" : "switch preview"}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
