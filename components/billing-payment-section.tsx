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
  const paymentMethodEmptyState = (
    <>
      <div className={`rounded-3xl border ${theme.border} ${theme.panelMuted} px-5 py-5 sm:px-6 sm:py-6`}>
        <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
          Payment Status
        </p>
        <div className={`mt-3 w-16 border-t border-dashed ${theme.accentBorder}`} />
        <div className="mt-4 space-y-2">
          <h3 className="font-mono text-xl font-black tracking-[-0.05em] sm:text-2xl">
            支払い方法はまだ登録されていない
          </h3>
          <p className={`text-sm leading-6 ${theme.mutedText}`}>
            利用条件がそろうと、登録済みの支払い方法と更新先をこの場所で確認できます。
          </p>
        </div>
      </div>
    </>
  );

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

          {isStripeConfigured ? (
            <span className={`${theme.pill} px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]`}>
              Stripe
            </span>
          ) : null}
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-4">
            {isAuthenticated
              ? isStripeConfigured
                ? isPro
                  ? (
                    <div className={`rounded-3xl border ${theme.border} ${theme.panelMuted} px-5 py-5 sm:px-6 sm:py-6`}>
                      <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
                        Payment Status
                      </p>
                      <div className={`mt-3 w-16 border-t border-dashed ${theme.accentBorder}`} />
                      <div className="mt-4 space-y-2">
                        <h3 className="font-mono text-xl font-black tracking-[-0.05em] sm:text-2xl">
                          登録済みの支払い方法は Billing Portal から更新できます。
                        </h3>
                        <p className={`text-sm leading-6 ${theme.mutedText}`}>
                          現在の請求情報やカードの更新先は外部の Billing Portal に集約しています。
                        </p>
                      </div>
                    </div>
                  )
                  : paymentMethodEmptyState
                : (
                  isPro ? (
                    <div className={`rounded-3xl border ${theme.border} ${theme.panelMuted} px-5 py-5 sm:px-6 sm:py-6`}>
                      <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
                        Payment Status
                      </p>
                      <div className={`mt-3 w-16 border-t border-dashed ${theme.accentBorder}`} />
                      <div className="mt-4 space-y-2">
                        <h3 className="font-mono text-xl font-black tracking-[-0.05em] sm:text-2xl">
                          Stripe 未設定のため、お支払い方法は利用できません。
                        </h3>
                        <p className={`text-sm leading-6 ${theme.mutedText}`}>
                          支払い方法の詳細は、利用条件がそろった時点でここから確認できます。
                        </p>
                      </div>
                    </div>
                  ) : (
                    paymentMethodEmptyState
                  )
                )
              : (
                <div className={`rounded-3xl border ${theme.border} ${theme.panelMuted} px-5 py-5 sm:px-6 sm:py-6`}>
                  <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
                    Payment Status
                  </p>
                  <div className={`mt-3 w-16 border-t border-dashed ${theme.accentBorder}`} />
                  <div className="mt-4 space-y-2">
                    <h3 className="font-mono text-xl font-black tracking-[-0.05em] sm:text-2xl">
                      ログインすると、お支払い方法の確認と更新ができるようになります。
                    </h3>
                    <p className={`text-sm leading-6 ${theme.mutedText}`}>
                      ログイン後に支払い設定へアクセスできるようになります。
                    </p>
                  </div>
                </div>
              )}
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
              現在登録済みの支払い情報はありません。
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
          <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
            Billing History
          </p>
          <div className={`mt-3 w-16 border-t border-dashed ${theme.accentBorder}`} />
          <div className="mt-4 space-y-2">
            <h3 className="font-mono text-xl font-black tracking-[-0.05em] sm:text-2xl">
              請求履歴はまだない
            </h3>
            <p className={`text-sm leading-6 ${theme.mutedText}`}>
              請求が発生すると、ここに履歴が時系列で表示されます。
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
