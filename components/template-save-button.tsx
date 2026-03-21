import Link from "next/link";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import type { AppPlan } from "@/lib/stripe/plans";
import { getDashboardThemeStyles } from "./dashboard-shell";

type TemplateSaveButtonProps = {
  plan: AppPlan;
  currentTheme?: PdfThemeName;
  mode?: "summary" | "event";
  sourceEventId?: string;
  defaultName?: string;
  defaultDescription?: string;
  saveTemplateAction?: (input: {
    sourceEventId: string;
    name: string;
    description?: string;
  }) => Promise<unknown>;
};

export function TemplateSaveButton({
  plan,
  currentTheme = "light",
  mode = "summary",
  sourceEventId,
  defaultName = "",
  defaultDescription = "",
  saveTemplateAction,
}: TemplateSaveButtonProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  if (plan !== "pro") {
    return (
      <Link
        href="/settings/billing"
        className={`${theme.buttonPrimary} inline-flex min-h-11 items-center justify-center px-5 text-sm font-bold tracking-[0.14em]`}
      >
        Proでテンプレート保存を有効化
      </Link>
    );
  }

  if (mode === "event" && sourceEventId) {
    return (
      <form
        action={async (formData) => {
          "use server";

          if (!saveTemplateAction) {
            return;
          }

          await saveTemplateAction({
            sourceEventId,
            name: String(formData.get("name") ?? defaultName),
            description: String(formData.get("description") ?? defaultDescription),
          });
        }}
        className="grid gap-3 md:grid-cols-[minmax(0,14rem)_minmax(0,18rem)_auto]"
      >
        <label className="grid gap-2 text-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
            テンプレート名
          </span>
          <input
            type="text"
            name="name"
            defaultValue={defaultName}
            className={`${theme.input} min-h-11 px-4 py-3`}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
            補足
          </span>
          <input
            type="text"
            name="description"
            defaultValue={defaultDescription}
            className={`${theme.inputMuted} min-h-11 px-4 py-3`}
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className={`${theme.buttonSecondary} min-h-11 px-5 text-sm font-bold tracking-[0.14em]`}
          >
            この内容をテンプレート保存
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`border-2 ${theme.border} ${theme.panelAlt} px-5 py-4 text-sm leading-6`}>
      Pro保存が有効です。公演エディタから進行表をそのままテンプレート化できます。
    </div>
  );
}
