"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { AnimatedLoadingText } from "./animated-loading-text";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isRegister = mode === "register";
  const alternateHref = isRegister ? "/login" : "/register";
  const alternateLabel = isRegister ? "アカウントをお持ちですか？" : "まだアカウントがありませんか？";
  const alternateAction = isRegister ? "ログイン" : "アカウントを作成";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    startTransition(async () => {
      const result = isRegister
        ? await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/events",
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: "/events",
          });

      if (result.error) {
        setError(result.error.message ?? "認証に失敗しました。");
        return;
      }

      router.push("/events");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-3 border-b border-white/10 pb-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-[#f6c453]">
          OPERATOR PANEL
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#f8f5f0]">
            {isRegister ? "アカウントを作成" : "ログイン"}
          </h1>
          <p className="max-w-md text-sm leading-6 text-[#c9c1b5]">
            {isRegister
              ? "無料で始めて、必要になったら公演の保存や運用を広げられます。"
              : "公演の作成、複製、PDF出力、テンプレート保存を続けましょう。"}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.28em] text-[#8f8577]">
          <span>Secure session</span>
          <span>/events handoff</span>
        </div>
      </div>

      <div className="space-y-5">
        {isRegister ? (
          <label className="block border-b border-white/10 pb-4">
            <span className="text-sm font-medium text-[#d8d1c4]">名前</span>
            <input
              required
              name="name"
              type="text"
              autoComplete="name"
              className="mt-3 w-full border-0 border-b border-[#3d382f] bg-transparent px-0 py-3 text-sm text-[#f6f3ee] outline-none transition placeholder:text-[#766e61] focus:border-[#f6c453] focus:ring-0"
            />
          </label>
        ) : null}

        <label className="block border-b border-white/10 pb-4">
          <span className="text-sm font-medium text-[#d8d1c4]">メールアドレス</span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="mt-3 w-full border-0 border-b border-[#3d382f] bg-transparent px-0 py-3 text-sm text-[#f6f3ee] outline-none transition placeholder:text-[#766e61] focus:border-[#f6c453] focus:ring-0"
          />
        </label>

        <label className="block border-b border-white/10 pb-4">
          <span className="text-sm font-medium text-[#d8d1c4]">パスワード</span>
          <input
            required
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="mt-3 w-full border-0 border-b border-[#3d382f] bg-transparent px-0 py-3 text-sm text-[#f6f3ee] outline-none transition placeholder:text-[#766e61] focus:border-[#f6c453] focus:ring-0"
          />
        </label>
      </div>

      {error ? (
        <p className="border-l-2 border-[#f05a4f] bg-[#281411] px-4 py-3 text-sm text-[#ffcdc7]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl border border-[#f6c453] bg-[#f6c453] px-4 py-3.5 text-sm font-semibold text-[#1f1b16] transition hover:bg-[#ffe08a] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <AnimatedLoadingText>
            {isRegister ? "アカウントを作成中..." : "ログイン中..."}
          </AnimatedLoadingText>
        ) : isRegister ? (
          "アカウントを作成"
        ) : (
          "ログイン"
        )}
      </button>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#8f8577]">
          Secondary access
        </p>
        <p className="mt-2 text-sm leading-6 text-[#c9c1b5]">{alternateLabel}</p>
        <Link
          href={alternateHref}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-[#f8f5f0] transition hover:border-[#f6c453] hover:bg-white/[0.04]"
        >
          {alternateAction}
        </Link>
      </div>
    </form>
  );
}
