"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { CalendarTask } from "@/types/operations"
import {
  fetchCalendarTasks,
  markCalendarTaskComplete,
  reassignCalendarTask,
  snoozeCalendarTask,
} from "@/services/calendar"
import { getActiveOrgId } from "@/lib/active-org"

export function useCalendar() {
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        setTasks([])
        return
      }

      const activeOrgId = getActiveOrgId()
      const orgId = activeOrgId
        ? activeOrgId
        : (
            await supabase
              .from("org_members")
              .select("organization_id")
              .eq("user_id", userData.user.id)
              .limit(1)
              .maybeSingle()
          ).data?.organization_id

      if (!orgId) {
        setTasks([])
        return
      }

      const calendarTasks = await fetchCalendarTasks(orgId)
      setTasks(calendarTasks)
      setSelectedTaskId((prev) => prev ?? calendarTasks[0]?.id ?? null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load calendar tasks.")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [])

  const selectedTask = useMemo(() => {
    return tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null
  }, [tasks, selectedTaskId])

  const upcomingTasks = useMemo(() => {
    if (!tasks.length) return []
    const now = new Date()
    const windowEnd = new Date()
    windowEnd.setDate(now.getDate() + 7)
    return tasks
      .filter((task) => {
        const due = new Date(task.dueDate)
        return due >= now && due <= windowEnd && task.status !== "done"
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [tasks])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const selectTask = useCallback((task: CalendarTask) => {
    setSelectedTaskId(task.id)
  }, [])

  async function handleAction(promise: Promise<CalendarTask>) {
    setActionLoading(true)
    setActionMessage(null)
    try {
      const updated = await promise
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)))
      setSelectedTaskId(updated.id)
      setActionMessage("Update saved.")
      return updated
    } catch (actionError) {
      setActionMessage(
        actionError instanceof Error ? actionError.message : "Unable to update calendar task."
      )
      throw actionError
    } finally {
      setActionLoading(false)
    }
  }

  const markComplete = useCallback(
    (task: CalendarTask) => {
      if (task.status === "done") return Promise.resolve(task)
      return handleAction(markCalendarTaskComplete(task.id))
    },
    []
  )

  const snooze = useCallback(
    (task: CalendarTask, days = 7) => {
      const due = new Date(task.dueDate)
      due.setDate(due.getDate() + days)
      const nextDate = due.toISOString().slice(0, 10)
      return handleAction(snoozeCalendarTask(task.id, nextDate))
    },
    []
  )

  const reassign = useCallback(
    (taskId: string, userId: string | null) => handleAction(reassignCalendarTask(taskId, userId)),
    []
  )

  return {
    tasks,
    selectedTask,
    upcomingTasks,
    loading,
    error,
    actionLoading,
    actionMessage,
    selectTask,
    markComplete,
    snooze,
    reassign,
    refresh,
  }
}
