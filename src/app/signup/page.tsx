import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start with secure access for your compliance team."
      backHref="/login"
      backLabel="Sign in"
    >
      <SignUpForm />
    </AuthShell>
  )
}
