import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      panelMeta="REGISTER / BACKSTAGE"
      panelTitle="REGISTER / BACKSTAGE"
      panelDescription="まずは無料で始めて、必要になったら公演の保存や運用を広げられます。"
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
