import type { listTemplates } from "@/lib/services/templates-service";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type TemplateListProps = {
  templates: Awaited<ReturnType<typeof listTemplates>>;
  currentTheme?: PdfThemeName;
  instantiateAction: (
    input: {
      templateId: string;
      title: string;
    },
  ) => Promise<unknown>;
};

export function TemplateList({
  templates,
  currentTheme = "light",
  instantiateAction,
}: TemplateListProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  if (templates.length === 0) {
    return (
      <section className={`border-2 ${theme.border} ${theme.panelMuted} p-8 text-sm leading-7 ${theme.mutedText}`}>
        まだテンプレートはありません。Proで公演内容を保存すると、この一覧から次回公演をすぐ作成できます。
      </section>
    );
  }

  return (
    <section className={`overflow-hidden border-2 ${theme.border} ${theme.panel}`}>
      <div className={`grid gap-px ${theme.border} bg-current/20`}>
        {templates.map((template) => (
          <article
            key={template.id}
            className={`grid gap-6 px-6 py-6 md:grid-cols-[1.5fr_auto] ${theme.panel}`}
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className={`font-mono text-xl font-black tracking-[-0.06em] ${theme.text}`}>
                  {template.name}
                </h2>
                <span className={`${theme.pill} px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]`}>
                  {template.items.length} items
                </span>
              </div>
              {template.description ? (
                <p className={`text-sm leading-7 ${theme.mutedText}`}>
                  {template.description}
                </p>
              ) : null}
            </div>

            <form
              action={async () => {
                "use server";

                await instantiateAction({
                  templateId: template.id,
                  title: `${template.name} Copy`,
                });
              }}
              className="flex items-center"
            >
              <button
                type="submit"
                className={`${theme.buttonPrimary} inline-flex min-h-11 items-center justify-center px-4 py-2 text-sm font-bold`}
              >
                このテンプレートで公演作成
              </button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
