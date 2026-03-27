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
    "peer-checked:border-[#f6c453] peer-checked:bg-[#f6c453] peer-checked:text-[#1f1b16] peer-checked:hover:bg-[#ffda78]";

  return (
    <section className={`overflow-hidden border-2 ${theme.border} ${theme.panelAlt}`}>
      <div className={`border-b-2 ${theme.border} px-4 py-3`}>
        <p className={`font-mono text-[10px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
          Add Production Item
        </p>
        <p className={`mt-1 text-sm leading-6 ${theme.mutedText}`}>
          Compact one-line strip for live edits and quick inserts.
        </p>
      </div>

      <form
        action={addItemAction}
        className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)_auto]"
      >
        <fieldset className="min-w-0">
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
                  className={`${theme.buttonSecondary} flex min-h-11 items-center justify-center px-4 text-xs font-black tracking-[0.18em] uppercase transition ${checkedTab}`}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="grid min-w-0 gap-2">
          <span className="sr-only">タイトル</span>
          <input
            type="text"
            name="title"
            placeholder="曲名や進行メモを入力"
            required
            className={`${theme.input} min-h-11 px-4 py-3`}
          />
        </label>

        <button
          type="submit"
          className={`${theme.buttonPrimary} min-h-11 px-6 text-sm font-black tracking-[0.14em] uppercase`}
        >
          ADD TO SET
        </button>
      </form>
    </section>
  );
}
