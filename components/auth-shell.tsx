import type { ReactNode } from "react";

type AuthShellProps = {
  panelTitle: string;
  panelDescription: string;
  panelMeta?: string;
  children: ReactNode;
};

const featureCards = [
  {
    title: "PDFをすぐ出力",
    description: "リハ前の差し替えも、現場でそのまま共有できる出力設計。",
  },
  {
    title: "複製して再利用",
    description: "公演ごとのテンプレートを流用して、立ち上げを早くする。",
  },
  {
    title: "本番用の保存感",
    description: "操作の流れを崩さず、制作チームの仕事場として使える。",
  },
] as const;

export function AuthShell({
  panelTitle,
  panelDescription,
  panelMeta = "BACKSTAGE ACCESS",
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#0c0c0d] text-[#f6f3ee] [background-image:radial-gradient(circle_at_top,_rgba(246,196,83,0.14),_transparent_30%),linear-gradient(180deg,#0c0c0d_0%,#111112_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-[#f6c453]">
            SHOWRUNNER
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#948a7b]">
            backstage / auth
          </p>
        </header>

        <section className="flex flex-1 items-center py-8 sm:py-10 lg:py-14">
          <div className="grid w-full gap-5 lg:grid-cols-[1.18fr_minmax(360px,0.82fr)]">
            <aside className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,24,0.98)_0%,rgba(18,18,18,0.98)_100%)] shadow-[0_32px_90px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,196,83,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_32%)]" />
              <div className="relative flex min-h-full flex-col justify-between gap-10 p-8 sm:p-10 lg:p-12">
                <div className="space-y-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.38em] text-[#b2a898]">
                    Production backstage / setlist ops
                  </p>
                  <div className="max-w-xl space-y-4">
                    <h1 className="text-4xl font-semibold tracking-tight text-[#f8f5f0] sm:text-5xl lg:text-6xl">
                      現場のためのセットリスト作成。
                    </h1>
                    <p className="max-w-lg text-base leading-7 text-[#c8c0b4] sm:text-lg">
                      進行、出力、複製、共有までをひとつの作業場にまとめ、
                      公演の準備を速く、静かに、確実に進めます。
                    </p>
                  </div>

                  <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
                      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#f6c453]">
                        Free tier
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#ece6db]">
                        無料で本番用PDFまで作成できるから、まずは小さく試せます。
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
                      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#f6c453]">
                        Workflow
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#ece6db]">
                        複製と保存を前提にした、現場向けの運用に馴染む構成です。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-[#c7bfb3] sm:grid-cols-3">
                  {featureCards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur"
                    >
                      <p className="text-sm font-medium text-[#f8f5f0]">{card.title}</p>
                      <p className="mt-2 leading-6">{card.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#171717]/98 shadow-[0_32px_90px_rgba(0,0,0,0.38)]">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,196,83,0.05)_0%,transparent_32%)]" />
              <div className="relative flex h-full flex-col p-6 sm:p-8 lg:p-10">
                <div className="space-y-2 border-b border-white/10 pb-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.38em] text-[#f6c453]">
                    {panelMeta}
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#f8f5f0]">
                    {panelTitle}
                  </h2>
                  <p className="max-w-md text-sm leading-6 text-[#c9c1b5]">{panelDescription}</p>
                </div>

                <div className="flex-1 py-6 sm:py-8">{children}</div>

                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-[11px] uppercase tracking-[0.28em] text-[#8f8577]">
                  <span>Secure session</span>
                  <span>/events handoff</span>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
