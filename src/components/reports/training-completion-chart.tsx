import type { TrainingDepartmentSummary } from "@/services/reports"

export function TrainingCompletionChart({ data }: { data: TrainingDepartmentSummary[] }) {
  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => (
        <div key={item.department} className="flex items-center gap-3 text-xs text-slate-600">
          <span className="w-24 text-slate-500">{item.department}</span>
          <div className="h-2 flex-1 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-cyan-600"
              style={{ width: `${item.completionRate}%` }}
            />
          </div>
          <span className="w-10 text-right text-slate-500">{item.completionRate}%</span>
        </div>
      ))}
    </div>
  )
}
