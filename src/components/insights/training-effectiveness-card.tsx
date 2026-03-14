"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"

type TrainingStats = {
  completionRate: number
  completedCount: number
  totalAssignments: number
  openIncidents: number
}

function RateBar({ rate, colorClass }: { rate: number; colorClass: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${rate}%` }}
      />
    </div>
  )
}

export function TrainingEffectivenessCard({ active = false }: { active?: boolean }) {
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!active) return
    const supabase = createClient()

    async function load() {
      setLoading(true)
      try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: membership } = await supabase
        .from("org_members")
        .select("organization_id")
        .eq("user_id", userData.user.id)
        .limit(1)
        .maybeSingle()

      if (!membership?.organization_id) return
      const orgId = membership.organization_id

      const [{ data: members }, { data: requiredModules }, { data: openIncidents }] =
        await Promise.all([
          supabase
            .from("org_members")
            .select("user_id")
            .eq("organization_id", orgId)
            .limit(LIST_LIMIT),
          supabase
            .from("training_sims")
            .select("id, passing_score")
            .eq("organization_id", orgId)
            .eq("is_required", true)
            .limit(LIST_LIMIT),
          supabase
            .from("incidents")
            .select("id")
            .eq("organization_id", orgId)
            .eq("status", "open")
            .limit(LIST_LIMIT),
        ])

      const memberIds = (members ?? []).map((m) => m.user_id)
      const moduleIds = new Set((requiredModules ?? []).map((m) => m.id))
      const passingScores = new Map(
        (requiredModules ?? []).map((m) => [m.id, m.passing_score ?? 0])
      )

      const totalAssignments = moduleIds.size * memberIds.length

      if (totalAssignments === 0) {
        setStats({
          completionRate: 0,
          completedCount: 0,
          totalAssignments: 0,
          openIncidents: (openIncidents ?? []).length,
        })
        return
      }

      const { data: completions } = await supabase
        .from("training_completions")
        .select("user_id, module_id, score, completed_at")
        .in("user_id", memberIds)
        .limit(LIST_LIMIT)

      const passed = (completions ?? []).filter(
        (c) =>
          moduleIds.has(c.module_id) &&
          c.completed_at &&
          (c.score ?? 0) >= (passingScores.get(c.module_id) ?? 0)
      ).length

      setStats({
        completionRate: Math.round((passed / totalAssignments) * 100),
        completedCount: passed,
        totalAssignments,
        openIncidents: (openIncidents ?? []).length,
      })
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [active])

  function getInsight(stats: TrainingStats): { text: string; color: string } {
    if (stats.completionRate >= 80 && stats.openIncidents <= 2) {
      return {
        text: "Strong training coverage correlates with your low incident count.",
        color: "text-emerald-700",
      }
    }
    if (stats.completionRate < 50 && stats.openIncidents >= 3) {
      return {
        text: "Low training completion is likely contributing to open incident risk.",
        color: "text-rose-700",
      }
    }
    if (stats.completionRate >= 75) {
      return {
        text: "Training coverage is solid. Focus on resolving open incidents.",
        color: "text-amber-700",
      }
    }
    return {
      text: "Improving training completion reduces breach probability by up to 60%.",
      color: "text-slate-600",
    }
  }

  const trainingBarColor =
    !stats || stats.completionRate < 50
      ? "bg-rose-400"
      : stats.completionRate < 75
        ? "bg-amber-400"
        : "bg-emerald-400"

  const incidentColor =
    !stats || stats.openIncidents === 0
      ? "text-emerald-700"
      : stats.openIncidents <= 2
        ? "text-amber-700"
        : "text-rose-700"

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Training effectiveness</p>
        <p className="text-xs text-slate-500">
          Completion rate vs. open incident correlation.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      ) : !stats ? (
        <p className="text-sm text-slate-400">No training data yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Training completion */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-end justify-between">
              <p className="text-xs font-medium text-slate-500">Required training complete</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completionRate}%</p>
            </div>
            <RateBar rate={stats.completionRate} colorClass={trainingBarColor} />
            <p className="mt-1.5 text-right text-xs text-slate-400">
              {stats.completedCount} / {stats.totalAssignments} assignments
            </p>
          </div>

          {/* Open incidents */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Open incidents</p>
              <p className={`text-2xl font-bold ${incidentColor}`}>{stats.openIncidents}</p>
            </div>
            <RateBar
              rate={Math.min(100, stats.openIncidents * 20)}
              colorClass={stats.openIncidents === 0 ? "bg-emerald-400" : stats.openIncidents <= 2 ? "bg-amber-400" : "bg-rose-400"}
            />
          </div>

          {/* Insight */}
          <p className={`text-xs ${getInsight(stats).color}`}>{getInsight(stats).text}</p>
        </div>
      )}
    </div>
  )
}
