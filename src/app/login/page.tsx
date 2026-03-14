import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to ComplyCare"
      description="Access production-safe compliance workflows."
    >
      <SignInForm />
    </AuthShell>
  )
}
