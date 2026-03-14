"use client"

import type { RegulationAlert } from "@/types/compliance"

export function RegulationAlert({ alert }: { alert: RegulationAlert }) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-amber-900 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            Regulation change alert
          </p>
          <h2 className="mt-1 text-lg font-semibold">{alert.title}</h2>
          <p className="mt-1 text-sm text-amber-700">{alert.summary}</p>
          <p className="mt-2 text-sm font-medium">Recommended action: {alert.action}</p>
        </div>
        <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold">
          {alert.date}
        </span>
      </div>
    </div>
  )
}
