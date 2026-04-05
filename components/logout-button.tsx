"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type LogoutButtonProps = {
  className?: string;
  collapsed?: boolean;
  variant?: "default" | "rail";
};

const BASE_BUTTON_CLASSNAME =
  "inline-flex items-center justify-center rounded-xl border border-[#4a3f32] bg-transparent px-4 py-2 text-sm font-medium text-[#f6f3ee] transition hover:border-[#f6c453] hover:text-[#f6c453] disabled:cursor-not-allowed disabled:opacity-70";

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path
        d="M10 6.75v-1A1.75 1.75 0 0 1 11.75 4h5.5A1.75 1.75 0 0 1 19 5.75v12.5A1.75 1.75 0 0 1 17.25 20h-5.5A1.75 1.75 0 0 1 10 18.25v-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.75 12h9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m7.75 9-3 3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoutButton({ className, collapsed = false, variant = "default" }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      aria-label={variant === "rail" && collapsed ? "ログアウト" : undefined}
      title={variant === "rail" && collapsed ? "ログアウト" : undefined}
      className={[BASE_BUTTON_CLASSNAME, className].filter(Boolean).join(" ")}
    >
      {variant === "rail" ? (
        <>
          <LogoutIcon />
          {collapsed ? (
            <span className="sr-only">{isPending ? "ログアウト中..." : "ログアウト"}</span>
          ) : (
            <span className="ml-2">{isPending ? "ログアウト中..." : "ログアウト"}</span>
          )}
        </>
      ) : (
        isPending ? "ログアウト中..." : "ログアウト"
      )}
    </button>
  );
}
