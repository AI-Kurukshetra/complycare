"use client"

import { useEffect, useMemo, useState } from "react"
import { AuthPanel } from "@/components/auth-panel"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { DashboardHeader } from "@/components/dashboard-header"
import { TrainingModuleCard } from "@/components/training/module-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionCard } from "@/components/ui/section-card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/ui/stat-card"
import { useTraining } from "@/hooks/use-training"

export function TrainingLibrary() {
  const { modules, completions, loading, summary, refresh } = useTraining()
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const navLinks = [{ label: "Admin view", href: "/training/admin" }]

  useEffect(() => {
    if (currentUser) {
      void refresh()
    }
  }, [currentUser, refresh])

  const completionByModule = useMemo(() => {
    return new Map(completions.map((completion) => [completion.moduleId, completion]))
  }, [completions])

  const progressPercent = summary.requiredTotal
    ? Math.round((summary.requiredCompleted / summary.requiredTotal) * 100)
    : 0

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 2 Training"
        title="Employee Training"
        description="Assign HIPAA training modules, track completion status, and issue certificates."
        navLinks={navLinks}
      />

      <AuthPanel onAuth={setCurrentUser} />
      {!currentUser && <AuthRequiredBanner message="Sign in to view your training assignments." />}

      <section className={currentUser ? "" : "pointer-events-none opacity-60"}>
        <SectionCard
          title="Required training progress"
          description="Completion for modules marked required for your organization."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Required completed"
              value={`${summary.requiredCompleted} / ${summary.requiredTotal}`}
            />
            <StatCard label="Average score" value={`${summary.averageScore}%`} />
            <StatCard
              label="Overdue modules"
              value={summary.overdueCount}
              valueClassName={summary.overdueCount > 0 ? "text-rose-600" : "text-slate-900"}
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{progressPercent}% complete</span>
              <span>
                {summary.requiredCompleted} of {summary.requiredTotal} required modules
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-cyan-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </SectionCard>
      </section>

      <section className={currentUser ? "" : "pointer-events-none opacity-60"}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Training module library</h2>
          <p className="text-sm text-slate-500">{modules.length} modules</p>
        </div>

        {loading ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        ) : modules.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No training modules yet"
              description="Create your first HIPAA module to start assigning training."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {modules.map((module) => (
              <TrainingModuleCard
                key={module.id}
                module={module}
                completion={completionByModule.get(module.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
