import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthenticatedAppFrame } from "@/components/authenticated-app-frame";
import { getDashboardThemeStyles } from "@/components/dashboard-shell";
import { LogoutButton } from "@/components/logout-button";
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
    <AuthenticatedAppFrame
      currentTheme="dark"
      activeItem="account"
      title="アカウント概要"
      eyebrow="マイページ"
      description="現在ログインしているオペレーター情報と、利用中のプランをすばやく確認できます。"
      userMenu={
        <UserMenu
          displayName={userIdentity.displayName}
          email={userIdentity.email}
          currentPlan={currentPlan.plan}
        />
      }
      footer={(collapsed) => (
        <footer role="contentinfo" className="space-y-3">
          <LogoutButton collapsed={collapsed} variant="rail" className="w-full" />
        </footer>
      )}
    >
      <section className="mx-auto flex max-w-5xl flex-col gap-6 py-6 lg:py-8">
        <article className={`border-2 ${theme.border} ${theme.panel} p-6 sm:p-8`}>
          <div className="space-y-4">
            <div className="space-y-3">
              <h2 className="font-mono text-4xl font-black tracking-[-0.08em] sm:text-5xl">
                アカウント詳細
              </h2>
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
                <p className="mt-3 text-lg font-semibold">{formatPlanLabel(currentPlan.plan)}</p>
              </section>
            </div>
          </div>
        </article>

        <article className={`${theme.panelAlt} ${theme.text} border-2 ${theme.accentBorder} p-6 sm:p-8`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${theme.currentEventText}`}>
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
    </AuthenticatedAppFrame>
  );
}
