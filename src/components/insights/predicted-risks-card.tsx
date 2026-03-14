"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import type { PredictedRisk, RiskProbability } from "@/lib/ai/risk-prediction"

const probabilityScale: Record<RiskProbability, number> = {
  low: 0.35,
  medium: 0.6,
  high: 0.85,
}

const probabilityStyles: Record<RiskProbability, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
}

function probabilityLabel(probability: RiskProbability) {
  if (probability === "high") return "High"
  if (probability === "medium") return "Medium"
  return "Low"
}

function RadarChart({ risks }: { risks: PredictedRisk[] }) {
  const points = useMemo(() => {
    const slice = (Math.PI * 2) / risks.length
    return risks.map((risk, index) => {
      const angle = slice * index - Math.PI / 2
      const radius = probabilityScale[risk.probability] * 90
      const x = 100 + Math.cos(angle) * radius
      const y = 100 + Math.sin(angle) * radius
      return { x, y }
    })
  }, [risks])

  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ")

  return (
    <svg viewBox="0 0 200 200" className="h-40 w-40">
      <circle cx="100" cy="100" r="90" className="fill-none stroke-slate-200" />
      <circle cx="100" cy="100" r="60" className="fill-none stroke-slate-200" />
      <circle cx="100" cy="100" r="30" className="fill-none stroke-slate-200" />
      <polygon points={polygon} className="fill-cyan-200/60 stroke-cyan-600" />
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={3} className="fill-cyan-700" />
      ))}
    </svg>
  )
}

export function PredictedRisksCard({ active = false }: { active?: boolean }) {
  const [risks, setRisks] = useState<PredictedRisk[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchRisks() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/ai/risk-predict", { method: "POST" })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to fetch predicted risks.")
      }
      setRisks(payload.risks ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch predicted risks.")
      setRisks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (active) void fetchRisks()
  }, [active])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Predicted risks (next 90 days)</p>
          <p className="text-xs text-slate-500">
            AI-identified compliance threats ranked by probability.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchRisks} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      {risks.length === 0 ? (
        <p className="text-sm text-slate-500">
          {loading ? "Analyzing risk signals..." : "No predicted risks yet."}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-3">
            {risks.map((risk) => (
              <div key={risk.risk_title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{risk.risk_title}</p>
                    <p className="mt-1 text-xs text-slate-500">{risk.potential_impact}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${probabilityStyles[risk.probability]}`}
                  >
                    {probabilityLabel(risk.probability)} probability
                  </span>
                </div>
                {risk.recommended_actions.length > 0 ? (
                  <ul className="mt-3 list-disc pl-4 text-xs text-slate-600">
                    {risk.recommended_actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <RadarChart risks={risks} />
            <p className="mt-2 text-xs text-slate-500">90-day risk radar</p>
          </div>
        </div>
      )}
    </div>
  )
}
