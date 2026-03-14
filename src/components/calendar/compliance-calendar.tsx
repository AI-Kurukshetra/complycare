"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CalendarTask } from "@/types/operations"

const typeBadges: Record<string, string> = {
  policy_review: "border-sky-200 bg-sky-50 text-sky-700",
  training_renewal: "border-orange-200 bg-orange-50 text-orange-700",
  risk_assessment: "border-teal-200 bg-teal-50 text-teal-700",
  vulnerability_scan: "border-rose-200 bg-rose-50 text-rose-700",
  baa_renewal: "border-indigo-200 bg-indigo-50 text-indigo-700",
  custom: "border-slate-200 bg-slate-50 text-slate-700",
}

type CalendarView = "month" | "week" | "day"

type Props = {
  tasks: CalendarTask[]
  selectedTaskId?: string | null
  onSelect: (task: CalendarTask) => void
}

function formatIso(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatTitle(view: CalendarView, focusedDate: Date) {
  if (view === "month") {
    return focusedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }
  return focusedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function getRange(view: CalendarView, focusedDate: Date) {
  if (view === "month") {
    const first = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1)
    const offset = first.getDay()
    first.setDate(first.getDate() - offset)
    return Array.from({ length: 42 }).map((_, index) => {
      const date = new Date(first)
      date.setDate(first.getDate() + index)
      return date
    })
  }

  if (view === "week") {
    const first = new Date(focusedDate)
    const offset = first.getDay()
    first.setDate(first.getDate() - offset)
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(first)
      date.setDate(first.getDate() + index)
      return date
    })
  }

  return [new Date(focusedDate)]
}

export function ComplianceCalendar({ tasks, selectedTaskId, onSelect }: Props) {
  const [view, setView] = useState<CalendarView>("month")
  const [focusedDate, setFocusedDate] = useState(() => new Date())

  const todayIso = useMemo(() => formatIso(new Date()), [])

  const tasksByDate = useMemo(() => {
    const map = new Map<string, CalendarTask[]>()
    tasks.forEach((task) => {
      const list = map.get(task.dueDate) ?? []
      list.push(task)
      map.set(task.dueDate, list)
    })
    return map
  }, [tasks])

  const rangeDates = useMemo(() => getRange(view, focusedDate), [view, focusedDate])

  const handleShift = (direction: "prev" | "next") => {
    const next = new Date(focusedDate)
    if (view === "month") {
      next.setMonth(focusedDate.getMonth() + (direction === "prev" ? -1 : 1))
    } else if (view === "week") {
      next.setDate(focusedDate.getDate() + (direction === "prev" ? -7 : 7))
    } else {
      next.setDate(focusedDate.getDate() + (direction === "prev" ? -1 : 1))
    }
    setFocusedDate(next)
  }

  const renderTasks = (dateIso: string) => {
    const items = tasksByDate.get(dateIso) ?? []
    return items.map((task) => {
      const isSelected = selectedTaskId === task.id
      const badge = typeBadges[task.taskType] ?? typeBadges.custom
      const statusBg = task.status === "done" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-700"
      return (
        <button
          key={task.id}
          type="button"
          onClick={() => onSelect(task)}
          className={cn(
            "w-full rounded-2xl border px-3 py-1 text-left text-xs font-semibold",
            badge,
            statusBg,
            isSelected ? "border-cyan-500" : "border-transparent",
            "hover:border-slate-300"
          )}
        >
          <span className="block">{task.title}</span>
          <span className="text-[0.6rem] uppercase tracking-[0.2em]">{task.status}</span>
        </button>
      )
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["month", "week", "day"] as CalendarView[]).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={view === option ? "default" : "outline"}
              onClick={() => setView(option)}
            >
              {option}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Button size="icon" variant="ghost" onClick={() => handleShift("prev")}>
            ‹
          </Button>
          <span className="text-base font-semibold text-slate-900">{formatTitle(view, focusedDate)}</span>
          <Button size="icon" variant="ghost" onClick={() => handleShift("next")}>
            ›
          </Button>
        </div>
      </div>

      {view === "month" ? (
        <div className="overflow-x-auto">
          <div className="min-w-[700px] grid grid-cols-7 gap-2 text-xs text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold">
                {day}
              </div>
            ))}
            {rangeDates.map((date) => {
              const iso = formatIso(date)
              const tasksForDate = renderTasks(iso)
              const isCurrentMonth = date.getMonth() === focusedDate.getMonth()
              return (
                <div
                  key={iso}
                  className={cn(
                    "flex h-28 flex-col gap-1 rounded-2xl border p-2",
                    isCurrentMonth ? "border-slate-200 bg-white" : "border-transparent bg-slate-50",
                    iso === todayIso ? "border-cyan-500/50 bg-cyan-50" : ""
                  )}
                >
                  <span className="text-xs font-semibold text-slate-600">
                    {date.getDate()}
                  </span>
                  <div className="flex flex-col gap-1 overflow-hidden text-[0.6rem]">
                    {tasksForDate.length ? tasksForDate : <span className="text-slate-400">No tasks</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rangeDates.map((date) => {
            const iso = formatIso(date)
            const tasksForDate = tasksByDate.get(iso) ?? []
            return (
              <div key={iso} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>
                    {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </span>
                  <span className="text-xs text-slate-500">
                    {tasksForDate.length} task{tasksForDate.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {tasksForDate.length ? (
                    tasksForDate.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-sm",
                          selectedTaskId === task.id ? "border-cyan-500" : "border-slate-200"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          <span className="text-xs text-slate-500">{task.status}</span>
                        </div>
                        <button
                          type="button"
                          className="text-xs text-slate-500"
                          onClick={() => onSelect(task)}
                        >
                          View details
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No tasks scheduled.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
