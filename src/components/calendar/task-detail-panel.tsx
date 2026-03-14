"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import type { CalendarTask } from "@/types/operations"

type Props = {
  task: CalendarTask | null
  actionLoading: boolean
  actionMessage: string | null
  onMarkComplete: (task: CalendarTask) => Promise<CalendarTask>
  onSnooze: (task: CalendarTask, days?: number) => Promise<CalendarTask>
  onReassign: (taskId: string, assignedTo: string | null) => Promise<CalendarTask>
}

const recurrenceLabels: Record<string, string> = {
  none: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  annually: "Annually",
}

export function TaskDetailPanel({
  task,
  actionLoading,
  actionMessage,
  onMarkComplete,
  onSnooze,
  onReassign,
}: Props) {
  const [assignee, setAssignee] = useState(task?.assignedTo ?? "")

  useEffect(() => {
    function sync() { setAssignee(task?.assignedTo ?? "") }
    sync()
  }, [task])

  if (!task) {
    return <EmptyState title="No task selected" description="Pick a task from the calendar." />
  }

  const dueDate = new Date(task.dueDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  const badgeClass = task.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"

  return (
    <div className="flex flex-col gap-4 text-sm text-slate-700">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
        <div className={cn("mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", badgeClass)}>
          {task.status}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Type</p>
        <p className="text-lg font-semibold text-slate-900">{task.taskType.replace(/_/g, " ")}</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Due</p>
          <p className="text-base font-semibold text-slate-900">{dueDate}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recurrence</p>
          <p className="text-sm text-slate-500">{recurrenceLabels[task.recurrenceRule] ?? "Custom"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Notifications</p>
          <p className="text-sm text-slate-500">
            Remind {task.notificationDaysBefore.join(", ")} day(s) before due date
          </p>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Assigned to</label>
        <div className="mt-1 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            placeholder="User ID"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => void onReassign(task.id, assignee.trim() || null)}
            disabled={actionLoading}
          >
            Reassign
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void onMarkComplete(task)} disabled={task.status === "done" || actionLoading}>
          Mark complete
        </Button>
        <Button size="sm" variant="outline" onClick={() => void onSnooze(task, 7)} disabled={actionLoading}>
          Snooze 7 days
        </Button>
      </div>

      {task.completedAt ? (
        <p className="text-xs text-slate-500">Completed at {new Date(task.completedAt).toLocaleString()}</p>
      ) : null}

      {actionMessage ? <p className="text-xs text-slate-600">{actionMessage}</p> : null}
    </div>
  )
}
