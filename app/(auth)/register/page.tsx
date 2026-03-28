import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f10] px-6 py-16 text-[#f6f3ee] [background-image:radial-gradient(circle_at_top,_rgba(246,196,83,0.16),_transparent_28%),linear-gradient(180deg,#0f0f10_0%,#151515_100%)]">
      <section className="w-full max-w-md">
        <AuthForm mode="register" />
      </section>
    </main>
  );
}
