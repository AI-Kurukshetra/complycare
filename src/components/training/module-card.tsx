import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TrainingCompletion, TrainingModule } from "@/types/training"

const moduleTypeLabels: Record<string, string> = {
  video: "Video",
  quiz: "Quiz",
  scenario: "Scenario",
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

export function TrainingModuleCard({
  module,
  completion,
}: {
  module: TrainingModule
  completion?: TrainingCompletion
}) {
  const hasAttempt = Boolean(completion)
  const hasCompletion = Boolean(completion?.completedAt)
  const passed = hasCompletion
    ? (completion?.score ?? 0) >= module.passingScore
    : false
  const statusLabel = hasCompletion
    ? passed
      ? `Completed · ${completion?.score ?? 0}%`
      : `Needs retry · ${completion?.score ?? 0}%`
    : hasAttempt
      ? "In progress"
      : "Not started"

  const statusClass = hasCompletion
    ? passed
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700"
    : hasAttempt
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdue =
    !passed && module.dueDate ? new Date(module.dueDate) < today : false

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            {moduleTypeLabels[module.moduleType] ?? "Module"}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{module.title}</h3>
          {module.description ? (
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            module.isRequired ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
          )}
        >
          {module.isRequired ? "Required" : "Optional"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">
          Est. {module.estimatedMinutes} min
        </span>
        {module.dueDate ? (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Due {formatDate(module.dueDate)}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusClass)}>
          {statusLabel}
        </span>
        {overdue ? (
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
            Overdue
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        <Button asChild size="sm">
          <Link href={`/training/${module.id}`}>Open module</Link>
        </Button>
      </div>
    </div>
  )
}
