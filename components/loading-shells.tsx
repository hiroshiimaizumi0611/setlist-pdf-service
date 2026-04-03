import { DashboardShell, getDashboardThemeStyles } from "./dashboard-shell";

function SkeletonBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-sm bg-[#2a2824] ${className}`} />;
}

export function EditorLoadingShell() {
  const theme = getDashboardThemeStyles("dark");

  const sidebar = (
    <div className="space-y-3">
      <section className={`border ${theme.railBorder} ${theme.panelMuted} px-4 py-4`}>
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="mt-3 h-3 w-24" />
        <SkeletonBlock className="mt-5 h-px w-full" />
        <SkeletonBlock className="mt-3 h-3 w-32" />
      </section>

      <SkeletonBlock className="h-11 w-full" />
      <SkeletonBlock className="h-11 w-full" />

      <section className="space-y-2">
        <SkeletonBlock className="h-3 w-28" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`border ${theme.railBorder} ${theme.panelMuted} px-3 py-3`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <SkeletonBlock className="h-4 w-36" />
                <SkeletonBlock className="h-3 w-28" />
              </div>
              <SkeletonBlock className="h-7 w-10" />
            </div>
            <div className="mt-3 flex gap-2">
              <SkeletonBlock className="h-8 w-16" />
              <SkeletonBlock className="h-8 w-16" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );

  return (
    <DashboardShell
      currentTheme="dark"
      sidebar={sidebar}
      eyebrow="技術進行シート"
      title="読み込み中..."
      description="公演情報とセットリストを読み込んでいます。"
      headerActions={
        <>
          <SkeletonBlock className="h-11 w-28" />
          <SkeletonBlock className="h-11 w-28" />
        </>
      }
    >
      <section className={`overflow-hidden border-2 ${theme.border} ${theme.panelMuted}`}>
        <div className={`flex items-center justify-between gap-4 border-b ${theme.border} px-4 py-4`}>
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-4 w-52" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-10 w-28" />
            <SkeletonBlock className="h-10 w-28" />
          </div>
        </div>
        <div className="grid gap-px bg-[#2a2824] md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${theme.panel} px-4 py-4`}>
              <SkeletonBlock className="h-3 w-16" />
              <SkeletonBlock className="mt-3 h-10 w-full" />
            </div>
          ))}
          <div className={`${theme.panel} px-4 py-4 md:col-span-4`}>
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="mt-3 h-24 w-full" />
          </div>
        </div>
      </section>

      <section className={`overflow-hidden border-2 ${theme.border} ${theme.panelMuted}`}>
        <div className={`border-b ${theme.border} px-4 py-4`}>
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="mt-3 h-11 w-full" />
        </div>
        <div className="px-4 py-4">
          <div className="grid gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-full" />
            ))}
            <SkeletonBlock className="h-10 w-32" />
          </div>
        </div>
      </section>

      <section className={`overflow-hidden border-2 ${theme.border} ${theme.panel}`}>
        <div className={`flex items-center justify-between border-b ${theme.border} px-4 py-4`}>
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-4 w-44" />
          </div>
          <SkeletonBlock className="h-8 w-16" />
        </div>
        <div className="divide-y divide-[#2a2824]">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid gap-4 px-4 py-4 md:grid-cols-[120px_minmax(0,1fr)_160px]">
              <SkeletonBlock className="h-12 w-full" />
              <SkeletonBlock className="h-12 w-full" />
              <div className="flex gap-2">
                <SkeletonBlock className="h-9 w-16" />
                <SkeletonBlock className="h-9 w-16" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

export function PdfPreviewLoadingShell() {
  return (
    <main className="min-h-screen bg-[#111111] text-[#f6f3ee]">
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(246,196,83,0.18),_transparent_30%),linear-gradient(180deg,_#101010_0%,_#050505_100%)] px-6">
        <div
          role="status"
          aria-label="PDFプレビューの読み込み状況"
          className="flex w-full max-w-lg flex-col items-center gap-5 border border-[#2f2a24] bg-[#111111]/95 px-8 py-10 text-center shadow-[0_32px_90px_rgba(0,0,0,0.45)]"
        >
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#2f2a24] border-t-[#f6c453]" />
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#91897c]">
              PDF Preview
            </p>
            <h1 className="font-mono text-2xl font-black tracking-[-0.06em]">
              PDFプレビューを準備中...
            </h1>
            <p className="text-sm leading-7 text-[#bfb7aa]">
              用紙レイアウトと埋め込みプレビューを読み込んでいます。
            </p>
          </div>
          <div className="w-full space-y-3">
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
            <div className="pt-2">
              <SkeletonBlock className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function TemplatesLoadingShell() {
  const theme = getDashboardThemeStyles("dark");

  return (
    <main className={`${theme.page} min-h-screen px-4 py-24 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-10 w-72" />
          <SkeletonBlock className="h-4 w-[28rem]" />
        </div>
        <section className={`overflow-hidden border-2 ${theme.border} ${theme.panel}`}>
          <div className="divide-y divide-[#2a2824]">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="grid gap-6 px-6 py-6 md:grid-cols-[1.5fr_auto]">
                <div className="space-y-3">
                  <SkeletonBlock className="h-8 w-56" />
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-3/4" />
                </div>
                <div className="flex items-center">
                  <SkeletonBlock className="h-11 w-40" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
