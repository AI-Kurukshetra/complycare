"use client"

import { useState } from "react"
import { AuthPanel } from "@/components/auth-panel"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { DashboardHeader } from "@/components/dashboard-header"
import { TrainingAdminTable } from "@/components/training/training-admin-table"

export default function TrainingAdminPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Training admin"
        title="Employee Training Oversight"
        description="Track required HIPAA training completion, identify overdue modules, and send reminders."
        navLinks={[{ label: "Training library", href: "/training" }]}
      />

      <AuthPanel onAuth={setCurrentUser} />

      {!currentUser && (
        <AuthRequiredBanner message="Sign in to access training compliance analytics." />
      )}

      <section className={currentUser ? "" : "pointer-events-none opacity-60"}>
        <TrainingAdminTable enabled={Boolean(currentUser)} />
      </section>
    </main>
  )
}
