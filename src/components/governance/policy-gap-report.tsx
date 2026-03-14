"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { PolicyGap } from "@/lib/ai/policy-gap-analysis"

const severityStyles: Record<PolicyGap["severity"], string> = {
  critical: "bg-rose-100 text-rose-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
}

const gapTypeLabel: Record<PolicyGap["gap_type"], string> = {
  missing: "Missing",
  outdated: "Outdated",
  incomplete: "Incomplete",
}

export function PolicyGapReport({ active }: { active: boolean }) {
  const [gaps, setGaps] = useState<PolicyGap[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchGaps() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/ai/policy-gaps", { method: "POST" })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to fetch policy gaps.")
      }
      setGaps(payload.gaps ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch policy gaps.")
      setGaps([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!active) return
    void fetchGaps()
  }, [active])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Policy gap report</p>
          <p className="text-xs text-slate-500">
            AI assessment of missing or outdated HIPAA policies.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchGaps} disabled={loading || !active}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      {gaps.length === 0 ? (
        <p className="text-sm text-slate-500">
          {loading ? "Analyzing policy coverage..." : "No gaps flagged yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {gaps.map((gap) => (
            <div key={`${gap.policy_name}-${gap.hipaa_section}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{gap.policy_name}</p>
                  <p className="mt-1 text-xs text-slate-500">HIPAA {gap.hipaa_section}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${severityStyles[gap.severity]}`}>
                  {gap.severity}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1">{gapTypeLabel[gap.gap_type]}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{gap.recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
