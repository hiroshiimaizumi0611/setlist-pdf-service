import { redirect } from "next/navigation";
import { AuthenticatedAppFrame } from "@/components/authenticated-app-frame";
import { getAuthSessionWithPlan } from "@/lib/subscription";
import { listEventSummaries } from "@/lib/services/events-service";
import { listTemplates } from "@/lib/services/templates-service";
import { getDashboardThemeStyles } from "@/components/dashboard-shell";
import { LogoutButton } from "@/components/logout-button";
import { TemplateList } from "@/components/template-list";
import { TemplateSaveButton } from "@/components/template-save-button";
import { UserMenu } from "@/components/user-menu";
import { resolveAuthenticatedUserIdentity } from "@/lib/user-identity";
import {
  createEventFromTemplateFormAction,
  saveTemplateFromEventFormAction,
} from "./actions";

export const dynamic = "force-dynamic";

function formatTemplateDate(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(value);
}

export default async function TemplatesPage() {
  const authSession = await getAuthSessionWithPlan();

  if (!authSession) {
    redirect("/login");
  }

  const { session, currentPlan } = authSession;
  const events = await listEventSummaries({ userId: session.user.id });
  const templates = await listTemplates({ userId: session.user.id });
  const isPro = currentPlan.plan === "pro";
  const theme = getDashboardThemeStyles("dark");
  const userIdentity = resolveAuthenticatedUserIdentity(session.user);

  return (
    <AuthenticatedAppFrame
      currentTheme="dark"
      activeItem="templates"
      title="テンプレート管理"
      eyebrow="テンプレート"
      description="定番の曲順やMCの流れを保存しておけば、次の公演を数分で立ち上げられます。"
      actions={<TemplateSaveButton plan={currentPlan.plan} currentTheme="dark" />}
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
      <section className={`border-2 ${theme.border} ${theme.panel} p-6 sm:p-8`}>
        <div className="space-y-3">
          <p className={`font-mono text-xs font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
            公演から保存
          </p>
          <h2 className="font-mono text-2xl font-black tracking-[-0.06em]">
            既存公演から保存
          </h2>
          <p className={`max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
            すでに作成した公演を土台にして、次回以降も流用できるテンプレートを保存します。
          </p>
        </div>

        {events.length === 0 ? (
          <p className={`mt-6 border-2 border-dashed ${theme.border} ${theme.panelMuted} px-5 py-4 text-sm ${theme.mutedText}`}>
            まだ保存対象の公演がありません。先に公演を作成すると、ここからテンプレート化できます。
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            <div className={`hidden items-center gap-3 border-b ${theme.border} pb-2 font-mono text-[11px] uppercase tracking-[0.22em] ${theme.mutedText} lg:grid lg:grid-cols-[minmax(0,1.8fr)_5.5rem_minmax(0,1.2fr)_minmax(0,1.1fr)_auto]`}>
              <span>公演</span>
              <span>項目数</span>
              <span>テンプレート名</span>
              <span>メモ</span>
              <span className="text-right">保存</span>
            </div>
            {events.map((event) => (
              <article
                key={event.id}
                className={`border ${theme.border} ${theme.panelMuted} px-4 py-4`}
              >
                {isPro ? (
                  <form
                    action={saveTemplateFromEventFormAction}
                    className="grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_5.5rem_minmax(0,1.2fr)_minmax(0,1.1fr)_auto] lg:items-center"
                  >
                    <input type="hidden" name="sourceEventId" value={event.id} />
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-mono text-base font-black tracking-[-0.04em] sm:text-lg">
                        {event.title}
                      </h3>
                      <p className={`text-sm ${theme.mutedText}`}>
                        {[event.venue, formatTemplateDate(event.eventDate)]
                          .filter(Boolean)
                          .join(" / ") || "日付・会場未設定"}
                      </p>
                    </div>
                    <p className={`font-mono text-xs uppercase tracking-[0.18em] ${theme.mutedText} lg:text-center`}>
                      {event.itemCount}項目
                    </p>
                    <label className="grid gap-2 text-sm">
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em] lg:sr-only">
                        テンプレート名
                      </span>
                      <input
                        type="text"
                        name="name"
                        defaultValue={event.title}
                        placeholder="テンプレート名"
                        required
                        className={`${theme.input} min-h-11 px-4 py-3 text-sm`}
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em] lg:sr-only">
                        補足メモ
                      </span>
                      <input
                        type="text"
                        name="description"
                        defaultValue={event.notes ?? ""}
                        placeholder="メモや会場向け補足"
                        className={`${theme.inputMuted} min-h-11 px-4 py-3 text-sm`}
                      />
                    </label>
                    <div className="flex items-center lg:justify-end">
                      <button
                        type="submit"
                        className={`${theme.buttonSecondary} inline-flex min-h-11 items-center justify-center px-4 py-3 text-sm font-medium whitespace-nowrap`}
                      >
                        この公演から保存
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_5.5rem_minmax(0,1.2fr)_minmax(0,1.1fr)_auto] lg:items-center">
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-mono text-base font-black tracking-[-0.04em] sm:text-lg">
                        {event.title}
                      </h3>
                      <p className={`text-sm ${theme.mutedText}`}>
                        {[event.venue, formatTemplateDate(event.eventDate)]
                          .filter(Boolean)
                          .join(" / ") || "日付・会場未設定"}
                      </p>
                    </div>
                    <p className={`font-mono text-xs uppercase tracking-[0.18em] ${theme.mutedText} lg:text-center`}>
                      {event.itemCount}項目
                    </p>
                    <div className={`lg:col-span-3 border ${theme.accentBorder} ${theme.panelAlt} px-4 py-3 text-sm leading-6 ${theme.text}`}>
                      Pro でテンプレート保存を有効化すると、この公演構成をそのまま再利用できます。
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-3">
          <p className={`font-mono text-xs font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
            保存済みテンプレート一覧
          </p>
          <p className={`max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
            保存した構成を一覧で整理し、次回公演をすぐ立ち上げられるようにしています。
          </p>
        </div>

        <TemplateList
          templates={templates}
          currentTheme="dark"
          instantiateAction={createEventFromTemplateFormAction}
        />
      </section>
    </AuthenticatedAppFrame>
  );
}
