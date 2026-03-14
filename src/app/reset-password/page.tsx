import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="We will send a secure reset link to your email."
      backHref="/login"
      backLabel="Sign in"
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
