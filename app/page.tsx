import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();

  if (session?.user.id) {
    redirect("/events");
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#1f1b16] [background-image:radial-gradient(circle_at_top,_rgba(246,196,83,0.22),_transparent_28%),linear-gradient(180deg,#fffdf8_0%,#f4efe4_100%)]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.34em] text-[#7b7162]">
                Setlist PDF Service
              </p>
              <h1 className="max-w-2xl font-mono text-5xl font-black tracking-[-0.08em] sm:text-6xl">
                公演の流れを、PDFまでひとつにつなぐ。
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#5f5649]">
                無料で公演作成とPDF書き出しを始めて、必要になったらProでテンプレート保存を解放できます。
                日本語セットリストに合わせた軽い導線で、当日の準備をすばやく進めます。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#1f1b16] bg-[#f6c453] px-5 text-sm font-bold tracking-[0.14em] text-[#1f1b16] transition hover:bg-[#ffda78]"
              >
                アカウントを作成
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#1f1b16] bg-[#fffdf8] px-5 text-sm font-bold tracking-[0.14em] text-[#1f1b16] transition hover:bg-[#efe3c6]"
              >
                ログイン
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["公演作成", "最初の公演を作ると、そのまま進行表編集に入れます。"],
                ["PDF書き出し", "編集中のセットリストを印刷向けPDFに出力できます。"],
                ["テンプレート保存", "Proでよく使う構成を次回公演へ再利用できます。"],
              ].map(([title, description]) => (
                <article
                  key={title}
                  className="rounded-3xl border-2 border-[#1f1b16] bg-[#fffaf0] p-5 shadow-[0_18px_48px_rgba(60,41,9,0.06)]"
                >
                  <h2 className="font-mono text-lg font-black tracking-[-0.05em]">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#5f5649]">{description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border-2 border-[#1f1b16] bg-[#fffaf0] p-8 shadow-[0_28px_72px_rgba(60,41,9,0.12)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#7b7162]">
              MVP flow
            </p>
            <ol className="mt-6 space-y-4 text-sm leading-7 text-[#5f5649]">
              <li className="rounded-2xl border border-[#1f1b16] bg-[#f7f1e3] p-4">
                1. アカウントを作成してセットリスト編集を開始
              </li>
              <li className="rounded-2xl border border-[#1f1b16] bg-[#f7f1e3] p-4">
                2. 公演を複製して次の現場の下書きを素早く用意
              </li>
              <li className="rounded-2xl border border-[#1f1b16] bg-[#f7f1e3] p-4">
                3. PDFを書き出して、Proでテンプレート保存を追加
              </li>
            </ol>
          </aside>
        </div>
      </section>
    </main>
  );
}
