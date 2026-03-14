"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionCard } from "@/components/ui/section-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type AdminMember = {
  userId: string
  email: string
  role: string
}

type AdminModule = {
  id: string
  title: string
  passingScore: number
  isRequired: boolean
  dueDate: string | null
  moduleType: string
  estimatedMinutes: number
}

type AdminCompletion = {
  id: string
  moduleId: string
  userId: string
  score: number | null
  completedAt: string | null
  attempts: number
}

type AdminData = {
  organizationId: string
  members: AdminMember[]
  modules: AdminModule[]
  completions: AdminCompletion[]
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function TrainingAdminTable({ enabled }: { enabled: boolean }) {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      if (!enabled) return
      setLoading(true)
      setError(null)
      setMessage(null)
      try {
        const response = await fetch("/api/training/admin")
        const payload = (await response.json()) as AdminData & { error?: string }
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load training data.")
        }
        if (active) setData(payload)
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load data.")
          setData(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [enabled])

  const requiredModules = useMemo(
    () => (data?.modules ?? []).filter((module) => module.isRequired),
    [data]
  )

  const completionLookup = useMemo(() => {
    const map = new Map<string, AdminCompletion>()
    data?.completions.forEach((completion) => {
      const key = `${completion.userId}:${completion.moduleId}`
      const existing = map.get(key)
      if (!existing) {
        map.set(key, completion)
        return
      }
      const existingDate = existing.completedAt ? new Date(existing.completedAt) : null
      const candidateDate = completion.completedAt ? new Date(completion.completedAt) : null
      if (candidateDate && (!existingDate || candidateDate > existingDate)) {
        map.set(key, completion)
      }
    })
    return map
  }, [data])

  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const overdueItems = useMemo(() => {
    if (!data) return [] as { userId: string; moduleId: string }[]
    const items: { userId: string; moduleId: string }[] = []
    data.members.forEach((member) => {
      requiredModules.forEach((module) => {
        if (!module.dueDate) return
        const dueDate = new Date(module.dueDate)
        if (dueDate >= today) return
        const completion = completionLookup.get(`${member.userId}:${module.id}`)
        const passed = completion && completion.score !== null && completion.score >= module.passingScore
        if (!passed) {
          items.push({ userId: member.userId, moduleId: module.id })
        }
      })
    })
    return items
  }, [completionLookup, data, requiredModules, today])

  const aggregateStats = useMemo(() => {
    if (!data) {
      return {
        completionRate: 0,
        averageScore: 0,
        overdueCount: 0,
        moduleSummaries: [] as { id: string; title: string; avgScore: number; incomplete: number }[],
      }
    }

    const totalRequired = requiredModules.length * data.members.length
    let completedRequired = 0

    const moduleSummaries = requiredModules.map((module) => {
      const completions = data.completions.filter((completion) => completion.moduleId === module.id)
      const scores = completions
        .map((completion) => completion.score)
        .filter((score): score is number => typeof score === "number")
      const avgScore = scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0

      let incomplete = 0
      data.members.forEach((member) => {
        const completion = completionLookup.get(`${member.userId}:${module.id}`)
        const passed = completion && completion.score !== null && completion.score >= module.passingScore
        if (passed) {
          completedRequired += 1
        } else {
          incomplete += 1
        }
      })

      return { id: module.id, title: module.title, avgScore, incomplete }
    })

    const completionRate = totalRequired ? Math.round((completedRequired / totalRequired) * 100) : 0
    const averageScore = moduleSummaries.length
      ? Math.round(
          moduleSummaries.reduce((sum, module) => sum + module.avgScore, 0) / moduleSummaries.length
        )
      : 0

    return {
      completionRate,
      averageScore,
      overdueCount: overdueItems.length,
      moduleSummaries,
    }
  }, [completionLookup, data, overdueItems.length, requiredModules])

  async function handleSendReminders() {
    if (!data) return
    setSending(true)
    setMessage(null)
    try {
      const response = await fetch("/api/training/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: data.organizationId, overdue: overdueItems }),
      })
      const payload = (await response.json()) as { ok?: boolean; warning?: string; error?: string }
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send reminders.")
      }
      if (payload.warning) {
        setMessage(payload.warning)
      } else {
        setMessage("Reminders queued for overdue modules.")
      }
    } catch (sendError) {
      setMessage(sendError instanceof Error ? sendError.message : "Unable to send reminders.")
    } finally {
      setSending(false)
    }
  }

  if (!enabled) return null

  if (loading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Unable to load training admin view" description={error} />
  }

  if (!data) {
    return (
      <EmptyState
        title="No training data"
        description="Create training modules to populate the admin view."
      />
    )
  }

  return (
    <div className="grid gap-6">
      <SectionCard title="Training completion overview">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid gap-2 text-sm text-slate-600">
            <p>
              Completion rate <span className="font-semibold text-slate-900">{aggregateStats.completionRate}%</span>
            </p>
            <p>
              Average score <span className="font-semibold text-slate-900">{aggregateStats.averageScore}%</span>
            </p>
            <p>
              Overdue assignments <span className="font-semibold text-rose-600">{aggregateStats.overdueCount}</span>
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Button size="sm" onClick={handleSendReminders} disabled={sending || overdueItems.length === 0}>
              Send Reminder
            </Button>
            {message ? <p className="text-xs text-slate-500">{message}</p> : null}
            {overdueItems.length === 0 ? (
              <p className="text-xs text-slate-500">No overdue modules.</p>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Module performance">
        <div className="grid gap-2">
          {aggregateStats.moduleSummaries.map((module) => (
            <div
              key={module.id}
              className="flex flex-wrap items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-slate-900">{module.title}</p>
                <p className="text-xs text-slate-500">Average score {module.avgScore}%</p>
              </div>
              <div
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  module.incomplete > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                )}
              >
                {module.incomplete} incomplete
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Employee completion matrix" description="Required modules only">
        {requiredModules.length === 0 ? (
          <EmptyState
            title="No required modules"
            description="Mark a module as required to track completion."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  {requiredModules.map((module) => (
                    <th key={module.id} className="px-4 py-3">
                      {module.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.members.map((member) => (
                  <tr key={member.userId} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{member.email}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </td>
                    {requiredModules.map((module) => {
                      const completion = completionLookup.get(`${member.userId}:${module.id}`)
                      const hasAttempt = Boolean(completion)
                      const passed =
                        completion && completion.score !== null && completion.score >= module.passingScore
                      const scoreLabel =
                        completion?.score !== null && completion?.score !== undefined
                          ? `${completion.score}%`
                          : "No score"
                      const overdue =
                        !passed && module.dueDate ? new Date(module.dueDate) < today : false
                      const statusLabel = passed
                        ? "Completed"
                        : overdue
                          ? "Overdue"
                          : hasAttempt
                            ? "In progress"
                            : "Not started"

                      return (
                        <td key={module.id} className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={cn(
                                "rounded-full px-3 py-1 text-xs font-semibold",
                                passed
                                  ? "bg-emerald-100 text-emerald-700"
                                  : overdue
                                    ? "bg-rose-100 text-rose-700"
                                    : hasAttempt
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-100 text-slate-600"
                              )}
                            >
                              {statusLabel}
                            </span>
                            <span className="text-xs text-slate-500">
                              {completion?.completedAt ? formatDate(completion.completedAt) : scoreLabel}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
