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
      <header className="border-b border-[#2f2a24] bg-[#0d0d0d]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-10 w-80" />
            <SkeletonBlock className="h-4 w-52" />
          </div>
          <div className="flex flex-wrap gap-3">
            <SkeletonBlock className="h-11 w-24" />
            <SkeletonBlock className="h-11 w-24" />
            <SkeletonBlock className="h-11 w-32" />
            <SkeletonBlock className="h-11 w-28" />
          </div>
        </div>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-[1600px] lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(246,196,83,0.18),_transparent_35%),linear-gradient(180deg,_#101010_0%,_#050505_100%)] px-6 py-8 sm:px-8">
          <div className="mx-auto flex max-w-[980px] flex-col gap-4">
            <SkeletonBlock className="h-12 w-full" />
            <div className="overflow-hidden rounded-[28px] border border-[#2f2a24] bg-[#0b0b0b] p-6 shadow-[0_32px_90px_rgba(0,0,0,0.45)]">
              <SkeletonBlock className="h-[860px] w-full bg-[#f3efe6]" />
            </div>
          </div>
        </section>
        <aside className="border-l border-[#2f2a24] bg-[#111111] p-6">
          <div className="space-y-4">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-20 w-full" />
          </div>
        </aside>
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
