import Link from "next/link";
import type { SetlistPdfWarning } from "@/lib/pdf/build-layout";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";

type PdfPreviewInspectorProps = {
  currentTheme: PdfThemeName;
  lightHref: string;
  darkHref: string;
  warnings: SetlistPdfWarning[];
  updatedAt: Date | null;
};

function formatUpdatedAt(value: Date | null) {
  if (!value) {
    return "未保存";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Tokyo",
    timeZoneName: "short",
  }).format(value);
}

function ThemeLink({
  href,
  label,
  active,
  swatchClassName,
}: {
  href: string;
  label: string;
  active: boolean;
  swatchClassName: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center gap-2 border px-3 py-3 transition ${
        active
          ? "border-[#f6c453] bg-[#2a2417] text-[#f6c453]"
          : "border-[#38332b] bg-[#202020] text-[#bfb7aa] hover:border-[#5b513d] hover:text-[#f6f3ee]"
      }`}
    >
      <span className={`h-8 w-8 border ${swatchClassName}`} />
      <span className="text-[10px] font-black tracking-[0.22em]">{label}</span>
    </Link>
  );
}

export function PdfPreviewInspector({
  currentTheme,
  lightHref,
  darkHref,
  warnings,
  updatedAt,
}: PdfPreviewInspectorProps) {
  const hasWarnings = warnings.length > 0;

  return (
    <aside
      className="flex h-full min-h-[calc(100vh-64px)] flex-col border-l border-[#2f2a24] bg-[#1a1a1a]"
    >
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#bfb7aa]">
            <span className="h-1 w-1 bg-[#f6c453]" />
            PDFテーマ切替
          </h2>
          <div className="grid grid-cols-2 gap-px border border-[#38332b] bg-[#38332b]">
            <ThemeLink
              href={lightHref}
              label="LIGHT"
              active={currentTheme === "light"}
              swatchClassName="border-[#d8d0c2] bg-[#fffdf8]"
            />
            <ThemeLink
              href={darkHref}
              label="DARK"
              active={currentTheme === "dark"}
              swatchClassName="border-[#f6c453] bg-[#000000]"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#bfb7aa]">
            <span className="h-1 w-1 bg-[#f6c453]" />
            出力サイズ選択
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between border border-[#f6c453]/60 bg-[#201c14] px-3 py-3">
              <span className="text-xs font-bold text-[#f6c453]">A4 (210 x 297mm)</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#f6c453]" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#bfb7aa]">
            <span className="h-1 w-1 bg-[#f6c453]" />
            ページ継続確認
          </h2>

          {hasWarnings ? (
            <div className="space-y-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#f6c453]">
                レイアウト警告
              </p>
              {warnings.map((warning) => (
                <div
                  key={`${warning.type}-${warning.rowId}`}
                  className="border-l-2 border-[#f6c453] bg-[#111111] px-4 py-4 text-[11px] leading-6 text-[#f6f3ee]"
                >
                  {warning.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-[#38332b] bg-[#111111] px-4 py-4 text-[11px] leading-6 text-[#bfb7aa]">
                共有レイアウト上で長い曲名や改ページ警告は検出されませんでした。
              </div>
              <label className="flex items-center gap-3 text-[11px] font-bold text-[#f6f3ee]">
                <input type="checkbox" checked readOnly className="h-4 w-4 accent-[#f6c453]" />
                レイアウト確定済
              </label>
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-[#2f2a24] bg-[#141414] px-6 py-4">
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] text-[#8d8578]">
          <span>最終更新時刻:</span>
          <span className="text-right text-[#f6c453]">{formatUpdatedAt(updatedAt)}</span>
        </div>
      </footer>
    </aside>
  );
}
