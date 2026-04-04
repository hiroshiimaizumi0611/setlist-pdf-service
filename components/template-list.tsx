import type { listTemplates } from "@/lib/services/templates-service";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";
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
          保存した構成を row で一覧し、次回公演をすぐ立ち上げられるようにしました。
        </p>
      </div>

      {templates.length === 0 ? (
        <p className={`mt-6 border-2 border-dashed ${theme.border} ${theme.panelMuted} px-5 py-4 text-sm leading-7 ${theme.mutedText}`}>
          まだ保存済みテンプレートがありません。公演内容を保存すると、この一覧から次回公演をすぐ立ち上げられます。
        </p>
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
