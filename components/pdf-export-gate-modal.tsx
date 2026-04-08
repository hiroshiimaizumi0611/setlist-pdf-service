"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PdfExportGateModalProps = {
  isExportGated: boolean;
  downloadHref: string;
};

export function PdfExportGateModal({
  isExportGated,
  downloadHref,
}: PdfExportGateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dialog = dialogRef.current;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (!dialog) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [isOpen]);

  if (!isExportGated) {
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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-export-gate-modal-title"
            tabIndex={-1}
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
              <a
                href={downloadHref}
                className="inline-flex min-h-11 items-center justify-center border border-[#f6c453] bg-[#f6c453] px-4 text-sm font-black text-[#1f1b16] transition hover:bg-[#ffe08a]"
              >
                標準プリセットで出力
              </a>
              <Link
                href="/settings/billing"
                className="inline-flex min-h-11 items-center justify-center border border-[#8a6b42] bg-[#2a1e12] px-4 text-sm font-black text-[#f6c453] transition hover:border-[#f6c453] hover:bg-[#352612]"
              >
                Proにアップグレード
              </Link>
              <button
                type="button"
                ref={closeButtonRef}
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
