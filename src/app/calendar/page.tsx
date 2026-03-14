"use client"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionCard } from "@/components/ui/section-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/dashboard-header"
import { ComplianceCalendar } from "@/components/calendar/compliance-calendar"
import { TaskDetailPanel } from "@/components/calendar/task-detail-panel"
import { useCalendar } from "@/hooks/use-calendar"

function formatDate(value: string) {
  const date = new Date(value)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function CalendarPage() {
  const {
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
  } = useCalendar()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 3 Calendar"
        title="Compliance calendar"
        description="View recurring deadlines, deadlines, and overdue items at a glance."
        navLinks={[{ label: "Training", href: "/training" }, { label: "Operations", href: "/operations" }]}
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        </div>
      </DashboardHeader>

      {error ? (
        <SectionCard>
          <EmptyState title="Unable to load calendar" description={error} />
        </SectionCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <SectionCard title="Calendar">
          {loading ? (
            <div className="grid gap-4">
              <Skeleton className="h-16 rounded-3xl" />
              <Skeleton className="h-96 rounded-3xl" />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No calendar tasks"
              description="Seeded tasks appear after you configure your organization."
            />
          ) : (
            <ComplianceCalendar
              tasks={tasks}
              selectedTaskId={selectedTask?.id ?? null}
              onSelect={selectTask}
            />
          )}
        </SectionCard>

        <div className="flex flex-col gap-6">
          <SectionCard title="Task details">
            <TaskDetailPanel
              task={selectedTask}
              actionLoading={actionLoading}
              actionMessage={actionMessage}
              onMarkComplete={markComplete}
              onSnooze={snooze}
              onReassign={reassign}
            />
          </SectionCard>

          <SectionCard title="Upcoming tasks" description="Next 7 days">
            {loading ? (
              <div className="grid gap-3">
                <Skeleton className="h-12 rounded-2xl" />
                <Skeleton className="h-12 rounded-2xl" />
              </div>
            ) : upcomingTasks.length === 0 ? (
              <EmptyState title="No upcoming tasks" description="You are caught up for the next week." />
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => selectTask(task)}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        Due {formatDate(task.dueDate)} · {task.taskType.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em]",
                        task.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {task.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  )
}
