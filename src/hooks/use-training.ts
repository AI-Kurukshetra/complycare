"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { TrainingCompletion, TrainingModule } from "@/types/training"
import { fetchTrainingCompletions, fetchTrainingModules } from "@/services/training"
import { getActiveOrgId } from "@/lib/active-org"

export function useTraining() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [completions, setCompletions] = useState<TrainingCompletion[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      setModules([])
      setCompletions([])
      setLoading(false)
      return
    }

    const userId = userData.user?.id
    if (!userId) {
      setModules([])
      setCompletions([])
      setLoading(false)
      return
    }

    const activeOrgId = getActiveOrgId()
    const orgId = activeOrgId
      ? activeOrgId
      : (
          await supabase
            .from("org_members")
            .select("organization_id")
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle()
        ).data?.organization_id

    if (!orgId) {
      setModules([])
      setCompletions([])
      setLoading(false)
      return
    }

    try {
      const [moduleData, completionData] = await Promise.all([
        fetchTrainingModules(orgId),
        fetchTrainingCompletions(userId),
      ])
      setModules(moduleData)
      setCompletions(completionData)
    } catch (error) {
      console.error("Failed to load training data", error)
      setModules([])
      setCompletions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const summary = useMemo(() => {
    const completionByModule = new Map(
      completions.map((completion) => [completion.moduleId, completion])
    )
    const requiredModules = modules.filter((module) => module.isRequired)
    const completedRequired = requiredModules.filter((module) => {
      const completion = completionByModule.get(module.id)
      if (!completion?.completedAt) return false
      if (completion.score === null) return false
      return completion.score >= module.passingScore
    })
    const averageScore = completions.length
      ? Math.round(
          completions.reduce((sum, completion) => sum + (completion.score ?? 0), 0) /
            completions.length
        )
      : 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdueCount = requiredModules.filter((module) => {
      const completion = completionByModule.get(module.id)
      if (!module.dueDate) return false
      const dueDate = new Date(module.dueDate)
      if (dueDate >= today) return false
      if (!completion?.completedAt) return true
      if (completion.score === null) return true
      return completion.score < module.passingScore
    }).length

    return {
      requiredTotal: requiredModules.length,
      requiredCompleted: completedRequired.length,
      averageScore,
      overdueCount,
    }
  }, [completions, modules])

  return {
    modules,
    completions,
    loading,
    summary,
    refresh,
  }
}
