import type { listTemplates } from "@/lib/services/templates-service";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";
import { FormPendingButton } from "./form-pending-button";

type TemplateRowProps = {
  template: Awaited<ReturnType<typeof listTemplates>>[number];
  currentTheme?: PdfThemeName;
  instantiateAction: (formData: FormData) => Promise<void>;
};

export function TemplateRow({
  template,
  currentTheme = "dark",
  instantiateAction,
}: TemplateRowProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <article className={`border ${theme.border} ${theme.panelMuted} px-4 py-4 transition hover:-translate-y-0.5`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_7rem_auto] lg:items-center">
        <div className="min-w-0 space-y-1">
          <h3 className={`font-mono text-base font-black tracking-[-0.04em] ${theme.text} sm:text-lg`}>
            {template.name}
          </h3>
          {template.description ? <p className={`text-sm leading-6 ${theme.mutedText}`}>{template.description}</p> : null}
        </div>

        <p className={`font-mono text-xs uppercase tracking-[0.18em] ${theme.mutedText} lg:text-center`}>
          {template.items.length} items
        </p>

        <form action={instantiateAction} className="flex items-center lg:justify-end">
          <input type="hidden" name="templateId" value={template.id} />
          <input type="hidden" name="title" value={`${template.name} Copy`} />
          <input type="hidden" name="theme" value={currentTheme} />
          <FormPendingButton
            idleLabel="このテンプレートで公演作成"
            pendingLabel="公演作成中..."
            className={`${theme.buttonPrimary} inline-flex min-h-11 items-center justify-center px-4 py-2 text-sm font-bold whitespace-nowrap`}
          />
        </form>
      </div>
    </article>
  );
}
