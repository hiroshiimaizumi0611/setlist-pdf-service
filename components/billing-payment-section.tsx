import type { AppPlan } from "@/lib/stripe/plans";
import { getDashboardThemeStyles } from "./dashboard-shell";

type BillingPaymentSectionProps = {
  currentPlan: AppPlan;
  isAuthenticated: boolean;
  isStripeConfigured: boolean;
  openBillingPortalAction: () => Promise<void>;
  subscription: {
    status: string;
    plan?: string;
    billingInterval?: string | null;
    periodEnd?: Date | null;
    seats?: number | null;
  } | null;
};

export function BillingPaymentSection({
  currentPlan,
  isAuthenticated,
  isStripeConfigured,
  openBillingPortalAction,
  subscription,
}: BillingPaymentSectionProps) {
  const theme = getDashboardThemeStyles("dark");
  const isPro = currentPlan === "pro";
  const canOpenPortal = isAuthenticated && isStripeConfigured && isPro;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className={`border-2 ${theme.border} ${theme.panel} p-6 sm:p-8`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
              Payment Method
            </p>
            <h2 className="font-mono text-2xl font-black tracking-[-0.06em] sm:text-3xl">
              お支払い方法
            </h2>
          </div>

          <span className={`${theme.pill} px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]`}>
            {isStripeConfigured ? "Stripe" : "Placeholder"}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <div className={`border-2 ${theme.border} ${theme.panelMuted} px-4 py-4`}>
            <p className={`text-sm font-bold ${theme.text}`}>
              {isAuthenticated
                ? isStripeConfigured
                  ? isPro
                    ? "登録済みの支払い方法は Billing Portal から更新できます。"
                    : "支払い方法はまだ登録されていません。"
                  : "Stripe 未設定のため、お支払い方法は利用できません。"
                : "ログインすると、お支払い方法の確認と更新ができるようになります。"}
            </p>

            <p className={`mt-2 text-sm leading-6 ${theme.mutedText}`}>
              {isAuthenticated
                ? isPro && isStripeConfigured
                  ? "現在の請求情報やカードの更新先は外部の Billing Portal に集約しています。"
                  : "請求の詳細はまだ入っていないため、ここでは安全なプレースホルダーのみ表示しています。"
                : "この画面では読み取り専用の空状態として扱っています。"}
            </p>
          </div>

          {canOpenPortal ? (
            <form action={openBillingPortalAction}>
              <button
                type="submit"
                className={`${theme.buttonSecondary} min-h-11 w-full px-4 py-3 text-sm font-bold`}
              >
                支払い方法を確認
              </button>
            </form>
          ) : (
            <button
              type="button"
              disabled
              className={`${theme.buttonSecondary} min-h-11 w-full px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-70`}
            >
              支払い方法を確認
            </button>
          )}

          {subscription ? (
            <div className={`border ${theme.border} ${theme.panelMuted} px-4 py-4 text-xs uppercase tracking-[0.18em] ${theme.mutedText}`}>
              {subscription.status === "active" ? "Active subscription" : subscription.status}
              {subscription.billingInterval ? ` · ${subscription.billingInterval}` : ""}
            </div>
          ) : (
            <div className={`border ${theme.border} ${theme.panelMuted} px-4 py-4 text-sm leading-6 ${theme.mutedText}`}>
              現在は請求先情報のサンプル表示のみです。実運用の支払い方法は将来の Billing Portal 連携で表示されます。
            </div>
          )}
        </div>
      </article>

      <article className={`border-2 ${theme.border} ${theme.panel} p-6 sm:p-8`}>
        <div className="space-y-2">
          <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
            Billing History
          </p>
          <h2 className="font-mono text-2xl font-black tracking-[-0.06em] sm:text-3xl">
            請求履歴
          </h2>
        </div>

        <div className={`mt-6 border-2 border-dashed ${theme.border} ${theme.panelMuted} px-5 py-8`}>
          <p className={`text-base font-bold ${theme.text}`}>請求履歴はまだありません</p>
          <p className={`mt-2 text-sm leading-6 ${theme.mutedText}`}>
            将来 invoice list が入る前提の器です。今は空状態のまま表示し、履歴データが来たときに差し替えます。
          </p>
        </div>
      </article>
    </section>
  );
}
