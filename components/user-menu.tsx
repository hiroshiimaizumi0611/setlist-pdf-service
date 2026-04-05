"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { AppPlan } from "@/lib/stripe/plans";
import { LogoutButton } from "./logout-button";

type UserMenuProps = {
  displayName?: string | null;
  email: string;
  currentPlan: AppPlan;
};

function getInitial(displayName: string | null | undefined, email: string) {
  const source = displayName?.trim() || email.trim();
  return source.charAt(0).toUpperCase();
}

export function UserMenu({ displayName, email, currentPlan }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="ユーザーメニューを開く"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#4a3f32] bg-[#201a14] text-[13px] font-black text-[#f6c453] transition hover:border-[#f6c453] hover:text-[#ffe08a] focus:outline-none focus:ring-2 focus:ring-[#f6c453] focus:ring-offset-2 focus:ring-offset-[#131313]"
      >
        {getInitial(displayName, email)}
      </button>

      {isOpen ? (
        <div
          id={panelId}
          aria-label="ユーザーメニュー"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 overflow-hidden rounded-3xl border border-[#38332b] bg-[#181818] p-2 text-[#f6f3ee] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        >
          <div className="rounded-2xl border border-[#38332b] bg-[#222222] px-4 py-3">
            <p className="text-sm font-semibold text-[#f6f3ee]">
              {displayName?.trim() || email}
            </p>
            <p className="mt-1 text-sm text-[#bfb7aa]">{email}</p>
            <p className="mt-3 inline-flex rounded-full border border-[#4f452f] bg-[#2a2419] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f6c453]">
              {currentPlan}
            </p>
          </div>

          <div className="mt-2 rounded-2xl border border-[#38332b] bg-[#1b1b1b] p-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center rounded-2xl px-3 py-2.5 text-sm font-medium text-[#f6f3ee] transition hover:bg-[#252525]"
            >
              マイページ
            </Link>
            <Link
              href="/settings/billing"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center rounded-2xl px-3 py-2.5 text-sm font-medium text-[#f6f3ee] transition hover:bg-[#252525]"
            >
              プラン管理
            </Link>
          </div>

          <div className="mt-2 rounded-2xl border border-[#4d2a24] bg-[#271714] p-1">
            <LogoutButton className="w-full justify-start rounded-2xl border-0 px-3 py-2.5 text-left text-sm font-medium text-[#ffcdc7] hover:bg-[#3a1d18] hover:text-[#ffe2dc]" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
