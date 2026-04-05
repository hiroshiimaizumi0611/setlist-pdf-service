import Link from "next/link";
import type { listTemplates } from "@/lib/services/templates-service";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";
import { StatusPanel } from "./status-panel";
import { TemplateRow } from "./template-row";

type TemplateListProps = {
  templates: Awaited<ReturnType<typeof listTemplates>>;
  currentTheme?: PdfThemeName;
  instantiateAction: (formData: FormData) => Promise<void>;
};

export function TemplateList({
  templates,
  currentTheme = "dark",
  instantiateAction,
}: TemplateListProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <section className={`border-2 ${theme.border} ${theme.panel} p-6 sm:p-8`}>
      <div className="space-y-3">
        <p className={`font-mono text-xs font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
          テンプレート一覧
        </p>
        <h2 className="font-mono text-2xl font-black tracking-[-0.06em]">
          保存済みテンプレート
        </h2>
        <p className={`max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
          保存した構成を一覧で整理し、次回公演をすぐ立ち上げられるようにしています。
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="mt-6">
          <StatusPanel
            theme={theme}
            label="REUSABLE ASSETS"
            title="まだ保存済みテンプレートがない"
            description="一度公演を保存すると、次回以降の公演立ち上げが速くなる。"
            actions={
              <Link
                href="/events"
                className={`${theme.buttonSecondary} inline-flex min-h-11 items-center justify-center px-4 py-3 text-sm font-black tracking-[0.14em] uppercase`}
              >
                保存元の公演を確認
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <div className={`hidden items-center gap-3 border-b ${theme.border} pb-2 font-mono text-[11px] uppercase tracking-[0.22em] ${theme.mutedText} lg:grid lg:grid-cols-[minmax(0,1.7fr)_7rem_auto]`}>
            <span>テンプレート</span>
            <span>項目数</span>
            <span className="text-right">作成</span>
          </div>
          {templates.map((template) => (
            <TemplateRow
              key={template.id}
              template={template}
              currentTheme={currentTheme}
              instantiateAction={instantiateAction}
            />
          ))}
        </div>
      )}
    </section>
  );
}
