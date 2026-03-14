"use client"

import { useEffect, useMemo, useState } from "react"
import { AuthPanel } from "@/components/auth-panel"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { DashboardHeader } from "@/components/dashboard-header"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionCard } from "@/components/ui/section-card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrainingModulePlayer } from "@/components/training/module-player"
import { createClient } from "@/utils/supabase/client"
import type { TrainingCompletion, TrainingModule } from "@/types/training"
import {
  fetchTrainingCompletionsForModule,
  fetchTrainingModuleById,
} from "@/services/training"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function TrainingModulePage({ moduleId }: { moduleId: string }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [module, setModule] = useState<TrainingModule | null>(null)
  const [completions, setCompletions] = useState<TrainingCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState("Organization")
  const [employeeName, setEmployeeName] = useState("Employee")

  const latestCompletion = useMemo(() => completions[0] ?? null, [completions])

  useEffect(() => {
    let active = true

    async function loadModule() {
      if (!currentUser) return
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData.user) {
          throw new Error("Sign in to access this module.")
        }

        const user = userData.user
        const email = user.email ?? ""
        const fallbackName = email ? email.split("@")[0] : "Employee"
        if (active) {
          setEmployeeName(fallbackName || "Employee")
        }

        const { data: membership, error: membershipError } = await supabase
          .from("org_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle()

        if (membershipError || !membership?.organization_id) {
          throw new Error("Complete organization setup to access training modules.")
        }

        const { data: orgData } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", membership.organization_id)
          .limit(1)
          .maybeSingle()

        if (active) {
          setOrganizationName(orgData?.name ?? "Organization")
        }

        const moduleData = await fetchTrainingModuleById(moduleId)
        if (!moduleData) {
          throw new Error("Training module not found.")
        }

        const completionsData = await fetchTrainingCompletionsForModule(user.id, moduleId)

        if (active) {
          setModule(moduleData)
          setCompletions(completionsData)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load module.")
          setModule(null)
          setCompletions([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadModule()

    return () => {
      active = false
    }
  }, [currentUser, moduleId])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Training module"
        title={module?.title ?? "Training module"}
        description={
          module?.description ??
          "Complete the HIPAA training module to update your compliance record."
        }
        navLinks={[{ label: "Back to library", href: "/training" }]}
      />

      <AuthPanel onAuth={setCurrentUser} />

      {!currentUser && (
        <AuthRequiredBanner message="Sign in to launch this training module." />
      )}

      <section className={currentUser ? "" : "pointer-events-none opacity-60"}>
        {loading ? (
          <div className="grid gap-4">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        ) : error ? (
          <EmptyState title="Unable to load module" description={error} />
        ) : module ? (
          <div className="grid gap-6">
            <SectionCard title="Module overview">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {module.moduleType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Estimated time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {module.estimatedMinutes} minutes
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Due date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {module.dueDate ? formatDate(module.dueDate) : "No due date"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Latest attempt
                  </p>
                  {latestCompletion ? (
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {latestCompletion.completedAt
                        ? formatDate(latestCompletion.completedAt)
                        : "In progress"}
                      {latestCompletion.score !== null
                        ? ` · ${latestCompletion.score}%`
                        : ""}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">No attempts yet</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Attempts
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {completions.length}
                  </p>
                </div>
              </div>
            </SectionCard>

            <TrainingModulePlayer
              module={module}
              employeeName={employeeName}
              organizationName={organizationName}
              previousAttempts={completions.length}
              onCompletion={async () => {
                const supabase = createClient()
                const { data: userData } = await supabase.auth.getUser()
                if (!userData.user) return
                const updated = await fetchTrainingCompletionsForModule(userData.user.id, moduleId)
                setCompletions(updated)
              }}
            />
          </div>
        ) : (
          <EmptyState
            title="Module not found"
            description="The training module you're looking for isn't available."
          />
        )}
      </section>
    </main>
  )
}
