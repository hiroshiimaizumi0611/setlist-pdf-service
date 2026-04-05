import { DashboardShell, getDashboardThemeStyles } from "./dashboard-shell";

function SkeletonBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-sm bg-[#2a2824] ${className}`} />;
}

function ShellSectionLabel({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-[#91897c]">
        {label}
      </p>
      <div className="w-14 border-t border-dashed border-[#f6c453]" />
    </div>
  );
}

export function EditorLoadingShell() {
  const theme = getDashboardThemeStyles("dark");

  const sidebar = (
    <div className="space-y-3">
      <section className={`border ${theme.railBorder} ${theme.panelMuted} px-4 py-4`}>
        <ShellSectionLabel label="CURRENT SHOW" />
        <div className="mt-3 space-y-2.5">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-px w-full" />
          <SkeletonBlock className="h-3 w-32" />
        </div>
      </section>

      <div className="grid gap-2">
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-full" />
      </div>

      <section className="space-y-3">
        <ShellSectionLabel label="QUICK ACTIONS" />
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
          <SkeletonBlock className="h-10 w-24" />
          <SkeletonBlock className="h-10 w-24" />
        </>
      }
    >
      <section className={`overflow-hidden border-2 ${theme.border} ${theme.panelMuted}`}>
        <div className={`flex items-center justify-between gap-4 border-b ${theme.border} px-4 py-4`}>
          <div className="space-y-3">
            <ShellSectionLabel label="EVENT OVERVIEW" />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-52" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-24" />
            <SkeletonBlock className="h-9 w-24" />
          </div>
        </div>
        <div className="grid gap-px bg-[#2a2824] md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${theme.panel} px-4 py-4`}>
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="mt-2.5 h-10 w-full" />
            </div>
          ))}
          <div className={`${theme.panel} px-4 py-4 md:col-span-4`}>
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-2.5 h-20 w-full" />
          </div>
        </div>
      </section>

      <section className={`overflow-hidden border-2 ${theme.border} ${theme.panelMuted}`}>
        <div className={`border-b ${theme.border} px-4 py-4`}>
          <ShellSectionLabel label="SETLIST FILTERS" />
          <SkeletonBlock className="mt-3 h-10 w-full" />
        </div>
        <div className="px-4 py-4">
          <div className="grid gap-2.5 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-full" />
            ))}
            <SkeletonBlock className="h-10 w-28" />
          </div>
        </div>
      </section>

      <section className={`overflow-hidden border-2 ${theme.border} ${theme.panel}`}>
        <div className={`flex items-center justify-between border-b ${theme.border} px-4 py-4`}>
          <div className="space-y-3">
            <ShellSectionLabel label="SETLIST" />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-44" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
          </div>
          <SkeletonBlock className="h-8 w-14" />
        </div>
        <div className="divide-y divide-[#2a2824]">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid gap-3 px-4 py-4 md:grid-cols-[120px_minmax(0,1fr)_148px]">
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
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[linear-gradient(180deg,_rgba(15,15,16,0.98)_0%,_rgba(9,9,9,0.98)_100%)] px-6">
        <div
          role="status"
          aria-label="PDFプレビューの読み込み状況"
          className="flex w-full max-w-xl flex-col gap-5 border border-[#2f2a24] bg-[#111111]/96 px-7 py-8 shadow-[0_32px_90px_rgba(0,0,0,0.45)]"
        >
          <div className="space-y-3 text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-[#91897c]">
              PDF PREVIEW
            </p>
            <div className="mx-auto w-14 border-t border-dashed border-[#f6c453]" />
            <h1 className="font-mono text-2xl font-black tracking-[-0.06em]">
              PDFプレビューを準備中...
            </h1>
            <p className="mx-auto max-w-md text-sm leading-7 text-[#bfb7aa]">
              用紙レイアウトと埋め込みプレビューを読み込んでいます。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
            <section className="border border-[#2f2a24] bg-[#171717] px-4 py-4">
              <ShellSectionLabel label="PAGE PREVIEW" />
              <div className="mt-3 space-y-3">
                <SkeletonBlock className="h-3 w-24" />
                <div className="border border-[#2f2a24] bg-[#141414] p-3">
                  <SkeletonBlock className="h-52 w-full bg-[#24211d]" />
                </div>
              </div>
            </section>
            <section className="border border-[#2f2a24] bg-[#171717] px-4 py-4">
              <ShellSectionLabel label="EXPORT NOTES" />
              <div className="mt-3 space-y-2.5">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-5/6" />
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-10 w-full" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export function TemplatesLoadingShell() {
  const theme = getDashboardThemeStyles("dark");

  return (
    <main className={`${theme.page} min-h-screen px-4 py-20 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="space-y-3 border-l-4 border-[#353534] pl-4">
          <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
            TEMPLATE WORKSPACE
          </p>
          <h1 className="font-mono text-[2rem] font-black tracking-[-0.06em] sm:text-[2.45rem]">
            読み込み中...
          </h1>
          <p className={`max-w-3xl text-sm leading-7 ${theme.mutedText}`}>
            テンプレート管理を読み込んでいます。
          </p>
        </div>
        <section className={`overflow-hidden border-2 ${theme.border} ${theme.panelMuted}`}>
          <div className={`border-b ${theme.border} px-5 py-4`}>
            <ShellSectionLabel label="SOURCE EVENTS" />
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={`border ${theme.border} ${theme.panel} px-4 py-4`}>
                  <SkeletonBlock className="h-4 w-36" />
                  <SkeletonBlock className="mt-2.5 h-3 w-24" />
                  <SkeletonBlock className="mt-4 h-9 w-28" />
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-4">
            <ShellSectionLabel label="SAVED TEMPLATES" />
            <div className="mt-3 divide-y divide-[#2a2824] border border-[#2f2a24] bg-[#171717]">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_156px] md:items-center">
                  <div className="space-y-2.5">
                    <SkeletonBlock className="h-4 w-52" />
                    <SkeletonBlock className="h-3 w-full" />
                    <SkeletonBlock className="h-3 w-2/3" />
                  </div>
                  <SkeletonBlock className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
