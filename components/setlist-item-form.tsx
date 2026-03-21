import type { SetlistItemType } from "@/lib/services/events-service";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type SetlistItemFormProps = {
  currentTheme: PdfThemeName;
  addItemAction?: (formData: FormData) => Promise<void>;
};

const ITEM_TYPE_OPTIONS: Array<{ value: SetlistItemType; label: string }> = [
  { value: "song", label: "曲" },
  { value: "mc", label: "MC" },
  { value: "transition", label: "転換" },
  { value: "heading", label: "見出し" },
];

export function SetlistItemForm({
  currentTheme,
  addItemAction,
}: SetlistItemFormProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <section className={`border-2 ${theme.border} ${theme.panelAlt} p-5`}>
      <div className="space-y-2">
        <h2 className="font-mono text-2xl font-black tracking-[-0.06em]">項目追加</h2>
        <p className={`text-sm leading-6 ${theme.mutedText}`}>
          曲・MC・転換を本番順に積み上げます。必要ならメモと尺も同時に入力できます。
        </p>
      </div>

      <form action={addItemAction} className="mt-5 grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <label className="grid gap-2 text-sm font-medium">
          <span className="font-mono text-[11px] uppercase tracking-[0.26em]">項目種別</span>
          <select name="itemType" defaultValue="song" className={`${theme.input} min-h-11 px-4 py-3`}>
            {ITEM_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span className="font-mono text-[11px] uppercase tracking-[0.26em]">タイトル</span>
          <input
            type="text"
            name="title"
            placeholder="曲名や進行メモを入力"
            className={`${theme.input} min-h-11 px-4 py-3`}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span className="font-mono text-[11px] uppercase tracking-[0.26em]">アーティスト</span>
          <input
            type="text"
            name="artist"
            placeholder="任意"
            className={`${theme.inputMuted} min-h-11 px-4 py-3`}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
          <label className="grid gap-2 text-sm font-medium">
            <span className="font-mono text-[11px] uppercase tracking-[0.26em]">尺(秒)</span>
            <input
              type="number"
              min="0"
              name="durationSeconds"
              placeholder="任意"
              className={`${theme.inputMuted} min-h-11 px-4 py-3`}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            <span className="font-mono text-[11px] uppercase tracking-[0.26em]">メモ</span>
            <input
              type="text"
              name="notes"
              placeholder="転換やキューの補足"
              className={`${theme.inputMuted} min-h-11 px-4 py-3`}
            />
          </label>
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            className={`${theme.buttonPrimary} min-h-11 px-5 text-sm font-bold tracking-[0.14em] uppercase`}
          >
            項目を追加
          </button>
        </div>
      </form>
    </section>
  );
}
