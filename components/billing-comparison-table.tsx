import { getDashboardThemeStyles } from "./dashboard-shell";

type ComparisonRow = {
  feature: string;
  free: string;
  pro: string;
};

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "公演作成 / 基本設定", free: "利用可", pro: "利用可" },
  { feature: "曲順編集 / 基本運用", free: "利用可", pro: "利用可" },
  { feature: "PDF 出力", free: "利用可", pro: "利用可" },
  { feature: "過去公演複製", free: "利用可", pro: "利用可" },
  { feature: "テンプレート保存", free: "未対応", pro: "利用可" },
  { feature: "今後の時短機能追加（先行アクセス）", free: "なし", pro: "先行" },
];

export function BillingComparisonTable() {
  const theme = getDashboardThemeStyles("dark");

  return (
    <section className={`border-2 ${theme.border} ${theme.panel} p-6 sm:p-8`} aria-labelledby="billing-comparison-heading">
      <div className="space-y-2">
        <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
            比較
        </p>
        <h2 id="billing-comparison-heading" className="font-mono text-2xl font-black tracking-[-0.06em] sm:text-3xl">
            プラン比較
        </h2>
        <p className={`max-w-3xl text-sm leading-7 ${theme.mutedText}`}>
            現行の機能範囲だけを並べ、Free と Pro の差分が一目で追えるように整理しています。
        </p>
      </div>

      <div className="mt-6 overflow-hidden border-2 border-[#353534]">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#151515]">
              <th
                scope="col"
                className={`border-b border-[#353534] px-4 py-4 text-left text-[11px] font-mono uppercase tracking-[0.28em] ${theme.mutedText}`}
              >
                Feature
              </th>
              <th
                scope="col"
                className={`border-b border-[#353534] px-4 py-4 text-left text-[11px] font-mono uppercase tracking-[0.28em] ${theme.mutedText}`}
              >
                Free
              </th>
              <th
                scope="col"
                className={`border-b border-[#353534] px-4 py-4 text-left text-[11px] font-mono uppercase tracking-[0.28em] ${theme.mutedText}`}
              >
                Pro
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, index) => (
              <tr key={row.feature} className={index % 2 === 0 ? "bg-[#181818]" : "bg-[#161616]"}>
                <th
                  scope="row"
                  className={`border-b border-[#2b2b2b] px-4 py-4 text-left text-sm font-medium ${theme.text}`}
                >
                  {row.feature}
                </th>
                <td
                  className={`border-b border-[#2b2b2b] px-4 py-4 text-sm ${theme.mutedText}`}
                >
                  {row.free}
                </td>
                <td
                  className={`border-b border-[#2b2b2b] px-4 py-4 text-sm ${theme.mutedText}`}
                >
                  {row.pro}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
