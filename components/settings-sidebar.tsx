import type { AppPlan } from "@/lib/stripe/plans";
import { getDashboardThemeStyles } from "./dashboard-shell";

type SettingsSidebarProps = {
  currentPlan: AppPlan;
};

const SETTINGS_NAV_ITEMS = [
  { label: "Account", href: "#" },
  { label: "Billing", href: "#" },
  { label: "Subscription", href: "/settings/billing", active: true },
  { label: "Security", href: "#" },
  { label: "Integrations", href: "#" },
] as const;

export function SettingsSidebar({ currentPlan }: SettingsSidebarProps) {
  const theme = getDashboardThemeStyles("dark");

  return (
    <div className="flex h-full flex-col gap-6">
      <section className={`border ${theme.railBorder} ${theme.panelMuted} px-4 py-4`}>
        <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${theme.mutedText}`}>
          BACKSTAGE PRO
        </p>
        <p className={`mt-3 text-xl font-black tracking-[-0.06em] ${theme.text}`}>
          Settings
        </p>
        <p className={`mt-2 text-xs leading-6 ${theme.mutedText}`}>
          {currentPlan === "pro"
            ? "Proアカウントの支払いと更新をまとめて管理できます。"
            : "無料プランのままでも設定画面として確認できます。"}
        </p>
      </section>

      <nav aria-label="設定ナビゲーション">
        <ul className="space-y-2">
          {SETTINGS_NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.active ? (
                <a
                  href={item.href}
                  aria-current="page"
                  className={`flex items-center justify-between border ${theme.accentBorder} bg-[#f6c453] px-4 py-3 text-sm font-black text-[#1f1b16]`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.24em]">Current</span>
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className={`flex items-center justify-between border ${theme.railBorder} ${theme.panelMuted} px-4 py-3 text-sm font-medium ${theme.mutedText}`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.24em]">Soon</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <section className={`mt-auto border ${theme.railBorder} ${theme.panelMuted} px-4 py-4`}>
        <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
          SUBSCRIPTION
        </p>
        <p className={`mt-2 text-sm font-bold ${theme.text}`}>
          {currentPlan === "pro" ? "Pro active" : "Free active"}
        </p>
        <p className={`mt-2 text-xs leading-6 ${theme.mutedText}`}>
          今回のTask 2では、ナビゲーションとトップバーの器だけを用意しています。
        </p>
      </section>
    </div>
  );
}
