"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import type { AppPlan } from "@/lib/stripe/plans";
import { authClient } from "@/lib/auth-client";
import { AnimatedLoadingText } from "./animated-loading-text";
import { getDashboardThemeStyles } from "./dashboard-shell";

type UpgradeCardProps = {
  plan: AppPlan;
  billingConfigured: boolean;
  isAuthenticated?: boolean;
  currentTheme?: PdfThemeName;
  openBillingPortalAction: () => Promise<void>;
  upgradeLabel?: string;
  billingPortalLabel?: string;
  loginLabel?: string;
  loginHref?: string;
};

export function UpgradeCard({
  plan,
  billingConfigured,
  isAuthenticated = true,
  currentTheme = "dark",
  openBillingPortalAction,
  upgradeLabel = "Upgrade to Pro",
  billingPortalLabel = "Open billing portal",
  loginLabel = "Log in to upgrade",
  loginHref = "/login",
}: UpgradeCardProps) {
  const theme = getDashboardThemeStyles(currentTheme);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleUpgrade() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await authClient.subscription.upgrade({
          plan: "pro",
          annual: false,
          successUrl: "/settings/billing",
          cancelUrl: "/settings/billing",
          disableRedirect: true,
        });

        if (result.error) {
          setError(result.error.message ?? "チェックアウトの開始に失敗しました。");
          return;
        }

        if (result.data?.url) {
          window.location.assign(result.data.url);
        }
      } catch {
        setError("チェックアウトの開始に失敗しました。");
      }
    });
  }

  const disabledBillingPortal = plan === "pro" && !billingConfigured;

  return (
    <aside className={`border-2 ${theme.border} ${theme.panel} p-6 sm:p-7`}>
      <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.28em] ${theme.mutedText}`}>
        Primary Action
      </p>
      <h2 className="mt-3 font-mono text-2xl font-black tracking-[-0.08em] sm:text-3xl">
        {plan === "pro" ? "お支払い設定" : "テンプレート保存をProで解放"}
      </h2>
      <p className={`mt-3 text-sm leading-7 ${theme.mutedText}`}>
        {plan === "pro"
          ? "支払い方法の更新や請求設定はここから移動できます。"
          : "無料プランのまま公演作成とPDF出力は使えます。繰り返し使う進行表の保存だけをProで追加します。"}
      </p>

      <div className="mt-6">
        {!isAuthenticated ? (
          <Link
            href={loginHref}
            className={`${theme.buttonPrimary} inline-flex min-h-11 w-full items-center justify-center px-4 py-3 text-sm font-bold`}
          >
            {loginLabel}
          </Link>
        ) : disabledBillingPortal ? (
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className={`${theme.buttonSecondary} min-h-11 w-full px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {billingPortalLabel}
            </button>
            <p className={`text-sm leading-6 ${theme.mutedText}`}>
              Stripe未設定のため、お支払い設定はご利用いただけません。
            </p>
          </div>
        ) : plan === "pro" ? (
          <form action={openBillingPortalAction}>
            <button
              type="submit"
              className={`${theme.buttonSecondary} min-h-11 w-full px-4 py-3 text-sm font-bold`}
            >
              {billingPortalLabel}
            </button>
          </form>
        ) : (
          <button
            type="button"
            disabled={isPending || !billingConfigured}
            onClick={() => {
              void handleUpgrade();
            }}
            className={`${theme.buttonPrimary} min-h-11 w-full px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {isPending ? <AnimatedLoadingText>{"チェックアウトを準備中..."}</AnimatedLoadingText> : upgradeLabel}
          </button>
        )}
      </div>

      <div className={`mt-6 border ${theme.border} ${theme.panelMuted} px-4 py-4 text-sm leading-6 ${theme.mutedText}`}>
        {plan === "pro"
          ? "Stripeの請求ポータルに遷移して支払い方法や請求情報を更新できます。"
          : "公演テンプレートの保存数に制限はありません。ツアー単位で使い回す下書きをまとめて残せます。"}
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
    </aside>
  );
}
