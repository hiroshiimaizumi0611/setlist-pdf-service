"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";

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
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-5 rounded-3xl border border-[#353534] bg-[#181818]/96 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur"
    >
      <div className="space-y-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#91897c]">
          Backstage Access
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#f6f3ee]">
          {isRegister ? "アカウントを作成" : "ログイン"}
        </h1>
        <p className="text-sm leading-6 text-[#bfb7aa]">
          {isRegister
            ? "無料プランで公演作成とPDF出力を始めて、必要になったらProでテンプレート保存を追加できます。"
            : "公演の作成、複製、PDF出力、テンプレート保存を続けましょう。"}
        </p>
      </div>

      <div className="space-y-4">
        {isRegister ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#d8d1c4]">名前</span>
            <input
              required
              name="name"
              type="text"
              autoComplete="name"
              className="w-full rounded-2xl border border-[#38332b] bg-[#111111] px-4 py-3 text-sm text-[#f6f3ee] outline-none transition focus:border-[#f6c453] focus:bg-[#171717]"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#d8d1c4]">メールアドレス</span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-[#38332b] bg-[#111111] px-4 py-3 text-sm text-[#f6f3ee] outline-none transition focus:border-[#f6c453] focus:bg-[#171717]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#d8d1c4]">パスワード</span>
          <input
            required
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="w-full rounded-2xl border border-[#38332b] bg-[#111111] px-4 py-3 text-sm text-[#f6f3ee] outline-none transition focus:border-[#f6c453] focus:bg-[#171717]"
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-2xl border border-[#9f3a31] bg-[#3a1612] px-4 py-3 text-sm text-[#ffcdc7]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl border border-[#f6c453] bg-[#f6c453] px-4 py-3 text-sm font-medium text-[#1f1b16] transition hover:bg-[#ffe08a] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending
          ? isRegister
            ? "アカウントを作成中..."
            : "ログイン中..."
          : isRegister
            ? "アカウントを作成"
            : "ログイン"}
      </button>

      <p className="text-sm text-[#bfb7aa]">
        {alternateLabel}{" "}
        <Link href={alternateHref} className="font-medium text-[#f6c453] underline">
          {alternateAction}
        </Link>
      </p>
    </form>
  );
}
