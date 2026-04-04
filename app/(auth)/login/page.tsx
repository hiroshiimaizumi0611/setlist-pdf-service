import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      panelMeta="LOGIN / BACKSTAGE"
      panelTitle="LOGIN / BACKSTAGE"
      panelDescription="公演の管理画面に入って、セットリストの作成と出力を続けます。"
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
