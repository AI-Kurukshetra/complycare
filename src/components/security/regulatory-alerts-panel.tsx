import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { RegulatoryUpdate } from "@/types/security"

const impactStyles: Record<RegulatoryUpdate["impactLevel"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
}

function formatDate(value: string | null) {
  if (!value) return "TBD"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function RegulatoryAlertsPanel({
  updates,
  loading,
  onRefresh,
}: {
  updates: RegulatoryUpdate[]
  loading?: boolean
  onRefresh?: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Regulatory alerts</p>
          <p className="text-xs text-slate-500">Curated HIPAA updates and impact signals.</p>
        </div>
        <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh feed"}
        </Button>
      </div>

      {updates.length === 0 ? (
        <EmptyState
          title="No regulatory alerts yet"
          description="Pull the latest HIPAA guidance to populate this panel."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {updates.map((update) => (
            <div
              key={update.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{update.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Effective {formatDate(update.effectiveDate)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    impactStyles[update.impactLevel]
                  }`}
                >
                  {update.impactLevel}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">{update.summary}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  {update.actionRequired ? "Action required" : "Advisory"}
                </span>
                {update.affectedAreas.map((area) => (
                  <span
                    key={`${update.id}-${area}`}
                    className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700"
                  >
                    {area.replace(/_/g, " ")}
                  </span>
                ))}
              </div>

              {update.sourceUrl ? (
                <p className="mt-3 text-xs text-slate-400">Source: {update.sourceUrl}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
