"use client"

import type { RiskTimelinePoint } from "@/types/compliance"

type RiskTimelineProps = {
  points: RiskTimelinePoint[]
}

export function RiskTimeline({ points }: RiskTimelineProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Risk Timeline</h3>
      <p className="text-sm text-slate-500">Simulated impact of recommended actions.</p>

      <div className="mt-4 flex flex-col gap-3">
        {points.map((point) => (
          <div key={point.label} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{point.label}</p>
              <p className="text-xs text-slate-500">Risk {point.riskScore}</p>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${point.complianceScore}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Compliance score: {point.complianceScore}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
