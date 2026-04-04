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

export function SetlistItemForm({ currentTheme, addItemAction }: SetlistItemFormProps) {
  const theme = getDashboardThemeStyles(currentTheme);
  const checkedTab =
    currentTheme === "dark"
      ? "peer-checked:border-[#f6c453] peer-checked:bg-[#f6c453] peer-checked:text-[#1f1b16] peer-checked:hover:bg-[#ffda78]"
      : "peer-checked:border-[#c78f14] peer-checked:bg-[#fff1c4] peer-checked:text-[#1f1b16] peer-checked:hover:bg-[#ffe9a5]";
  const stripFrame =
    currentTheme === "dark"
      ? "bg-[#1a1a1a] shadow-[inset_0_1px_0_rgba(255,246,223,0.04)]"
      : "bg-[#fffef8]";
  const stripBand = currentTheme === "dark" ? "bg-[#141414]" : "bg-[#fffdf7]";
  const stripLabel = currentTheme === "dark" ? "text-[#bfb7aa]" : "text-[#736759]";
  const stripDivider = currentTheme === "dark" ? "bg-[#2b2a28]" : "bg-[#d7cfbe]";

  return (
    <section
      data-editor-strip="add-item"
      className={`overflow-hidden border-2 ${theme.border} ${stripFrame}`}
    >
      <div className={`border-b ${theme.border} px-4 py-3`}>
        <p className={`font-mono text-[10px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
          Add Production Item
        </p>
        <p className={`mt-1 text-sm leading-5 ${theme.mutedText}`}>
          Compact one-line strip for live edits and quick inserts.
        </p>
      </div>

      <form action={addItemAction} className="px-4 py-4">
        <div className={`grid gap-px ${stripDivider} md:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)_auto]`}>
          <fieldset className={`min-w-0 ${stripBand} p-2`}>
            <legend className="sr-only">項目種別</legend>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
              {ITEM_TYPE_OPTIONS.map((option) => (
                <label key={option.value} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="itemType"
                    value={option.value}
                    defaultChecked={option.value === "song"}
                    className="peer sr-only"
                  />
                  <span
                    className={`${theme.buttonSecondary} flex min-h-10 items-center justify-center px-3 text-[11px] font-black tracking-[0.18em] uppercase transition ${checkedTab}`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={`grid min-w-0 gap-2 ${stripBand} px-4 py-3`}>
            <span className="sr-only">タイトル</span>
            <input
              type="text"
              name="title"
              placeholder="曲名や進行メモを入力"
              required
              className={`${theme.input} min-h-10 px-4 py-2.5 text-sm font-semibold tracking-[0.04em]`}
            />
          </label>

          <button
            type="submit"
            data-strip-action="add-item"
            className={`${theme.buttonPrimary} min-h-10 px-6 text-sm font-black tracking-[0.14em] uppercase`}
          >
            ADD TO SET
          </button>
        </div>

        <details
          className={`mt-3 border-t ${theme.border} pt-3`}
        >
          <summary
            data-strip-action="toggle-advanced"
            className={`${theme.buttonSecondary} inline-flex min-h-10 cursor-pointer items-center justify-center px-4 text-xs font-black tracking-[0.18em] uppercase`}
          >
            追加設定
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="grid gap-2">
              <span className={`font-mono text-[10px] uppercase tracking-[0.3em] ${stripLabel}`}>
                アーティスト
              </span>
              <input
                type="text"
                name="artist"
                placeholder="任意"
                className={`${theme.inputMuted} min-h-10 px-4 py-2.5`}
              />
            </label>

            <label className="grid gap-2">
              <span className={`font-mono text-[10px] uppercase tracking-[0.3em] ${stripLabel}`}>
                尺(秒)
              </span>
              <input
                type="number"
                min="0"
                name="durationSeconds"
                placeholder="任意"
                className={`${theme.inputMuted} min-h-10 px-4 py-2.5`}
              />
            </label>

            <label className="grid gap-2">
              <span className={`font-mono text-[10px] uppercase tracking-[0.3em] ${stripLabel}`}>
                メモ
              </span>
              <input
                type="text"
                name="notes"
                placeholder="転換やキューの補足"
                className={`${theme.inputMuted} min-h-10 px-4 py-2.5`}
              />
            </label>
          </div>
        </details>
      </form>
    </section>
  );
}
