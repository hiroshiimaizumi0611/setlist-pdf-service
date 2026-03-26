import { redirect } from "next/navigation";
import { getAuthSessionWithPlan } from "@/lib/subscription";
import { listEventSummaries } from "@/lib/services/events-service";
import { listTemplates } from "@/lib/services/templates-service";
import { getDashboardThemeStyles } from "@/components/dashboard-shell";
import { TemplateList } from "@/components/template-list";
import { TemplateSaveButton } from "@/components/template-save-button";
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
  const theme = getDashboardThemeStyles("light");

  return (
    <main className={`${theme.page} min-h-screen px-4 py-5 sm:px-6 lg:px-8 lg:py-8`}>
      <section className="mx-auto max-w-5xl space-y-8">
        <header className={`flex flex-col gap-4 border-2 ${theme.border} ${theme.panel} p-8 md:flex-row md:items-end md:justify-between`}>
          <div className="space-y-3">
            <p className={`font-mono text-xs font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
              テンプレート
            </p>
            <h1 className="font-mono text-4xl font-black tracking-[-0.08em]">
              テンプレート管理
            </h1>
            <p className={`max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
              定番の曲順やMCの流れを保存しておけば、次の公演を数分で立ち上げられます。
            </p>
          </div>

          <TemplateSaveButton plan={currentPlan.plan} currentTheme="light" />
        </header>

        <section className={`border-2 ${theme.border} ${theme.panel} p-8`}>
          <div className="space-y-3">
            <p className={`font-mono text-xs font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
              公演から保存
            </p>
            <h2 className="font-mono text-2xl font-black tracking-[-0.06em]">
              既存の公演からテンプレートを保存
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
            <div className="mt-6 grid gap-4">
              {events.map((event) => (
                <article
                  key={event.id}
                  className={`border-2 ${theme.border} ${theme.panelMuted} p-5`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-mono text-lg font-black tracking-[-0.04em]">
                        {event.title}
                      </h3>
                      <p className={`text-sm ${theme.mutedText}`}>
                        {[event.venue, formatTemplateDate(event.eventDate)]
                          .filter(Boolean)
                          .join(" / ") || "日付・会場未設定"}
                      </p>
                      <p className={`font-mono text-xs uppercase tracking-[0.18em] ${theme.mutedText}`}>
                        {event.itemCount}項目
                      </p>
                    </div>

                    {isPro ? (
                      <form
                        action={saveTemplateFromEventFormAction}
                        className="grid w-full gap-3 md:max-w-md"
                      >
                        <input type="hidden" name="sourceEventId" value={event.id} />
                        <label className="grid gap-2 text-sm">
                          <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
                            テンプレート名
                          </span>
                          <input
                            type="text"
                            name="name"
                            defaultValue={event.title}
                            placeholder="テンプレート名"
                            className={`${theme.input} px-4 py-3 text-sm`}
                          />
                        </label>
                        <label className="grid gap-2 text-sm">
                          <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
                            補足メモ
                          </span>
                          <input
                            type="text"
                            name="description"
                            defaultValue={event.notes ?? ""}
                            placeholder="メモや会場向け補足"
                            className={`${theme.inputMuted} px-4 py-3 text-sm`}
                          />
                        </label>
                        <button
                          type="submit"
                          className={`${theme.buttonSecondary} inline-flex min-h-11 items-center justify-center px-4 py-3 text-sm font-medium`}
                        >
                          この公演から保存
                        </button>
                      </form>
                    ) : (
                      <div className={`w-full border-2 ${theme.accentBorder} ${theme.panelAlt} px-4 py-4 text-sm leading-6 ${theme.text} md:max-w-md`}>
                        Pro でテンプレート保存を有効化すると、この公演構成をそのまま再利用できます。
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <TemplateList
          templates={templates}
          currentTheme="light"
          instantiateAction={createEventFromTemplateFormAction}
        />
      </section>
    </main>
  );
}
