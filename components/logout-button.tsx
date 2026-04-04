"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
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
      className={
        className ??
        "inline-flex items-center rounded-xl border border-[#4a3f32] bg-transparent px-4 py-2 text-sm font-medium text-[#f6f3ee] transition hover:border-[#f6c453] hover:text-[#f6c453] disabled:cursor-not-allowed disabled:opacity-70"
      }
    >
      {isPending ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
