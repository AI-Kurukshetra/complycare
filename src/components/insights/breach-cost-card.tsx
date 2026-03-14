"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { BreachCostResult } from "@/lib/ai/breach-cost-calculator"

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`
  return `$${value.toLocaleString("en-US")}`
}

function CostBar({
  label,
  score,
  cost,
  maxCost,
  colorClass,
}: {
  label: string
  score: number
  cost: number
  maxCost: number
  colorClass: string
}) {
  const widthPct = maxCost > 0 ? Math.round((cost / maxCost) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>
          {label} <span className="text-slate-400">(score: {score})</span>
        </span>
        <span className="font-semibold text-slate-900">{formatCurrency(cost)}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  )
}

export function BreachCostCard({ active = false }: { active?: boolean }) {
  const [result, setResult] = useState<BreachCostResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchEstimate() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/ai/breach-cost", { method: "POST" })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to fetch breach cost estimate.")
      }
      setResult(payload as BreachCostResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch breach cost estimate.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (active) void fetchEstimate()
  }, [active])

  const savings =
    result
      ? result.mitigation_savings.current_cost - result.mitigation_savings.target_cost
      : 0

  const savingsPct =
    result && result.mitigation_savings.current_cost > 0
      ? Math.round((savings / result.mitigation_savings.current_cost) * 100)
      : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Breach cost estimate</p>
          <p className="text-xs text-slate-500">
            AI-modelled financial exposure based on org profile and risk signals.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchEstimate} disabled={loading || !active}>
          {loading ? "Estimating..." : "Refresh"}
        </Button>
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      {!result ? (
        <p className="text-sm text-slate-500">
          {loading ? "Analysing breach exposure..." : "No estimate yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Cost range */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3">
            <p className="text-xs font-medium text-rose-700">Estimated exposure range</p>
            <p className="mt-1 text-2xl font-bold text-rose-800">
              {formatCurrency(result.estimated_cost_range.min)}
              <span className="mx-2 text-lg font-normal text-rose-400">–</span>
              {formatCurrency(result.estimated_cost_range.max)}
            </p>
          </div>

          {/* Cost drivers */}
          {result.cost_drivers.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cost drivers
              </p>
              <ul className="flex flex-col gap-1.5">
                {result.cost_drivers.map((driver) => (
                  <li key={driver} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    {driver}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Before / after bar chart */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cost reduction — current vs target (score 80)
            </p>
            <div className="flex flex-col gap-3">
              <CostBar
                label="Current compliance"
                score={result.mitigation_savings.current_score}
                cost={result.mitigation_savings.current_cost}
                maxCost={result.mitigation_savings.current_cost}
                colorClass="bg-rose-400"
              />
              <CostBar
                label="At target compliance"
                score={result.mitigation_savings.target_score}
                cost={result.mitigation_savings.target_cost}
                maxCost={result.mitigation_savings.current_cost}
                colorClass="bg-emerald-400"
              />
            </div>
            {savings > 0 && (
              <p className="mt-3 text-xs text-emerald-700">
                Potential savings:{" "}
                <span className="font-semibold">
                  {formatCurrency(savings)} ({savingsPct}% reduction)
                </span>{" "}
                by reaching a compliance score of {result.mitigation_savings.target_score}.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
