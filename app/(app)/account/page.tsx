import Link from "next/link";
import { redirect } from "next/navigation";
import { AppGlobalNav } from "@/components/app-global-nav";
import { getDashboardThemeStyles } from "@/components/dashboard-shell";
import { UserMenu } from "@/components/user-menu";
import { getAuthSessionWithPlan } from "@/lib/subscription";
import { resolveAuthenticatedUserIdentity } from "@/lib/user-identity";

export const dynamic = "force-dynamic";

function formatPlanLabel(plan: "free" | "pro") {
  return plan === "pro" ? "Pro" : "Free";
}

export default async function AccountPage() {
  const authSession = await getAuthSessionWithPlan();

  if (!authSession) {
    return redirect("/login");
  }

  const { session, currentPlan } = authSession;
  const theme = getDashboardThemeStyles("dark");
  const userIdentity = resolveAuthenticatedUserIdentity(session.user);

  return (
    <main className={`${theme.page} min-h-screen`}>
      <header
        className={`sticky top-0 z-30 border-b ${theme.border} bg-[#131313]/92 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8`}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="space-y-2">
              <p
                className={`font-mono text-[11px] font-semibold uppercase tracking-[0.3em] ${theme.headerCurrentShow}`}
              >
                Account Summary
              </p>
              <p className={`text-xs uppercase tracking-[0.24em] ${theme.mutedText}`}>
                Settings / Account
              </p>
            </div>
            <AppGlobalNav ariaLabel="設定ナビゲーション" className="shrink-0" />
          </div>

          <UserMenu
            displayName={userIdentity.displayName}
            email={userIdentity.email}
            currentPlan={currentPlan.plan}
          />
        </div>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <article className={`border-2 ${theme.border} ${theme.panel} p-6 sm:p-8`}>
          <div className="space-y-4">
            <div className="space-y-3">
              <p
                className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}
              >
                マイページ
              </p>
              <h1 className="font-mono text-4xl font-black tracking-[-0.08em] sm:text-5xl">
                アカウント概要
              </h1>
              <p className={`max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
                現在ログインしているオペレーター情報と、利用中のプランをすばやく確認できます。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <section className={`border ${theme.border} ${theme.panelAlt} p-4`}>
                <p className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
                  名前
                </p>
                <p className="mt-3 text-lg font-semibold">{userIdentity.displayName}</p>
              </section>

              <section className={`border ${theme.border} ${theme.panelAlt} p-4`}>
                <p className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
                  メール
                </p>
                <p className="mt-3 break-all text-lg font-semibold">{userIdentity.email}</p>
              </section>

              <section className={`border ${theme.border} ${theme.panelAlt} p-4`}>
                <p className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
                  現在のプラン
                </p>
                <p className="mt-3 text-lg font-semibold">
                  {formatPlanLabel(currentPlan.plan)}
                </p>
              </section>
            </div>
          </div>
        </article>

        <article
          className={`${theme.panelAlt} ${theme.text} border-2 ${theme.accentBorder} p-6 sm:p-8`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p
                className={`font-mono text-[11px] uppercase tracking-[0.3em] ${theme.currentEventText}`}
              >
                Billing
              </p>
              <p className="text-lg font-semibold">請求やプラン変更は billing 画面から管理します。</p>
              <p className={`text-sm leading-7 ${theme.currentEventMeta}`}>
                このページでは編集は行わず、確認用のサマリーに絞っています。
              </p>
            </div>

            <Link
              href="/settings/billing"
              className={`${theme.buttonSecondary} inline-flex min-h-11 items-center justify-center px-5 text-sm font-black uppercase tracking-[0.18em]`}
            >
              プラン管理へ
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
