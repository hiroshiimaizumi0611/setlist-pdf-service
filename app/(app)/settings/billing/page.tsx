import { redirect } from "next/navigation";
import Link from "next/link";
import {
  auth,
  getAuthSession,
  getRequestHeaders,
  requireAuthSession,
} from "@/lib/auth";
import { env } from "@/lib/env";
import { getCurrentPlan } from "@/lib/subscription";
import { PRO_MONTHLY_PRICE_LABEL } from "@/lib/stripe/plans";
import { getDashboardThemeStyles } from "@/components/dashboard-shell";
import { BillingComparisonTable } from "@/components/billing-comparison-table";
import { BillingPaymentSection } from "@/components/billing-payment-section";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { UpgradeCard } from "@/components/upgrade-card";
import { UserMenu } from "@/components/user-menu";
import type { AppPlan } from "@/lib/stripe/plans";
import type { AuthenticatedUserIdentity } from "@/lib/user-identity";
import { resolveAuthenticatedUserIdentity } from "@/lib/user-identity";

export const dynamic = "force-dynamic";

type BillingPageContentBaseProps = {
  currentPlan: AppPlan;
  isStripeConfigured: boolean;
  subscription: {
    status: string;
    plan?: string;
    billingInterval?: string | null;
    periodEnd?: Date | null;
    seats?: number | null;
  } | null;
};

type AuthenticatedBillingPageContentProps = BillingPageContentBaseProps & {
  isAuthenticated: true;
  userIdentity: AuthenticatedUserIdentity;
};

type GuestBillingPageContentProps = BillingPageContentBaseProps & {
  isAuthenticated: false;
};

type BillingPageContentProps =
  | AuthenticatedBillingPageContentProps
  | GuestBillingPageContentProps;

async function openBillingPortalAction() {
  "use server";

  if (!env.isStripeConfigured) {
    throw new Error("Billing is not configured.");
  }

  const session = await requireAuthSession();
  const response = await auth.api.createBillingPortal({
    body: {
      referenceId: session.user.id,
      customerType: "user",
      returnUrl: new URL("/settings/billing", env.BETTER_AUTH_URL).toString(),
      disableRedirect: true,
    },
    headers: await getRequestHeaders(),
  });

  redirect(response.url);
}

export default async function BillingPage() {
  const session = await getAuthSession();
  const currentPlan = await getCurrentPlan();

  if (session?.user.id) {
    const userIdentity = resolveAuthenticatedUserIdentity(session.user);

    return (
      <BillingPageContent
        currentPlan={currentPlan.plan}
        userIdentity={userIdentity}
        isStripeConfigured={currentPlan.billingConfigured}
        isAuthenticated={true}
        subscription={currentPlan.activeSubscription}
      />
    );
  }

  return (
    <BillingPageContent
      currentPlan={currentPlan.plan}
      isStripeConfigured={currentPlan.billingConfigured}
      isAuthenticated={false}
      subscription={currentPlan.activeSubscription}
    />
  );
}

export function BillingPageContent(props: BillingPageContentProps) {
  const { currentPlan, isStripeConfigured, isAuthenticated, subscription } = props;
  const isPro = currentPlan === "pro";
  const theme = getDashboardThemeStyles("dark");

  return (
    <main className={`${theme.page} min-h-screen`}>
      <header
        className={`sticky top-0 z-30 border-b ${theme.border} bg-[#131313]/92 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8`}
      >
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.3em] ${theme.headerCurrentShow}`}>
              Subscription Management
            </p>
            <div
              className={`hidden border-l ${theme.border} pl-4 text-[10px] font-mono uppercase tracking-[0.26em] ${theme.mutedText} md:block`}
            >
              Settings / Billing
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <UserMenu
                displayName={props.userIdentity.displayName}
                email={props.userIdentity.email}
                currentPlan={currentPlan}
              />
            ) : (
              <Link
                href="/login"
                className={`${theme.buttonSecondary} inline-flex min-h-10 items-center justify-center px-4 text-xs font-black tracking-[0.18em] uppercase`}
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col lg:block">
        <aside
          className={`${theme.rail} ${theme.railBorder} border-b px-4 pb-5 pt-6 lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:h-full lg:w-72 lg:border-b-0 lg:border-r lg:px-5 lg:pb-4 lg:pt-20`}
        >
          <SettingsSidebar currentPlan={currentPlan} />
        </aside>

        <div className="min-w-0 px-4 pb-8 pt-6 sm:px-6 lg:pl-[19rem] lg:pr-8 lg:pt-8">
          <section className="mx-auto max-w-6xl space-y-6">
            <section className={`border-2 ${theme.border} ${theme.panel} p-6 sm:p-8`}>
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-5">
                  <p
                    className={`font-mono text-[11px] font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}
                  >
                    プラン管理
                  </p>
                  <div className="space-y-3">
                    <h1 className="font-mono text-4xl font-black tracking-[-0.08em] sm:text-5xl">
                      Current Plan
                    </h1>
                    <p className={`max-w-3xl text-sm leading-7 ${theme.mutedText}`}>
                      現在のプランと支払い状態を一目で確認できるように、Stitch の subscription
                      画面に寄せたトップレベルのヘルスをまとめています。
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`${theme.pill} px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]`}
                    >
                      {isPro ? "Pro" : "Free"}
                    </span>
                    {subscription ? (
                      <span className={`${theme.pill} px-3 py-1 text-xs font-medium`}>
                        {subscription.status === "active" ? "有効中" : subscription.status}
                      </span>
                    ) : null}
                    <span
                      className={`${theme.pill} px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]`}
                    >
                      {isPro ? PRO_MONTHLY_PRICE_LABEL : "基本機能込み"}
                    </span>
                  </div>

                  <div
                    className={`${theme.panelAlt} ${theme.text} border-2 ${theme.accentBorder} px-4 py-3 text-sm`}
                  >
                    {isPro
                      ? "このアカウントではテンプレート保存が有効です。"
                      : "イベント作成と既存テンプレートの呼び出しは無料のまま利用でき、テンプレート保存だけを Pro で解放します。"}
                  </div>

                  <p className={`max-w-3xl text-sm leading-7 ${theme.mutedText}`}>
                    Stripe test mode の設定が未完了でも画面確認できるようにしています。
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <UpgradeCard
                    plan={currentPlan}
                    billingConfigured={isStripeConfigured}
                    isAuthenticated={isAuthenticated}
                    currentTheme="dark"
                    openBillingPortalAction={openBillingPortalAction}
                    upgradeLabel="Proへアップグレード"
                    billingPortalLabel="お支払い設定を開く"
                    loginLabel="ログインしてアップグレード"
                    loginHref="/login"
                  />
                </div>
              </div>
            </section>

            <BillingComparisonTable />

            <BillingPaymentSection
              currentPlan={currentPlan}
              isAuthenticated={isAuthenticated}
              isStripeConfigured={isStripeConfigured}
              openBillingPortalAction={openBillingPortalAction}
              subscription={subscription}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
