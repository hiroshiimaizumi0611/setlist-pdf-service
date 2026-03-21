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
  const alternateLabel = isRegister
    ? "Already have an account?"
    : "Need an account?";
  const alternateAction = isRegister ? "Log in" : "Create one";

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
            callbackURL: "/",
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: "/",
          });

      if (result.error) {
        setError(result.error.message ?? "Authentication failed.");
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-5 rounded-3xl border border-stone-200/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(60,41,9,0.08)] backdrop-blur"
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm leading-6 text-stone-600">
          {isRegister
            ? "Start saving event templates and building print-ready setlists."
            : "Sign in to manage events, templates, and PDF exports."}
        </p>
      </div>

      <div className="space-y-4">
        {isRegister ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Name</span>
            <input
              required
              name="name"
              type="text"
              autoComplete="name"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Password</span>
          <input
            required
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending
          ? isRegister
            ? "Creating account..."
            : "Signing in..."
          : isRegister
            ? "Create account"
            : "Sign in"}
      </button>

      <p className="text-sm text-stone-600">
        {alternateLabel}{" "}
        <Link href={alternateHref} className="font-medium text-stone-950 underline">
          {alternateAction}
        </Link>
      </p>
    </form>
  );
}
