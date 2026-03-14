import { AuthShell } from "@/components/auth/auth-shell"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      description="Use the secure link from your email to finish reset."
      backHref="/login"
      backLabel="Sign in"
    >
      <UpdatePasswordForm />
    </AuthShell>
  )
}
